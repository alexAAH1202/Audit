// Run by tests/run.js:  node tests/suites/photo-integrity.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1100,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const wipe=()=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k)};
const notice=()=>p.evaluate(()=>{const n=document.querySelector('[data-notice=photoloss]');return n?n.innerText.replace(/\s+/g,' ').trim():null});
await p.goto('file://'+process.argv[2]);await p.evaluate(async()=>{localStorage.clear();await IDB.clear()});await p.reload();await p.waitForTimeout(500);
const jpg=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=120;c.height=80;return c.toDataURL('image/jpeg')});
console.log("1 first run, manifest seeded:",await p.evaluate(()=>JSON.stringify(pmLoad())),"| notice:",await notice());
// add three photos through the normal path
await p.evaluate(async jpg=>{const q=allQs().filter(x=>x.page.title==="Accessible Car Parking");
 for(let i=0;i<3;i++){const rec={id:"ph"+i,key:q[i].key,data:jpg,ts:1};await IDB.put(rec);(PHOTOS[q[i].key]=PHOTOS[q[i].key]||[]).push(rec)}},jpg);
console.log("2 manifest tracks adds:",await p.evaluate(()=>Object.keys(pmLoad()).join()));
await p.reload();await p.waitForTimeout(700);console.log("3 reload, all present: no notice:",(await notice())===null,"| photos in memory:",await p.evaluate(()=>countPhotos()));
// delete one the normal way: manifest follows, no false alarm
await p.evaluate(async()=>{const k=allQs().find(x=>(PHOTOS[x.key]||[]).some(q=>q.id==="ph2")).key;await IDB.del("ph2");PHOTOS[k]=PHOTOS[k].filter(q=>q.id!=="ph2")});await p.reload();await p.waitForTimeout(600);console.log("4 deliberate delete: no notice:",(await notice())===null,"| manifest:",await p.evaluate(()=>Object.keys(pmLoad()).join()));
const [bk0]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>document.getElementById('btnBackup').click())]);const bkPath=await bk0.path();
// SIMULATE LOSS: remove two photos straight from IndexedDB behind the app's back
await p.evaluate(()=>new Promise(res=>{const r=indexedDB.open("iac-audit-photos",1);r.onsuccess=()=>{const db=r.result;const tx=db.transaction("photos","readwrite");const os=tx.objectStore("photos");os.delete("ph0");os.delete("ph1");tx.oncomplete=()=>{db.close();res()}}}));
await p.reload();await p.waitForTimeout(800);
console.log("5 photos vanished: notice:",await notice());
// restore from a backup made while the photos existed
const j=JSON.parse(fs.readFileSync(bkPath,'utf8'));console.log("6 backup made earlier holds",j.photos.length,"photos");
await p.setInputFiles('#btnDone ~ input[type=file]',bkPath);await p.waitForTimeout(900);
console.log("7 after Restore audit: notice gone:",(await notice())===null,"| photos back:",await p.evaluate(()=>countPhotos()),"| manifest:",await p.evaluate(()=>Object.keys(pmLoad()).join()));
await p.reload();await p.waitForTimeout(700);console.log("8 reload after restore: no notice:",(await notice())===null);
// Forget
await p.evaluate(()=>new Promise(res=>{const r=indexedDB.open("iac-audit-photos",1);r.onsuccess=()=>{const db=r.result;const tx=db.transaction("photos","readwrite");tx.objectStore("photos").delete("ph0");tx.oncomplete=()=>{db.close();res()}}}));
await p.reload();await p.waitForTimeout(700);console.log("9 lost again:",(await notice())!==null);await p.click('[data-act=photoforget]');
await p.reload();await p.waitForTimeout(600);console.log("10 Forget is remembered across reload:",(await notice())===null);
console.log("errors:",errs);await b.close()})();
