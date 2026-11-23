// Run by tests/run.js:  node tests/suites/keyboard-focus.js <path to access-audit.html>
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:700}});await p.goto('file://'+process.argv[2]);
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
await p.keyboard.press('Tab');let bad=[],n=0;
for(let i=0;i<200;i++){const r=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body||e.closest('#nextbar')||e.closest('.top')||e.closest('#notices')||e.className==='skip')return {skip:true};const c=document.getElementById('content').getBoundingClientRect();const r=e.getBoundingClientRect();const vis=Math.max(0,Math.min(r.bottom,c.bottom)-Math.max(r.top,c.top));return {id:(e.id||e.tagName)+'|'+(e.textContent||'').trim().slice(0,14),fully:vis<=0,frac:Math.round(vis/Math.max(1,r.height)*100)}});
 if(!r.skip){n++;if(r.fully)bad.push(r.id)}await p.keyboard.press('Tab');}
console.log("content tab stops checked:",n,"| entirely scrolled out of view when focused:",bad.length,bad.slice(0,4));await b.close()})();
