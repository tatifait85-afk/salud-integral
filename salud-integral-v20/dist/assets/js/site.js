/* Salud Integral — comportamiento general (menú móvil) */
(function () {
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (!btn || !nav) return;
  function set(open) { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
})();

/* Programa gratuito por correo (MailerLite). Solo existe en la versión en español. */
(function () {
  var form = document.querySelector('form[data-ml]'); if (!form) return;
  var msg = document.querySelector('[data-ml-msg]'), btn = form.querySelector('button');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.querySelector('input[type=email]');
    if (!email.value || !email.checkValidity()) { email.focus(); email.reportValidity && email.reportValidity(); return; }
    var fd = new FormData(); fd.append('fields[email]', email.value.trim()); fd.append('ml-submit', '1'); fd.append('anticsrf', 'true');
    if (btn.disabled) return;   /* evita envíos duplicados */
    btn.disabled = true; btn.setAttribute('aria-busy', 'true'); msg.textContent = '';
    fetch(form.getAttribute('data-ml'), { method: 'POST', body: fd })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        if (d && d.success) { msg.textContent = form.getAttribute('data-ok'); form.reset(); }
        else { msg.textContent = form.getAttribute('data-err'); }
      })
      .catch(function () { msg.textContent = form.getAttribute('data-err'); })
      .then(function () { btn.disabled = false; btn.removeAttribute('aria-busy'); });
  });
})();

/* Formulario de contacto.
   - Con data-endpoint (CONTACT_ENDPOINT en el build): POST JSON {name,email,message,lang,page,website} y solo se muestra éxito
     si el servidor responde HTTP 2xx con JSON {"ok":true}.
   - Sin endpoint: respaldo mailto: (abre el programa de correo; NO se afirma que el mensaje se envió). */
(function () {
  var form = document.querySelector('.cform'); if (!form) return;
  var msg = form.querySelector('.cform-msg'), btn = form.querySelector('button[type=submit]'), busy = false;
  var RX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function say(t, bad) { msg.textContent = t; msg.setAttribute('role', bad ? 'alert' : 'status'); msg.classList.toggle('err', !!bad); }
  function bad(el, t) { say(t, true); el.setAttribute('aria-invalid', 'true'); el.focus(); }
  form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (busy) return;
    var f = form.elements, n = f.name.value.trim(), m = f.email.value.trim(), t = f.message.value.trim();
    [f.name, f.email, f.message].forEach(function (x) { x.removeAttribute('aria-invalid'); });
    if (f.website && f.website.value) { say(form.getAttribute('data-sent'), false); form.reset(); return; }   /* trampa anti-bots: no se envía nada */
    if (!n) return bad(f.name, form.getAttribute('data-e-name'));
    if (!RX.test(m)) return bad(f.email, form.getAttribute('data-e-email'));
    if (!t) return bad(f.message, form.getAttribute('data-e-msg'));
    var ep = form.getAttribute('data-endpoint');
    if (!ep) {
      var body = t + '\n\n— ' + n + ' (' + m + ')';
      window.location.href = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(form.getAttribute('data-subject')) + '&body=' + encodeURIComponent(body);
      say(form.getAttribute('data-ok'), false); return;
    }
    busy = true; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); say(form.getAttribute('data-sending'), false);
    var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { ctl && ctl.abort(); }, 15000);
    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', signal: ctl ? ctl.signal : undefined,
      body: JSON.stringify({ name: n, email: m, message: t, lang: form.getAttribute('data-lang'), page: location.pathname }) })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        if (x.ok && x.d && x.d.ok === true) { say(form.getAttribute('data-sent'), false); form.reset(); }
        else say(form.getAttribute('data-e-srv'), true);
      })
      .catch(function () { say(form.getAttribute('data-e-net'), true); })
      .then(function () { clearTimeout(tm); busy = false; btn.disabled = false; btn.removeAttribute('aria-busy'); });
  });
})();

/* Lupa: buscador de todo el sitio (índice local, sin servidor). */
(function () {
  var btn = document.querySelector('.search-btn'); if (!btn) return;
  var box, input, list, msg, data = null, loading = false;
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function build() {
    box = document.createElement('div'); box.className = 'sbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', btn.getAttribute('aria-label'));
    box.innerHTML = '<div class="sbox-in"><div class="sbox-bar"><svg class="ic" aria-hidden="true"><use href="#i-search"/></svg><input type="search" autocomplete="off"><button type="button"></button></div><p class="sbox-msg"></p><ul class="sbox-res"></ul></div>';
    document.body.appendChild(box);
    input = box.querySelector('input'); list = box.querySelector('.sbox-res'); msg = box.querySelector('.sbox-msg');
    input.placeholder = btn.getAttribute('data-ph'); input.setAttribute('aria-label', btn.getAttribute('aria-label'));
    box.querySelector('.sbox-bar button').textContent = btn.getAttribute('data-close');
    box.querySelector('.sbox-bar button').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    input.addEventListener('input', run); msg.textContent = btn.getAttribute('data-hint');
  }
  function load(cb) {
    if (window.SI_SEARCH) { data = window.SI_SEARCH; cb(); return; }
    if (loading) return; loading = true;
    var s = document.createElement('script'); s.src = btn.getAttribute('data-src');
    s.onload = function () { data = window.SI_SEARCH || []; cb(); }; document.head.appendChild(s);
  }
  function run() {
    var q = norm(input.value).trim().split(/\s+/).filter(Boolean); list.innerHTML = '';
    if (!q.length) { msg.textContent = btn.getAttribute('data-hint'); return; }
    var res = (data || []).filter(function (r) { var h = norm(r.t + ' ' + r.d + ' ' + r.k); return q.every(function (w) { return h.indexOf(w) > -1; }); }).slice(0, 12);
    msg.textContent = res.length ? '' : btn.getAttribute('data-none');
    res.forEach(function (r) {
      var li = document.createElement('li'), a = document.createElement('a'); a.href = r.u;
      if (r.x) { a.target = '_blank'; a.rel = 'noopener'; }
      var st = document.createElement('strong'); st.textContent = r.t; a.appendChild(st);
      if (r.d) { var sp = document.createElement('span'); sp.textContent = r.d; a.appendChild(sp); }
      li.appendChild(a); list.appendChild(li);
    });
  }
  function open() { if (!box) build(); box.classList.add('open'); load(function () { run(); }); setTimeout(function () { input.focus(); }, 30); }
  function close() { box.classList.remove('open'); btn.focus(); }
  btn.addEventListener('click', open);
  document.addEventListener('keydown', function (e) { if (e.key === '/' && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); open(); } });
})();

/* Carrusel de acreditaciones: flechas + desplazamiento táctil */
(function () {
  document.querySelectorAll('.carousel').forEach(function (c) {
    var track = c.querySelector('.cred-track'); if (!track) return;
    function mk(cls, label, ch, dir) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'car-btn ' + cls; b.setAttribute('aria-label', label); b.textContent = ch;
      b.addEventListener('click', function () { var w = track.querySelector('.cred').offsetWidth + 20; track.scrollBy({ left: dir * w, behavior: 'smooth' }); });
      c.appendChild(b);
    }
    mk('prev', c.getAttribute('data-prev'), '‹', -1); mk('next', c.getAttribute('data-next'), '›', 1);
  });
})();
