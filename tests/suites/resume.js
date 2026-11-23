// Run by tests/run.js:  node tests/suites/resume.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1100,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const wipe=()=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k)};
await p.goto('file://'+process.argv[2]);await p.evaluate(wipe);await p.reload();await p.waitForTimeout(400);
const note=()=>p.evaluate(()=>{const n=document.querySelector('[data-notice=resume]');return n?n.innerText.replace(/\s+/g,' ').trim():null});
console.log("1 fresh audit offers nothing:",await note());
// work on a page: answer questions 1-3 of 7 on Floor / Ground Surfaces
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Floor / Ground Surfaces");render()});
const radios=p.locator('[role=radiogroup][aria-labelledby]');
await radios.nth(0).locator('[role=radio]').first().click();
await radios.nth(1).locator('[role=radio]').nth(1).click();
await radios.nth(2).locator('[role=radio]').first().click();
console.log("2 saved as the audit goes:",await p.evaluate(()=>{const r=JSON.parse(localStorage.getItem('iac_resume_v1'));const x=allQs().find(q=>q.key===r.k);return x.item.t.slice(0,40)}));
// go elsewhere, reload
await p.evaluate(()=>{cur=0;render();saveA()});
await p.reload();await p.waitForTimeout(700);
console.log("3 after reload:",await note());
await p.click('[data-act=resume]');await p.waitForTimeout(250);
console.log("4 Continue: page:",await p.evaluate(()=>T.pages[cur].title),"| focus on its answer group:",await p.evaluate(()=>document.activeElement.getAttribute('role')+" / "+(document.activeElement.closest('[role=radiogroup]')?.getAttribute('aria-labelledby')===('ql-'+JSON.parse(localStorage.getItem('iac_resume_v1')).k.replace(/\|/g,'-p-').replace(/[^\w-]/g,'_')))),"| notice gone:",(await note())===null);
// Next unanswered continues after it
await p.evaluate(()=>document.getElementById('btnNextUn').click());await p.waitForTimeout(150);
console.log("5 Next unanswered continues after the resume point:",await p.evaluate(()=>{const k=document.activeElement.closest('[role=radiogroup]');const q=allQs().filter(x=>x.page.title==="Floor / Ground Surfaces");const i=q.findIndex(x=>('ql-'+x.key.replace(/\|/g,'-p-').replace(/[^\w-]/g,'_'))===k.getAttribute('aria-labelledby'));return "question "+(i+1)+" of "+q.length}));
// after a reload the FAB continues from the saved point too (not from the top)
await p.evaluate(()=>{cur=0;render()});await p.reload();await p.waitForTimeout(600);await p.click('#btnNextUn');await p.waitForTimeout(200);
console.log("6 after reload, Next unanswered starts from where you were:",await p.evaluate(()=>T.pages[cur].title));
// stale key ignored
await p.evaluate(()=>localStorage.setItem('iac_resume_v1',JSON.stringify({k:'nonsense',t:1})));await p.reload();await p.waitForTimeout(600);console.log("7 stale key: no offer:",(await note())===null);
// all answered: nothing to continue
await p.evaluate(()=>{localStorage.setItem('iac_resume_v1',JSON.stringify({k:allQs()[3].key,t:1}));unansweredKeys().forEach(x=>{S[x.key]="pass"});saveA()});await p.reload();await p.waitForTimeout(600);
console.log("8 everything answered: no offer:",(await note())===null);
// backup carries it, restore restores it
await p.evaluate(()=>{const k=allQs()[10].key;S[k]="";setLastQ(k);saveA()});
const [bk]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>document.getElementById('btnBackup').click())]);const j=JSON.parse(fs.readFileSync(await bk.path(),'utf8'));
console.log("9 backup records it:",typeof j.resume==="string"&&j.resume.length>0);
await p.evaluate(wipe);await p.reload();await p.waitForTimeout(400);
await p.setInputFiles('#btnDone ~ input[type=file]',await bk.path());await p.waitForTimeout(700);
console.log("   after restore, saved:",await p.evaluate(()=>JSON.parse(localStorage.getItem('iac_resume_v1')).k===allQs()[10].key));
// reset clears it
await p.click('#btnReset');await p.fill('#resetConfirm','RESET');await p.click('[data-go]');await p.waitForTimeout(300);
console.log("10 reset clears it:",await p.evaluate(()=>localStorage.getItem('iac_resume_v1')));
console.log("errors:",errs);await b.close()})();
