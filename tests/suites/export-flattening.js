// Run by tests/run.js:  node tests/suites/export-flattening.js <path to access-audit.html>
const {chromium}=require('playwright');const S=(process.env.TEST_OUT+'/');(async()=>{const b=await chromium.launch();const p=await b.newPage({acceptDownloads:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);
await p.evaluate(()=>{const q=allQs().filter(x=>x.item.rs==="phml");const o=RS("phml").opts;
 const br=((o.find(x=>x.breach))||{}).code,hi=((o.find(x=>x.flag&&x.score===0))||{}).code;
 S[q[0].key]=String(br);S[q[0].key+"|diff"]="low";S[q[0].key+"|tf"]="2";S[q[0].key+"|action"]="Regrade the bay.";
 S[q[3].key]=String(hi);
 saveA();mode="report";render();});
const live=await p.evaluate(()=>[document.querySelectorAll('#content select').length,document.querySelectorAll('#content .rf-hint').length]);
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);
const f=S+'export3.html';require('fs').copyFileSync(await d.path(),f);
const q=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});await q.goto('file://'+f);
console.log("live selects/hints",live,"export:",await q.evaluate(()=>[document.querySelectorAll('#rContent select').length,document.querySelectorAll('.rf-hint').length,[...document.querySelectorAll('.flagitem .tf-row')].map(r=>r.innerText.replace(/\s+/g,' ')).join(' || ')]));
await (await q.$('.flagitem')).evaluate(e=>e.scrollIntoView({block:"center"}));await q.screenshot({path:S+'export3.png'});
console.log("errors:",errs);await b.close()})();
