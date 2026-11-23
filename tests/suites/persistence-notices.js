// Run by tests/run.js:  node tests/suites/persistence-notices.js <path to access-audit.html>
const {chromium}=require('playwright');const S=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();
for(const mode of ["granted","refused","unsupported"]){
 const p=await b.newPage({viewport:{width:390,height:500}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(m=>{ if(m==="unsupported"){Object.defineProperty(navigator,'storage',{value:undefined});}
   else {navigator.storage.persisted=async()=>false;navigator.storage.persist=async()=>m==="granted";} },mode);
 await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
 console.log(mode,await p.evaluate(()=>[PERSIST,document.getElementById('notices').innerText.trim().slice(0,60)]),errs);
 if(mode==="refused"){await p.screenshot({path:S+'persist.png'});await p.click('.notice .nx');console.log("after dismiss:",await p.$$eval('.notice',n=>n.length));}
 await p.close();}
await b.close()})();
