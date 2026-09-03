#!/usr/bin/env python3
import hashlib,json,os,shutil,stat,sys,tarfile,tempfile,posixpath
from pathlib import Path
ROOT=Path(os.environ.get("VIREO_WEBSITE_ROOT","/srv/www/vireocode")); CONTROL=Path(os.environ.get("VIREO_WEBSITE_CONTROL_ROOT","/var/lib/vireo-website-deployment")); REPO="vireocodedev/vireo"; MAX=128*1024*1024
def fail(message,code=1): print(json.dumps({"error":message}),file=sys.stderr); raise SystemExit(code)
def valid(value, pattern): return __import__('re').fullmatch(pattern,value or '') is not None
def control_file(name):
 p=CONTROL/name
 try:
  mode=os.lstat(p).st_mode
  if stat.S_ISLNK(mode) or not stat.S_ISREG(mode): fail('control path must be a regular non-symlink file')
 except FileNotFoundError: pass
 return p
def state_path(): return control_file('deployment-state.json')
def release_path(value):
 try:
  releases=(ROOT/'releases').resolve(strict=True); path=Path(value).resolve(strict=True)
 except FileNotFoundError: fail('release path is missing')
 if not path.is_dir() or path.parent!=releases: fail('release path must be a direct directory beneath releases')
 return str(path)
def validate_state(s):
 if not isinstance(s,dict) or s.get('schemaVersion')!=1 or not isinstance(s.get('generation'),int) or s['generation']<0: fail('deployment state is malformed')
 for name in ('current','previous','pending'):
  value=s.get(name)
  if value is None: continue
  if not isinstance(value,dict) or 'path' not in value: fail('deployment state entry is malformed')
  value['path']=release_path(value['path'])
  if name=='pending' and value.get('phase') not in ('staged','active'): fail('pending deployment state is malformed')
  if not value.get('legacy'):
   for key,pattern in [('runId',r'[1-9][0-9]*'),('attempt',r'[1-9][0-9]*'),('repository',r'vireocodedev/vireo'),('commit',r'[a-f0-9]{40}'),('digest',r'[a-f0-9]{64}')]:
    if not valid(str(value.get(key,'')),pattern): fail('accepted deployment state is malformed')
 return s
def load():
 if state_path().exists(): return validate_state(json.loads(state_path().read_text()))
 current=ROOT/'current'
 if current.is_symlink():
  try: legacy=release_path(current)
  except FileNotFoundError: fail('legacy current symlink is broken')
  return {"schemaVersion":1,"generation":0,"current":{"legacy":True,"path":legacy},"previous":None,"pending":None}
 if current.exists(): fail('legacy current must be an atomic symlink')
 return {"schemaVersion":1,"generation":0,"current":None,"previous":None,"pending":None}
def save(s):
 p=state_path(); t=control_file('deployment-state.tmp'); t.write_text(json.dumps(validate_state(s),sort_keys=True)); os.replace(t,p)
def out(status,s): print(json.dumps({"status":status,"generation":s['generation'],"current":s['current'],"pending":s['pending']},sort_keys=True))
def identity(args):
 if len(args)!=6: fail('invalid identity',64)
 run,attempt,repo,commit,digest,bytes_=args
 if not valid(run,r'[1-9][0-9]*') or not valid(attempt,r'[1-9][0-9]*') or repo!=REPO or not valid(commit,r'[a-f0-9]{40}') or not valid(digest,r'[a-f0-9]{64}') or not valid(bytes_,r'[1-9][0-9]*'): fail('invalid identity',64)
 if int(bytes_)>MAX: fail('archive too large',64)
 return {"runId":run,"attempt":attempt,"repository":repo,"commit":commit,"digest":digest,"bytes":int(bytes_)}
def content_same(a,b): return a and all(a.get(k)==b.get(k) for k in ('repository','commit','digest'))
def exact_same(a,b): return a and all(a.get(k)==b.get(k) for k in ('runId','attempt','repository','commit','digest','bytes'))
def valid_site_path(value):
 return '\\' not in value and value.isascii() and all(0x21<=ord(char)<=0x7e for char in value)
def site_digest(root,proof):
 entries=[]
 for directory,dirs,files in os.walk(root):
  for name in dirs+files:
   path=Path(directory)/name
   relative=str(path.relative_to(root)).replace('\\','/')
   if not valid_site_path(relative): fail('deployment path must be printable ASCII')
   mode=path.lstat().st_mode
   if path.is_symlink() or not (path.is_dir() or path.is_file()): fail('deployment tree contains an unsafe entry')
   if path.is_dir() and stat.S_IMODE(mode)!=0o755: fail('deployment directory mode is not Caddy-readable')
  for file in files:
   path=Path(directory)/file; name=str(path.relative_to(root)).replace('\\','/')
   if not valid_site_path(name): fail('deployment path must be printable ASCII')
   if stat.S_IMODE(path.lstat().st_mode)!=0o644: fail('deployment file mode is not Caddy-readable')
   if name!=proof: entries.append([name,hashlib.sha256(path.read_bytes()).hexdigest()])
 # Contract: SHA-256 over UTF-8 compact JSON of sorted [printable-ASCII path,
 # lowercase SHA-256] pairs. The producer enforces the same ASCII restriction.
 return hashlib.sha256(json.dumps(sorted(entries),separators=(',',':')).encode('utf-8')).hexdigest()
def snapshot_upload(path,ident):
 target=control_file('upload.snapshot'); target.unlink(missing_ok=True)
 try: fd=os.open(path,os.O_RDONLY|getattr(os,'O_NOFOLLOW',0))
 except OSError: fail('incoming archive must be a regular non-symlink file')
 try:
  meta=os.fstat(fd)
  if not stat.S_ISREG(meta.st_mode) or meta.st_size!=ident['bytes']: fail('incoming archive size mismatch')
  out=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
  remaining=ident['bytes']
  with os.fdopen(fd,'rb',closefd=False) as source, os.fdopen(out,'wb') as destination:
   while remaining:
    chunk=source.read(min(1024*1024,remaining))
    if not chunk: fail('incoming archive was truncated during snapshot')
    destination.write(chunk); remaining-=len(chunk)
   if source.read(1): fail('incoming archive has trailing bytes')
 except:
  target.unlink(missing_ok=True); raise
 finally: os.close(fd)
 if hashlib.sha256(control_file('upload.snapshot').read_bytes()).hexdigest()!=ident['digest']:
  control_file('upload.snapshot').unlink(missing_ok=True); fail('archive digest mismatch')
 return control_file('upload.snapshot')
def validate_extract(archive,target,ident):
 with tarfile.open(archive,'r:') as t:
  members=t.getmembers(); names=[]; normalized_members={}; logical=0; root_member=False
  if len(members)>10000: fail('archive has too many members')
  for m in members:
   if m.name in ('.','./'):
    if root_member or not m.isdir(): fail('unsafe archive root member')
    root_member=True; continue
   raw=m.name.removeprefix('./').rstrip('/')
   if not raw: fail('unsafe archive member')
   n=posixpath.normpath(raw)
   if raw!=n or not valid_site_path(n) or n.startswith('/') or '..' in Path(n).parts or not (m.isfile() or m.isdir()) or n in names or getattr(m,'sparse',None): fail('unsafe archive member')
   if m.size>16*1024*1024: fail('archive member is too large')
   logical+=m.size
   if logical>MAX: fail('archive logical size is too large')
   names.append(n); normalized_members[n]=m
  proof='.well-known/vireo-deployment.json'
  if proof not in names: fail('archive lacks deployment proof')
  # GNU tar commonly stores this as ./.well-known/... . Extract through the
  # already unique, traversal-checked normalized member rather than re-parsing.
  data=json.load(t.extractfile(normalized_members[proof])); expected={k:ident[k] for k in ('repository','commit')}
  if data.get('schemaVersion')!=1 or any(data.get(k)!=v for k,v in expected.items()) or not valid(data.get('siteDigest'),r'[a-f0-9]{64}'): fail('deployment proof mismatch')
  t.extractall(target, members=members, filter='data')
  for directory,dirs,files in os.walk(target):
   os.chmod(directory,0o755)
   for file in files: os.chmod(Path(directory)/file,0o644)
  if site_digest(target,proof)!=data['siteDigest']: fail('deployment proof site digest mismatch')
def valid_orphan_target(target,ident):
 try:
  if target.is_symlink() or not target.is_dir() or Path(release_path(target))!=target.resolve(strict=True): return False
  proof='.well-known/vireo-deployment.json'; data=json.loads((target/proof).read_text())
  return data.get('schemaVersion')==1 and data.get('repository')==ident['repository'] and data.get('commit')==ident['commit'] and valid(data.get('siteDigest'),r'[a-f0-9]{64}') and site_digest(target,proof)==data['siteDigest']
 except (FileNotFoundError,json.JSONDecodeError,OSError,SystemExit): return False
def cleanup(s):
 keep={x.get('path') for x in (s.get('current'),s.get('previous')) if x}
 for p in (ROOT/'releases').glob('*'):
  if str(p) not in keep: shutil.rmtree(p,ignore_errors=True)
def main():
 if len(sys.argv)<2: fail('missing verb',64)
 if os.geteuid()==0 and ('VIREO_WEBSITE_ROOT' in os.environ or 'VIREO_WEBSITE_CONTROL_ROOT' in os.environ): fail('root controller refuses overridden production roots')
 verb,args=sys.argv[1],sys.argv[2:]; ROOT.mkdir(parents=True,exist_ok=True); (ROOT/'releases').mkdir(exist_ok=True); (ROOT/'incoming').mkdir(exist_ok=True); CONTROL.mkdir(parents=True,exist_ok=True)
 if ROOT.is_symlink() or (ROOT/'releases').is_symlink() or CONTROL.is_symlink() or not stat.S_ISDIR(CONTROL.stat().st_mode): fail('site and control directories must be real directories')
 if "VIREO_WEBSITE_CONTROL_ROOT" not in os.environ and (CONTROL.stat().st_uid!=0 or CONTROL.stat().st_mode&0o077): fail('control directory must be root-owned and private')
 if "VIREO_WEBSITE_ROOT" not in os.environ and (ROOT.stat().st_uid!=0 or (ROOT/'releases').stat().st_uid!=0): fail('site root and releases must be root-owned')
 import fcntl
 with open(control_file('deploy.lock'),'a+') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX); s=load()
  if verb=='status': out('status',s); return
  if verb=='reconcile':
   pending=s.get('pending')
   if pending is None: out('reconciled',s); return
   # Scheduled reconciliation never stages or builds. It only restores the last
   # accepted endpoint after an interrupted runner left a transaction pending.
   link=ROOT/'current'; nxt=ROOT/'current.next'; nxt.unlink(missing_ok=True)
   prior=s.get('current')
   if prior: os.symlink(prior['path'],nxt); os.replace(nxt,link)
   else: link.unlink(missing_ok=True)
   shutil.rmtree(pending['path'],ignore_errors=True)
   (ROOT/'incoming'/f"{pending['runId']}-{pending['attempt']}-{pending['digest']}.tar").unlink(missing_ok=True)
   s['pending']=None; s['generation']+=1; save(s); out('rolled-back',s); return
  ident=identity(args[:6]); key=f"{ident['runId']}-{ident['attempt']}-{ident['digest']}"; target=ROOT/'releases'/key
  if verb=='stage':
   if content_same(s.get('current'),ident):
    (ROOT/'incoming'/f"{key}.tar").unlink(missing_ok=True); out('accepted',s); return
   if s.get('pending') and not exact_same(s['pending'],ident): fail('another deployment is pending',75)
   if s.get('pending') and exact_same(s['pending'],ident): out('staged',s); return
   if (s.get('current') or {}).get('runId') and int(ident['runId']) < int(s['current']['runId']): fail('stale workflow run',75)
   # A crash after the atomic rename is recoverable only for this exact identity.
   # Never make a different run/attempt inherit the staged content merely by digest.
   if target.exists():
    if valid_orphan_target(target,ident):
     target=Path(release_path(target)); s['generation']+=1; s['pending']={**ident,'path':str(target),'phase':'staged'}; save(s); out('staged',s); return
    # This exact, root-controlled release path was never accepted. Rebuild it
    # from the root-private snapshot instead of adopting incomplete crash debris.
    if target.is_symlink() or Path(release_path(target))!=target.resolve(strict=True): fail('orphan release path is unsafe')
    shutil.rmtree(target)
   work=Path(tempfile.mkdtemp(prefix='website-',dir=ROOT/'releases'))
   snapshot=None
   try:
    snapshot=snapshot_upload(ROOT/'incoming'/f"{key}.tar",ident); validate_extract(snapshot,work,ident); os.replace(work,target)
   except:
    shutil.rmtree(work,ignore_errors=True); raise
   finally:
    if snapshot: snapshot.unlink(missing_ok=True)
   s['generation']+=1; s['pending']={**ident,'path':str(target),'phase':'staged'}; save(s); out('staged',s); return
  if len(args)!=7 or not valid(args[6],r'[0-9]+'): fail('missing generation',64)
  if verb=='accept' and content_same(s.get('current'),ident): out('accepted',s); return
  if verb=='rollback' and s.get('pending') is None: out('rolled-back',s); return
  if verb=='rollback' and not exact_same(s.get('pending'),ident): fail('another deployment is pending',75)
  if s['generation']!=int(args[6]) or not exact_same(s.get('pending'),ident): fail('CAS generation changed',75)
  if verb=='activate':
   if s['pending']['phase']=='active': out('active',s); return
   link=ROOT/'current'; nxt=ROOT/'current.next'; nxt.unlink(missing_ok=True); os.symlink(target,nxt); os.replace(nxt,link)
   s['generation']+=1; s['pending']['phase']='active'; save(s); out('active',s); return
  if verb=='accept':
   if s['pending']['phase']!='active': fail('deployment is not active',75)
   pending=s['pending']; s['previous']=s['current']; s['current']={**pending,'path':pending['path']}; s['pending']=None; s['generation']+=1; save(s); cleanup(s); (ROOT/'incoming'/f"{pending['runId']}-{pending['attempt']}-{pending['digest']}.tar").unlink(missing_ok=True); out('accepted',s); return
  if verb=='rollback':
   prior=s['current']; link=ROOT/'current'; nxt=ROOT/'current.next'; nxt.unlink(missing_ok=True)
   if prior: os.symlink(prior['path'],nxt); os.replace(nxt,link)
   else: link.unlink(missing_ok=True)
   pending=s['pending']; shutil.rmtree(pending['path'],ignore_errors=True); (ROOT/'incoming'/f"{pending['runId']}-{pending['attempt']}-{pending['digest']}.tar").unlink(missing_ok=True); s['pending']=None; s['generation']+=1; save(s); out('rolled-back',s); return
  fail('unsupported verb',64)
if __name__=='__main__': main()
