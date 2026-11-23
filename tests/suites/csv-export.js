// Run by tests/run.js:  node tests/suites/csv-export.js <path to access-audit.html>
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({acceptDownloads:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);
await p.evaluate(()=>{const q=allQs().filter(x=>x.item.rs==="phml");const fi=((RS("phml").opts.find(o=>o.flag))||{}).code;S[q[0].key]=String(fi);S[q[0].key+"|diff"]="low";S[q[0].key+"|action"]='Fix "it", now';saveA();render();});
console.log(await p.$$eval('.top .btn',bs=>bs.map(b=>b.textContent).join(" | ")));
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnCsv')]);
console.log(d.suggestedFilename());console.log(require('fs').readFileSync(await d.path(),'utf8'));
console.log("errors:",errs);await b.close()})();
