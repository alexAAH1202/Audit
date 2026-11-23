// Run by tests/run.js:  node tests/suites/site-scope.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1000,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
const tot=()=>p.evaluate(()=>[allQs().length,document.getElementById('tAns').textContent]);
console.log("1 order:",await p.evaluate(()=>T.pages.slice(0,4).map(x=>x.title).join(" > ")),"| assessable q:",(await tot())[0]);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Site Scope");render()});
console.log("2 banner:",await p.$eval('.draftbar',e=>e.innerText.replace(/\s+/g,' ').slice(0,90)),"| groups:",await p.$$eval('[role=radiogroup][aria-labelledby]',g=>g.length),"| follow-up shown:",await p.$$eval('[role=radiogroup]',g=>g.length)>0&&await p.evaluate(()=>!!document.body.innerText.match(/When were the sanitary/)));
const pick=async(label,code)=>{await p.evaluate(([l,c])=>{[...document.querySelectorAll('[data-pick]')].find(b=>b.closest('.qrow').innerText.startsWith(l)&&b.dataset.v===c).click()},[label,code])};
await pick("Storeys","1");await pick("Is on-site","no");await pick("Are sanitary","no");
console.log("3 answers stored:",await p.evaluate(()=>JSON.stringify(scopeAnswers())),"| aria-checked after render:",await p.$$eval('[data-pick][aria-checked=true]',b=>b.length),"| focus on selected:",await p.evaluate(()=>document.activeElement.getAttribute('aria-checked')));
console.log("4 skipped:",await p.evaluate(()=>T.pages.filter(isSkipped).map(x=>x.title).join(" | ")),"| assessable q now:",(await tot())[0],"(was 500)");
console.log("5 nav N/A:",await p.$$eval('#nav a.na',n=>n.map(x=>x.getAttribute('aria-label')).join(" || ")));
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Ambulant Toilets");render()});
console.log("6 skipped page:",await p.$eval('.skipbar',e=>e.innerText.replace(/\s+/g,' ')),"| questions rendered:",await p.$$eval('[role=radiogroup]',g=>g.length));
await p.click('[data-scopeov]');await p.waitForTimeout(100);
console.log("7 assess anyway:",await p.$$eval('[role=radiogroup]',g=>g.length)>0,"| q count:",(await tot())[0]);
await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Ambulant Toilets").key;S[k]="pass";saveA();render()});
console.log("8 answered page stays:",await p.$eval('.skipbar',e=>e.innerText.slice(0,90)));
// answered page stays even if override removed
await p.evaluate(()=>{delete S["scopeov|"+T.pages.find(x=>x.title==="Ambulant Toilets").id];saveA();render()});
console.log("  still not skipped with answers:",await p.evaluate(()=>!isSkipped(T.pages.find(x=>x.title==="Ambulant Toilets"))));
// sanitary yes -> follow-up + built rule
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Site Scope");render()});await pick("Are sanitary","yes");
console.log("9 follow-up appears:",await p.evaluate(()=>!!document.body.innerText.match(/When were the sanitary/)));
await pick("When were","before");console.log("  skipped now:",await p.evaluate(()=>T.pages.filter(isSkipped).map(x=>x.title).join(" | ")));
// keyboard
await p.locator('[data-pick][aria-checked=true]').first().focus();await p.keyboard.press('ArrowRight');
console.log("10 arrow key moved+saved:",await p.evaluate(()=>JSON.stringify(scopeAnswers())),"| focus kept:",await p.evaluate(()=>document.activeElement.hasAttribute('data-pick')));
// staff-only skips nothing
await p.evaluate(()=>{});await pick("Who uses","staff");console.log("11 staff-only skips Customer Service Areas?",await p.evaluate(()=>isSkipped(T.pages.find(x=>x.title==="Customer Service Areas"))));
// persistence + report
await p.reload();await p.waitForTimeout(300);console.log("12 persists:",await p.evaluate(()=>JSON.stringify(scopeAnswers())));
await p.evaluate(()=>{mode="report";render()});
console.log("13 report draft box:",await p.$eval('.draftbox',e=>e.innerText.replace(/\s+/g,' ').slice(0,120)),"| declared scope rows:",await p.$$eval('h3',hs=>{const c=hs.find(h=>h.textContent.startsWith("Scope and"));return c.parentElement.innerText.includes("Not applicable by scope")}));
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);fs.copyFileSync(await dl.path(),D+'ss-export.html');
const q=await ctx.newPage();await q.goto('file://'+D+'ss-export.html');
console.log("14 export: draft box",await q.$$eval('.draftbox,.draftchip',n=>n.length),"| not applicable text:",(await q.content()).includes("Not applicable by scope"));
// review list
await p.evaluate(()=>{mode="audit";render()});
console.log("15 review btn:",await p.$eval('#btnReview',b=>b.textContent));
await p.evaluate(()=>reviewModal());console.log("  items:",await p.$$eval('.revitem',n=>n.length));
await p.locator('[data-rev]').first().check();console.log("  after tick:",await p.$eval('#btnReview',b=>b.textContent),"| saved in template:",await p.evaluate(()=>JSON.stringify(T.meta.reviewed)));
await p.click('[data-close]');
// TBC chip
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Refuge & Assisted Evacuation");render()});console.log("16 TBC chips on page:",await p.$$eval('.draftchip',n=>n.length));
console.log("errors:",errs);await b.close()})();
