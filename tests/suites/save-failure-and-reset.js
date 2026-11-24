// Run by tests/run.js:  node tests/suites/save-failure-and-reset.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
const N=()=>p.evaluate(()=>[...document.querySelectorAll('#notices .notice')].map(n=>n.className.replace('notice','').trim()+": "+n.innerText.replace(/\s+/g,' ').slice(0,75)).filter(x=>!x.includes('Storage not protected')));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
// A: quota on localStorage
await p.evaluate(()=>{window._si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="iac_answers_v2")throw new DOMException("full","QuotaExceededError");return window._si.call(this,k,v)}});
await p.evaluate(()=>{const q=allQs().filter(x=>x.item.rs==="phml");S[q[0].key]="3";saveA();saveA();saveA();});
console.log("A quota:",await N());
console.log("  one notice only:",await p.$$eval('[data-notice="savefail"]',n=>n.length));
await p.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException("blocked","SecurityError")};saveA()});console.log("A2 other error:",await N());
await p.evaluate(()=>{Storage.prototype.setItem=window._si;saveA()});console.log("A3 recovered:",await N());
// B: photo store fails
await p.evaluate(()=>{window._pp=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException("full","QuotaExceededError")}});
const k=await p.evaluate(()=>allQs().filter(x=>x.item.rs==="phml")[0].key);
await p.evaluate(async k=>{const rec={id:"x1",key:k,data:"data:image/jpeg;base64,AAAA",ts:1};const er=await IDB.put(rec);if(er)saveFailed("photos",er);(PHOTOS[k]=PHOTOS[k]||[]).push(rec)},k);
console.log("B photo fail:",await N());
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#notices [data-act=backup]')]);
console.log("  backup includes unsaved photo:",JSON.parse(fs.readFileSync(await d.path(),'utf8')).photos.map(x=>x.id));
await p.evaluate(()=>{IDBObjectStore.prototype.put=window._pp});
// C: reset dialog
await p.evaluate(()=>{const f=allQs()[0];});
const sitekey=await p.evaluate(()=>getFieldKey("Title Page","Site conducted"));await p.evaluate(k=>{S[k]="Kerrabee Community Centre";saveA();},sitekey);
await p.click('#btnReset');await p.waitForSelector('dialog[open]');
console.log("C1 go disabled:",await p.isDisabled('[data-go]'),"| focus on input:",await p.evaluate(()=>document.activeElement.id));
await p.screenshot({path:D+'reset.png'});
await p.fill('#resetConfirm','Kerrabee');console.log("C2 partial:",await p.isDisabled('[data-go]'));
await p.fill('#resetConfirm','  kerrabee COMMUNITY  centre ');console.log("C3 case/space-insensitive match:",!await p.isDisabled('[data-go]'));
await p.click('[data-cancel]');console.log("C4 cancelled, data kept:",await p.evaluate(()=>[Object.keys(S).length,!!document.querySelector('dialog')]));
await p.click('#btnReset');await p.keyboard.press('Escape');console.log("C5 Esc closes:",await p.waitForFunction(()=>!document.querySelector('dialog'),null,{timeout:3000}).then(()=>true,()=>false));
await p.click('#btnReset');await p.type('#resetConfirm','Kerrabee Community Centre');await p.keyboard.press('Enter');await p.waitForTimeout(300);
console.log("C6 reset by Enter:",await p.evaluate(()=>[Object.keys(S).length,countPhotos(),!!document.querySelector('dialog')]));
await p.click('#btnReset');console.log("C7 no site -> word:",await p.textContent('#resetDlgLabel, label[for=resetConfirm]'));
console.log("errors:",errs);await b.close()})();
