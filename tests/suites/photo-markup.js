// Run by tests/run.js:  node tests/suites/photo-markup.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const OUT=process.env.TEST_OUT+'/';
const AX=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1000,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file://'+process.argv[2]);await p.evaluate(async()=>{localStorage.clear();await IDB.clear()});await p.reload();await p.waitForTimeout(400);
await p.evaluate(()=>{document.getElementById('notices').innerHTML='';cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
// a grey test photo with no yellow in it
const b64=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d');x.fillStyle='#667';x.fillRect(0,0,1200,800);x.fillStyle='#889';x.fillRect(300,200,500,300);return c.toDataURL('image/jpeg',.9).split(',')[1]});
fs.writeFileSync(OUT+'markup-photo.jpg',Buffer.from(b64,'base64'));
const yellow=src=>p.evaluate(src=>new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>220&&d[i+1]>170&&d[i+2]<90)n++;res(n)};im.src=src}),src);
const addPhoto=async()=>{const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.addphoto').first().click()]);await fc.setFiles(OUT+'markup-photo.jpg');await p.waitForSelector('dialog.annotdlg[open]')};
const canvasPoint=async(fx,fy)=>{const bb=await p.locator('.annotdlg canvas').boundingBox();await p.mouse.click(bb.x+bb.width*fx,bb.y+bb.height*fy)};
const rec=()=>p.evaluate(()=>{const r=Object.values(PHOTOS).flat()[0];return r?{ann:(r.ann||[]).map(m=>m.t+(m.text?":"+m.text:"")).join(","),hasOrig:!!r.orig,len:r.data.length}:null});

// 1 capture opens the editor; the photo is already stored
await addPhoto();
console.log("1 after capture the editor opens:",await p.isVisible('dialog.annotdlg'),"| photo already stored before any marking:",await p.evaluate(async()=>(await IDB.all()).length),"| dialog title:",await p.textContent('#annTitle'));
console.log("  focus starts on:",await p.evaluate(()=>document.activeElement.textContent.trim()),"| canvas size matches the photo:",await p.$eval('.annotdlg canvas',c=>c.width+"x"+c.height));
// 2 arrow by two taps
await p.click('[data-tool=arrow]');console.log("2 arrow armed:",await p.textContent('#annStatus'),"| pressed:",await p.getAttribute('[data-tool=arrow]','aria-pressed'));
await canvasPoint(.2,.7);console.log("   after the tail:",await p.textContent('#annStatus'));
await canvasPoint(.45,.5);console.log("   after the head:",await p.textContent('#annStatus'));
// 3 label
await p.click('[data-tool=label]');console.log("3 label with no text:",await p.textContent('#annStatus'));
await p.fill('#annText','790 mm');await p.press('#annText','Enter');console.log("   armed:",await p.textContent('#annStatus'));
await canvasPoint(.7,.3);console.log("   placed:",await p.textContent('#annStatus'));
// 4 undo
await p.click('[data-undo]');console.log("4 undo removes the label:",await p.textContent('#annStatus'));
await p.click('[data-tool=label]');await canvasPoint(.7,.3);
// 5 save
await p.click('[data-save]');await p.waitForTimeout(300);
const r1=await rec();console.log("5 saved:",JSON.stringify({ann:r1.ann,hasOrig:r1.hasOrig}),"| dialog closed:",await p.locator('dialog.annotdlg').count()===0,"| thumbnail now yellow pixels:",await yellow(await p.$eval('.qphoto img',i=>i.src))>200,"| original has none:",await yellow(await p.evaluate(()=>Object.values(PHOTOS).flat()[0].orig))===0);
console.log("   stored in IndexedDB with the marks:",await p.evaluate(async()=>{const a=await IDB.all();return !!(a[0].ann&&a[0].orig)}),"| thumbnail label:",await p.$eval('.qp-open',e=>e.getAttribute('aria-label')));
// 6 reopen from the thumbnail; marks are there; edit
await p.click('.qp-open');await p.waitForSelector('dialog.annotdlg[open]');
await p.click('[data-undo]');await p.click('[data-save]');await p.waitForTimeout(300);
console.log("6 reopened, undo, save:",JSON.stringify((await rec()).ann));
await p.click('.qp-open');await p.waitForSelector('dialog.annotdlg[open]');await p.click('[data-clear]');await p.click('[data-save]');await p.waitForTimeout(300);
const r3=await rec();console.log("7 clearing all marks restores the original:",JSON.stringify({ann:r3.ann,hasOrig:r3.hasOrig}),"| yellow:",await yellow(await p.$eval('.qphoto img',i=>i.src)));
// 8 skip keeps as taken, Escape counts as skip
await p.evaluate(async()=>{for(const r of Object.values(PHOTOS).flat())await IDB.del(r.id);for(const k of Object.keys(PHOTOS))delete PHOTOS[k];render()});
await addPhoto();await p.click('[data-skip]');await p.waitForTimeout(200);console.log("8 Skip keeps the photo unmarked:",JSON.stringify((await rec()).ann===""&&!(await rec()).hasOrig));
await addPhoto();await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log("   Escape closes without marking:",await p.locator('dialog.annotdlg').count()===0,"| photos:",await p.evaluate(()=>countPhotos()));
// 9 keyboard only
await p.evaluate(async()=>{for(const r of Object.values(PHOTOS).flat())await IDB.del(r.id);for(const k of Object.keys(PHOTOS))delete PHOTOS[k];render()});
await addPhoto();await p.click('[data-tool=arrow]');await p.locator('.annotdlg canvas').focus();
await p.keyboard.press('Enter');await p.keyboard.press('Shift+ArrowRight');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
console.log("9 keyboard: arrow placed:",await p.textContent('#annStatus'));
await p.click('[data-save]');await p.waitForTimeout(250);console.log("   saved with the keyboard-placed arrow:",JSON.stringify((await rec()).ann));
// 10 auto-offer preference
await p.evaluate(async()=>{for(const r of Object.values(PHOTOS).flat())await IDB.del(r.id);for(const k of Object.keys(PHOTOS))delete PHOTOS[k];render()});
await addPhoto();await p.uncheck('#annAuto');await p.click('[data-skip]');await p.waitForTimeout(200);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.addphoto').first().click()]);await fc.setFiles(OUT+'markup-photo.jpg');await p.waitForTimeout(500);
console.log("10 with 'Offer after every photo' off, the editor stays closed:",await p.locator('dialog.annotdlg').count()===0,"| photos kept:",await p.evaluate(()=>countPhotos()));
// 11 backup carries marks; restore returns them; fingerprint sees a mark-up change
await p.evaluate(()=>{try{localStorage.setItem('iac_annot_auto','1')}catch(e){}});
await p.evaluate(async()=>{for(const r of Object.values(PHOTOS).flat())await IDB.del(r.id);for(const k of Object.keys(PHOTOS))delete PHOTOS[k];render()});
await addPhoto();await p.click('[data-tool=arrow]');await canvasPoint(.3,.6);await canvasPoint(.5,.5);
const before=await p.evaluate(()=>auditSig());await p.click('[data-save]');await p.waitForTimeout(250);
console.log("11 a mark-up changes the backup fingerprint:",before!==await p.evaluate(()=>auditSig()));
const [bk]=await Promise.all([p.waitForEvent('download'),p.evaluate(()=>document.getElementById('btnBackup').click())]);const j=JSON.parse(fs.readFileSync(await bk.path(),'utf8'));
console.log("   backup holds marks + original:",j.photos.length,j.photos[0].ann&&j.photos[0].ann.length,!!j.photos[0].orig);
await p.evaluate(async()=>{localStorage.clear();await IDB.clear()});await p.reload();await p.waitForTimeout(400);
await p.setInputFiles('#btnDone ~ input[type=file]',await bk.path());await p.waitForTimeout(800);
console.log("   restored:",JSON.stringify(await rec()));
// 12 report plate shows the marked-up picture
await p.evaluate(()=>{const k=Object.keys(PHOTOS)[0];const o=RS("phml").opts;S[k]="high";saveA();mode="report";render()});
console.log("12 report plate uses the marked-up image:",await p.evaluate(()=>{const r=Object.values(PHOTOS).flat()[0];const pl=document.querySelector('.plate img');return !!pl&&pl.src===r.data}));
// 13 axe on the editor
await p.evaluate(()=>{mode="audit";cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});await p.click('.qp-open');await p.waitForSelector('dialog.annotdlg[open]');await p.addScriptTag({content:AX});
const ax=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}})).violations.map(v=>v.id+" x"+v.nodes.length));
console.log("13 axe on the editor:",ax.length?ax:"no violations");
const small=await p.evaluate(()=>[...document.querySelectorAll('dialog.annotdlg button, dialog.annotdlg input')].filter(e=>e.offsetParent&&(e.getBoundingClientRect().height<44&&e.type!=="checkbox")).map(e=>e.textContent.trim()||e.id));
console.log("    controls under 44px high (checkbox excepted):",small);
await p.keyboard.press('Escape');
// 14 phone
const q=await b.newPage({viewport:{width:390,height:800},deviceScaleFactor:2});q.on('pageerror',e=>errs.push(e.message));
await q.goto('file://'+process.argv[2]);await q.evaluate(async()=>{localStorage.clear();await IDB.clear()});await q.reload();await q.waitForTimeout(400);
await q.evaluate(()=>{document.getElementById('notices').innerHTML='';cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
const [fc2]=await Promise.all([q.waitForEvent('filechooser'),q.locator('.addphoto').first().click()]);await fc2.setFiles(OUT+'markup-photo.jpg');await q.waitForSelector('dialog.annotdlg[open]');
const fit=await q.evaluate(()=>{const d=document.querySelector('dialog.annotdlg').getBoundingClientRect();return {w:Math.round(d.width),h:Math.round(d.height),vw:innerWidth,vh:innerHeight,sideways:document.documentElement.scrollWidth>innerWidth+1}});
console.log("14 phone: dialog fits the screen:",fit.w<=fit.vw&&fit.h<=fit.vh+1,"| no sideways scroll:",!fit.sideways);
await q.screenshot({path:OUT+'markup-phone.png'});
console.log("errors:",errs);await b.close()})();
