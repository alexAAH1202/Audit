// Run by tests/run.js:  node tests/suites/leave-and-saved-templates.js <path to access-audit.html>
const {chromium}=require('playwright');const D=(process.env.TEST_OUT+'/');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();
const errs=[];const mk=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
const nn=p=>p.evaluate(()=>[...document.querySelectorAll('#notices .notice')].map(n=>n.innerText.replace(/\s+/g,' ').slice(0,60)).filter(x=>!x.startsWith('Storage')));
// 1 fresh default
let p=await mk();await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
console.log("1 fresh: notices",await nn(p));
console.log("  q per LEAVE page:",await p.evaluate(()=>{const cnt=it=>(it.k==="q"?1:0)+(it.items||[]).reduce((a,x)=>a+cnt(x),0);return T.pages.filter(x=>["Exits & Egress Routes","Refuge & Assisted Evacuation","Emergency Information & Alarms"].includes(x.title)).map(x=>x.title+"="+x.items.reduce((a,i)=>a+cnt(i),0)).join(", ")}));
console.log("  render each LEAVE page + report:",await p.evaluate(()=>{const out=[];T.pages.forEach((pg,i)=>{if(/LEAVE|Exits &|Refuge|Emergency Info/.test(pg.title)){cur=i;mode="audit";render();out.push(pg.title+":"+document.querySelectorAll("#content .opt, #content button").length)}});
  const k=allQs().find(x=>x.page.title==="Exits & Egress Routes").key;S[k]="breach";const k2=allQs().find(x=>x.page.title==="Emergency Information & Alarms").key;S[k2]="med";saveA();mode="report";render();
  out.push("journey:"+[...document.querySelectorAll('.jname')].map(n=>n.textContent+" / "+n.parentElement.querySelector('.jmeta').textContent.split('·').slice(0,2).join('·')).join(" || "));return out.join("\n   ")}));
// 2 legacy saved template
const legacy=await (async()=>{const q=await mk();await q.goto('file://'+D+'before.html');const r=await q.evaluate(()=>{const t=seedDefault();const k=Object.keys(t).length;return JSON.stringify(t)});await q.close();return r})();
p=await mk();await p.goto('file://'+process.argv[2]);
await p.evaluate(t=>{localStorage.clear();localStorage.setItem("iac_template_v2",t);},legacy);
const before=JSON.parse(legacy);const fq=it=>it.k==="q"?it:(it.items||[]).map(fq).find(Boolean);const answerKey=before.pages.find(x=>x.title==="Accessible Car Parking").items.map(fq).find(Boolean).id;
await p.evaluate(k=>{localStorage.setItem("iac_answers_v2",JSON.stringify({s:{[k]:"1"},r:{},cur:0}))},answerKey);
await p.reload();await p.waitForTimeout(400);
console.log("2 legacy: offer shown:",await nn(p),"| pages:",await p.evaluate(()=>T.pages.length));
await p.click('[data-act=addleave]');await p.waitForTimeout(200);
const r=await p.evaluate(({k,old})=>{const ids=[];const w=i=>{ids.push(i.id);(i.items||[]).forEach(w)};T.pages.forEach(pg=>{ids.push(pg.id);pg.items.forEach(w)});
 const oldIds=new Set();const wo=i=>{oldIds.add(i.id);(i.items||[]).forEach(wo)};old.pages.forEach(pg=>{oldIds.add(pg.id);pg.items.forEach(wo)});
 return {pages:T.pages.length,uniq:ids.length===new Set(ids).size,oldKept:[...oldIds].every(i=>ids.includes(i)),order:T.pages.slice(-8).map(x=>x.title).join(" > "),answer:S[k],nextId:T.meta.nextId,notice:[...document.querySelectorAll('[data-notice=leave]')].length}},{k:answerKey,old:before});
console.log("  after add:",r);
console.log("  second call no-op:",await p.evaluate(()=>[addLeaveSection(),T.pages.length]));
await p.reload();await p.waitForTimeout(300);console.log("  persists after reload:",await p.evaluate(()=>[hasLeave(),T.pages.length,S[Object.keys(S)[0]]]),await nn(p));
// 3 dismissal persists
await p.evaluate(t=>{localStorage.setItem("iac_template_v2",t);},legacy);await p.reload();await p.waitForTimeout(300);
await p.click('[data-notice=leave] .nx');await p.reload();await p.waitForTimeout(300);console.log("3 dismissed stays dismissed:",await nn(p));
await p.evaluate(()=>{EDIT=true;document.body.classList.add("edit-on");});console.log("  editor button visible:",await p.isVisible('#btnLeave'));
console.log("errors:",errs);await b.close()})();
