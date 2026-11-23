/* =====================================================================
   REPORT v2 — journey priority in the template editor.
   Two small edits to EXISTING lines. Apply after patch.js.
===================================================================== */

/* --- EDIT 1 of 2 --------------------------------------------------
   In render(), inside the `if(EDIT){ ... }` block for the page header,
   find this line:

     ${p.divider?`<input class="ein" data-pblurb value="${esc(p.blurb||"")}" placeholder="Divider description">`:""}</div>`;

   Replace it with the line below. A divider sets the priority for its
   whole section; a normal page shows "Inherit from section" and only
   overrides when you choose a value.
------------------------------------------------------------------- */

   ${p.divider?`<input class="ein" data-pblurb value="${esc(p.blurb||"")}" placeholder="Divider description" style="margin-bottom:6px">`:""}
    <label class="emeta">Journey priority
      <select class="ein" data-ppri style="width:auto;display:inline-block">
        ${p.divider?"":`<option value=""${!validPri(p.pri)?" selected":""}>Inherit from section</option>`}
        ${PRI_OPTIONS.map(([v,l])=>`<option value="${v}"${validPri(p.pri)===v?" selected":""}>${l}</option>`).join("")}
      </select></label>
    ${p.divider&&!validPri(p.pri)?`<span class="emeta" style="margin-left:8px;color:var(--orange)">not set — falling back to "${PRI_LABEL[fallbackPri(p.title)]}"</span>`:""}
   </div>`;


/* --- EDIT 2 of 2 --------------------------------------------------
   In the content "change" listener, beside the existing data-pdiv
   handler, add this line. Re-render so the report and the fallback
   hint both update immediately.

     const pd=e.target.closest("[data-pdiv]"); if(pd){ ... }
   ↓ add directly after it:
------------------------------------------------------------------- */

 const pr=e.target.closest("[data-ppri]");
 if(pr){ T.pages[cur].pri=pr.value?+pr.value:0; saveT(); render(); return; }


/* --- OPTIONAL: add the missing journey dividers -------------------
   The patch cannot create dividers — they are template content, not
   code. If you want them inserted automatically, edit the map below to
   match your real page titles, open the tool, and paste the whole
   function into the browser console. It reports what it will do and
   changes nothing until you confirm.
------------------------------------------------------------------- */
function addJourneyDividers(commit){
 /* divider title, priority, and the page title it should sit BEFORE
    (first case-insensitive substring match wins) */
 const PLAN=[
  ["ARRIVE",      1, "Accessible Car Parking"],
  ["ENTER",       1, "Principal Pedestrian Entrance"],
  ["MOVE AROUND", 1, "Internal Accessways"],
  ["JOIN IN",     2, "Reception"],
  ["AMENITIES",   3, "Accessible Toilet"],
  ["BE INFORMED", 4, "Signage"],
  ["LEAVE",       1, "Egress"]
 ];
 const report=[];
 PLAN.forEach(([title,pri,before])=>{
  if(T.pages.some(p=>p.divider&&p.title.toUpperCase()===title)){
   report.push(`SKIP  ${title} — divider already exists`); return; }
  const i=T.pages.findIndex(p=>!p.divider&&p.title.toLowerCase().includes(before.toLowerCase()));
  if(i<0){ report.push(`MISS  ${title} — no page matching "${before}"`); return; }
  report.push(`ADD   ${title} (priority ${pri}) before "${T.pages[i].title}"`);
  if(commit) T.pages.splice(i,0,{id:"pg"+genId(),title,divider:true,blurb:"",pri,items:[]});
 });
 console.log(report.join("\n"));
 if(commit){ saveT(); render(); console.log("\nCommitted. Check the nav, then Export template to back it up."); }
 else console.log('\nDry run. Run addJourneyDividers(true) to apply.');
}
