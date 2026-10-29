import os, re, sys, shutil
src, out = sys.argv[1], sys.argv[2]
if os.path.exists(out): shutil.rmtree(out)
shutil.copytree(src, out)

def rel_path(p, root):
    """p starts with '/', root is '' or '../' etc. Returns relative path; dir links get index.html."""
    frag = ''
    m = re.search(r'[#?].*$', p)
    if m: frag = m.group(0); p = p[:m.start()]
    p = p.lstrip('/')
    if p == '' or p.endswith('/'): p += 'index.html'
    return (root or './') + p + frag if not root else root + p + frag

def conv_html(path):
    depth = os.path.relpath(path, out).count(os.sep)
    root = '../' * depth
    s = open(path, encoding='utf-8').read()
    def attr(m):
        return '%s="%s"' % (m.group(1), rel_path(m.group(2), root))
    # href, src, srcset (single-URL srcsets here), and any attr with a leading-/ value other than protocol-relative
    s = re.sub(r'<base href="(/[^"]*)">', lambda m: '<base href="%s">' % ((root or './') + m.group(1).lstrip('/')), s)
    s = s.replace('window.SITE_HOME={"es":"/","en":"/en/"};', 'window.SITE_HOME={"es":"../../index.html","en":"../../en/index.html"};')
    s2 = re.sub(r'\b(href|src|srcset|data-[a-z-]+|poster|action)="(/(?!/)[^"]*)"', attr, s)
    open(path, 'w', encoding='utf-8').write(s2)

for dp, _, fs in os.walk(out):
    for f in fs:
        if f.endswith('.html'): conv_html(os.path.join(dp, f))

ROOT_JS = "var __R=((document.currentScript&&document.currentScript.getAttribute('src'))||'').replace(/assets\\/js\\/[^\\/]*$/,'');\n"
def js_conv(path, skip=()):
    s = open(path, encoding='utf-8').read()
    def rep(m):
        q, p = m.group(1), m.group(2)
        if p in skip or p.startswith('/api/') or p.startswith('/privado/'): return m.group(0)
        r = rel_path(p, '')
        r = r[2:] if r.startswith('./') else r
        return '(__R+%s%s%s)' % (q, r, q)
    s = re.sub(r"""(["'])(/(?:assets|en|alimentacion|habitos-y-bienestar|transpersonal-espiritual|sobre-mi|recursos|mente-tranquila|contacto|informe-personalizado|acompanamiento|tu-mapa-de-habitos|mi-jardin-digestivo|bajar-de-peso|privacidad|terminos-de-uso)[^"']*)\1""", rep, s)
    open(path, 'w', encoding='utf-8').write(ROOT_JS + s)

j = os.path.join(out, 'assets/js')
for f in ('data-es.js', 'data-en.js', 'romero.js', 'search-es.js', 'search-en.js'):
    js_conv(os.path.join(j, f))
