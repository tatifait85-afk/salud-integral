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

  /* ================= WHATSAPP (globo flotante) ================= */
  var wa = el('a', 'wa-float'); wa.href = D.wa; wa.target = '_blank'; wa.rel = 'noopener';
  wa.setAttribute('aria-label', D.lang === 'es' ? 'Escribir por WhatsApp' : 'Write on WhatsApp');
  wa.innerHTML = '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false"><path fill="#fff" d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.19 1.6 6.01L4 29l8.12-1.57a12 12 0 0 0 3.92.66C22.68 28.09 28 22.69 28 16.05 28 9.4 22.68 3 16.04 3Zm0 22.07c-1.24 0-2.45-.33-3.5-.96l-.5-.3-4.82.93.97-4.7-.33-.52a9.93 9.93 0 0 1-1.53-5.28c0-5.5 4.48-9.98 9.99-9.98 5.5 0 9.98 4.48 9.98 9.98 0 5.5-4.48 9.83-9.98 9.83Zm5.47-7.5c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.53.72.3 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z"/></svg>';
  document.body.appendChild(wa);
})();
