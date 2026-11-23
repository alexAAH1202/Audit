// Run by tests/run.js:  node tests/suites/best-practice-groups.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.evaluate(()=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k)});await p.reload();await p.waitForTimeout(300);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
const tog=()=>p.locator('.grptoggle').first();
console.log("1 groups on page:",await p.$$eval('.card h3',h=>h.map(x=>x.innerText.replace(/\s+/g,' ').trim().slice(0,70)).join(" || ")));
console.log("  Best Practice folded:",await tog().getAttribute('aria-expanded'),"| its questions hidden:",await p.evaluate(()=>{const g=document.querySelector('.grpbody');return g.hidden&&g.querySelector('[role=radio]').offsetParent===null}),"| legislative group still open:",await p.evaluate(()=>[...document.querySelectorAll('.card')].filter(c=>!c.querySelector('.grptoggle')&&c.querySelector('[role=radiogroup]')).length>0));
console.log("2 hidden controls are not tab stops:",await p.evaluate(async()=>{const g=document.querySelector('.grpbody');return [...g.querySelectorAll('button,textarea')].every(e=>e.offsetParent===null)}));
// open / close
await tog().click();console.log("3 click opens:",await tog().getAttribute('aria-expanded'),await p.evaluate(()=>document.querySelector('.grpbody').hidden===false));
await p.evaluate(()=>render());console.log("   survives a re-render:",await tog().getAttribute('aria-expanded'));
await tog().click();console.log("   click closes:",await tog().getAttribute('aria-expanded'));
// keyboard
await tog().focus();await p.keyboard.press('Enter');console.log("4 Enter opens:",await tog().getAttribute('aria-expanded'));await p.keyboard.press('Space');console.log("   Space closes:",await tog().getAttribute('aria-expanded'));
// answering inside opens a folded group and counts live
await p.evaluate(()=>{const card=document.querySelector('.grpcard');const ks=sweepKeys(card);S[ks[ks.length-1]]="high";saveA();GRP_OPEN.clear();GRP_SHUT.clear();render()});
console.log("5 a group with an answer opens itself:",await tog().getAttribute('aria-expanded'),"| header:",await tog().innerText().then(t=>t.replace(/\s+/g,' ')));
await p.locator('.grpbody [role=radiogroup]').first().locator('[role=radio]').nth(2).click();
console.log("6 header updates as you answer:",await tog().innerText().then(t=>t.replace(/\s+/g,' ')));
// Next unanswered opens a folded group
await p.evaluate(()=>{GRP_OPEN.clear();GRP_SHUT.clear();const g=T.pages.find(x=>x.title==="Accessible Car Parking");allQs().filter(x=>x.page===g).forEach(x=>{S[x.key]="pass"});
 const card=document.querySelector('.grpcard');sweepKeys(card).forEach(k=>{S[k]=""});saveA();render()});
console.log("7 before jump, BP folded:",await tog().getAttribute('aria-expanded'));
await p.click('#btnNextUn');await p.waitForTimeout(300);
console.log("   Next unanswered opened it and focused inside:",await tog().getAttribute('aria-expanded'),"|",await p.evaluate(()=>!!document.activeElement.closest('.grpbody')&&document.activeElement.getAttribute('role')));
// resume via goToQuestion
await p.evaluate(()=>{GRP_OPEN.clear();GRP_SHUT.clear();render()});
await p.evaluate(()=>{const card=document.querySelector('.grpcard');const k=sweepKeys(card)[0];goToQuestion(allQs().find(x=>x.key===k))});await p.waitForTimeout(250);
console.log("8 goToQuestion (Resume) opens it:",await tog().getAttribute('aria-expanded'));
// edit mode shows everything
await p.evaluate(()=>{EDIT=true;render()});console.log("9 template editor not folded:",await p.$$eval('.grptoggle',n=>n.length)===0);
await p.evaluate(()=>{EDIT=false;render()});
// page height saving
const h1=await p.evaluate(()=>{GRP_OPEN.clear();GRP_SHUT.clear();cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");const g=allQs().filter(x=>x.page.title==="Accessible Car Parking");g.forEach(x=>S[x.key]="");render();return document.getElementById('content').scrollHeight});
await p.evaluate(()=>{document.querySelectorAll('.grptoggle').forEach(t=>t.click())});const h2=await p.evaluate(()=>document.getElementById('content').scrollHeight);
console.log("10 page height folded vs all open:",h1,"vs",h2,"(",Math.round((1-h1/h2)*100)+"% shorter )");
console.log("errors:",errs);await b.close()})();
