#!/usr/bin/env python3
"""Empaquetado seguro del sitio PÚBLICO. Es la única vía prevista para crear el ZIP que se entrega/sube a un hosting estático.
 1) Verifica que dist/ existe y contiene privado/ (el build completo).
 2) Crea el ZIP SIN privado/ ni ningún archivo cuyo nombre o contenido coincida con static_privado/ (detecta copias renombradas).
 3) Reabre el ZIP y lo vuelve a verificar. Sale con error (y borra el ZIP) si algo protegido se coló.
Uso: python3 tools/package.py [salida.zip]"""
import os, sys, zipfile, hashlib
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST, PRIV = os.path.join(ROOT, "dist"), os.path.join(ROOT, "static_privado")
out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "sitio-publico.zip"))
sha = lambda b: hashlib.sha256(b).hexdigest()
def leaves(base):  # todos los archivos bajo base (incluye subcarpetas: privado/jardin/, privado/equilibrio/)
    return [os.path.join(dp, f) for dp, _, fs in os.walk(base) for f in fs]
protected_names = {f for f in os.listdir(PRIV) if os.path.isfile(os.path.join(PRIV, f))} | {"mapa-fuentes.js"}   # mapa-fuentes.js lo genera el build dentro de dist/privado/
protected_hashes = {sha(open(f, "rb").read()) for f in leaves(PRIV)}
pd = os.path.join(DIST, "privado")
if os.path.isdir(pd): protected_hashes |= {sha(open(f, "rb").read()) for f in leaves(pd)}
else: sys.exit("ERROR: dist/privado/ no existe: ejecute primero python3 src/build.py (el build completo lo crea).")

def bad(name, data):
    parts = name.split("/")
    if parts[0] == "privado": return "carpeta privado/"
    if parts[-1] in protected_names: return "nombre protegido"
    if sha(data) in protected_hashes: return "contenido idéntico a un archivo protegido"
    return None

n = 0
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for dp, ds, fs in os.walk(DIST):
        rel = os.path.relpath(dp, DIST)
        if rel == ".": ds[:] = sorted(d for d in ds if d != "privado")
        else: ds.sort()
        for f in sorted(fs):
            full = os.path.join(dp, f); name = os.path.normpath(os.path.join(rel, f)).replace(os.sep, "/")
            data = open(full, "rb").read(); why = bad(name, data)
            if why:
                z.close(); os.path.exists(out) and os.remove(out)
                sys.exit(f"ERROR: {name} es un archivo protegido ({why}) fuera de privado/. Paquete NO creado.")
            z.writestr(zipfile.ZipInfo.from_file(full, name), data, zipfile.ZIP_DEFLATED); n += 1
# verificación independiente del ZIP terminado
with zipfile.ZipFile(out) as z:
    for name in z.namelist():
        why = bad(name, z.read(name))
        if why: os.remove(out); sys.exit(f"ERROR: el ZIP contiene {name} ({why}). Borrado.")
print(f"OK {out}: {n} archivos, sin privado/ ni recursos protegidos (verificado por nombre y por contenido).")
