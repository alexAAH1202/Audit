// Run by tests/run.js:  node tests/suites/accessibility-axe.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const AX=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const url='file://'+process.argv[2];
(async()=>{const b=await chromium.launch();const results={};
async function run(name,w,setup){
 const ctx=await b.newContext({viewport:{width:w,height:900}});const p=await ctx.newPage();p.on('dialog',d=>d.dismiss());
 await p.goto(url);await p.waitForTimeout(300);
 await p.evaluate(async()=>{ /* realistic data */
  const jpg=(()=>{const c=document.createElement('canvas');c.width=300;c.height=200;const x=c.getContext('2d');x.fillStyle='#789';x.fillRect(0,0,300,200);return c.toDataURL('image/jpeg')})();
  const qs=allQs().filter(x=>x.item.rs==="phml");const o=RS("phml").opts;const br=((o.find(x=>x.breach))||{}).code,hi=((o.find(x=>x.flag&&x.score===0))||{}).code,md=((o.find(x=>/med/i.test(x.l)))||{}).code;
  [[0,br],[3,hi],[40,md],[120,hi]].forEach(([i,v],n)=>{const k=qs[i].key;S[k]=v;S[k+"|diff"]=["low","mod","high",""][n];S[k+"|action"]="Fix it";S[k+"|impact"]="Cannot enter";S[k+"|n"]="note";
   const r={id:"p"+n,key:k,data:jpg,ts:1};PHOTOS[k]=[r];});
  S[getFieldKey("Title Page","Site conducted")]="Test Centre";saveA();});
 await setup(p);
 await p.addScriptTag({content:AX});
 const r=await p.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}));
 results[name]={v:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\n').slice(1,3).join(' ').slice(0,160))})),inc:r.incomplete.map(v=>v.id+"("+v.nodes.length+")")};
 await ctx.close();}
await run("audit page (desktop)",1280,async p=>{await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render()})});
await run("audit page (phone 390)",390,async p=>{await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Entrances");render()})});
await run("site scope",1280,async p=>{await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Site Scope");render()})});
await run("report view",1280,async p=>{await p.evaluate(()=>{mode="report";render()})});
await run("edit mode",1280,async p=>{await p.evaluate(()=>{EDIT=true;cur=T.pages.findIndex(x=>x.title==="Exits & Egress Routes");render()})});
await run("drawer open (phone)",390,async p=>{await p.click('#btnMenu');await p.waitForTimeout(400)});
await run("More menu open (phone)",390,async p=>{await p.click('#btnMore')});
await run("reset dialog",1280,async p=>{await p.click('#btnReset')});
await run("review dialog",1280,async p=>{await p.evaluate(()=>reviewModal())});
await run("title page",1280,async p=>{});
fs.writeFileSync((process.env.TEST_OUT+'/'+'ax.json'),JSON.stringify(results,null,1));
const agg={};for(const [n,r] of Object.entries(results)){console.log("\n##",n,"| violations:",r.v.length,"| needs review:",r.inc.join(", ")||"none");r.v.forEach(v=>{console.log("  -",v.impact,v.id,"x"+v.n,"|",v.help);v.ex.forEach(e=>console.log("      ",e))})}
await b.close()})();
