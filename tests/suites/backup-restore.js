// Run by tests/run.js:  node tests/suites/backup-restore.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
const url='file://'+process.argv[2];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));const dialogs=[];p.on('dialog',d=>{dialogs.push(d.message().split("\n")[0]);d.accept();});
const notices=()=>p.evaluate(()=>[...document.querySelectorAll('#notices .notice')].map(n=>n.innerText.replace(/\s+/g,' ').slice(0,70)));
await p.goto(url);await p.waitForTimeout(300);
console.log("1 fresh, no data:",await notices());
await p.evaluate(async()=>{const q=allQs().filter(x=>x.item.rs==="phml");S[q[0].key]="3";S[q[0].key+"|action"]="Regrade";REPS={x:1};saveA();
 await IDB.put({id:"ph1",key:q[0].key,data:"data:image/jpeg;base64,/9j/AAAA",ts:1});await loadPhotos();checkBackupStale();render();});
console.log("2 edited, unbacked:",await notices());
let [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnBackup')]);
const f=D+'bk1.json';fs.copyFileSync(await d.path(),f);const j=JSON.parse(fs.readFileSync(f,'utf8'));
console.log("3 file:",d.suggestedFilename(),j.format,j.schemaVersion,Object.keys(j.answers.s).length,"answers",j.photos.length,"photos",j.template.pages.length,"pages");
console.log("  notice:",await notices());
await p.reload();await p.waitForTimeout(400);console.log("4 reload, in sync:",await notices());
await p.evaluate(()=>{const k=Object.keys(S)[0];S[k]="med";saveA();});await p.reload();await p.waitForTimeout(400);console.log("5 edited after backup:",await notices());
// wipe everything
await p.evaluate(async()=>{localStorage.clear();await IDB.clear();});await p.reload();await p.waitForTimeout(300);
console.log("6 wiped:",await p.evaluate(()=>[Object.keys(S).length,countPhotos()]));
await p.setInputFiles('#btnDone ~ input[type=file]',f);await p.waitForTimeout(600);
console.log("7 restored:",await p.evaluate(()=>[Object.keys(S).length,countPhotos(),JSON.stringify(REPS),T.pages.length]),await notices(),dialogs.slice(-1));
await p.reload();await p.waitForTimeout(400);console.log("8 reload after restore:",await p.evaluate(()=>[Object.keys(S).length,countPhotos()]),await notices());
// bad files
for(const [n,c] of [["notjson","hello"],["wrongfmt",JSON.stringify({pages:[]})],["newer",JSON.stringify({format:"iac-audit-backup",schemaVersion:99})],["damaged",JSON.stringify({format:"iac-audit-backup",schemaVersion:1})]]){
 fs.writeFileSync(D+n+'.json',c);const before=await p.evaluate(()=>Object.keys(S).length);
 await p.setInputFiles('#btnDone ~ input[type=file]',D+n+'.json');await p.waitForTimeout(300);
 console.log("bad",n,"->",dialogs.slice(-1)[0].slice(0,60),"| unchanged:",before===await p.evaluate(()=>Object.keys(S).length));}
// complete button + auto-backup on report view
await p.evaluate(()=>{const k=Object.keys(S)[0];S[k]="high";saveA();});
[d]=await Promise.all([p.waitForEvent('download'),p.click('#btnReport')]);console.log("9 report view auto-backup:",d.suggestedFilename());
[d]=await Promise.all([p.waitForEvent('download'),p.click('#btnDone')]);console.log("10 complete:",await p.textContent('#btnDone'),JSON.parse(fs.readFileSync(await d.path(),'utf8')).complete);
await p.click('#btnDone');console.log("11 reopen:",await p.textContent('#btnDone'));
console.log("errors:",errs);await b.close()})();
