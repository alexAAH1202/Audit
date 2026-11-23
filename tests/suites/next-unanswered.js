// Run by tests/run.js:  node tests/suites/next-unanswered.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
console.log("1 nav labels:",await p.$$eval('#nav a, #nav .div',n=>n.slice(0,12).map(x=>x.innerText.replace(/\s+/g,' ').trim()).join(" | ")));
console.log("  aria sample:",await p.$eval('#nav a[aria-label]',a=>a.getAttribute('aria-label')),"| score text in nav:",await p.$$eval('#nav .sc',n=>n.some(x=>/\d+\/\d+/.test(x.textContent)&&false)));
console.log("2 fab:",await p.$eval('#btnNextUn',f=>[f.textContent,f.hidden,f.getAttribute('aria-disabled')]),"| totals-based unanswered:",await p.evaluate(()=>unansweredKeys().length));
await p.click('#btnNextUn');await p.waitForTimeout(300);
console.log("3 first jump -> page:",await p.evaluate(()=>T.pages[cur].title),"| focus is radio:",await p.evaluate(()=>document.activeElement.getAttribute('role')),"| flash:",await p.$$eval('.qrow.flash',n=>n.length));
const first=await p.evaluate(()=>document.activeElement.dataset.q);
await p.keyboard.press('ArrowRight');   // answers it (High)
await p.click('#btnNextUn');await p.waitForTimeout(200);
const second=await p.evaluate(()=>document.activeElement.dataset.q);
console.log("4 after answering, next is a different question on the same page:",first!==second,await p.evaluate(()=>T.pages[cur].title),"| count:",await p.$eval('#btnNextUn',f=>f.textContent));
// jump from a late page wraps around
await p.evaluate(()=>{cur=T.pages.length-3;lastQ=null;render()});await p.click('#btnNextUn');await p.waitForTimeout(200);
console.log("5 from a late page:",await p.evaluate(()=>T.pages[cur].title));
// answer everything, check done state
await p.evaluate(()=>{unansweredKeys().forEach(x=>{S[x.key]="pass"});saveA();renderNav();renderTop();});
console.log("6 all answered:",await p.$eval('#btnNextUn',f=>[f.textContent,f.getAttribute('aria-disabled')]),"| nav:",await p.$$eval('#nav a',n=>n.slice(5,8).map(x=>x.innerText.replace(/\s+/g,' ').trim()).join(" | ")),"| sections:",await p.$$eval('#nav .div',n=>n.slice(0,3).map(x=>x.innerText.replace(/\s+/g,' ').trim()).join(" | ")));
await p.evaluate(()=>document.getElementById('btnNextUn').click());console.log("  click when done is a no-op:",await p.evaluate(()=>T.pages[cur].title));
await p.evaluate(()=>{mode="report";render()});console.log("7 hidden in report:",await p.$eval('#nextbar',f=>f.hidden));
await p.evaluate(()=>{mode="audit";EDIT=true;render()});console.log("  hidden in edit:",await p.$eval('#nextbar',f=>f.hidden));
await p.evaluate(()=>{EDIT=false;render()});
await p.setViewportSize({width:390,height:800});await p.evaluate(()=>{S[allQs()[10].key]="";saveA();renderTop();render()});await p.screenshot({path:D+'fab.png'});
console.log("errors:",errs);await b.close()})();
