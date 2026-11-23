// Run by tests/run.js:  node tests/suites/export-axe.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const AX=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
(async()=>{const b=await chromium.launch();for(const w of [1280,390]){const p=await b.newPage({viewport:{width:w,height:900}});await p.goto('file://'+process.argv[2]);await p.addScriptTag({content:AX});
const r=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}})).violations.map(v=>v.id+' x'+v.nodes.length+' :: '+v.nodes[0].target.join(' ')));
console.log("export @"+w+":",r.length?r:"no violations");await p.close()}await b.close()})();
