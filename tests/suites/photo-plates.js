// Run by tests/run.js:  node tests/suites/photo-plates.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage({viewport:{width:1100,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
const mkjpg=(w,h,c,t)=>p.evaluate(([w,h,c,t])=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='60px Arial';x.fillText(t,40,h/2);return cv.toDataURL('image/jpeg',.8)},[w,h,c,t]);
const L=await mkjpg(1400,1000,'#3a7','landscape'),P=await mkjpg(750,1000,'#a63','portrait');
const r=await p.evaluate(async([L,P])=>{
 const qs=allQs().filter(x=>x.item.rs==="phml");const o=RS("phml").opts;const hi=((o.find(x=>x.flag&&x.score===0))||{}).code,br=((o.find(x=>x.breach))||{}).code;
 const add=async(k,id,d)=>{const rec={id,key:k,data:d,ts:1};await IDB.put(rec);(PHOTOS[k]=PHOTOS[k]||[]).push(rec)};
 // finding A (breach, ARRIVE) 2 photos; finding B (high, later section) 1 photo; non-flagged item with comment + photo
 S[qs[0].key]=String(br);await add(qs[0].key,"a1",L);await add(qs[0].key,"a2",P);
 S[qs[200].key]=String(hi);await add(qs[200].key,"b1",L);S[qs[200].key+"|action"]="Fix it.";S[qs[200].key+"|diff"]="low";
 S[qs[5].key]="0";S[qs[5].key+"|n"]="Looks fine but monitor";await add(qs[5].key,"c1",P);
 S[qs[0].key+"|cap:a1"]='Tape across bay: 2.1m "short" <b>';
 saveA();mode="report";render();return [qs[0].key,qs[200].key,qs[5].key]},[L,P]);
console.log("screen refs:",await p.$$eval('.figrefs',n=>n.map(x=>x.innerText.replace(/\s+/g,' ')).join(" | ")));
console.log("plates:",await p.$$eval('.plate figcaption',n=>n.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,80)).join("\n   ")));
console.log("finding photo refs:",await p.$$eval('#sec-findings .figrefs',n=>n.map(x=>x.innerText.replace(/\s+/g,' ')).join(" | ")));
// caption typing + anchor
await p.fill('input[aria-label="Caption for Figure 3"]','Rear view');console.log("caption saved:",await p.evaluate(k=>S[k+"|cap:b1"],r[1]),await p.evaluate(()=>[...document.querySelectorAll('.plate input')].length));
await p.evaluate(()=>{ /* fig order check */ });
// CSV
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#btnCsv')]);console.log(fs.readFileSync(await dl.path(),'utf8').split("\r\n").map(l=>l.slice(-30)).join("\n"));
// export + pdf
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);const ef=D+'pl-export.html';fs.copyFileSync(await d.path(),ef);
const q=await ctx.newPage();await q.goto('file://'+ef);
console.log("export: inputs in plates",await q.$$eval('.plate input',n=>n.length),"| captions as text:",await q.$$eval('.plate .rf-v.cap',n=>n.map(x=>x.textContent)));
await q.pdf({path:D+'pl.pdf',preferCSSPageSize:true,printBackground:true});
console.log("errors:",errs);await b.close()})();
