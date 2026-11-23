// Run by tests/run.js:  node tests/suites/sweep-to-pass.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1000,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Entrances");render()});
const info=()=>p.evaluate(()=>{const c=[...document.querySelectorAll('.card')].find(c=>c.querySelector('.sweep'));
 const ks=[...c.querySelectorAll('[role=radiogroup][aria-labelledby]')].map(g=>g.querySelector('[data-q]').dataset.q);
 return {btn:c.querySelector('[data-sweepgo]').textContent,aria:c.querySelector('[data-sweepgo]').getAttribute('aria-disabled'),undoVisible:!c.querySelector('[data-sweepundo]').hidden,chip:c.querySelector('[data-sweepchip]').hidden?null:c.querySelector('[data-sweepchip]').textContent,msg:c.querySelector('[data-sweepmsg]').textContent,n:ks.length,ans:ks.map(k=>S[k]??"-").join(""),sw:ks.map(k=>S[k+"|sw"]?"s":".").join(""),checked:[...c.querySelectorAll('[role=radio][aria-checked=true]')].length,score:document.getElementById('tScore').textContent,flag:document.getElementById('tFlag').textContent}});
console.log("sweep groups on page:",await p.$$eval('.sweep',s=>s.map(x=>x.closest('.card').querySelector('h3').textContent.trim().slice(0,40))));
console.log("1 initial:",await info());
// two hand answers first
await p.evaluate(()=>{const c=[...document.querySelectorAll('.card')].find(c=>c.querySelector('.sweep'));const g=c.querySelectorAll('[role=radiogroup][aria-labelledby]');g[1].querySelectorAll('[role=radio]')[1].click();g[3].querySelectorAll('[role=radio]')[4].click()});
console.log("2 two hand answers:",await info());
await p.locator('[data-sweepgo]').first().focus();await p.keyboard.press('Enter');
console.log("3 swept via keyboard:",await info(),"| focus kept:",await p.evaluate(()=>document.activeElement.matches('[data-sweepgo]')));
console.log("  second sweep no-op:",await (async()=>{await p.keyboard.press('Enter');return (await info()).sw})());
// hand-touch a swept one
await p.evaluate(()=>{const c=[...document.querySelectorAll('.card')].find(c=>c.querySelector('.sweep'));c.querySelectorAll('[role=radiogroup][aria-labelledby]')[0].querySelectorAll('[role=radio]')[2].click()});
console.log("4 hand-changed Q1:",await info());
await p.locator('[data-sweepundo]').first().click();
console.log("5 undo:",await info());
await p.locator('[data-sweepgo]').first().click();
// report + export + backup
await p.evaluate(()=>{mode="report";render()});
console.log("6 report disclosure:",await p.evaluate(()=>{const t=[...document.querySelectorAll('.cov th')].map(x=>x.textContent);const r=[...document.querySelectorAll('.cov tr')].find(r=>r.textContent.includes("Entrances"));return [t.join("/"),r&&r.innerText.replace(/\s+/g,' ')]}),await p.evaluate(()=>[...document.querySelectorAll('#content p')].map(x=>x.textContent).find(t=>t.includes('sweeping')).trim().slice(0,110)));
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#btnBackup')]);const bk=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
console.log("7 backup keeps sweep marks:",Object.keys(bk.answers.s).filter(k=>k.endsWith("|sw")).length);
await p.evaluate(()=>{localStorage.clear()});await p.reload();await p.waitForTimeout(200);
await p.setInputFiles('#btnDone ~ input[type=file]',await dl.path());await p.waitForTimeout(500);
console.log("  restored sweep marks:",await p.evaluate(()=>Object.keys(S).filter(k=>k.endsWith("|sw")).length));
await p.evaluate(()=>{mode="audit";cur=T.pages.findIndex(x=>x.title==="Entrances");render()});console.log("8 after restore:",(await info()).chip,"| undo visible",(await info()).undoVisible);
const ex=await p.evaluate(()=>{mode="report";render();return document.querySelectorAll('.sweep').length});console.log("9 sweep controls in report:",ex);
await p.screenshot({path:D+'sweep.png',clip:{x:0,y:0,width:1000,height:300}});
console.log("errors:",errs);await b.close()})();
