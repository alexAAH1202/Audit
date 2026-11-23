// Run by tests/run.js:  node tests/suites/top-bar.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const errs=[];
for(const w of [390,360,768,1280]){const p=await b.newPage({viewport:{width:w,height:800}});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.dismiss());await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
console.log(w,"top:",await p.$eval('.top',e=>Math.round(e.getBoundingClientRect().height)),"| notices:",await p.$eval('#notices',e=>Math.round(e.getBoundingClientRect().height)),"| visible buttons:",await p.$$eval('.top .btn',bs=>bs.filter(b=>b.offsetParent).map(b=>b.textContent.trim()).join(" · ")));
if(w===390){
 await p.screenshot({path:D+'tb-closed.png'});
 await p.click('#btnMore');console.log("  open: expanded",await p.getAttribute('#btnMore','aria-expanded'),"| visible:",await p.$$eval('.top .btn',bs=>bs.filter(b=>b.offsetParent).map(b=>b.textContent.trim()).join(" · ")));
 await p.screenshot({path:D+'tb-open.png'});
 await p.keyboard.press('Escape');console.log("  Esc closes:",await p.getAttribute('#btnMore','aria-expanded'),"focus on More:",await p.evaluate(()=>document.activeElement.id));
 await p.click('#btnMore');await p.click('#btnBackup');await p.waitForTimeout(300);console.log("  choosing an item closes menu:",await p.getAttribute('#btnMore','aria-expanded'));
 await p.click('#btnMore');await p.click('#btnEdit');console.log("  Edit template works, edit-only hidden until edit:",await p.evaluate(()=>document.body.classList.contains('edit-on')));
 await p.click('#btnMore');console.log("  edit-only items in menu:",await p.$$eval('.top .btn.editonly',bs=>bs.filter(b=>b.offsetParent).map(b=>b.textContent.trim()).join(" · ")));
 await p.screenshot({path:D+'tb-edit.png'});
 await p.click('#btnReport');console.log("  Report view still one tap:",await p.evaluate(()=>mode));
}
await p.close()}
console.log("errors:",errs);await b.close()})();
