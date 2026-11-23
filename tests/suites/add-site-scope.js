// Run by tests/run.js:  node tests/suites/add-site-scope.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const errs=[];
const mk=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
const q=await mk();await q.goto('file://'+D+'before.html');const legacy=await q.evaluate(()=>JSON.stringify(seedDefault()));
const lg=JSON.parse(legacy);const fq=it=>it.k==="q"?it:(it.items||[]).map(fq).find(Boolean);const key=lg.pages.find(x=>x.title==="Signage").items.map(fq).find(Boolean).id;
const p=await mk();await p.goto('file://'+process.argv[2]);
await p.evaluate(({t,k})=>{localStorage.clear();localStorage.setItem("iac_template_v2",t);localStorage.setItem("iac_answers_v2",JSON.stringify({s:{[k]:"1"},r:{},cur:0}))},{t:legacy,k:key});
await p.reload();await p.waitForTimeout(400);
console.log("offers:",await p.evaluate(()=>[...document.querySelectorAll('#notices .notice')].map(n=>n.dataset.notice).filter(x=>!['persist','backup'].includes(x)).join(",")));
await p.click('[data-act=addscope]');await p.waitForTimeout(150);
const r=await p.evaluate(({k,old})=>{const a=[];T.pages.forEach(pg=>{a.push(pg.id);const w=i=>{a.push(i.id);(i.items||[]).forEach(w)};pg.items.forEach(w)});
 const o=[];old.pages.forEach(pg=>{o.push(pg.id);const w=i=>{o.push(i.id);(i.items||[]).forEach(w)};pg.items.forEach(w)});
 cur=T.pages.findIndex(x=>x.title==="Site Scope");render();
 return {order:T.pages.slice(0,3).map(x=>x.title).join(" > "),uniq:a.length===new Set(a).size,oldKept:o.every(i=>a.includes(i)),answer:S[k],picks:document.querySelectorAll('[data-pick]').length>0,second:addSiteScope()}},{k:key,old:lg});
console.log(r);
await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-pick]')].find(b=>b.closest('.qrow').innerText.startsWith("Are on-site")||b.closest('.qrow').innerText.startsWith("Is on-site")&&b.dataset.v==="no");b.click()});
console.log("rule applies on migrated template:",await p.evaluate(()=>T.pages.filter(isSkipped).map(x=>x.title)));
console.log("errors:",errs);await b.close()})();
