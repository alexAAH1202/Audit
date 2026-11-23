// Run by tests/run.js:  node tests/suites/answer-codes-migration.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
const SUM=`(()=>{const f=collectFindings().map(x=>[x.key,x.gc,x.flag,x.section,x.pri].join("|")).sort();const t=totals();const sc=[...allPageScores().entries()].map(([p,v])=>p.title+":"+[v.got,v.max,v.hi,v.med,v.brc,v.ans,v.n].join(",")).join(";");
 return JSON.stringify({f,t,sc,top:[document.getElementById('tScore').textContent,document.getElementById('tFlag').textContent,document.getElementById('tAns').textContent],nav:[...document.querySelectorAll('#nav a .sc')].map(x=>x.textContent).join(',')})})()`;
const wipe=d=>{ for(const k of Object.keys(localStorage)) localStorage.removeItem(k); for(const [k,v] of Object.entries(d||{})) localStorage.setItem(k,v); };
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const errs=[];
const mk=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());return p};
// ---- 1. build a realistic LEGACY audit with the old app (answers are positions)
const old=await mk();await old.goto('file://'+D+'legacy.html');await old.waitForTimeout(300);
const made=await old.evaluate(async()=>{
 const qs=allQs().filter(x=>x.item.rs==="phml");
 qs.slice(0,60).forEach((x,i)=>{S[x.key]=String(i%5);if(i%7==0)S[x.key+"|n"]="note "+i;if(i%11==0)S[x.key+"|diff"]="low"});
 S[qs[70].key]="0";S[qs[70].key+"|sw"]="1";
 const g=T.pages.find(p=>p.title==="Accessible Car Parking");
 const grp=g.items.find(i=>i.k==="grp");
 if(grp){S[grp.id+"|addl0"]="4";S[grp.id+"|addl0|t"]="Extra: bollard";}
 const fq=allQs().find(x=>x.item.rs==="fnn");if(fq){S[fq.key]="0"}
 T.rs.rsCustom={name:"Yes / No / Unsure",opts:[{l:"Yes",cls:"g",score:1},{l:"No",cls:"r",score:0,flag:true},{l:"Unsure",cls:"o",flag:true}]};
 const cq=qs[100];findItem(cq.item.id).rs="rsCustom";S[cq.key]="1";const cq2=qs[101];findItem(cq2.item.id).rs="rsCustom";S[cq2.key]="2";
 S[qs[120].key]="9";S[qs[121].key]="";
 S[getFieldKey("Title Page","Site conducted")]="Migration Test Centre";S["report|position"]="Position text";
 S[getFieldKey("Site Scope","Storeys used by the public, counting basements")]="1";
 REPS[g.items.find(i=>i.k==="sec").id]=2;saveT();saveA();
 const jpg=(()=>{const c=document.createElement('canvas');c.width=100;c.height=60;return c.toDataURL('image/jpeg')})();const rec={id:"mig1",key:qs[0].key,data:jpg,ts:1};await IDB.put(rec);
 return {numericAnswers:Object.keys(S).filter(k=>/^[^|]+(\|addl\d+)?$/.test(k)&&/^\d+$/.test(S[k])).length,hasFnn:!!fq,hasAddl:!!grp};});
console.log("1 legacy fixture:",JSON.stringify(made));
await old.evaluate(()=>{mode="audit";render()});
const oldSum=await old.evaluate(SUM);
const dump=await old.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
const oldLabels=await old.evaluate(()=>{const m={};allQs().forEach(x=>{const set=RS(x.item.rs).opts;const v=S[x.key];if(v!==undefined&&v!==""&&set[+v])m[x.key]=set[+v].l});
 Object.keys(S).filter(k=>/\|addl\d+$/.test(k)).forEach(k=>{const set=RS("phml").opts;if(S[k]!==""&&set[+S[k]])m[k]=set[+S[k]].l});return m});
console.log("  legacy labels recorded:",Object.keys(oldLabels).length);
// ---- 2. open the same data in the NEW app
const nw=await mk();await nw.goto('file://'+process.argv[2]);
const dls=[];nw.on('download',d=>dls.push(d.suggestedFilename()));
await nw.evaluate(wipe,dump);
await nw.reload();await nw.waitForTimeout(1200);
console.log("2 migration notice:",await nw.$eval('[data-notice=migrated]',n=>n.innerText.replace(/\s+/g,' ').slice(0,210)).catch(e=>"NONE"));
console.log("  backup file downloaded first:",dls);
console.log("  pre-copy kept in browser:",await nw.evaluate(()=>[!!localStorage.getItem('iac_answers_v2_pre_codes'),!!localStorage.getItem('iac_template_v2_pre_codes')]));
console.log("  stored version:",await nw.evaluate(()=>[JSON.parse(localStorage.getItem('iac_answers_v2')).v,S_FORMAT]));
// ---- 3. nothing changed meaning
const newLabels=await nw.evaluate(()=>{const m={};allQs().forEach(x=>{const set=RS(x.item.rs).opts;const o=optOf(set,S[x.key]);if(o)m[x.key]=o.l});
 Object.keys(S).filter(k=>/\|addl\d+$/.test(k)).forEach(k=>{const o=optOf(RS("phml").opts,S[k]);if(o)m[k]=o.l});return m});
const diff=[];for(const k in oldLabels){if(oldLabels[k]!==newLabels[k])diff.push([k,oldLabels[k],newLabels[k]])}
for(const k in newLabels){if(!(k in oldLabels))diff.push([k,"(none)",newLabels[k]])}
console.log("3 answer labels identical:",diff.length===0,"("+Object.keys(newLabels).length+" compared)",diff.slice(0,3));
await nw.evaluate(()=>{mode="audit";render()});const newSum=await nw.evaluate(SUM);
const a=JSON.parse(oldSum),c=JSON.parse(newSum);
console.log("  findings identical:",JSON.stringify(a.f)===JSON.stringify(c.f),"("+a.f.length+") | totals identical:",JSON.stringify(a.t)===JSON.stringify(c.t),JSON.stringify(c.t),"| page scores identical:",a.sc===c.sc,"| top bar identical:",JSON.stringify(a.top)===JSON.stringify(c.top),c.top.join(" / "),"| nav identical:",a.nav===c.nav);
if(a.nav!==c.nav)console.log("   nav old:",a.nav.slice(0,120),"\n   nav new:",c.nav.slice(0,120));
console.log("4 stored values:",await nw.evaluate(()=>{const q=allQs().filter(x=>x.item.rs==="phml");return [0,1,2,3,4].map(i=>S[q[i].key]).join(",")}),"| custom set codes:",await nw.evaluate(()=>T.rs.rsCustom.opts.map(o=>o.code).join(",")),"| unreadable one kept aside:",await nw.evaluate(()=>{const q=allQs().filter(x=>x.item.rs==="phml");return JSON.stringify([S[q[120].key],S[q[120].key+"|legacy"]])}));
console.log("5 untouched data:",await nw.evaluate(()=>[S["report|position"],getFieldVal("Title Page","Site conducted"),scopeAns("storeys"),Object.keys(S).filter(k=>k.endsWith("|sw")).length,S[allQs().filter(x=>x.item.rs==="phml")[0].key+"|diff"]].join(" / ")),"| swept still recognised:",await nw.evaluate(()=>{const k=Object.keys(S).find(k=>k.endsWith("|sw")).replace("|sw","");return isSwept(k)&&S[k]==="pass"}));
// ---- 4. idempotent
dls.length=0;await nw.reload();await nw.waitForTimeout(800);
console.log("6 second load: no second backup or notice:",dls.length===0&&(await nw.$$('[data-notice=migrated]')).length===0);
// ---- 5. the app still works with codes
await nw.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Landscaping");render()});
await nw.locator('[role=radio]').nth(1).click();console.log("7 a click stores a code:",await nw.evaluate(()=>{const q=allQs().filter(x=>x.page.title==="Landscaping")[0];return S[q.key]}));
await nw.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Floor / Ground Surfaces");render()});
await nw.locator('.sweep [data-sweepgo]').first().click();
console.log("  sweep writes the pass code:",await nw.evaluate(()=>[...new Set(Object.keys(S).filter(k=>k.endsWith('|sw')).map(k=>S[k.replace('|sw','')]))].join()));
// ---- 6. restore of an OLD backup file made by the legacy app
const old2=await mk();await old2.goto('file://'+D+'legacy.html');await old2.evaluate(wipe,dump);await old2.reload();await old2.waitForTimeout(300);
const [bk]=await Promise.all([old2.waitForEvent('download'),old2.evaluate(()=>document.getElementById('btnBackup').click())]);const bf=D+'legacy-backup.json';fs.copyFileSync(await bk.path(),bf);
const bj=JSON.parse(fs.readFileSync(bf,'utf8'));console.log("8 legacy backup file: schemaVersion",bj.schemaVersion,"answers.v",bj.answers.v);
const rs=await mk();await rs.goto('file://'+process.argv[2]);await rs.evaluate(wipe,{});await rs.reload();await rs.waitForTimeout(500);
await rs.setInputFiles('#btnDone ~ input[type=file]',bf);await rs.waitForTimeout(800);
await rs.evaluate(()=>{mode="audit";render()});const rc=JSON.parse(await rs.evaluate(SUM));
console.log("  restored legacy backup equals the migrated data:",JSON.stringify(rc.f)===JSON.stringify(c.f),JSON.stringify(rc.t)===JSON.stringify(c.t),"| stored version",await rs.evaluate(()=>JSON.parse(localStorage.getItem('iac_answers_v2')).v));
// ---- 7. a NEW backup is format 2
const [bk2]=await Promise.all([rs.waitForEvent('download'),rs.evaluate(()=>document.getElementById('btnBackup').click())]);const b2=JSON.parse(fs.readFileSync(await bk2.path(),'utf8'));
console.log("9 new backup: schemaVersion",b2.schemaVersion,"answers.v",b2.answers.v,"| sample answer value:",Object.values(b2.answers.s).find(v=>['pass','high','med','low','breach'].includes(v)));
console.log("errors:",errs);await b.close()})();
