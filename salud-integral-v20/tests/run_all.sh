#!/usr/bin/env bash
# Ejecuta toda la batería: build limpio y reproducible, auditoría estática y pruebas e2e (Playwright) sobre una vista previa local.
# Requisitos: python3, node, playwright (npm i -g playwright && npx playwright install chromium). axe-core opcional: AXE=/ruta/axe.min.js
set -u; cd "$(dirname "$0")/.."; PORT=${PORT:-8765}; rc=0
hash_dist(){ (cd dist && find . -type f -print0 | sort -z | xargs -0 sha256sum); }
echo "== 1. Build limpio y reproducible"; rm -rf dist; python3 src/build.py >/dev/null && hash_dist > /tmp/h1.txt && python3 src/build.py >/dev/null && hash_dist > /tmp/h2.txt \
  && diff -q /tmp/h1.txt /tmp/h2.txt >/dev/null && echo "PASS dos builds idénticos ($(wc -l </tmp/h1.txt) archivos)" || { echo "FAIL build no reproducible"; rc=1; }
echo "== 2. Auditoría estática"; python3 -I tests/audit_static.py dist | tail -3 || rc=1
echo "== 2b. Paquete público sin recursos protegidos"; python3 tools/package.py /tmp/sitio-publico.zip && python3 - <<'PY' || rc=1
import zipfile,sys
n=zipfile.ZipFile('/tmp/sitio-publico.zip').namelist()
bad=[x for x in n if x.startswith('privado/') or x.split('/')[-1] in ('mapa-motor.js','mapa-datos.js','mapa-pdf.js','mapa-fuentes.js')]
print('PASS ZIP sin privado/ (%d archivos)'%len(n)) if not bad and 'index.html' in n and 'terminos-de-uso/index.html' in n else (print('FAIL',bad) or sys.exit(1))
PY
echo "== 3. Vista previa local"; rm -rf prev && cp -r dist prev && python3 tools/relativize.py dist prev >/dev/null
(cd prev && python3 -m http.server $PORT >/dev/null 2>&1 & echo $! > /tmp/srv.pid); sleep 1
for t in site contact newsletter acceso jardin romero; do echo "== e2e: $t"; NODE_PATH=$(npm root -g) node tests/e2e/$t.js http://localhost:$PORT | grep -E "FAIL|TODO OK|FALLOS|cargas" ; [ ${PIPESTATUS[0]} -eq 0 ] || rc=1; done
if [ -n "${AXE:-}" ]; then echo "== e2e: a11y (axe)"; NODE_PATH=$(npm root -g) node tests/e2e/a11y.js http://localhost:$PORT | tail -8 ; [ ${PIPESTATUS[0]} -eq 0 ] || rc=1; fi
# 4. Worker real en local (wrangler dev): IPN simulado, cookies por producto, límites, reembolsos y recorridos del comprador
echo "== 4. Worker (wrangler dev --local)"
if [ -d worker/node_modules ]; then
  if [ -e worker/.dev.vars ]; then
    echo "OMITIDO: worker/.dev.vars ya existe; no se sobrescribe; pruebas Worker omitidas"; rc=1
  else
    trap 'rm -f worker/.dev.vars' EXIT
    (cd worker && printf 'TOKEN_SECRET=%s\nPRUEBA_LOCAL=1\n' "$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" > .dev.vars && npx wrangler dev --local --port 8799 >/tmp/wr.log 2>&1 & echo $! > /tmp/wr.pid)
    for i in $(seq 1 60); do curl -s -o /dev/null http://localhost:8799/ && break; sleep 1; done
    node tests/worker.js | grep -E "FALLA|TODO OK|HAY FALLAS" ; [ ${PIPESTATUS[0]} -eq 0 ] || rc=1
    for t in pago-jardin pago-equilibrio; do echo "== e2e Worker: $t"; NODE_PATH=$(npm root -g) BASE=http://localhost:8799 node tests/e2e/$t.js | grep -E "FALLA|TODO OK|HAY FALLAS"; [ ${PIPESTATUS[0]} -eq 0 ] || rc=1; done
    pkill -P $(cat /tmp/wr.pid) 2>/dev/null; kill $(cat /tmp/wr.pid) 2>/dev/null; rm -f worker/.dev.vars
    trap - EXIT
  fi
else echo "OMITIDO: falta 'cd worker && npm ci' (las pruebas del Worker no se ejecutaron)"; rc=1; fi
kill $(cat /tmp/srv.pid) 2>/dev/null; [ $rc -eq 0 ] && echo "RESULTADO: TODO OK" || echo "RESULTADO: HAY FALLOS"; exit $rc
