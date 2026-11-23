// Run by tests/run.js:  node tests/suites/print-and-export.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
// a real JPEG
const jpg=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=300;const x=c.getContext('2d');x.fillStyle='#7a9';x.fillRect(0,0,400,300);x.fillStyle='#fff';x.font='40px Arial';x.fillText('photo',140,160);return c.toDataURL('image/jpeg',.7)});
await p.evaluate(async jpg=>{
 const sk=getFieldKey("Title Page","Site conducted");S[sk]='Kerrabee "Community" Centre & <Library> — 12 Station Street, Kerrabee';
 S[getFieldKey("Title Page","Name")]="Kerrabee Shire Council";S["report|revision"]="B";
 S["report|position"]="The centre is reachable and enterable without assistance, but the car park breaches and the rear exit is stepped.\n\nThe main hall, kitchen and meeting rooms work well.";
 const qs=allQs().filter(x=>x.item.rs==="phml");const o=RS("phml").opts;const br=((o.find(x=>x.breach))||{}).code,hi=((o.find(x=>x.flag&&x.score===0))||{}).code,md=((o.find(x=>/med/i.test(x.l)))||{}).code;
 const diffs=["low","mod","high",""];let n=0;
 for(let i=0;i<qs.length&&n<46;i+=9){const k=qs[i].key;S[k]=String([br,hi,md][n%3]);S[k+"|diff"]=diffs[n%4];if(n%2==0){S[k+"|action"]="Regrade and re-surface the area to meet the required gradient, then re-measure and record.\nInstall a compliant handrail on both sides.";S[k+"|impact"]="A wheelchair user cannot reach the entrance unassisted.";}
  if(n%5==0){const rec={id:"p"+n,key:k,data:jpg,ts:1};await IDB.put(rec);(PHOTOS[k]=PHOTOS[k]||[]).push(rec);} if(n%3==1)S[k+"|n"]="Site note: measured on a wet day.";n++;}
 saveA();mode="report";render();},jpg);
// export file -> pdf
const [d]=await Promise.all([p.waitForEvent('download'),p.click('#btnExport')]);const ef=D+'pr-export.html';fs.copyFileSync(await d.path(),ef);
const q=await ctx.newPage();await q.goto('file://'+ef);
await q.pdf({path:D+'pr-export.pdf',preferCSSPageSize:true,printBackground:true});
// in-app print path: fire beforeprint, pdf, afterprint
await p.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
console.log("in-app swapped: selects",await p.$$eval('#content select',s=>s.length),"textareas",await p.$$eval('#content textarea',s=>s.length));
await p.pdf({path:D+'pr-app.pdf',preferCSSPageSize:true,printBackground:true});
await p.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
console.log("restored live editable:",await p.$$eval('#content textarea',s=>s.length)>0,"| errors:",errs);await b.close()})();
