// Run by tests/run.js:  node tests/suites/journey-dividers.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const errs=[];
const mk=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
const ids=`(()=>{const t=T;const m={};t.pages.forEach(pg=>{const a=[];const w=i=>{a.push(i.id);(i.items||[]).forEach(w)};pg.items.forEach(w);m[pg.title+(pg.divider?"|div":"")]=[pg.id,...a]});return m})()`;
const order=p=>p.evaluate(()=>T.pages.map(x=>(x.divider?"■ ":"   ")+x.title+(x.divider?" (pri "+x.pri+")":"")).join("\n"));
// 1 seed
let p=await mk();await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
const seedNew=await p.evaluate(ids);const seedOrder=await order(p);console.log(seedOrder.split("\n").filter(l=>l.startsWith("■")||/Internal|Floor|Signage|Entrances|Toilets|Adult|Customer|Meeting|Ambulant|Exits/.test(l)).join("\n"));
const po=await mk();await po.goto('file://'+D+'before2.html');const seedOld=await po.evaluate(ids);
let same=0,bad=[];for(const k in seedOld){(JSON.stringify(seedOld[k])===JSON.stringify(seedNew[k]))?same++:bad.push(k)}
console.log("1 existing pages (incl LEAVE) identical ids:",same,"/",Object.keys(seedOld).length,"bad:",bad);
const allIds=Object.values(seedNew).flat();console.log("  all ids unique:",allIds.length===new Set(allIds).size,"| journey notice on fresh:",await p.$$eval('[data-notice=journey]',n=>n.length));
// 2 legacy original template (pre-LEAVE, pre-journey)
const q=await mk();await q.goto('file://'+D+'before.html');const legacy=await q.evaluate(()=>JSON.stringify(seedDefault()));
const lg=JSON.parse(legacy);const fq=it=>it.k==="q"?it:(it.items||[]).map(fq).find(Boolean);
const key=lg.pages.find(x=>x.title==="Signage").items.map(fq).find(Boolean).id;
for(const orderOps of [["addjourney","addleave"],["addleave","addjourney"]]){
 const r=await mk();await r.goto('file://'+process.argv[2]);
 await r.evaluate(({t,k})=>{localStorage.clear();localStorage.setItem("iac_template_v2",t);localStorage.setItem("iac_answers_v2",JSON.stringify({s:{[k]:"1"},r:{},cur:0}))},{t:legacy,k:key});
 await r.reload();await r.waitForTimeout(400);
 const offers=await r.evaluate(()=>[...document.querySelectorAll('#notices .notice')].map(n=>n.dataset.notice));
 for(const op of orderOps){await r.click(`[data-act=${op}]`);await r.waitForTimeout(150);}
 const o=await order(r);const res=await r.evaluate(({k,old})=>{const t=T;const a=[];t.pages.forEach(pg=>{a.push(pg.id);const w=i=>{a.push(i.id);(i.items||[]).forEach(w)};pg.items.forEach(w)});
  const oldA=[];old.pages.forEach(pg=>{oldA.push(pg.id);const w=i=>{oldA.push(i.id);(i.items||[]).forEach(w)};pg.items.forEach(w)});
  return {uniq:a.length===new Set(a).size,oldKept:oldA.every(i=>a.includes(i)),answer:S[k],blurbs:t.pages.filter(x=>x.divider).map(x=>x.title+":"+x.pri)}},{k:key,old:lg});
 console.log("2 legacy",orderOps.join("→"),"offers:",offers.filter(x=>x!=="persist"&&x!=="backup").join(","),res,"| same order as seed:",o===seedOrder);
}
// 3 journey stages in report
await p.evaluate(()=>{const seen=new Set();allQs().forEach(x=>{const pg=x.page.title;if(!seen.has(pg)&&x.item.rs==="phml"){seen.add(pg);S[x.key]="med"}});saveA();mode="report";render()});
console.log("3 journey stages:",await p.$$eval('.jname',n=>n.map(x=>x.textContent).join(" → ")));
console.log("  meta:",await p.$$eval('.jmeta',n=>n.map(x=>x.textContent.split("·").slice(0,2).join("·").trim()).join(" | ")));
console.log("errors:",errs);await b.close()})();
