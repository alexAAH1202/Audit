#!/usr/bin/env node
/* Regression runner for access-audit.html (developer tooling only: the tool itself stays single-file, no build).

   node tests/run.js                 run every suite, compare with the saved snapshots
   node tests/run.js --update        accept the current output as the new snapshots
   node tests/run.js --only search   run suites whose name contains "search"
   node tests/run.js path/to/app.html

   Each suite drives the real page in headless Chromium and prints what it observed. A suite FAILS if it exits
   with an error, reports a page error ("errors: [ ... ]" that is not empty), or its output differs from
   tests/expected/<suite>.txt. A difference is not always a bug: review it, and if the change is intended run
   with --update and commit the new snapshot. */
const {spawnSync,execFileSync}=require('child_process');
const fs=require('fs'), path=require('path');

const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2);
const update=args.includes('--update');
const onlyIdx=args.indexOf('--only'), only=onlyIdx>=0?args[onlyIdx+1]:null;
const appArg=args.find((a,i)=>!a.startsWith('--')&&args[i-1]!=='--only');
const app=path.resolve(appArg||path.join(root,'access-audit.html'));
const OUT=path.join(__dirname,'.out'), EXP=path.join(__dirname,'expected'), SUITES=path.join(__dirname,'suites');
fs.mkdirSync(OUT,{recursive:true}); fs.mkdirSync(EXP,{recursive:true});
if(!fs.existsSync(app)){ console.error('App not found: '+app); process.exit(2); }

/* Older builds used as fixtures (a saved template from before LEAVE existed, a pre-codes audit, ...). They come from
   git history, so those commits must stay in the repository. */
const FIXTURES={'before.html':'cdd979c','before2.html':'eea8eaa','legacy.html':'ed21fc6'};
const missing=[];
for(const [file,rev] of Object.entries(FIXTURES)){
  try{ fs.writeFileSync(path.join(OUT,file),execFileSync('git',['show',`${rev}:access-audit.html`],{cwd:root,maxBuffer:64*1024*1024})); }
  catch(e){ missing.push(file); }
}
const needsFixture={'answer-codes-migration':['legacy.html'],'leave-and-saved-templates':['before.html'],'journey-dividers':['before.html','before2.html'],'add-site-scope':['before.html']};

/* Playwright and axe-core: from tests/node_modules if installed, otherwise from the global install. */
let globalRoot=''; try{ globalRoot=execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(); }catch(e){}
const env={...process.env,TEST_OUT:OUT,NODE_PATH:[path.join(__dirname,'node_modules'),globalRoot,process.env.NODE_PATH||''].filter(Boolean).join(path.delimiter)};

/* Output is normalised so that dates and run-specific numbers do not cause false differences. */
const normalise=s=>s.replace(/\r/g,'').replace(/\d{4}-\d{2}-\d{2}/g,'DATE').replace(/\b\d{13}\b/g,'TIMESTAMP').replace(/[ \t]+$/gm,'').trimEnd()+'\n';

const order=fs.readdirSync(SUITES).filter(f=>f.endsWith('.js')).map(f=>f.slice(0,-3)).sort((a,b)=>{
  /* export-axe reads the export written by site-scope, so it runs after it */
  if(a==='export-axe') return 1; if(b==='export-axe') return -1; return a.localeCompare(b); });
const results=[];
for(const name of order){
  if(only&&!name.includes(only)) continue;
  const lack=(needsFixture[name]||[]).filter(f=>missing.includes(f));
  if(lack.length){ results.push({name,status:'SKIP',note:'needs '+lack.join(', ')+' from git history'}); continue; }
  const argv=[path.join(SUITES,name+'.js'),name==='export-axe'?path.join(OUT,'ss-export.html'):app];
  const t0=Date.now();
  const r=spawnSync('node',argv,{cwd:__dirname,env,encoding:'utf8',timeout:240000,maxBuffer:32*1024*1024});
  const out=normalise((r.stdout||'')+(r.stderr?('\n[stderr]\n'+r.stderr):''));
  const problems=[];
  if(r.status!==0) problems.push('exit code '+r.status+(r.error?' ('+r.error.message+')':''));
  if(/errors:\s*\[\s*[^\]\s]/.test(out)) problems.push('the page raised an error');
  const file=path.join(EXP,name+'.txt');
  if(update){ fs.writeFileSync(file,out); }
  else if(!fs.existsSync(file)) problems.push('no snapshot yet (run with --update after reviewing the output)');
  else if(fs.readFileSync(file,'utf8')!==out){
    problems.push('output differs from the snapshot');
    fs.writeFileSync(path.join(OUT,name+'.actual.txt'),out);
  }
  results.push({name,status:problems.length&&!(update&&problems.every(p=>p.startsWith('output')||p.startsWith('no snapshot')))?'FAIL':'PASS',note:problems.join('; '),secs:((Date.now()-t0)/1000).toFixed(1)});
  process.stdout.write(`${results[results.length-1].status.padEnd(5)} ${name.padEnd(28)} ${results[results.length-1].secs}s ${results[results.length-1].note}\n`);
}
const fail=results.filter(r=>r.status==='FAIL'), skip=results.filter(r=>r.status==='SKIP');
skip.forEach(r=>console.log(`SKIP  ${r.name.padEnd(28)} ${r.note}`));
console.log(`\n${results.length-fail.length-skip.length} passed, ${fail.length} failed, ${skip.length} skipped${update?' (snapshots updated)':''}`);
if(fail.length&&!update){ console.log('Actual output of a differing suite is in tests/.out/<suite>.actual.txt; compare with tests/expected/<suite>.txt'); }
process.exit(fail.length?1:0);
