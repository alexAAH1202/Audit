// Run by tests/run.js:  node tests/suites/not-applicable.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1100,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
const stat=()=>p.evaluate(()=>{const t=totals();return {score:document.getElementById('tScore').textContent,ans:document.getElementById('tAns').textContent,unans:unansweredKeys().length}});
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Landscaping");render()});await p.locator(".grptoggle").first().click();
console.log("1 options per question:",await p.$$eval('[role=radiogroup][aria-labelledby]',g=>g[0].querySelectorAll('[role=radio]').length),"| last is:",await p.$$eval('[role=radiogroup][aria-labelledby]',g=>[...g[0].querySelectorAll('[role=radio]')].pop().textContent));
const before=await stat();
const first=p.locator('[role=radiogroup][aria-labelledby]').first();
await first.locator('[role=radio]').last().click();
const after=await stat();
console.log("2 mark N/A: stored:",await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Landscaping").key;return S[k]}),"| unanswered",before.unans,"->",after.unans,"| score",before.score,"->",after.score,"| aria-checked:",await first.locator('[role=radio]').last().getAttribute('aria-checked'));
console.log("3 page progress counts it as resolved:",await p.evaluate(()=>[...document.querySelectorAll('#nav a')].find(a=>a.textContent.includes('Landscaping')).textContent.replace(/\s+/g,' ').trim()));
// score: pass one, N/A one -> denominator shrinks
await p.evaluate(()=>{const q=allQs().filter(x=>x.page.title==="Landscaping");S[q[1].key]="pass";saveA();renderNav();renderTop();updatePageScore()});
console.log("4 score excludes N/A from the denominator:",await p.evaluate(()=>{const sc=pageScore(T.pages.find(x=>x.title==="Landscaping"));return JSON.stringify([sc.got,sc.max])}),"(5 questions, 1 N/A, 1 pass -> 1/4)");
// click again clears
if(await p.locator('.grptoggle[aria-expanded="false"]').count()) await p.locator('.grptoggle[aria-expanded="false"]').first().click();
await first.locator('[role=radio]').last().click();console.log("5 tap again clears:",await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Landscaping").key;return JSON.stringify(S[k])}));
// keyboard reaches it
await first.locator('[role=radio]').first().focus();await p.keyboard.press('End');console.log("6 End key selects N/A:",await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Landscaping").key;return S[k]}));
// next unanswered skips N/A
console.log("7 Next-unanswered ignores N/A:",await p.evaluate(()=>!unansweredKeys().some(x=>S[x.key]==="na")));
// not a finding
console.log("8 not a finding:",await p.evaluate(()=>collectFindings().filter(f=>f.page.title==="Landscaping"&&f.gl==="na"||f.opt&&f.opt.code==="na").length));
// scope: no lift
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Internal Accessways");render()});
const liftQ=await p.evaluate(()=>{const x=allQs().find(q=>q.item.t==="Lift landings and lobbies provide required circulation dimensions");return x.key});
await p.evaluate(()=>{S[allQs().find(q=>q.item.t==="Lifts are equipped with audible and visual indicators / hearing augmentation").key]="high";saveA()});
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Site Scope");render()});
await p.evaluate(()=>{[...document.querySelectorAll('[data-pick]')].find(b=>b.closest('.qrow').innerText.startsWith("Is a passenger")&&b.dataset.v==="no").click()});
console.log("9 lift = No: auto N/A set on:",await p.evaluate(()=>SCOPE_QRULES[0].texts.map(t=>{const x=allQs().find(q=>q.item.t===t);return x?(S[x.key]||"-")+(S[x.key+"|nasrc"]?"*":""):"(page skipped)"}).join(" , ")),"(* = set by scope; the hand-answered one untouched)");
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Internal Accessways");render()});
console.log("   shown as selected N/A on the page:",await p.evaluate(k=>{const b=document.querySelector(`[data-q="${CSS.escape(k)}"][data-v=na]`);return b&&b.getAttribute('aria-checked')},liftQ));
// hand override then switch back
await p.evaluate(k=>{document.querySelector(`[data-q="${CSS.escape(k)}"][data-v=pass]`).click()},liftQ);
console.log("10 hand answer replaces it:",await p.evaluate(k=>[S[k],S[k+"|nasrc"]||"no scope mark"].join(" / "),liftQ));
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Site Scope");render()});
await p.evaluate(()=>{[...document.querySelectorAll('[data-pick]')].find(b=>b.closest('.qrow').innerText.startsWith("Is a passenger")&&b.dataset.v==="yes").click()});
console.log("11 lift = Yes undoes scope marks only:",await p.evaluate(()=>SCOPE_QRULES[0].texts.map(t=>{const x=allQs().find(q=>q.item.t===t);return x?(S[x.key]||"-"):"?"}).join(" , ")));
// report
await p.evaluate(()=>{[...document.querySelectorAll('[data-pick]')].find(b=>b.closest('.qrow').innerText.startsWith("Is a passenger")&&b.dataset.v==="no").click();mode="report";render()});
console.log("12 report coverage:",await p.$$eval('h3',hs=>{const c=hs.find(h=>h.textContent.startsWith("Scope and"));return c.parentElement.innerText.replace(/\n+/g,' ').match(/\d+ questions? marked not applicable[^.]*\./)?.[0]?.slice(0,260)}));
console.log("    table cell:",await p.$$eval('.cov tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' ')).filter(t=>/not applicable/.test(t)).slice(0,2)));
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);fs.copyFileSync(await d.path(),D+'na-export.html');console.log("    export mentions it:",fs.readFileSync(D+'na-export.html','utf8').includes('marked not applicable'));
// backup carries na + nasrc
const [bk]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>document.getElementById('btnBackup').click())]);const j=JSON.parse(fs.readFileSync(await bk.path(),'utf8'));console.log("13 backup keeps N/A:",Object.values(j.answers.s).filter(v=>v==="na").length,"na answers,",Object.keys(j.answers.s).filter(k=>k.endsWith('|nasrc')).length,"scope marks");
console.log("errors:",errs);await b.close()})();
