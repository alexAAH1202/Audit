// Run by tests/run.js:  node tests/suites/search.js <path to access-audit.html>
const {chromium}=require('playwright');const fs=require('fs');const D=(process.env.TEST_OUT+'/');
const AX=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
(async()=>{const b=await chromium.launch();const errs=[];
const open=async(w)=>{const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:w<500?2:1});p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.argv[2]);await p.evaluate(()=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k)});await p.reload();await p.waitForTimeout(300);await p.evaluate(()=>{document.getElementById('notices').innerHTML=''});return p};
const p=await open(1100);
const type=async q=>{await p.fill('#qSearch',q);await p.waitForTimeout(250)};
const res=()=>p.$$eval('.sres',n=>n.length);
await type('handrail');
console.log("1 'handrail':",await res(),"results | status:",await p.textContent('#qStatus'),"| nav hidden:",await p.$eval('#nav',e=>e.hidden),"| marks:",await p.$$eval('.sres mark',n=>n.length>0),"| clear button:",await p.isVisible('#qClear'));
console.log("   first result:",await p.$eval('.sres',e=>e.innerText.replace(/\s+/g,' ').slice(0,150)));
await type('ramp gradient');console.log("2 two words (AND):",await res(),"|",await p.$eval('.sres',e=>e.querySelector('.sr-q').textContent.slice(0,60)));
await type('1428.1 cl 12');console.log("3 by clause:",await res(),"| the exact phrase ranks first:",await p.$$eval('.sres',n=>n.slice(0,5).every(e=>/cl 12/i.test(e.innerText))));
await type('zzzqqq');console.log("4 nothing:",await p.$eval('#qResults',e=>e.innerText.slice(0,70)),"|",await p.textContent('#qStatus'));
// by instance name and by comment
await p.evaluate(()=>{cur=T.pages.findIndex(x=>x.title==="Accessible Car Parking");render();REPS[T.pages[cur].items.find(i=>i.k==="sec").id]=2;const sec=T.pages[cur].items.find(i=>i.k==="sec");S[sec.id+"~1|lbl"]="Bay Two by the lift";const q=allQs().filter(x=>x.page.title==="Accessible Car Parking"&&x.trail.length&&/lift/i.test(x.trail[0]));S[q[0].key+"|n"]="Kerb is cracked near the bollard";saveA();render()});
await type('by the lift');console.log("5 by repeated-element name:",await res(),"| shows the name:",await p.$eval('.sres .sr-m',e=>e.textContent.includes('Bay Two by the lift')));
await type('bollard');console.log("6 by your own comment:",await res(),"|",await p.$eval('.sres .sr-s',e=>e.textContent));
// scope-skipped page marked
await p.evaluate(()=>{S[getFieldKey("Site Scope","Is on-site car parking provided for the building?")]="no";saveA();render()});
await type('parking bays');console.log("7 skipped page still found + marked:",await p.$$eval('.sres .sr-s',n=>n.filter(x=>/not applicable by scope/i.test(x.textContent)).length>0));
await p.evaluate(()=>{S[getFieldKey("Site Scope","Is on-site car parking provided for the building?")]="";saveA();render()});
// choose a result in a folded group
await type('nosing');const folded=await p.evaluate(()=>0);
const idx=await p.evaluate(()=>{const hs=[...document.querySelectorAll('.sres')];return hs.findIndex(h=>/Best|best/.test(h.innerText))});
await type('permitted by exemption');
console.log("   (searching for a question inside a folded group)");
await type('signage');
await p.locator('.sres').first().click();await p.waitForTimeout(300);
const inf=await p.evaluate(()=>({page:T.pages[cur].title,focus:document.activeElement.getAttribute('role'),inFolded:!!document.activeElement.closest('.grpbody'),open:document.activeElement.closest('.grpbody')?!document.activeElement.closest('.grpbody').hidden:null}));
console.log("8 choosing a result goes there:",JSON.stringify(inf),"| search stays:",await p.inputValue('#qSearch'));
// pick a result known to be in a Best Practice group
await p.evaluate(()=>{GRP_OPEN.clear();GRP_SHUT.clear();render()});
const bpText=await p.evaluate(()=>{const c=[...document.querySelectorAll('.grpbody')].find(g=>g.hidden);const t=c.querySelector('.qt span').textContent;return t});
await type(bpText.slice(0,40));await p.locator('.sres').first().click();await p.waitForTimeout(300);
console.log("9 result inside a folded group opens it:",await p.evaluate(t=>{const f=document.activeElement.closest('.grpbody');return f&&!f.hidden&&document.activeElement.getAttribute('role')==='radio'},bpText));
// keyboard
await p.focus('#qSearch');await p.fill('#qSearch','handrail');await p.waitForTimeout(250);await p.keyboard.press('ArrowDown');console.log("10 ArrowDown moves into results:",await p.evaluate(()=>document.activeElement.classList.contains('sres')));
await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowUp');await p.keyboard.press('ArrowUp');console.log("    ArrowUp back to the box:",await p.evaluate(()=>document.activeElement.id));
await p.keyboard.press('Enter');await p.waitForTimeout(250);console.log("    Enter opens the first result:",await p.evaluate(()=>document.activeElement.getAttribute('role')));
await p.focus('#qSearch');await p.keyboard.press('Escape');console.log("11 Escape clears and restores the section list:",await p.inputValue('#qSearch')==="",await p.$eval('#nav',e=>!e.hidden));
await p.evaluate(()=>document.body.focus());await p.keyboard.press('/');console.log("12 '/' focuses search:",await p.evaluate(()=>document.activeElement.id));
// axe with results showing
await p.fill('#qSearch','handrail');await p.waitForTimeout(250);await p.addScriptTag({content:AX});
const ax=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}})).violations.map(v=>v.id+" x"+v.nodes.length));
console.log("13 axe with results showing:",ax.length?ax:"no violations");
// phone
const q=await open(390);
await q.click('#btnMenu');await q.waitForTimeout(350);await q.fill('#qSearch','handrail');await q.waitForTimeout(250);
await q.screenshot({path:D+'srch-phone.png'});
await q.locator('.sres').first().click();await q.waitForTimeout(400);
console.log("14 phone: choosing a result closes the drawer and lands on the question:",await q.evaluate(()=>({drawerOpen:document.querySelector('.side').classList.contains('open'),focus:document.activeElement.getAttribute('role'),page:T.pages[cur].title})));
const wide=await q.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);console.log("    no sideways scroll:",!wide);
console.log("errors:",errs);await b.close()})();
