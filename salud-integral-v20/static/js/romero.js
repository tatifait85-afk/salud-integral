/* Romero (asistente) + Orientador. Un solo motor, un solo catálogo (window.SI_CATALOG).
   No usa servicios externos ni guarda las respuestas de la persona. */
(function () {
  var D = window.SI_DATA, CAT = window.SI_CATALOG;
  if (!D || !CAT) return;
  var R = D.romero, UI = D.ui, Q = D.questions;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s.?'-]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function isExternal(u) { return /^https?:\/\//.test(u) && u.indexOf(location.origin) !== 0; }
  function link(label, href, cls) {
    var a = el('a', cls || 'btn btn-primary', label); a.href = href;
    if (isExternal(href)) { a.target = '_blank'; a.rel = 'noopener'; } return a;
  }

  /* ================= ORIENTADOR ================= */
  var back = null, box = null, step = -1, tags = {}, history = [], lastFocus = null;

  function scoreAll(t) {
    return CAT.map(function (r) {
      var topic = 0, fmt = 0;
      for (var k in t) {
        if (k.indexOf('f_') === 0) {
          var f = k.slice(2);
          if (r.type === f) fmt += t[k] * 2;
          if (r.type === 'jardin' && (f === 'equilibrio' || f === 'curso')) fmt += t[k] * 2;   /* Mi Jardín Digestivo: práctico/interactivo y con PDF personalizado */
          if (f === 'autonomo' && (r.type === 'libro' || r.type === 'curso' || r.type === 'articulo' || r.type === 'area' || r.type === 'jardin')) fmt += t[k] * 1.5;
        } else if (r.topics && r.topics[k]) topic += t[k] * r.topics[k];
      }
      var s = topic + (topic > 0 ? fmt : 0) + (r.priority || 0) * 0.1;
      return { r: r, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  function build() {
    back = el('div', 'gd-back'); back.setAttribute('role', 'presentation');
    box = el('div', 'gd'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'gd-title');
    back.appendChild(box); document.body.appendChild(back);
    back.addEventListener('click', function (e) { if (e.target === back) closeGuide(); });
    document.addEventListener('keydown', function (e) {
      if (!back.classList.contains('open')) return;
      if (e.key === 'Escape') closeGuide();
      if (e.key === 'Tab') {
        var f = box.querySelectorAll('button,a[href]'); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function closeBtn() {
    var b = el('button', 'gd-x'); b.type = 'button'; b.setAttribute('aria-label', UI.close);
    b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-x"/></svg>'; b.addEventListener('click', closeGuide); return b;
  }
  function openGuide() {
    if (!back) build();
    lastFocus = document.activeElement; step = -1; tags = {}; history = [];
    render(); back.classList.add('open'); document.body.style.overflow = 'hidden';
    var t = box.querySelector('button.btn,button.choice'); if (t) t.focus();
  }
  function closeGuide() { back.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function render() {
    box.innerHTML = ''; box.appendChild(closeBtn());
    if (step < 0) {
      var h = el('h2', null, UI.guide_title); h.id = 'gd-title'; box.appendChild(h);
      box.appendChild(el('p', null, UI.guide_intro));
      var s = el('button', 'btn btn-primary', UI.start); s.type = 'button'; s.addEventListener('click', function () { step = 0; render(); box.querySelector('.choice').focus(); });
      box.appendChild(s); box.appendChild(el('p', 'fine', UI.disclaimer)); return;
    }
    if (step >= Q.length) return result();
    var h2 = el('h2', null, UI.guide_title); h2.id = 'gd-title'; h2.className = 'sr'; h2.style.cssText = 'position:absolute;left:-999px'; box.appendChild(h2);
    box.appendChild(el('div', 'prog', UI.qcount.replace('{n}', step + 1).replace('{t}', Q.length)));
    var bar = el('div', 'bar-p'), i = el('i'); i.style.width = (step / Q.length * 100) + '%'; bar.appendChild(i); box.appendChild(bar);
    box.appendChild(el('p', 'q', Q[step].q));
    var wrap = el('div', 'choices');
    Q[step].opts.forEach(function (o, idx) {
      var b = el('button', 'choice', o.label); b.type = 'button';
      b.addEventListener('click', function () {
        history[step] = o.tags; step++; render();
        var f = box.querySelector('.choice') || box.querySelector('a.btn'); if (f) f.focus();
      });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
    var nav = el('div', 'nav-row');
    var bk = el('button', 'linkbtn', UI.back); bk.type = 'button'; bk.addEventListener('click', function () { step = step === 0 ? -1 : step - 1; render(); });
    nav.appendChild(bk); box.appendChild(nav);
  }
  function result() {
    var t = {}; history.forEach(function (h) { for (var k in h) t[k] = (t[k] || 0) + h[k]; });
    var ranked = scoreAll(t), main = ranked[0].r;
    var alt = null; for (var i = 1; i < ranked.length; i++) { if (ranked[i].r.type !== main.type && ranked[i].s > 0) { alt = ranked[i].r; break; } }
    var h = el('h2', null, UI.result_h); h.id = 'gd-title'; box.appendChild(h);
    box.appendChild(el('p', null, UI.result_lead));
    var c = el('div', 'res-card'); c.appendChild(el('h3', null, main.title));
    var sub = main.subtitle || ''; if (main.gloss) sub += (sub ? ' — ' : '') + '(' + main.gloss + ')';
    if (sub) c.appendChild(el('small', null, sub));
    var why = el('p', 'why'); var b = el('strong', null, UI.why_h + ': '); why.appendChild(b); why.appendChild(document.createTextNode(main.why)); c.appendChild(why);
    c.appendChild(link(main.cta, main.url)); box.appendChild(c);
    if (alt) {
      var a = el('div', 'alt-card'); a.appendChild(el('h4', null, UI.alt_h)); a.appendChild(el('p', null, alt.title));
      a.appendChild(link(alt.cta, alt.url, 'more')); box.appendChild(a);
    }
    var row = el('div', 'nav-row');
    var rb = el('button', 'linkbtn', UI.retry); rb.type = 'button'; rb.addEventListener('click', function () { step = 0; history = []; render(); box.querySelector('.choice').focus(); });
    var ol = link(UI.other_route, UI.resources_url, 'linkbtn'); row.appendChild(rb); row.appendChild(ol); box.appendChild(row);
    box.appendChild(el('p', 'fine', UI.disclaimer));
    var f = c.querySelector('a'); if (f) f.focus();
  }
  document.querySelectorAll('[data-open-guide]').forEach(function (b) { b.addEventListener('click', openGuide); });

  /* ================= ROMERO ================= */
  var launch = el('button', 'rm-launch'); launch.type = 'button'; launch.setAttribute('aria-label', R.open_label);
  var im = el('img'); im.src = '/assets/img/romero-s.webp'; im.alt = ''; im.width = 64; im.height = 83; launch.appendChild(im);
  var pill = el('span', 'rm-pill', R.launcher); launch.appendChild(pill);
  var panel = el('section', 'rm-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', R.name + ' — ' + R.role);
  var head = el('div', 'rm-head'), hi = el('img'); hi.src = '/assets/img/romero-s.webp'; hi.alt = ''; hi.width = 40; hi.height = 52;
  var ht = el('div'); ht.appendChild(el('b', null, R.name)); ht.appendChild(el('span', null, R.role));
  var x = el('button', 'rm-x'); x.type = 'button'; x.setAttribute('aria-label', R.close_label); x.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-x"/></svg>';
  head.appendChild(hi); head.appendChild(ht); head.appendChild(x);
  var log = el('div', 'rm-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
  var form = el('form', 'rm-form'), inp = el('input'); inp.type = 'text'; inp.placeholder = R.placeholder; inp.setAttribute('aria-label', R.placeholder); inp.maxLength = 400; inp.autocomplete = 'off';
  var send = el('button', null, R.send); send.type = 'submit'; form.appendChild(inp); form.appendChild(send);
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(form); panel.appendChild(el('p', 'rm-note', R.note));
  document.body.appendChild(launch); document.body.appendChild(panel);

  var started = false, ctx = { topic: null, asked: {} };
  function scroll() { log.scrollTop = log.scrollHeight; }
  function bot(text) { var m = el('div', 'msg bot', text); log.appendChild(m); scroll(); return m; }
  function me(text) { log.appendChild(el('div', 'msg me', text)); scroll(); }
  function buttons(list) {
    if (!list || !list.length) return;
    var w = el('div', 'opts');
    list.forEach(function (p) {
      if (p[1] === '__QUIZ__') { var q = el('button', 'opt link', p[0]); q.type = 'button'; q.addEventListener('click', openGuide); w.appendChild(q); }
      else w.appendChild(link(p[0], p[1], 'opt link'));
    });
    log.appendChild(w); scroll();
  }
  function menu() {
    var w = el('div', 'opts');
    R.menu.forEach(function (m) { var b = el('button', 'opt', m[1]); b.type = 'button'; b.addEventListener('click', function () { me(m[1].replace(/^\S+\s/, '')); choose(m[0]); }); w.appendChild(b); });
    log.appendChild(w); scroll();
  }
  function choose(key) {
    if (key === 'quiz') { bot(UI.guide_intro); var q = el('div', 'opts'), b = el('button', 'opt link', UI.start); b.type = 'button'; b.addEventListener('click', openGuide); q.appendChild(b); log.appendChild(q); scroll(); return; }
    if (key === 'tell') { bot(R.tell_prompt); if (!(window.matchMedia && matchMedia('(pointer: coarse)').matches)) inp.focus(); return; }
    answer(key);
  }
  function answer(key) {
    var g = R.go[key]; if (!g) g = R.go.fallback;
    bot(g.text);
    if (key === 'best') { bot(g.after); }
    buttons(g.btns);
    if (key === 'food' || key === 'mind' || key === 'habits') {
      ctx.topic = key;
      if (!ctx.asked[key] && R.followups[key]) { ctx.asked[key] = true; setTimeout(function () { bot(R.followups[key]); }, 350); }
    }
  }
  function suggestFor(topic) {
    var t = topic === 'mind' ? { mente: 3, f_libro: 2 } : topic === 'food' ? { alimentacion: 3, f_jardin: 2 } : { habitos: 3, f_libro: 2 };
    var top = scoreAll(t).filter(function (x) { return x.s > 0 && x.r.type !== 'area'; }).slice(0, 3);
    bot(R.more);
    buttons(top.map(function (x) { return [x.r.title, x.r.url]; }));
  }
  /* Compila cada patrón de intención una sola vez. Salvo los ya anclados con "^"
     (saludo), cada patrón se envuelve en \b(?:...) para exigir un límite de
     palabra al inicio de cada alternativa: evita que un fragmento coincida
     dentro de otra palabra (p. ej. "mente" en "aumente", "fee" en "feel"). */
  var INTENTS = R.intents.map(function (pair) {
    var body = pair[1], src = body.charAt(0) === '^' ? body : '\\b(?:' + body + ')';
    try { return [pair[0], new RegExp(src)]; } catch (e) { return [pair[0], null]; }
  });
  function handle(text) {
    var n = norm(text); if (!n) return;
    me(text);
    var yes = R.yes.some(function (y) { return n === y || n.indexOf(y + ' ') === 0; });
    if (yes && ctx.topic && n.split(' ').length <= 4) { suggestFor(ctx.topic); ctx.topic = null; return; }
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i][1] && INTENTS[i][1].test(n)) { answer(INTENTS[i][0]); return; }
    }
    answer('fallback');
  }
  function open() {
    panel.classList.add('open'); launch.style.display = 'none';
    if (!started) { started = true; bot(R.greet); menu(); }
    if (!(window.matchMedia && matchMedia('(pointer: coarse)').matches)) setTimeout(function () { inp.focus(); }, 50);
  }
  function close() { panel.classList.remove('open'); launch.style.display = ''; launch.focus(); }
  launch.addEventListener('click', open); x.addEventListener('click', close);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value; inp.value = ''; handle(v); });
})();
