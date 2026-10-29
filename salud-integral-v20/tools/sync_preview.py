import os,shutil,subprocess
subprocess.run(['python3','src/build.py'],cwd='site',stdout=subprocess.DEVNULL,check=True)
subprocess.run(['python3','tools/relativize.py','site/dist','preview_new'],stdout=subprocess.DEVNULL,check=True)
src='preview_new';dst='artifact_new/sitio';skip={'privado','_headers','robots.txt','sitemap.xml'};ch=[]
for dp,ds,fs in os.walk(src):
    rel=os.path.relpath(dp,src)
    if rel=='.': ds[:]=[d for d in ds if d not in skip]; fs=[f for f in fs if f not in skip]
    if rel.startswith('assets/jardin/vendor'): continue
    os.makedirs(os.path.join(dst,rel),exist_ok=True)
    for f in fs:
        a=os.path.join(dp,f);b=os.path.join(dst,rel,f)
        if not os.path.exists(b) or open(a,'rb').read()!=open(b,'rb').read():
            shutil.copy2(a,b);ch.append(os.path.normpath(os.path.join('sitio',rel,f)))
print('\n'.join(ch))
