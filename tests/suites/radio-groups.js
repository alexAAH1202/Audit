// Run by tests/run.js:  node tests/suites/radio-groups.js <path to access-audit.html>
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage({viewport:{width:1000,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
const G=p.locator('[role=radiogroup]').first();
console.log("1 aria snapshot:\n"+(await G.ariaSnapshot()).split("\n").slice(0,8).join("\n"));
console.log("2 label resolves:",await p.evaluate(()=>{const g=document.querySelector('[role=radiogroup][aria-labelledby]');return document.getElementById(g.getAttribute('aria-labelledby')).textContent.slice(0,50)}));
const st=()=>p.evaluate(()=>{const g=document.querySelector('[role=radiogroup]');return [...g.querySelectorAll('[role=radio]')].map(b=>(b.getAttribute('aria-checked')==="true"?"●":"○")+b.tabIndex).join(" ")});
console.log("3 initial (none chosen):",await st());
// tab into the group: first radio only
await p.locator('[role=radio]').first().focus();
await p.keyboard.press('ArrowRight');console.log("4 ArrowRight:",await st(),"| focus:",await p.evaluate(()=>document.activeElement.textContent));
await p.keyboard.press('ArrowDown');await p.keyboard.press('End');console.log("5 End:",await st(),"| answer saved:",await p.evaluate(()=>{const k=document.querySelector('[role=radio]').dataset.q;return S[k]}));
await p.keyboard.press('ArrowRight');console.log("6 wrap:",await st());
await p.keyboard.press('ArrowLeft');console.log("7 left:",await st());
await p.keyboard.press('Home');console.log("8 Home:",await st());
// Tab stops per group
await p.locator('[role=radio]').first().focus();await p.keyboard.press('Tab');
console.log("9 one Tab leaves the group:",await p.evaluate(()=>!document.activeElement.matches('[role=radio]')||document.activeElement.closest('[role=radiogroup]')!==document.querySelector('[role=radiogroup]')));
// click toggle clears, aria follows
await p.locator('[role=radio]').nth(2).click();console.log("10 click:",await st());
await p.locator('[role=radio]').nth(2).click();console.log("11 click again clears:",await st());
// space key
await p.locator('[role=radio]').nth(1).focus();await p.keyboard.press('Space');console.log("12 Space selects:",await st());
// focus kept after nav render
console.log("13 focus still in group after answer:",await p.evaluate(()=>document.activeElement.matches('[role=radio]')));
// persistence
await p.reload();await p.waitForTimeout(300);await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});console.log("14 after reload:",await st());
// addl group + counts
console.log("15 groups:",await p.$$eval('[role=radiogroup]',g=>g.length),"| buttons without role:",await p.$$eval('button[data-q]:not([role=radio])',g=>g.length),"| groups without a name:",await p.$$eval('[role=radiogroup]:not([aria-label]):not([aria-labelledby])',g=>g.length));
console.log("16 addl name:",await p.$$eval('[role=radiogroup][aria-label]',g=>g[0]&&g[0].getAttribute('aria-label')));
// every aria-labelledby id exists & unique
console.log("17 ids ok:",await p.evaluate(()=>{const ids=[...document.querySelectorAll('[role=radiogroup][aria-labelledby]')].map(g=>g.getAttribute('aria-labelledby'));return ids.every(i=>document.querySelectorAll('#'+CSS.escape(i)).length===1)}));
// report + other pages still render
await p.evaluate(()=>{mode="report";render()});console.log("18 report renders:",await p.$$eval('.card',c=>c.length)>0);
console.log("errors:",errs);await b.close()})();
