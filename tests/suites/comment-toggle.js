// Run by tests/run.js:  node tests/suites/comment-toggle.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.evaluate(()=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k)});await p.reload();await p.waitForTimeout(300);
await p.evaluate(()=>{document.getElementById('notices').innerHTML='';cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render();document.getElementById('notices').innerHTML=''});
const row=i=>p.locator('.qrow').nth(i);
console.log("1 default: comment box hidden:",await row(0).locator('.qnote').isHidden(),"| toggle:",await row(0).locator('.notetoggle').textContent(),"| aria-expanded:",await row(0).locator('.notetoggle').getAttribute('aria-expanded'),"| row height:",await row(0).evaluate(e=>Math.round(e.getBoundingClientRect().height)));
await row(0).locator('.notetoggle').click();
console.log("2 click opens + focuses:",await row(0).locator('.qnote').isVisible(),await p.evaluate(()=>document.activeElement.classList.contains('qnote')),"| label now:",await row(0).locator('.notetoggle').textContent(),await row(0).locator('.notetoggle').getAttribute('aria-expanded'));
await p.keyboard.type('Measured 2.3m');
console.log("3 typed note saved:",await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Accessible Car Parking").key;return S[k+"|n"]}));
await p.screenshot({path:D+'ct-open.png'});
await row(0).locator('.notetoggle').click();console.log("4 collapse keeps the text, shows a dot:",await row(0).locator('.qnote').isHidden(),"|",await row(0).locator('.notetoggle').innerText());
await p.evaluate(()=>render());console.log("5 re-render keeps it collapsed (auditor closed it):",await row(0).locator('.qnote').isHidden());
await p.reload();await p.waitForTimeout(500);await p.evaluate(()=>{document.getElementById('notices').innerHTML='';cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
console.log("6 after reload a saved note opens by itself:",await row(0).locator('.qnote').isVisible(),"| value:",await row(0).locator('.qnote').inputValue(),"| other rows still folded:",await row(1).locator('.qnote').isHidden());
// keyboard: Tab to toggle, Enter opens
await row(2).locator('.notetoggle').focus();await p.keyboard.press('Enter');console.log("7 Enter on the toggle opens it:",await row(2).locator('.qnote').isVisible());
await p.keyboard.press('Escape');
// layout: toggle and photo button side by side
const pos=await row(1).evaluate(e=>{const t=e.querySelector('.notetoggle').getBoundingClientRect(),a=e.querySelector('.addphoto').getBoundingClientRect();return {sameRow:Math.abs(t.top-a.top)<4,tH:Math.round(t.height),aH:Math.round(a.height)}});
console.log("8 comment + photo buttons on one row:",JSON.stringify(pos),"| row height now:",await row(1).evaluate(e=>Math.round(e.getBoundingClientRect().height)));
// report/other still read notes
console.log("9 note reaches the report:",await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Accessible Car Parking").key;S[k]="high";saveA();mode="report";render();return document.body.innerText.includes('Measured 2.3m')}));
console.log("errors:",errs);await b.close()})();
