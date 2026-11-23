// Run by tests/run.js:  node tests/suites/accessibility-manual.js <path to access-audit.html>
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const url='file://'+process.argv[2];
const prep=p=>p.evaluate(()=>{const jpg=(()=>{const c=document.createElement('canvas');c.width=300;c.height=200;return c.toDataURL('image/jpeg')})();
 const qs=allQs().filter(x=>x.item.rs==="phml");const o=RS("phml").opts;[[0,4],[3,1]].forEach(([i,v])=>{const k=qs[i].key;S[k]=v;S[k+"|action"]="A long works instruction that should wrap across several lines without forcing the page to scroll sideways at all";PHOTOS[k]=[{id:"x"+i,key:k,data:jpg,ts:1}]});S[getFieldKey("Title Page","Site conducted")]="A very long site name that goes on and on Community Centre and Library Annexe";saveA();});
// 1 reflow at 320
for(const [name,fn] of [["audit page",()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()}],["Entrances",()=>{cur=T.pages.findIndex(x=>x.title==="Entrances");render()}],["site scope",()=>{cur=T.pages.findIndex(x=>x.title==="Site Scope");render()}],["report",()=>{mode="report";render()}],["edit mode",()=>{EDIT=true;cur=T.pages.findIndex(x=>x.title==="Exits & Egress Routes");render()}],["title page",()=>{cur=0;render()}]]){
 const p=await b.newPage({viewport:{width:320,height:700}});await p.goto(url);await p.waitForTimeout(200);await prep(p);await p.evaluate(fn);await p.waitForTimeout(100);
 const r=await p.evaluate(()=>{const c=document.getElementById('content');const wide=[...document.querySelectorAll('#content *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>window.innerWidth+1&&r.width>0&&getComputedStyle(e).position!=='fixed'}).slice(0,3).map(e=>e.tagName+'.'+e.className.toString().slice(0,25));return {docScrollX:document.documentElement.scrollWidth>window.innerWidth+1,contentScrollX:c.scrollWidth>c.clientWidth+1,wide}});
 console.log("1 reflow 320 |",name.padEnd(12),JSON.stringify(r));await p.close();}
// 2 text spacing
{const p=await b.newPage({viewport:{width:390,height:800}});await p.goto(url);await prep(p);await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
 await p.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}'});await p.waitForTimeout(150);
 const r=await p.evaluate(()=>[...document.querySelectorAll('button,.opt,.btn,.stat,.chip')].filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+2).slice(0,6).map(e=>e.className+"|"+e.textContent.trim().slice(0,24)));
 console.log("2 text spacing: clipped controls:",JSON.stringify(r));await p.close();}
// 3 keyboard focus: visible indicator + not obscured by FAB
{const p=await b.newPage({viewport:{width:1280,height:700}});await p.goto(url);await prep(p);await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
 let noRing=[],hidden=[],stops=0;const seen=new Set();
 await p.keyboard.press('Tab');
 for(let i=0;i<260;i++){
  const r=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);const ring=(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none';
   const r=e.getBoundingClientRect();const fab=document.getElementById('btnNextUn');const f=fab&&!fab.hidden?fab.getBoundingClientRect():null;
   const ob=f&&!(r.right<f.left||r.left>f.right||r.bottom<f.top||r.top>f.bottom);
   return {id:e.id||e.tagName+'.'+String(e.className).slice(0,18)+'|'+(e.textContent||'').trim().slice(0,16),ring,ob,rad:e.getAttribute('role')==='radio'}});
  if(!r)break;if(seen.has(r.id)&&seen.size>5&&i>20&&r.id===[...seen][0])break;seen.add(r.id);stops++;
  if(!r.ring)noRing.push(r.id);if(r.ob)hidden.push(r.id);
  await p.keyboard.press('Tab');}
 console.log("3 keyboard: tab stops",stops,"| without visible focus indicator:",noRing.length,noRing.slice(0,5),"| focused but under the Next-unanswered button:",hidden.length,hidden.slice(0,3));await p.close();}
// 4 target sizes & touch targets (phone)
{const p=await b.newPage({viewport:{width:390,height:800}});await p.goto(url);await prep(p);await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Entrances");render()});
 const r=await p.evaluate(()=>{const els=[...document.querySelectorAll('button,a[href],input,select,textarea,[role=radio]')].filter(e=>e.offsetParent&&!e.closest('.side'));const small=els.filter(e=>{const r=e.getBoundingClientRect();return r.height<44||r.width<44});return {under44:small.length,under24:els.filter(e=>{const r=e.getBoundingClientRect();return r.height<24||r.width<24}).length,sample:small.slice(0,6).map(e=>e.tagName+'.'+String(e.className).slice(0,16)+'|'+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,20)+'|'+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))}});
 console.log("4 targets (phone, Entrances):",JSON.stringify(r));await p.close();}
// 5 structure
{const p=await b.newPage({viewport:{width:1280,height:800}});await p.goto(url);await prep(p);await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()});
 const r=await p.evaluate(()=>({lang:document.documentElement.lang,title:document.title,landmarks:['main','nav','aside','header','footer'].map(t=>t+':'+document.querySelectorAll(t).length).join(' '),h1:[...document.querySelectorAll('h1')].map(h=>h.textContent.trim()),h2:document.querySelectorAll('h2').length,skip:!!document.querySelector('.skip'),current:document.querySelectorAll('[aria-current=page]').length,liveRegions:[...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].length}));
 console.log("5 structure:",JSON.stringify(r));
 await p.keyboard.press('Tab');console.log("  first Tab stop is the skip link:",await p.evaluate(()=>document.activeElement.className),"| visible when focused:",await p.evaluate(()=>document.activeElement.getBoundingClientRect().top>=0));
 await p.keyboard.press('Enter');console.log("  skip link moves focus into the audit:",await p.evaluate(()=>document.activeElement.id));
 // reduced motion
 await p.emulateMedia({reducedMotion:'reduce'});console.log("6 reduced motion: drawer transition:",await p.evaluate(()=>getComputedStyle(document.querySelector('.side')).transitionDuration));await p.close();}
await b.close()})();
