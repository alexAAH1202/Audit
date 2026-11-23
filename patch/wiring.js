/* =====================================================================
   REPORT v2 — event wiring.
   Paste this block anywhere AFTER `const content=document.getElementById("content");`
   (the EVENTS section). It adds its own listeners rather than editing
   yours, so nothing existing can regress.
===================================================================== */
content.addEventListener("click",e=>{
 const cell=e.target.closest("[data-mx]");
 if(cell){
  const [p,d]=cell.dataset.mx.split(":");
  const same=REPFILTER.pri===+p&&REPFILTER.diff===d;
  REPFILTER=same?{pri:null,diff:null}:{pri:+p,diff:d};
  render(); return;
 }
 if(e.target.closest("[data-mxclear]")){ REPFILTER={pri:null,diff:null}; render(); return; }
});
content.addEventListener("change",e=>{
 const d=e.target.closest("[data-diff]");
 if(d){ S[d.dataset.diff+"|diff"]=d.value; saveA(); render(); }
});
/* Report-time prose fields. Saved on every keystroke, never re-rendered,
   so the caret and scroll position survive a long Action paragraph. */
content.addEventListener("input",e=>{
 const rf=e.target.closest("[data-rf]");
 if(rf){ S[rf.dataset.rf+"|"+rf.dataset.rfk]=rf.value; saveA(); }
});
