// Run by tests/run.js:  node tests/suites/scope-section.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
await p.evaluate(()=>{
 const set=(pg,l,v)=>{S[getFieldKey(pg,l)]=v};
 set("Access Audit Details","Scope","Publicly accessible areas of the ground floor, car park and external path of travel.\nStaff-only areas excluded.");
 set("Access Audit Details","Benchmark","Disability (Access to Premises — Buildings) Standards 2010; NCC 2022; AS 1428.1-2009.");
 set("Access Audit Details","Access Audit Agreement","Agreement dated 3 Nov 2026, ref KSC-114.");
 set("Access Audit Details","Client approval received on","2026-11-05");
 const qs=allQs().filter(x=>x.item.rs==="phml");const hi=((RS("phml").opts.find(o=>o.flag&&o.score===0))||{}).code;
 ["Accessible Car Parking","Entrances","Signage"].forEach(t=>{const x=qs.find(q=>q.page.title===t);S[x.key]=hi});
 const y=qs.filter(q=>q.page.title==="Entrances")[1];S[y.key]="pass";
 S["report|limits"]='Roof terrace locked: not assessed.\n"Plant room" excluded <by agreement>.';
 saveA();mode="report";render()});
console.log("screen card:",await p.$eval('h3:text("Scope and limitations")',h=>h.parentElement.innerText.replace(/\n+/g,' | ').slice(0,700)));
console.log("textareas in scope card:",await p.$$eval('h3',hs=>hs.find(h=>h.textContent.startsWith("Scope and"))?.parentElement.querySelectorAll('textarea').length));
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);const ef=D+'sc-export.html';fs.copyFileSync(await d.path(),ef);
const q=await ctx.newPage();await q.goto('file://'+ef);
console.log("export: textareas",await q.$$eval('textarea',n=>n.length),"| hint paras",await q.$$eval('.rf-hint',n=>n.length));
console.log("export limits:",JSON.stringify(await q.$$eval('.rf-v',n=>n.map(x=>x.textContent).find(t=>t.includes("Roof")))));
console.log("benchmark once:",(await q.content()).split("Benchmark").length-1);
await q.pdf({path:D+'sc.pdf',preferCSSPageSize:true,printBackground:true});
// empty template: card still renders
const e=await ctx.newPage();await e.goto('file://'+process.argv[2]);await e.evaluate(()=>{localStorage.clear();});await e.reload();await e.evaluate(()=>{mode="report";render()});
console.log("empty audit card:",await e.$eval('h3:text("Scope and limitations")',h=>h.parentElement.innerText.replace(/\n+/g,' | ').slice(0,260)));
console.log("errors:",errs);await b.close()})();
