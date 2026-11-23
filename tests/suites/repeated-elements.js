// Run by tests/run.js:  node tests/suites/repeated-elements.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1100,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
console.log("1 single instance: name field visible:",await p.isVisible('[data-instlbl]'),"| required tag:",await p.$$eval('.instname .reqtag',n=>n.length),"| heading:",await p.$eval('.rep h4',h=>h.textContent));
await p.click('[data-addrep]');await p.waitForTimeout(150);
console.log("2 after Add another: instances:",await p.$$eval('.rep',n=>n.length),"| focus on NEW name field:",await p.evaluate(()=>document.activeElement.hasAttribute('data-instlbl')&&document.activeElement.id),"| required tags:",await p.$$eval('.instname .reqtag',n=>n.length),"| unnamed notes:",await p.$$eval('.needname:not([hidden])',n=>n.length));
await p.keyboard.type('Bay 2 near the door');
console.log("3 typed: heading live:",await p.$$eval('.rep h4',h=>h.map(x=>x.textContent).join(" | ")),"| stored:",await p.evaluate(()=>Object.entries(S).filter(([k])=>k.endsWith('|lbl')).map(([k,v])=>v).join()));
await p.locator('[data-instlbl]').first().fill('Bay 1 nearest entry');
console.log("4 first named:",await p.$$eval('.rep h4',h=>h.map(x=>x.textContent).join(" | ")),"| unnamed notes:",await p.$$eval('.needname:not([hidden])',n=>n.length));
// answer a question in each bay
await p.evaluate(()=>{const o=RS("phml").opts;const hi=((o.find(x=>x.flag&&x.score===0))||{}).code,br=((o.find(x=>x.breach))||{}).code;const qs=allQs().filter(x=>x.page.title==="Accessible Car Parking"&&x.trail.length);
 const a=qs.find(x=>x.trail[0]==="Bay 1 nearest entry"),b2=qs.find(x=>x.trail[0]==="Bay 2 near the door");S[a.key]=hi;S[b2.key]=br;S[b2.key+"|action"]="Re-mark bay";
 const jpg=(()=>{const c=document.createElement('canvas');c.width=200;c.height=100;return c.toDataURL('image/jpeg')})();PHOTOS[b2.key]=[{id:"z1",key:b2.key,data:jpg,ts:1}];saveA();mode="report";render()});
console.log("5 report locations:",await p.$$eval('.flagitem .fp',n=>n.map(x=>x.textContent.slice(0,60)).join(" || ")));
console.log("  schedule Location:",await p.$$eval('.rep-table td[data-label=Location]',n=>n.map(x=>x.textContent).join(" || ")),"| plate:",await p.$$eval('.plate figcaption',n=>n.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,110)).join()));
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#btnCsv')]);console.log("  CSV Location col:",fs.readFileSync(await dl.path(),'utf8').split("\r\n").slice(1).map(l=>l.split('","')[4]).join(" || "));
// unnamed third bay -> default text + draft box
await p.evaluate(()=>{mode="audit";cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});await p.click('[data-addrep]');
await p.evaluate(()=>{const o=RS("phml").opts;const hi=((o.find(x=>x.flag&&x.score===0))||{}).code;const x=allQs().find(q=>q.page.title==="Accessible Car Parking"&&q.trail.length&&/#3/.test(q.trail[0]));S[x.key]=hi;saveA();mode="report";render()});
console.log("6 unnamed fallback in report:",await p.$$eval('.flagitem .fp',n=>n.map(x=>x.textContent.slice(0,60)).filter(t=>/#3/.test(t)).join()),"| draft box mentions unnamed:",await p.$$eval('.draftbox',n=>n.some(x=>/Name the repeated/.test(x.textContent))));
const [d2]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);fs.copyFileSync(await d2.path(),D+'in-export.html');const q=await ctx.newPage();await q.goto('file://'+D+'in-export.html');
console.log("  export: draft box gone:",await q.$$eval('.draftbox',n=>n.length)===0,"| names present:",(await q.content()).includes("Bay 2 near the door"));
// remove last instance deletes its name; persistence; backup/restore
await p.evaluate(()=>{mode="audit";cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
await p.locator('[data-delrep]').click();console.log("7 removed #3: instances",await p.$$eval('.rep',n=>n.length),"| stale name keys:",await p.evaluate(()=>Object.keys(S).filter(k=>k.endsWith('~2|lbl')).length));
await p.reload();await p.waitForTimeout(300);await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});console.log("8 persists:",await p.$$eval('.rep h4',h=>h.map(x=>x.textContent).join(" | ")));
const [bk]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>document.getElementById('btnBackup').click())]);const bj=JSON.parse(fs.readFileSync(await bk.path(),'utf8'));console.log("9 backup holds names:",Object.keys(bj.answers.s).filter(k=>k.endsWith('|lbl')).length);
await p.evaluate(()=>{localStorage.clear()});await p.reload();await p.setInputFiles('#btnDone ~ input[type=file]',await bk.path());await p.waitForTimeout(500);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});console.log("  restored:",await p.$$eval('.rep h4',h=>h.map(x=>x.textContent).join(" | ")));
// nested/other sections: Entrances page
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Entrances");render()});console.log("10 Entrances: name fields:",await p.$$eval('[data-instlbl]',n=>n.length),"(fixed PPE section has none:",await p.$$eval('.rep',n=>n.length),"instances)");
console.log("errors:",errs);await b.close()})();
