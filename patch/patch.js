/* =====================================================================
   REPORT v2 — journey-ordered, two-axis findings report.
   Drop-in replacement for reportHTML(). Paste this block immediately
   ABOVE the existing `function reportHTML(){` and DELETE the old
   function body (from `function reportHTML(){` down to the closing
   `return h+`</div></div>`;\n}`).

   Storage: adds S[key+"|diff"], S[key+"|impact"], S[key+"|action"].
   Same suffix pattern as the existing "|tf" and "|n" keys, so nothing
   already saved is touched and no migration is needed.
===================================================================== */

/* --- 1. Journey sections ---------------------------------------------
   Priority is a PROPERTY OF THE PAGE, set once in the template editor
   (see editor-priority.js). A divider sets the priority for its whole
   section; an individual page can override it — a Lifts page sitting
   inside a late section is still path of travel.

   Priority answers "where in the visitor's journey", never "how bad".
   Severity already carries that on the other axis, so a non-compliant
   adult change facility stays priority 3 and takes its weight from the
   Breach of Code classification instead.

   SECTION_PRI is now only a fallback, used for dividers whose priority
   has not been set yet. First match wins, so specific rows come first. */
const SECTION_PRI=[
 [/amenit|toilet|sanitary|\bwc\b|shower|change|ablution/i,                3],
 [/sign|wayfind|be informed|communicat|inform/i,                          4],
 [/arriv|park|approach|external|kerb|landscap/i,                          1],
 [/enter|entra|door|foyer|lobby/i,                                        1],
 [/move around|circulat|accessway|corridor|floor|surface|ramp|stair|lift|handrail/i, 1],
 [/leave|egress|evacuat|emergenc|refuge/i,                                1],
 [/join in|particip|service|counter|reception|seating|hearing|kitchen/i,  2]
];
const PRI_LABEL={1:"Path of travel",2:"Services & participation",
                 3:"Amenities",4:"Information & other"};
const PRI_OPTIONS=[[1,"1 \u00b7 Path of travel"],[2,"2 \u00b7 Services & participation"],
                   [3,"3 \u00b7 Amenities"],[4,"4 \u00b7 Information & other"]];

const validPri=v=>(v>=1&&v<=4)?+v:0;
function fallbackPri(title){
 const hit=SECTION_PRI.find(([re])=>re.test(title||""));
 return hit?hit[1]:2;
}
/* page.id -> {section, pri, secPri}. Rebuilt each render so edits apply. */
function sectionMap(){
 const m=new Map(); let sec="General", pri=2;
 T.pages.forEach(p=>{
  if(p.divider){
   sec=p.title;
   pri=validPri(p.pri)||fallbackPri(p.title);
   return;
  }
  m.set(p.id,{section:sec,secPri:pri,pri:validPri(p.pri)||pri});
 });
 return m;
}

/* --- 2. Effort & scheduling zone ------------------------------------ */
const DIFFS=[["low","Low effort"],["mod","Moderate"],["high","High / capital"]];
const DIFF_LABEL=Object.fromEntries(DIFFS);
function zoneOf(pri,diff){
 const early=pri<=2;
 if(diff==="low") return early?1:3;
 if(diff==="mod") return early?2:3;
 if(diff==="high")return early?3:4;
 return early?2:3;              // effort not yet set
}
const ZONE=[null,
 {k:"z1",l:"Do first",   sub:"Immediate"},
 {k:"z2",l:"Programme",  sub:"This budget cycle"},
 {k:"z3",l:"Plan",       sub:"Design & approval needed"},
 {k:"z4",l:"Monitor",    sub:"Act at next refurbishment"}];

/* --- 3. Collect every flagged finding, with its derived metadata ----- */
function collectFindings(){
 const map=sectionMap();
 return allQs().map(x=>{
  const v=S[x.key], set=RS(x.item.rs).opts;
  if(v===undefined||v===""||!set[+v]) return null;
  const o=set[+v];
  const meta=map.get(x.page&&x.page.id)||{section:"General",pri:2};
  const gc = o.breach?"br"
           : o.score===0?"hi"
           : /med/i.test(o.l)?"md"
           : /low/i.test(o.l)?"lo"
           : o.flag?"md":"pass";
  return {
   key:x.key, item:x.item, page:x.page, opt:o, flag:!!o.flag,
   gc, gl:o.l, section:meta.section, pri:meta.pri,
   diff:S[x.key+"|diff"]||"", impact:S[x.key+"|impact"]||"",
   action:S[x.key+"|action"]||"", note:S[x.key+"|n"]||"",
   zone:zoneOf(meta.pri,S[x.key+"|diff"]||"")
  };
 }).filter(Boolean);
}

/* --- 4. Report-time editable controls ------------------------------- */
function diffSelect(key,val){
 return `<select class="tf-select" data-diff="${esc(key)}" aria-label="Effort to remedy">
   <option value=""${!val?" selected":""}>Effort…</option>`+
   DIFFS.map(([k,l])=>`<option value="${k}"${val===k?" selected":""}>${esc(l)}</option>`).join("")+
   `</select>`;
}
function rfField(key,suffix,label,placeholder){
 const v=S[key+"|"+suffix]||"";
 return `<div class="rf"><label class="rf-l" for="rf-${esc(key)}-${suffix}">${esc(label)}</label>
   <textarea class="rf-t" id="rf-${esc(key)}-${suffix}" data-rf="${esc(key)}" data-rfk="${suffix}"
     placeholder="${esc(placeholder)}" rows="2">${esc(v)}</textarea></div>`;
}

/* --- 5. The report -------------------------------------------------- */
let REPFILTER={pri:null,diff:null};      // set by clicking a matrix cell

function reportHTML(){
 const all=collectFindings();
 const flags=all.filter(f=>f.flag);
 const breaches=flags.filter(f=>f.gc==="br");
 const onPath=flags.filter(f=>f.pri===1);
 const quick=flags.filter(f=>f.diff==="low");
 const noEffort=flags.filter(f=>!f.diff);
 const site=esc(getFieldVal("Title Page","Site conducted")||"—");

 let h=`<div class="pg report2"><h2>${esc(T.meta.title)} — Report</h2>
  <div class="crumb">Inclusive Access Co. — generated ${new Date().toLocaleDateString("en-AU")}</div>

  <div class="card">
   <h3>Scope</h3>
   <p><b>Site:</b> ${site} &nbsp; <b>Client:</b> ${esc(getFieldVal("Title Page","Name")||"—")}
      &nbsp; <b>Consultant:</b> ${esc(getFieldVal("Title Page","Consultant Name")||"—")}
      &nbsp; <b>Conducted:</b> ${esc(getFieldVal("Title Page","Conducted on")||"—")}</p>
   ${getFieldVal("Access Audit Details","Benchmark")?`<p style="margin-top:6px"><b>Benchmark:</b> ${esc(getFieldVal("Access Audit Details","Benchmark"))}</p>`:""}
   ${reportPhotos(getFieldKey("Title Page","Site photo / media"))}
  </div>`;

 /* ---- Position statement (auditor-written, saved like any field) ---- */
 const posKey="report|position";
 h+=`<div class="card"><h3>Position</h3>
   <p class="rf-hint">One paragraph a client can read alone and act on. Name the two or three findings that
      carry real risk, and say what still works. This replaces a percentage score — a score invites
      "is 78% a pass?", and because unanswered and N/A items move it, it rewards leaving things blank.</p>
   <textarea class="rf-t pos" data-rf="report" data-rfk="position" rows="4"
     placeholder="e.g. The centre is reachable and enterable without assistance, but…">${esc(S[posKey]||"")}</textarea>
  </div>`;

 /* ---- Tiles ---- */
 h+=`<div class="tiles">
   <div class="tile c-breach"><span class="tl">Code breaches</span><b class="statv">${breaches.length}</b><span class="tn">Mandatory, no discretion</span></div>
   <div class="tile c-red"><span class="tl">On path of travel</span><b class="statv">${onPath.length}</b><span class="tn">Reached before any service</span></div>
   <div class="tile c-orange"><span class="tl">Quick wins</span><b class="statv">${quick.length}</b><span class="tn">Low effort, flagged</span></div>
   <div class="tile"><span class="tl">Total flagged</span><b class="statv">${flags.length}</b><span class="tn">of ${all.length} answered</span></div>
  </div>`;

 /* ---- Matrix ---- */
 h+=`<div class="card"><h3>Where to start</h3>
   <p class="rf-hint">Findings plotted by position in the journey against effort to remedy. Read top-left to
      bottom-right. Select a cell to filter the findings below.
      ${noEffort.length?`<b style="color:var(--orange)">${noEffort.length} finding${noEffort.length===1?" has":"s have"} no effort set</b> — set it on each finding and this fills in.`:""}</p>
   <table class="mx"><thead><tr><th></th>`+
   DIFFS.map(([,l])=>`<th class="ch">${l}</th>`).join("")+`</tr></thead><tbody>`;
 [1,2,3,4].forEach(p=>{
  h+=`<tr><th scope="row">${p} · ${PRI_LABEL[p]}</th>`;
  DIFFS.forEach(([d])=>{
   const n=flags.filter(f=>f.pri===p&&f.diff===d).length, z=ZONE[zoneOf(p,d)];
   const on=REPFILTER.pri===p&&REPFILTER.diff===d;
   h+=`<td><button class="${n?z.k:"zempty"}${on?" sel":""}" data-mx="${p}:${d}"
      aria-label="${n} findings, ${PRI_LABEL[p]}, ${DIFF_LABEL[d]}, ${z.l}">
      <span class="n">${n||"—"}</span><span class="zl">${n?z.l:""}</span></button></td>`;
  });
  h+=`</tr>`;
 });
 h+=`</tbody></table>
   <div class="mxlegend">`+ZONE.slice(1).map(z=>`<span><i class="sw ${z.k}"></i> ${z.l} — ${z.sub}</span>`).join("")+`</div>
   <p class="rf-hint" style="margin-top:10px">Priority follows position in the journey, not the size of the breach:
      a 20&nbsp;mm lip at the front door outranks a poorly contrasted sign in a store room. Effort is a rough
      order of magnitude for time and funding — deliberately not a dollar figure.</p>
  </div>`;

 /* ---- Journey ---- */
 const smap=sectionMap(); const allSecs=[];
 smap.forEach(v=>{ if(!allSecs.some(s=>s.name===v.section)) allSecs.push({name:v.section,pri:v.secPri}); });
 /* Admin pages (Title, Introduction, Summary) land in a synthetic
    "General" section and hold no assessed items — drop any such stage
    rather than rendering an empty rung on the journey. */
 const liveSecs=allSecs.filter(s=>all.some(f=>f.section===s.name));
 h+=`<div class="card"><h3>The building, walked through</h3>
   <p class="rf-hint">A section with a breach breaks the chain: everything beyond it is unreachable for someone,
      however compliant it is in isolation.</p><div class="jrn">`;
 liveSecs.forEach(s=>{
  const items=all.filter(f=>f.section===s.name), fl=items.filter(f=>f.flag);
  const worst=fl.some(f=>f.gc==="br")?"breach":fl.some(f=>f.gc==="hi")?"red":fl.length?"orange":"green";
  const col=`var(--${worst==="breach"?"breach":worst==="red"?"red":worst==="orange"?"orange":"green"})`;
  const counts={}; fl.forEach(f=>{counts[f.gl]=(counts[f.gl]||0)+1;});
  /* A section normally carries one priority. If a page inside it has been
     overridden, say so honestly rather than reporting the section's. */
  const prisIn=[...new Set(items.map(f=>f.pri))].sort();
  const priTxt = prisIn.length===1
    ? `Priority ${prisIn[0]} \u00b7 ${PRI_LABEL[prisIn[0]]}`
    : `Priorities ${prisIn.join(", ")}`;
  h+=`<div class="jstage"><div class="jrail" style="color:${col}">
     <i class="jdot" style="background:${col}"></i><i class="jline"></i></div>
    <div class="jbody"><div class="jname">${esc(s.name)}</div>
     <div class="jmeta">${priTxt} \u00b7 ${items.length} assessed \u00b7 ${fl.length} flagged</div>
     <div class="jchips">`+
     (Object.keys(counts).length?Object.entries(counts).map(([l,n])=>
       `<span class="chip ${/breach/i.test(l)?"b":/high/i.test(l)?"h":"m"}">${n} ${esc(l)}</span>`).join("")
      :`<span class="chip p">No issues recorded</span>`)+
    `</div></div></div>`;
 });
 h+=`</div></div>`;

 /* ---- Findings ---- */
 let shown=flags;
 if(REPFILTER.pri) shown=shown.filter(f=>f.pri===REPFILTER.pri&&f.diff===REPFILTER.diff);
 const RANK={br:0,hi:1,md:2,lo:3,pass:9};
 shown=shown.slice().sort((a,b)=>a.pri-b.pri||RANK[a.gc]-RANK[b.gc]);
 h+=`<div class="card"><h3>Findings &amp; recommended actions <span class="cnt">${shown.length}${REPFILTER.pri?` of ${flags.length}`:""}</span>
   ${REPFILTER.pri?`<button class="btn" style="float:right;padding:4px 10px;font-size:12.5px" data-mxclear>Clear filter</button>`:""}</h3>`;
 if(!shown.length){
  h+=`<p style="color:var(--muted)">No findings match.</p>`;
 }else{
  let lastSec=null;
  shown.forEach(f=>{
   if(f.section!==lastSec){ lastSec=f.section;
    h+=`<h4 class="secbreak">${esc(f.section)} <span class="cnt">Priority ${f.pri}</span></h4>`; }
   const z=ZONE[zoneOf(f.pri,f.diff)];
   const flagCls=f.gc==="br"?"breach":f.gc==="hi"?"":"med";
   h+=`<div class="flagitem ${flagCls}">
     <span class="badge ${f.gc}">${esc(f.gl)}</span> &nbsp; <b>${esc(f.item.t)}</b>
     <div class="fp">${esc(f.page?f.page.title:"")}${f.item.c?" — "+esc(f.item.c):""}</div>
     ${f.note?`<div class="rf-note"><b>Site note:</b> ${esc(f.note)}</div>`:""}
     ${rfField(f.key,"impact","Impact — who is excluded, and from what","A wheelchair user cannot… / A person who is blind cannot…")}
     ${rfField(f.key,"action","Action — the works instruction","Extend the lower handrail by 160 mm with a matching return to the wall.")}
     <div class="tf-row">
       ${diffSelect(f.key,f.diff)}
       <label class="tf-label">Fix by:
         <select class="tf-select" data-tf="${esc(f.key)}">${tfOptions(TF_MAX_MONTHS[f.gc]||12,S[f.key+"|tf"])}</select></label>
       <span class="tag">When <b>${z.l}</b></span>
     </div>
     ${reportPhotos(f.key)}</div>`;
  });
 }
 h+=`</div>`;

 /* ---- Works schedule ---- */
 h+=`<div class="card"><h3>Works schedule</h3>
   <p class="rf-hint">The hand-off table. Export this as CSV beside the PDF so the client can paste it
      into their maintenance system or send it to a builder.</p>
   <table class="rep-table"><tr><th>Element</th><th>Location</th><th>Works</th><th>Clause</th><th>Effort</th></tr>`;
 let any=false;
 [1,2,3,4].forEach(z=>{
  const items=flags.filter(f=>zoneOf(f.pri,f.diff)===z);
  if(!items.length)return; any=true;
  h+=`<tr class="schband"><td colspan="5">${ZONE[z].l} — ${ZONE[z].sub} (${items.length})</td></tr>`;
  items.forEach(f=>{
   h+=`<tr><td>${esc(f.item.t)}</td><td>${esc(f.page?f.page.title:"")}</td>
     <td>${f.action?esc(f.action):`<span style="color:var(--muted)">— not yet written —</span>`}</td>
     <td style="font-size:12px;color:var(--muted)">${esc(f.item.c||"")}</td>
     <td>${f.diff?esc(DIFF_LABEL[f.diff]):`<span style="color:var(--muted)">—</span>`}</td></tr>`;
  });
 });
 if(!any) h+=`<tr><td colspan="5" style="color:var(--muted)">No flagged items.</td></tr>`;
 h+=`</table></div>`;

 /* ---- Monitor list (unchanged behaviour) ---- */
 const flagKeys=new Set(flags.map(f=>f.key));
 const monitored=allQs().filter(x=>(S[x.key+"|n"]||(PHOTOS[x.key]&&PHOTOS[x.key].length))&&!flagKeys.has(x.key));
 h+=`<div class="card"><h3>Other items with comments or photos to monitor <span class="cnt">${monitored.length}</span></h3>`;
 if(!monitored.length) h+=`<p style="color:var(--muted)">No additional comments or photos recorded.</p>`;
 monitored.forEach(x=>{
  h+=`<div class="flagitem med"><span class="badge md">Comment</span> &nbsp; ${esc(x.item.t)}
   <div class="fp">${esc(x.page?x.page.title:"")}${x.item.c?" — "+esc(x.item.c):""}</div>
   ${S[x.key+"|n"]?`<div class="rf-note"><b>Comment:</b> ${esc(S[x.key+"|n"])}</div>`:""}
   ${reportPhotos(x.key)}</div>`;
 });
 return h+`</div></div>`;
}

/* --- 6. CSV export of the works schedule ---------------------------- */
function exportScheduleCSV(){
 const flags=collectFindings().filter(f=>f.flag)
   .sort((a,b)=>zoneOf(a.pri,a.diff)-zoneOf(b.pri,b.diff)||a.pri-b.pri);
 const q=s=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';
 const rows=[["When","Priority","Journey section","Element","Location","Clause",
              "Classification","Effort","Impact","Works","Fix by (months)"]];
 flags.forEach(f=>rows.push([ZONE[zoneOf(f.pri,f.diff)].l,f.pri,f.section,f.item.t,
   f.page?f.page.title:"",f.item.c||"",f.gl,DIFF_LABEL[f.diff]||"",f.impact,f.action,
   S[f.key+"|tf"]||""]));
 const csv="﻿"+rows.map(r=>r.map(q).join(",")).join("\r\n");
 const a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 a.download="works-schedule-"+new Date().toISOString().slice(0,10)+".csv";
 document.body.appendChild(a); a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
}
