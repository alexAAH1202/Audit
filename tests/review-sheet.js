#!/usr/bin/env node
/* Builds docs/consultant-review-sheet.html and .pdf from the app's own template, drafts and Review list.
   Developer tooling, like the tests: node tests/review-sheet.js   (needs Playwright, as the tests do) */
const path=require("path"),fs=require("fs");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,".."), app=path.join(root,"access-audit.html");
(async()=>{
const b=await chromium.launch();const p=await b.newPage();await p.goto("file://"+app);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
const d=await p.evaluate(()=>{const seen=new Set(),qs=[];const walk=(items,pg,g)=>items.forEach(it=>{if(it.k==="grp")walk(it.items,pg,it.t);else if(it.items)walk(it.items,pg,g);else if(it.k==="q"&&!seen.has(it.t)){seen.add(it.t);const r=measureRule(it.t);qs.push({pg:pg.title,leg:/Legis/.test(g||""),t:it.t,c:it.c||"",m:r?measureReq(r):"",s:(it.f||"").trim()||draftStatement(it.t),i:(it.imp||"").trim()||draftImpact(it,pg),e:DIFF_LABEL[suggestEffort(it)]});}});
 T.pages.forEach(pg=>walk(pg.items||[],pg,""));return {qs,rev:REVIEW_ITEMS.map(r=>({g:r.g,t:r.t,d:r.d}))};});
const h=render(d);
fs.writeFileSync(path.join(root,"docs","consultant-review-sheet.html"),h);
await p.setContent("<!doctype html><html><head><meta charset=utf-8></head><body>"+h+"</body></html>");await p.waitForTimeout(800);
await p.pdf({path:path.join(root,"docs","consultant-review-sheet.pdf"),format:"A4",landscape:true,margin:{top:"10mm",bottom:"12mm",left:"10mm",right:"10mm"},displayHeaderFooter:true,headerTemplate:"<span></span>",footerTemplate:"<div style=\"font-size:7px;width:100%;text-align:center;color:#555\">Consultant review sheet · page <span class=pageNumber></span> of <span class=totalPages></span></div>"});
await b.close();console.log("Wrote docs/consultant-review-sheet.html and .pdf:",d.qs.length,"questions,",d.rev.length,"open decisions");
})();
function render(d){
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const box='<span class="box" aria-hidden="true"></span>';
const pages=[...new Set(d.qs.map(q=>q.pg))];
const meas=d.qs.filter(q=>q.m);
let h=`<title>Consultant Review Sheet</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Sans+Condensed:wght@600&display=swap">
<style>
/* Layout: a single reading column like a marked-up compliance schedule; tables carry the per-question review. */
:root{--bg:#fbfbfd;--fg:#1c1f2b;--muted:#5a5f73;--rule:#d5d7e2;--brand:#2b3990;--fill:#eef0f8;--draft:#8a5a00;
 --text:"IBM Plex Sans",system-ui,sans-serif;--label:"IBM Plex Sans Condensed","Arial Narrow",system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#14161f;--fg:#e6e8f0;--muted:#a3a8bc;--rule:#363a4c;--brand:#9aa8ff;--fill:#1e2130;--draft:#e0b45a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#14161f;--fg:#e6e8f0;--muted:#a3a8bc;--rule:#363a4c;--brand:#9aa8ff;--fill:#1e2130;--draft:#e0b45a;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:15px/1.5 var(--text);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 48px}
main{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
h1,h2,h3{text-wrap:balance;margin:0;line-height:1.25}h1{font-size:1.9rem;color:var(--brand)}h2{font-size:1.35rem;color:var(--brand);padding-top:8px;border-top:2px solid var(--brand)}h3{font-size:1.05rem;margin-top:14px}
p{margin:0;max-width:68ch}.lede{color:var(--muted)}
.meta{display:flex;flex-wrap:wrap;gap:8px 28px;font-size:.9rem}.meta b{font-family:var(--label);text-transform:uppercase;letter-spacing:.06em;font-size:.75rem;color:var(--muted);display:block}
.line{display:inline-block;min-width:14em;border-bottom:1px solid var(--fg);height:1.2em}
.box{display:inline-block;width:14px;height:14px;border:1.5px solid var(--fg);border-radius:2px;vertical-align:-2px}
.key{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:.88rem;color:var(--muted)}
ol.rev{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px}
ol.rev li{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;padding:10px 0;border-bottom:1px solid var(--rule);break-inside:avoid}
ol.rev .g{font-family:var(--label);text-transform:uppercase;letter-spacing:.06em;font-size:.72rem;color:var(--muted)}
ol.rev .d{grid-column:2;color:var(--fg);font-size:.92rem}
.notes{grid-column:2;border-bottom:1px dotted var(--muted);height:1.6em}
.wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:.84rem}
th{font-family:var(--label);text-transform:uppercase;letter-spacing:.05em;font-size:.7rem;text-align:left;color:var(--muted);border-bottom:1.5px solid var(--fg);padding:6px}
td{border-bottom:1px solid var(--rule);padding:7px 6px;vertical-align:top}
tr{break-inside:avoid}
td.ok{white-space:nowrap;font-size:.8rem}td.ok span{margin-right:8px}table{table-layout:fixed}
.cl{color:var(--muted);font-size:.78rem}
.dr{color:var(--draft)}.lim{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}
.fallback{color:var(--muted);font-style:italic}
.tag{font-family:var(--label);font-size:.68rem;letter-spacing:.05em;text-transform:uppercase;border:1px solid var(--rule);border-radius:3px;padding:0 4px;color:var(--muted)}
@media print{body{background:#fff;color:#000;padding:0;font-size:8pt}td{padding:3px 4px}ol.rev li{padding:4px 0}h2{break-before:page}h2.first{break-before:auto}.wrap{overflow:visible}}
</style>
<main>
<header style="display:flex;flex-direction:column;gap:12px">
<p class="lede" style="font-family:var(--label);text-transform:uppercase;letter-spacing:.08em;font-size:.8rem">Inclusive Access Co. · Premises Access Audit Tool</p>
<h1>Consultant review sheet</h1>
<p>The audit tool holds draft content that needs an access consultant's judgement before reports go to clients. Mark this sheet up and return it; each change will be made in the tool's template, so it applies to every future audit.</p>
<div class="meta"><div><b>Reviewed by</b><span class="line"></span></div><div><b>Date</b><span class="line" style="min-width:8em"></span></div><div><b>Template</b>${d.qs.length} questions, ${pages.length} areas</div></div>
<div class="key"><span>${box} OK as drafted</span><span>${box} Change: write the correction in the space</span><span><span class="dr">Brown text</span> = drafted by the tool</span></div>
</header>
<section style="display:flex;flex-direction:column;gap:12px"><h2 class="first">Part 1 · Open decisions (${d.rev.length})</h2>
<p class="lede">Questions about how the tool behaves. Tick when settled and note the decision.</p>
<ol class="rev">${d.rev.map((r,i)=>`<li>${box}<div><span class="g">${esc(r.g)}</span><br><b>${esc(r.t)}</b></div><div class="d">${esc(r.d)}</div><div class="notes"></div></li>`).join("")}</ol></section>
<section style="display:flex;flex-direction:column;gap:12px"><h2>Part 2 · Measured limits (${meas.length})</h2>
<p class="lede">The tool reads a limit from each question's wording and tells the auditor whether a measured value meets it. Check the limit is the one that applies. Gradients are entered as the N in 1:N.</p>
<div class="wrap"><table><thead><tr><th>Area</th><th>Question</th><th>Limit the tool checks</th><th style="width:15%">OK / change</th></tr></thead><tbody>
${meas.map(q=>`<tr><td>${esc(q.pg)}</td><td>${esc(q.t)}${q.c?`<div class="cl">${esc(q.c)}</div>`:""}</td><td class="lim dr">${esc(q.m)}</td><td class="ok"><span>${box} OK</span><span>${box} Change</span></td></tr>`).join("")}
</tbody></table></div></section>
<section style="display:flex;flex-direction:column;gap:12px"><h2>Part 3 · Finding wording and effort (${d.qs.length})</h2>
<p class="lede">What the report says when a question is not met. The statement is the requirement turned negative; where that would read wrongly the report says "Not met:" and the requirement. The impact is chosen by topic. The action asks for the requirement to be met. Effort is the starting value for the action plan. Rewrite the most common findings in your own words; the rest can stay drafted.</p>
${pages.map(pg=>{const qs=d.qs.filter(q=>q.pg===pg);return `<h3>${esc(pg)} <span class="tag">${qs.length}</span></h3><div class="wrap"><table><thead><tr><th style="width:24%">Question</th><th style="width:28%">Finding statement</th><th style="width:22%">Who this affects</th><th style="width:10%">Effort</th><th style="width:15%">OK / change</th></tr></thead><tbody>
${qs.map(q=>`<tr><td>${esc(q.t)}${q.c?`<div class="cl">${esc(q.c)}${q.leg?"":" · best practice"}</div>`:(q.leg?"":`<div class="cl">best practice</div>`)}</td><td class="dr">${q.s?esc(q.s):`<span class="fallback">Not met: ${esc(q.t)}</span>`}</td><td class="dr">${esc(q.i)}</td><td class="dr">${esc(q.e)}</td><td class="ok"><span>${box} OK</span><span>${box} Change</span></td></tr>`).join("")}</tbody></table></div>`;}).join("")}
<p class="cl">Every action reads "Rectify so that [the requirement], in accordance with [the clause]." Say here if you want a different pattern: <span class="line" style="min-width:20em"></span></p>
</section></main>`;
return h;}
