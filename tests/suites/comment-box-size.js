// Run by tests/run.js:  node tests/suites/comment-box-size.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();for(const w of [1100,390]){const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.argv[2]);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
await p.locator('.notetoggle').first().click();const first=p.locator('textarea.qnote').first();
console.log(w,"empty box height:",await first.evaluate(e=>Math.round(e.getBoundingClientRect().height)),"| font:",await first.evaluate(e=>getComputedStyle(e).fontSize));
await first.fill(Array.from({length:12},(_,i)=>"Line "+(i+1)+" of a long note about this item").join("\n"));
console.log("  after 12 lines:",await first.evaluate(e=>[Math.round(e.getBoundingClientRect().height),e.scrollHeight>e.clientHeight+2?"scrolls":"fits"]));
await first.fill("Short note");console.log("  after short note:",await first.evaluate(e=>Math.round(e.getBoundingClientRect().height)));
await p.evaluate(()=>{const k=allQs().find(x=>x.page.title==="Accessible Car Parking").key;S[k+"|n"]=Array.from({length:6},(_,i)=>"Saved line "+i).join("\n");NOTES_SHUT.clear();NOTES_OPEN.clear();saveA();render()});
console.log("  reload with saved 6-line note:",await p.locator('textarea.qnote').first().evaluate(e=>[Math.round(e.getBoundingClientRect().height),e.scrollHeight>e.clientHeight+2?"scrolls":"fits"]));
if(w===390)await p.screenshot({path:D+'note-phone.png'});
console.log("  errors:",errs);await p.close()}await b.close()})();
