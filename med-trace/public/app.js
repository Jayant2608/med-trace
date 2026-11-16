const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString("en-IN"):v};
const money=v=>"₹"+Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const shortTime=s=>String(s||"").replace("T"," ").slice(0,16);
const initials=n=>String(n||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();

const BADGE={genuine:"ok",received:"ok",delivered:"ok",active:"warn",completed:"info",withdrawn:"info",recalled:"bad",suspected_fake:"bad",expired:"warn",unknown:"info",in_transit:"info",cancelled:"info",high:"bad",critical:"bad",low:"info",medium:"warn",manufacturer:"info",distributor:"info",pharmacy:"info",regulator:"info"};
const NUMERIC=new Set(["id","number","money"]);

let META=null,user=null,cur="",sortCol=-1,sortDir=1,q="",rows=[],cols=[],lastSql=[];
let page=1,pageSize=10,currentRow=null;

/* ---------- api ---------- */
async function api(path,opts={}){
  const headers={...(opts.headers||{})};
  try{const t=localStorage.getItem("mt-token");if(t)headers["x-auth-token"]=t}catch{}
  const r=await fetch(path,{...opts,headers});
  const j=await r.json();
  if(!j.ok)throw new Error(j.error||"Request failed");
  return j;
}

/* ---------- toasts ---------- */
function toast(title,msg,kind="ok"){
  const el=document.createElement("div");
  el.className="toast "+kind;
  el.innerHTML=`<span class="ic">${kind==="ok"?"✓":kind==="bad"?"!":"⚠"}</span><div><b>${esc(title)}</b>${msg?`<small>${esc(msg)}</small>`:""}</div><button class="x" aria-label="Dismiss">×</button>`;
  el.querySelector(".x").onclick=()=>el.remove();
  $("#toasts").appendChild(el);
  setTimeout(()=>el.remove(),5200);
}

/* ---------- SQL panel ---------- */
const SQL_KW=/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|ON|USING|AS|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|INSERT|INTO|VALUES|UPDATE|SET|DELETE|GROUP|HAVING|BY|ORDER|LIMIT|OFFSET|DISTINCT|UNION|ALL|COUNT|SUM|AVG|MIN|MAX|COALESCE|CONCAT_WS|CONCAT|CURDATE|NOW|DATE_FORMAT|CAST|CASE|WHEN|THEN|ELSE|END|EXISTS|DESC|ASC|BEGIN|COMMIT|ROLLBACK|CREATE|TABLE|VIEW|TRIGGER|DATABASE|IF|EXISTS|DROP|ALTER|ADD|PRIMARY|FOREIGN|KEY|REFERENCES|UNIQUE|INDEX|CONSTRAINT|DEFAULT|AUTO_INCREMENT|ENGINE|CHARSET|CHARACTER|COLLATE|CASCADE|RESTRICT|CHECK|ENUM|INT|INTEGER|BIGINT|SMALLINT|DECIMAL|NUMERIC|VARCHAR|CHAR|TEXT|DATE|DATETIME|TIMESTAMP|TIME|BOOLEAN|BEFORE|AFTER|EACH|ROW|DECLARE|SIGNAL|SQLSTATE|MESSAGE_TEXT|NEW|OLD|FOR|CALL|DELIMITER|USE|REPLACE|INFORMATION_SCHEMA|SHOW|DESCRIBE)\b/gi;
function hl(sql){
  // Split off string literals and comments first, then colour the code in between.
  return esc(sql).split(/(--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|'(?:[^']|'')*'|"(?:[^"]|"")*")/g)
    .map(part=>{
      if(!part)return "";
      if(/^(--|#|\/\*)/.test(part))return `<span class="cm">${part}</span>`;
      if(/^['"]/.test(part))return `<span class="str">${part}</span>`;
      return part.replace(SQL_KW,'<span class="kw">$1</span>').replace(/\b(\d+)\b/g,'<span class="num">$1</span>');
    }).join("");
}
function sqlBlock(list,opts={}){
  if(!list||!list.length)return "";
  const open=opts.open?" open":"";
  const total=list.reduce((a,s)=>a+(s.rows||0),0);
  const body=list.map(s=>`<div class="stmt"><div class="lbl"><span>${esc(s.label||"Query")}</span>${s.rows!=null?`<span>${s.rows} row${s.rows===1?"":"s"} affected</span>`:""}</div><pre>${hl(s.sql)}</pre></div>`).join("");
  const trig=opts.trigger?`<div class="stmt"><div class="lbl"><span>Trigger that also ran</span></div><pre>${esc(opts.trigger)}</pre></div>`:"";
  const err=opts.error?`<div class="errline">MySQL ${esc(opts.error.sqlState||"")} · ${esc(opts.error.code||"")}: ${esc(opts.error.message||"")}</div>`:"";
  return `<div class="sqlwrap"><details class="sql"${open}><summary>Show the database query behind this<span class="meta">${list.length} statement${list.length===1?"":"s"} · ${total} row${total===1?"":"s"} affected</span></summary><div class="body">${body}${trig}${err}</div></details></div>`;
}
document.addEventListener("click",e=>{
  const b=e.target.closest(".sqlhint");
  if(!b)return;
  const slot=b.parentElement.querySelector(".slot");
  if(!slot)return; // report hints handle their own toggle via data-q
  if(slot.innerHTML){slot.innerHTML="";b.textContent="▸ Show the database query behind this";return}
  let list=[];try{list=JSON.parse(b.dataset.sql)}catch{}
  slot.innerHTML=sqlBlock(list,{open:true,trigger:b.dataset.trigger});
  b.textContent="▾ Hide SQL";
});

/* ---------- illustrations ---------- */
// Inline SVGs so the demo works offline and follows the theme. Kept as string
// builders so views can drop them in anywhere.
function illusTrace(){
  return `<svg class="illus" viewBox="0 0 640 150" role="img" aria-label="A batch moving from manufacturer to distributor to pharmacy to customer, checked at each step">
    <path class="dash flow" d="M112 78 H528"/>
    <g><rect class="node" x="18" y="44" width="94" height="68" rx="10"/>
      <rect class="fillb" x="38" y="62" width="54" height="12" rx="3"/>
      <path class="lnb" d="M38 96 h54 M38 86 h34"/>
      <text class="lbl" x="65" y="130" text-anchor="middle">Manufacturer</text></g>
    <g><rect class="node" x="184" y="44" width="94" height="68" rx="10"/>
      <path class="ln" d="M204 92 v-24 h34 v24 M238 68 h20 l16 16 v8 h-36"/>
      <circle class="ln" cx="216" cy="98" r="6"/><circle class="ln" cx="252" cy="98" r="6"/>
      <text class="lbl" x="231" y="130" text-anchor="middle">Distributor</text></g>
    <g><rect class="node" x="350" y="44" width="94" height="68" rx="10"/>
      <circle class="fillk" cx="397" cy="78" r="20"/>
      <path class="lnk" d="M397 62 v32 M381 78 h32"/>
      <text class="lbl" x="397" y="130" text-anchor="middle">Pharmacy</text></g>
    <g class="pulse"><rect class="node" x="516" y="44" width="94" height="68" rx="10"/>
      <circle class="ln" cx="563" cy="70" r="11"/>
      <path class="ln" d="M546 102 c0 -11 8 -17 17 -17 s17 6 17 17"/>
      <text class="lbl" x="563" y="130" text-anchor="middle">Customer</text></g>
  </svg>`;
}
function illusShield(){
  return `<svg class="illus" viewBox="0 0 120 120" role="img" aria-label="A shield with a check, representing blocked sales of unsafe batches">
    <path class="fillb" d="M60 12 l34 12 v28 c0 22 -15 38 -34 46 c-19 -8 -34 -24 -34 -46 V24 z"/>
    <path class="lnb" d="M60 12 l34 12 v28 c0 22 -15 38 -34 46 c-19 -8 -34 -24 -34 -46 V24 z"/>
    <path class="lnk" d="M44 58 l11 11 l21 -24"/>
  </svg>`;
}

/* ---------- drawer ---------- */
function openDrawer(title,html){
  $("#dtitle").textContent=title;
  $("#dbody").innerHTML=html;
  $("#drawer").classList.add("open");
}
function closeDrawer(){$("#drawer").classList.remove("open")}
$("#drawer").addEventListener("click",e=>{if(e.target.hasAttribute("data-close"))closeDrawer()});

/* ---------- auth (sign in / create account) ---------- */
const liE=$("#li-e"),liP=$("#li-p"),liEr=$("#li-er");
const suN=$("#su-n"),suE=$("#su-e"),suR=$("#su-r"),suO=$("#su-o"),suP=$("#su-p"),suC=$("#su-c"),suEr=$("#su-er");

function showTab(which){
  const signup=which==="signup";
  $("#lf").classList.toggle("hide",signup);
  $("#sf").classList.toggle("hide",!signup);
  $("#tab-signin").classList.toggle("on",!signup);
  $("#tab-signup").classList.toggle("on",signup);
  $("#tab-signin").setAttribute("aria-selected",String(!signup));
  $("#tab-signup").setAttribute("aria-selected",String(signup));
  liEr.textContent="";suEr.textContent="";
}
$("#tab-signin").onclick=()=>showTab("signin");
$("#tab-signup").onclick=()=>showTab("signup");

// One toggle handler for every password box, driven by the data-for attribute.
$$(".ptog").forEach(b=>b.onclick=()=>{const p=$("#"+b.dataset.for);const show=p.type==="password";p.type=show?"text":"password";b.textContent=show?"Hide":"Show"});

function storeSession(token){try{localStorage.setItem("mt-token",token)}catch{}}
function clearSession(){try{localStorage.removeItem("mt-token")}catch{}}

async function enterApp(j){
  storeSession(j.token);
  user=j.user;
  await boot();
  toast("Signed in",`Welcome, ${user.name}`);
}

async function doLogin(){
  liEr.textContent="";
  const btn=$("#lf button[type=submit]");
  btn.disabled=true;
  try{
    const j=await api("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email:liE.value.trim(),password:liP.value})});
    await enterApp(j);
  }catch(err){liEr.textContent=err.message}
  finally{btn.disabled=false}
}

async function doSignup(){
  suEr.textContent="";
  const btn=$("#sf button[type=submit]");
  btn.disabled=true;
  try{
    const j=await api("/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:suN.value.trim(),email:suE.value.trim(),role:suR.value,
        org_id:suO.value==="0"?null:Number(suO.value),password:suP.value,confirm:suC.value})});
    await enterApp(j);
    toast("Account created",`Signed in as ${user.email}`);
  }catch(err){suEr.textContent=err.message}
  finally{btn.disabled=false}
}

$("#lf").addEventListener("submit",e=>{e.preventDefault();doLogin()});
$("#sf").addEventListener("submit",e=>{e.preventDefault();doSignup()});
$("#demo").onclick=()=>{showTab("signin");liE.value="asha.mehta@cda.gov.in";liP.value="demo1234";doLogin()};

// Keep the organization list in step with the chosen role, like a real signup form.
suR.addEventListener("change",()=>{const opt=[...suO.options].find(o=>o.dataset.t===suR.value);suO.value=opt?opt.value:"0"});

try{const t=localStorage.getItem("mt-theme");if(t)document.documentElement.dataset.theme=t}catch{}
async function loadMeta(){
  META=await api("/api/meta");
  if(META.database)$("#dbname").textContent=META.database;
  const orgs=await api("/api/datasets/organizations");
  const opts=orgs.rows.map(r=>`<option value="${r[0]}" data-t="${r[2]}">${esc(r[1])} (${r[2]})</option>`).join("")+'<option value="0">Not listed / individual</option>';
  suO.innerHTML=opts;
}

/* ---------- shell ---------- */
async function boot(){
  $("#login").classList.add("hide");$("#app").classList.remove("hide");
  $("#who").innerHTML=`<b>${esc(user.name)}</b><br>${esc(user.role)} · ${esc(user.org)}`;
  $("#ini").textContent=initials(user.name);
  $("#aname").textContent=user.name.split(" ")[0];
  buildNav();
  await loadNotifications();
  go("_home");
}
function buildNav(){
  const allowed=META.access[user.role];
  let h=`<button data-k="_home">Overview</button><button data-k="_verify">Verify a batch code</button>`;
  if(user.role!=="customer")h+=`<button data-k="_trace">Trace a batch</button>`;
  if(user.role==="pharmacy"||user.role==="regulator")h+=`<button data-k="_sale">Test a sale</button>`;
  if(user.role==="regulator")h+=`<button data-k="_recall">Issue a recall</button>`;
  h+=`<button data-k="_schema">Database schema</button>`;
  h+=`<button data-k="_sql">Reports</button>`;
  META.groups.forEach(([g,ks])=>{const k2=ks.filter(k=>allowed.includes(k));if(k2.length)h+=`<div class="grp">${g}</div>`+k2.map(k=>`<button data-k="${k}">${esc(META.datasets[k].title)}<span>${META.datasets[k].count}</span></button>`).join("")});
  $("#nav").innerHTML=h;
}
$("#nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b)go(b.dataset.k)});
$("#lo").onclick=async()=>{
  try{await fetch("/api/logout",{method:"POST"})}catch{}
  clearSession();
  user=null;closeAllPop();
  $("#app").classList.add("hide");$("#login").classList.remove("hide");
  liP.value="";liEr.textContent="";suP.value="";suC.value="";suEr.textContent="";
  showTab("signin");
};
$("#th").onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=dark?"light":"dark";try{localStorage.setItem("mt-theme",r.dataset.theme)}catch{};if(dashData)renderCharts()};

/* ---------- scroll controls ---------- */
const mainEl=$("#main");
const scroller=()=>mainEl.scrollHeight>mainEl.clientHeight+8?mainEl:document.documentElement;
const syncScrollCtl=()=>{
  const el=scroller();
  const top=el===mainEl?el.scrollTop:window.scrollY;
  const max=el===mainEl?el.scrollHeight-el.clientHeight:el.scrollHeight-window.innerHeight;
  $("#up").disabled=top<=8;
  $("#down").disabled=max<=8||top>=max-8;
};
$("#up").onclick=()=>{const el=scroller();el===mainEl?el.scrollTo({top:0,behavior:"smooth"}):window.scrollTo({top:0,behavior:"smooth"})};
$("#down").onclick=()=>{const el=scroller();el===mainEl?el.scrollTo({top:el.scrollHeight,behavior:"smooth"}):window.scrollTo({top:document.documentElement.scrollHeight,behavior:"smooth"})};
mainEl.addEventListener("scroll",syncScrollCtl,{passive:true});
window.addEventListener("scroll",syncScrollCtl,{passive:true});
window.addEventListener("resize",syncScrollCtl);

/* ---------- popovers ---------- */
function closeAllPop(){["#avmenu","#bellpop","#gres"].forEach(s=>{const e=$(s);if(e)e.innerHTML=""})}
$("#avatar").onclick=e=>{e.stopPropagation();const m=$("#avmenu");if(m.innerHTML){m.innerHTML="";return}
  m.innerHTML=`<div class="menu"><div class="hdr"><b>${esc(user.name)}</b><small>${esc(user.role)} · ${esc(user.org)}</small></div>
   <button data-a="profile">View profile</button><button data-a="theme">Switch theme</button><button data-a="help">Keyboard shortcuts</button><button data-a="out">Sign out</button></div>`};
$("#bellbtn").onclick=e=>{e.stopPropagation();const p=$("#bellpop");if(p.innerHTML){p.innerHTML="";return}
  const items=(window.__notes||[]).map(n=>`<div class="item"><span>${n.icon}</span><div>${n.html}</div><span class="t">${esc(n.when)}</span></div>`).join("")||`<div class="item">Nothing needs attention right now.</div>`;
  p.innerHTML=`<div class="pop"><h4>Notifications</h4>${items}</div>`};
document.addEventListener("click",e=>{if(!e.target.closest("#avmenu")&&!e.target.closest("#avatar")&&!e.target.closest("#bellpop")&&!e.target.closest("#bellbtn")&&!e.target.closest("#gres")&&!e.target.closest("#gq"))closeAllPop()});
$("#avmenu").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const a=b.dataset.a;closeAllPop();
  if(a==="out")$("#lo").click();
  else if(a==="theme")$("#th").click();
  else if(a==="help")$("#help").classList.add("open");
  else if(a==="profile")openDrawer("Your profile",`<dl class="kv"><dt>Name</dt><dd>${esc(user.name)}</dd><dt>Email</dt><dd>${esc(user.email)}</dd><dt>Role</dt><dd><span class="b info">${esc(user.role)}</span></dd><dt>Organization</dt><dd>${esc(user.org)}</dd><dt>Datasets you can open</dt><dd>${META.access[user.role].length}</dd></dl>`);
});

/* ---------- notifications ---------- */
async function loadNotifications(){
  try{
    const d=await api("/api/dashboard");
    const notes=[];
    d.batchesByStatus.filter(b=>b.status==="recalled"||b.status==="suspected_fake").forEach(b=>{
      notes.push({icon:"⛔",html:`<b>${esc(b.status.replace(/_/g," "))}</b> — ${b.n} batch${b.n===1?"":"es"} blocked from sale`,when:"now"});
    });
    const unknown=(d.scansByResult.find(s=>s.result==="unknown")||{}).n||0;
    if(unknown)notes.push({icon:"⚠",html:`<b>${unknown} unknown</b> batch code${unknown===1?"":"s"} scanned — possible fake medicine`,when:"recent"});
    const intransit=(d.shipmentsByStatus.find(s=>s.status==="in_transit")||{}).n||0;
    if(intransit)notes.push({icon:"🚚",html:`<b>${intransit}</b> shipment${intransit===1?"":"s"} still in transit`,when:"open"});
    d.batchesByStatus.filter(b=>b.status==="expired").forEach(b=>notes.push({icon:"⌛",html:`<b>${b.n}</b> expired batch${b.n===1?"":"es"} to withdraw`,when:"open"}));
    window.__notes=notes;
    $("#bellcount").textContent=notes.length;
    $("#bellcount").style.display=notes.length?"grid":"none";
  }catch{}
}

/* ---------- keyboard shortcuts ---------- */
let gPending=false,gTimer=null;
document.addEventListener("keydown",e=>{
  const typing=/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
  if(e.key==="Escape"){closeAllPop();closeDrawer();$("#help").classList.remove("open");return}
  if(typing)return;
  if(e.key==="/"){e.preventDefault();$("#gq").focus();return}
  if(e.key==="?"){e.preventDefault();$("#help").classList.toggle("open");return}
  if(e.key==="g"){gPending=true;clearTimeout(gTimer);gTimer=setTimeout(()=>gPending=false,1200);return}
  if(gPending){
    const map={o:"_home",b:"batches",s:"shipments",v:"_verify",t:"_trace",r:"recalls",d:"_schema",q:"_sql"};
    if(map[e.key]){gPending=false;const btn=$(`#nav button[data-k="${map[e.key]}"]`);if(btn)btn.click()}
  }
});
$("#helpbtn").onclick=()=>$("#help").classList.add("open");
$("#helpclose").onclick=()=>$("#help").classList.remove("open");

/* ---------- global search ---------- */
let gTimer2=null;
$("#gq").addEventListener("input",e=>{
  const val=e.target.value.trim();
  clearTimeout(gTimer2);
  const box=$("#gres");
  if(val.length<2){box.innerHTML="";return}
  box.innerHTML=`<div class="gres"><div class="none">Searching…</div></div>`;
  gTimer2=setTimeout(async()=>{
    try{
      const j=await api(`/api/search?q=${encodeURIComponent(val)}&role=${encodeURIComponent(user.role)}`);
      box.innerHTML=j.hits.length?`<div class="gres">${j.hits.map(h=>`<button class="hit" data-d="${h.dataset}"><small>${esc(h.title)}</small><b>${esc(h.label)}</b></button>`).join("")}</div>`:`<div class="gres"><div class="none">No matches for “${esc(val)}”.</div></div>`;
    }catch(err){box.innerHTML=`<div class="gres"><div class="none">${esc(err.message)}</div></div>`}
  },220);
});
$("#gres").addEventListener("click",e=>{const b=e.target.closest(".hit");if(!b)return;$("#gq").value="";$("#gres").innerHTML="";go(b.dataset.d)});

/* ---------- views ---------- */
function crumbs(c){$("#crumbs").innerHTML=`<span>MedTrace</span><span class="sep">/</span>${c}`}

async function go(k,opts={}){
  cur=k;sortCol=-1;q="";page=1;
  $$("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
  const m=$("#view");
  if(k==="_home"){m.innerHTML=home();crumbs("<b>Overview</b>");await renderCharts()}
  else if(k==="_verify"){m.innerHTML=verifyView();crumbs("<b>Verify a batch code</b>");$("#vf").onsubmit=verify}
  else if(k==="_trace"){m.innerHTML=await traceView();crumbs("<b>Trace a batch</b>");$("#tf").onsubmit=trace}
  else if(k==="_sale"){m.innerHTML=await saleView();crumbs("<b>Test a sale</b>");$("#salef").onsubmit=testSale}
  else if(k==="_recall"){m.innerHTML=await recallView();crumbs("<b>Issue a recall</b>");$("#rf").onsubmit=issueRecall}
  else if(k==="_schema"){m.innerHTML=await schemaView();crumbs("<b>Database schema</b>");wireSchema();if(opts.focus)focusTable(opts.focus)}
  else if(k==="_sql"){m.innerHTML=await sqlView();crumbs("<b>Reports</b>");wireSqlView()}
  else{
    const d=META.datasets[k];
    crumbs(`<b>${esc(d.title)}</b>`);
    m.innerHTML=`<div class="page">
      <div class="pagehead"><h2>${esc(d.title)}</h2><p>${esc(d.desc)}</p></div>
      <div class="tools" style="margin:14px 0"><span class="chip" id="rc"></span><input id="s" type="search" placeholder="Search ${esc(d.title.toLowerCase())}" aria-label="Search"><button class="btn ghost sm" id="rf2">Refresh</button><button class="btn ghost sm" id="csv">Export CSV</button><button class="btn ghost sm" id="prn">Print</button><button class="btn ghost sm" id="defn">Table definition</button></div>
      <div id="tb"></div></div>`;
    $("#s").oninput=e=>{q=e.target.value;page=1;drawTable()};
    $("#rf2").onclick=()=>drawTable();
    $("#csv").onclick=exportCsv;
    $("#prn").onclick=()=>window.print();
    $("#defn").onclick=()=>go("_schema",{focus:cur});
    await drawTable();
  }
  mainEl.scrollTo({top:0,behavior:"smooth"});
  requestAnimationFrame(syncScrollCtl);
}

function cell(col,v){
  if(v===""||v==null)return `<td class="${NUMERIC.has(col.kind)?"r":""}">–</td>`;
  const k=col.kind;
  if(k==="id")return `<td class="id r">${esc(v)}</td>`;
  if(k==="code")return `<td class="code">${esc(v)}</td>`;
  if(k==="money")return `<td class="r money">${money(v)}</td>`;
  if(k==="number")return `<td class="r">${num(v)}</td>`;
  if(k==="badge")return `<td><span class="b ${BADGE[v]||"info"}">${esc(String(v).replace(/_/g," "))}</span></td>`;
  return `<td>${esc(v)}</td>`;
}
function skeleton(n=8){
  const w=[70,110,90,80,64,74,56,66];
  let h='<div class="skel">';
  for(let i=0;i<n;i++)h+=`<div class="r">${w.map(x=>`<i style="width:${x}px"></i>`).join("")}</div>`;
  return h+"</div>";
}
async function drawTable(){
  const tb=$("#tb");tb.innerHTML=`<div class="tw">${skeleton()}</div>`;
  const j=await api(`/api/datasets/${cur}?q=${encodeURIComponent(q)}`);
  cols=j.columns;rows=j.rows;lastSql=j.sql||[];
  if(sortCol>=0)rows=[...rows].sort((a,b)=>(a[sortCol]>b[sortCol]?1:a[sortCol]<b[sortCol]?-1:0)*sortDir);
  const rc=$("#rc");if(rc)rc.textContent=rows.length+(q?` of ${META.datasets[cur].count}`:"")+" rows";
  const pages=Math.max(1,Math.ceil(rows.length/pageSize));
  if(page>pages)page=pages;
  const start=(page-1)*pageSize;
  const view=rows.slice(start,start+pageSize);
  if(!rows.length){
    tb.innerHTML=`<div class="tw"><div class="empty"><b>No rows match your search.</b>Clear the search box to see all rows.<div style="margin-top:12px"><button class="btn ghost sm" id="clr">Clear search</button></div></div></div>`;
    $("#clr").onclick=()=>{$("#s").value="";q="";page=1;drawTable()};
    return;
  }
  tb.innerHTML=`<div class="tw"><table><thead><tr>${cols.map((c,i)=>`<th class="${NUMERIC.has(c.kind)?"r":""}" data-i="${i}" scope="col">${esc(c.label)}${sortCol===i?(sortDir>0?" ▲":" ▼"):""}</th>`).join("")}</tr></thead>
    <tbody>${view.map((r,ri)=>`<tr data-ri="${start+ri}">${r.map((v,i)=>cell(cols[i],v)).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="pager"><span>Showing ${rows.length?start+1:0}–${Math.min(start+pageSize,rows.length)} of ${rows.length} rows</span>
      <span class="pgs"><button id="p1" ${page===1?"disabled":""}>‹ Prev</button><span>Page ${page} of ${pages}</span><button id="pn" ${page===pages?"disabled":""}>Next ›</button>
      <select id="ps" aria-label="Rows per page">${[10,25,50].map(n=>`<option ${n===pageSize?"selected":""}>${n}</option>`).join("")}</select></span></div>
    ${sqlBlock(lastSql,{open:false})}`;
  tb.querySelectorAll("th").forEach(th=>th.onclick=()=>{const i=+th.dataset.i;sortDir=sortCol===i?-sortDir:1;sortCol=i;page=1;drawTable()});
  $("#p1").onclick=()=>{page--;drawTable()};
  $("#pn").onclick=()=>{page++;drawTable()};
  $("#ps").onchange=e=>{pageSize=+e.target.value;page=1;drawTable()};
  tb.querySelectorAll("tbody tr").forEach(tr=>tr.onclick=()=>openRow(+tr.dataset.ri));
}

/* ---------- row detail drawer ---------- */
async function openRow(i){
  currentRow=rows[i];if(!currentRow)return;
  const SINGULAR={organizations:"Organization",medicines:"Medicine",batches:"Batch",shipments:"Shipment",shipment_items:"Shipment item",inventory:"Inventory",customers:"Customer",sales:"Sale",sale_items:"Sale item",recalls:"Recall",verification_scans:"Verification scan",audit_log:"Audit entry"};
  const title=SINGULAR[cur]||META.datasets[cur].title;
  const kv=cols.map((c,ci)=>`<dt>${esc(c.label)}</dt><dd>${c.kind==="badge"?`<span class="b ${BADGE[currentRow[ci]]||"info"}">${esc(String(currentRow[ci]).replace(/_/g," "))}</span>`:c.kind==="money"?money(currentRow[ci]):c.kind==="code"?`<span class="mono">${esc(currentRow[ci])}</span>`:esc(currentRow[ci]??"–")}</dd>`).join("");
  openDrawer(`${title} #${currentRow[0]}`,`<dl class="kv">${kv}</dl><div class="dsec" id="drel"><h4>Related records</h4><div class="loading">Loading from MySQL…</div></div>`);
  if(cur==="batches")loadRelated(currentRow[0]);
  else $("#drel").innerHTML=`<h4>Related records</h4><p class="note">Open the Batches dataset to trace a batch through shipments, stock and sales.</p>`;
}
async function loadRelated(batchId){
  const box=$("#drel");if(!box)return;
  try{
    const j=await api(`/api/trace/${batchId}`);
    box.innerHTML=`<h4>Trace of this batch</h4>
      <div class="dsec"><b>Shipments</b>${j.flow.length?`<table class="minitbl"><thead><tr><th>Shipment</th><th>From</th><th>To</th><th>Qty</th></tr></thead><tbody>${j.flow.map(f=>`<tr><td>#${f.shipment_id}</td><td>${esc(f.from_org)}</td><td>${esc(f.to_org)}</td><td class="r">${num(f.quantity)}</td></tr>`).join("")}</tbody></table>`:`<p class="note">Not shipped.</p>`}</div>
      <div class="dsec"><b>Stock held</b>${j.stock.length?`<table class="minitbl"><thead><tr><th>Organization</th><th>On hand</th></tr></thead><tbody>${j.stock.map(s=>`<tr><td>${esc(s.organization)}</td><td class="r">${num(s.quantity_on_hand)}</td></tr>`).join("")}</tbody></table>`:`<p class="note">None.</p>`}</div>
      <div class="dsec"><b>Customers who bought it</b>${j.customers.length?`<table class="minitbl"><thead><tr><th>Customer</th><th>Pharmacy</th><th>Qty</th><th>Date</th></tr></thead><tbody>${j.customers.map(c=>`<tr><td>${esc(c.customer)}</td><td>${esc(c.pharmacy)}</td><td class="r">${num(c.quantity)}</td><td>${esc(shortTime(c.sale_date))}</td></tr>`).join("")}</tbody></table>`:`<p class="note">No recorded sales.</p>`}</div>
      ${sqlBlock(j.sql,{open:false})}`;
  }catch(err){box.innerHTML=`<h4>Related records</h4><p class="note">${esc(err.message)}</p>`}
}

/* ---------- CSV export ---------- */
function exportCsv(){
  const header=cols.map(c=>c.label).join(",");
  const body=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([header+"\n"+body],{type:"text/csv"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=`medtrace-${cur}.csv`;a.click();
  toast("Export ready",`${rows.length} rows written to medtrace-${cur}.csv`);
}

/* ---------- home / dashboard ---------- */
// GUI shortcut tiles. Kept role-aware so a customer never sees actions it cannot use.
function quickActions(){
  const acts=[["🔎","Verify a batch code","Check a printed code is genuine","_verify",""]];
  if(user.role!=="customer")acts.push(["🧭","Trace a batch","Follow a batch to every receiver","_trace","alt"]);
  if(user.role==="pharmacy"||user.role==="regulator")acts.push(["🛒","Test a sale","Watch MySQL block unsafe stock","_sale","warn"]);
  if(user.role==="regulator")acts.push(["🚨","Issue a recall","Pull a batch and log the change","_recall","warn"]);
  acts.push(["📊","Reports","Run the project's SQL reports","_sql","alt"]);
  return `<div class="quick">${acts.map(([ic,t,s,k,c])=>`<button class="qaction ${c}" data-go="${k}"><span class="qaic">${ic}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span></button>`).join("")}</div>`;
}
// A live "factory to customer" pipeline. Every node is a table count read from MySQL.
function pipeline(){
  const d=META.datasets;
  const steps=[
    ["Medicines",d.medicines.count,"registered products"],
    ["Batches",d.batches.count,"produced"],
    ["Shipments",d.shipments.count,"moved between organizations"],
    ["In stock",d.inventory.count,"inventory lines"],
    ["Sales",d.sales.count,"dispensed"],
    ["Verified",d.verification_scans.count,"scans checked"],
  ];
  return `<div class="panel"><h3>From factory to customer — live data flow</h3>
    <div class="pipe">${steps.map(([t,n,sub])=>`<div class="pstep ${n>0?"done":""}"><div class="pdot">${n>0?num(n):"—"}</div><b>${esc(t)}</b><small>${esc(sub)}</small></div>`).join("")}</div>
    <p class="note">Each stage is counted live from its MySQL table. Open any batch and use <b>Trace a batch</b> to follow one end-to-end.</p></div>`;
}
function home(){
  const s=META.stats;
  const kpis=[
    ["Batches tracked",s.batches,`${s.genuine} genuine`,"batches"],
    ["Genuine",s.genuine,"safe to sell","batches"],
    ["Recalled",s.recalled,"blocked from sale","recalls"],
    ["Suspected fake",s.suspected_fake,"under investigation","batches"],
    ["Expired",s.expired,"withdraw from shelves","batches"],
    ["Verification scans",s.scans,"all-time checks","verification_scans"],
  ];
  return `<div class="page">
    <div class="pagehead"><h2>Welcome, ${esc(user.name.split(" ")[0])}</h2><p>You are signed in as ${esc(user.role)} for ${esc(user.org)}. Every number below is aggregated live from MySQL.</p></div>
    <div class="kpis" style="margin-top:18px">${kpis.map(k=>`<button class="kpi" data-goto="${k[3]}"><span class="lbl">${esc(k[0])}</span><div class="val">${num(k[1])}</div><div class="sub">${esc(k[2])}</div></button>`).join("")}</div>
    ${quickActions()}
    ${pipeline()}
    <div class="grid2">
      <div class="panel"><h3>Batches by status</h3><div class="chartbox"><canvas id="cStatus"></canvas></div></div>
      <div class="panel"><h3>Verification scans by result</h3><div class="chartbox"><canvas id="cScans"></canvas></div></div>
    </div>
    <div class="grid2">
      <div class="panel"><h3>Inventory held by organization</h3><div class="chartbox"><canvas id="cInv"></canvas></div></div>
      <div class="panel"><h3>Recent status changes (audit log)</h3><ul class="feed" id="fActivity"><li class="loading">Loading…</li></ul></div>
    </div>
    <div class="panel"><h3>Recent verification scans</h3><ul class="feed" id="fScans"><li class="loading">Loading…</li></ul></div>
    <div class="panel"><h3>How a batch moves</h3>${illusTrace()}<ul class="chain" style="margin-top:10px"><li>Manufacturer produces a batch of a medicine</li><li>Shipments carry it to distributors, then pharmacies, and inventory is updated</li><li>A pharmacy sells it to a customer; sales of recalled, fake or expired batches are blocked</li><li>A regulator can recall it; every status change goes to the audit log</li><li>Anyone can verify the batch code</li></ul></div>
    <div class="panel"><p class="note" style="margin:0">Every table, count and trace on this site is read live from the MySQL database <code>medicine_traceability</code>.</p></div>
  </div>`;
}
let dashData=null,charts=[];
const PALETTE={genuine:"#157347",expired:"#c98a00",recalled:"#b42318",suspected_fake:"#8a2be2",unknown:"#2a5d9f"};
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
async function renderCharts(){
  $$(".kpi[data-goto]").forEach(b=>b.onclick=()=>go(b.dataset.goto));
  $$(".qaction[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
  try{ dashData=await api("/api/dashboard"); }catch{return}
  drawFeed(dashData);
  if(!window.Chart){drawFallback(dashData);return}
  const grid=cssv("--line"),mute=cssv("--mute");
  Chart.defaults.font.family='"IBM Plex Sans",system-ui,sans-serif';
  Chart.defaults.color=mute;
  charts.forEach(c=>c.destroy());charts=[];
  const mk=(id,cfg)=>{const el=$("#"+id);if(el)charts.push(new Chart(el,cfg))};
  mk("cStatus",{type:"bar",data:{labels:dashData.batchesByStatus.map(b=>b.status.replace(/_/g," ")),datasets:[{label:"Batches",data:dashData.batchesByStatus.map(b=>b.n),backgroundColor:dashData.batchesByStatus.map(b=>PALETTE[b.status]||"#2a5d9f"),borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:grid},ticks:{precision:0}}}}});
  mk("cInv",{type:"bar",data:{labels:dashData.inventoryByOrg.map(i=>i.org),datasets:[{label:"Units on hand",data:dashData.inventoryByOrg.map(i=>Number(i.units)),backgroundColor:"#0b6b63",borderRadius:6}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:grid}},y:{grid:{display:false}}}}});
  mk("cScans",{type:"doughnut",data:{labels:dashData.scansByResult.map(s=>s.result),datasets:[{data:dashData.scansByResult.map(s=>s.n),backgroundColor:dashData.scansByResult.map(s=>PALETTE[s.result]||"#2a5d9f"),borderColor:cssv("--panel"),borderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"right"}}}});
}
function drawFeed(d){
  const fa=$("#fActivity");
  if(fa)fa.innerHTML=d.recentActivity.map(a=>`<li><span class="b ${BADGE[a.new_status]||"info"}">${esc(a.new_status.replace(/_/g," "))}</span><span>${esc(a.batch_code)} · ${esc(a.old_status)} → ${esc(a.new_status)}${a.changed_by?` · ${esc(a.changed_by)}`:""}</span><span class="when">${esc(shortTime(a.changed_at))}</span></li>`).join("")||`<li>No status changes recorded.</li>`;
  const fs=$("#fScans");
  if(fs)fs.innerHTML=d.recentScans.map(s=>`<li><span class="b ${BADGE[s.result]||"info"}">${esc(s.result)}</span><span class="mono">${esc(s.batch_code_entered)}</span><span class="when">${esc(shortTime(s.scanned_at))}</span></li>`).join("")||`<li>No scans recorded.</li>`;
}
function drawFallback(d){
  const el=$("#cStatus");if(el)el.parentElement.innerHTML=`<p class="note">Chart library unavailable offline. Batches: ${d.batchesByStatus.map(b=>`${b.status} ${b.n}`).join(", ")}.</p>`;
}

/* ---------- verify ---------- */
function verifyView(){return `<div class="page"><div class="pagehead"><h2>Verify a batch code</h2><p>Type the batch code printed on the strip. The result is genuine, recalled, expired or unknown.</p></div>
 <div class="vlayout">
 <form class="panel" id="vf" style="margin-top:16px"><div class="row"><div><label for="bcode">Batch code</label><input id="bcode" placeholder="e.g. PCM-2025-A01" autocomplete="off"></div><button class="btn" type="submit">Check batch</button></div><p class="note">Try PCM-2025-A01, PCM-2025-B02, CTZ-2024-A01 or a made-up code. Each check is written to the verification_scans table.</p><div id="vr"></div><div id="vsql"></div></form>
 <aside class="panel sideillus"><div class="illusmini">${illusShield()}</div><p class="note" style="margin:0">A valid code confirms the batch exists and is safe to use on paper. It cannot prove the physical strip is authentic, since a counterfeit can copy a real code.</p></aside>
 </div></div>`}
async function verify(e){
  e.preventDefault();
  const vr=$("#vr");vr.innerHTML='<div class="res warn">Checking…</div>';$("#vsql").innerHTML="";
  try{
    const j=await api("/api/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:$("#bcode").value})});
    if(j.result==="unknown"){vr.innerHTML=`<div class="res warn">Unknown. No batch has that code, so this medicine may be fake. Report it to the regulator.</div>`;}
    else{
      const b=j.batch,cls=j.result==="genuine"?"ok":j.result==="expired"?"warn":"bad";
      const msg=j.result==="genuine"?"Genuine. This batch code is valid and not recalled.":j.result==="expired"?"Expired. Do not use this batch.":"Recalled or suspected fake. Do not sell or use this batch.";
      vr.innerHTML=`<div class="res ${cls}">${esc(msg)}<div style="font-weight:400;margin-top:6px">${esc(b.medicine)} · made by ${esc(b.manufacturer)} · expires ${esc(b.expiry_date)}</div></div>`;
    }
    $("#vsql").innerHTML=sqlBlock(j.sql,{open:false});
    toast(j.result==="genuine"?"Batch verified":j.result==="unknown"?"Unknown code":"Blocked",`${j.result} · ${$("#bcode").value}`,j.result==="genuine"?"ok":j.result==="unknown"?"warn":"bad");
    await loadNotifications();
  }catch(err){vr.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}

/* ---------- trace ---------- */
async function traceView(){
  const b=await api("/api/datasets/batches");
  const opts=b.rows.map(r=>`<option value="${r[0]}">${esc(r[1])} (${esc(String(r[7]).replace(/_/g," "))})</option>`).join("");
  return `<div class="page"><div class="pagehead"><h2>Trace a batch</h2><p>Follow one batch through shipments, stock and sales to find everyone who received it. Use this after a recall.</p></div>
 <form class="panel" id="tf" style="margin-top:16px"><div class="row"><div><label for="tb2">Batch</label><select id="tb2">${opts}</select></div><button class="btn" type="submit">Trace batch</button></div></form><div id="tr"></div></div>`}
async function trace(e){
  e.preventDefault();
  const tr=$("#tr");tr.innerHTML='<div class="panel"><div class="loading">Tracing…</div></div>';
  try{
    const j=await api(`/api/trace/${$("#tb2").value}`);
    const b=j.batch;
    const cls=b.status==="genuine"?"ok":b.status==="expired"?"warn":"bad";
    const msg=b.status==="genuine"?"Genuine. This batch is valid and not recalled.":b.status==="expired"?"Expired. Do not use this batch.":"Recalled or suspected fake. Do not sell or use this batch.";
    const sh=j.flow.map(f=>`<li>Shipment #${f.shipment_id}: ${esc(f.from_org)} to ${esc(f.to_org)}, ${num(f.quantity)} units, ${esc(shortTime(f.shipped_at))} <span class="b ${BADGE[f.shipment_status]||"info"}">${esc(String(f.shipment_status).replace(/_/g," "))}</span></li>`);
    const inv=j.stock.map(s=>`<li>${esc(s.organization)} holds ${num(s.quantity_on_hand)} units (updated ${esc(shortTime(s.last_updated))})</li>`);
    const sl=j.customers.map(c=>`<li>${esc(c.customer)} (${esc(c.phone||"")}) bought ${num(c.quantity)} units from ${esc(c.pharmacy)} on ${esc(shortTime(c.sale_date))}</li>`);
    const rec=j.recalls.map(r=>`<li>${esc(r.regulator)}: ${esc(r.reason)} <span class="b ${BADGE[r.severity]||"info"}">${esc(r.severity)}</span> on ${esc(shortTime(r.recall_date))}</li>`);
    const sec=(t,a,n)=>`<h4>${t}</h4>${a.length?`<ul class="chain">${a.join("")}</ul>`:`<p class="note">${n}</p>`}`;
    tr.innerHTML=`<div class="panel"><div class="res ${cls}" style="margin:0 0 6px"><b>${esc(b.batch_code)}</b>: ${esc(b.medicine)}. ${esc(msg)}</div>${sec("Shipments",sh,"This batch has not been shipped.")}${sec("Stock held now",inv,"No organization holds stock of this batch.")}${sec("Customers who bought it",sl,"No recorded sales, so no customers are affected.")}${sec("Recalls",rec,"No recalls recorded for this batch.")}${sqlBlock(j.sql,{open:false})}</div>`;
  }catch(err){tr.innerHTML=`<div class="panel"><div class="res bad">${esc(err.message)}</div></div>`}
}

/* ---------- sale ---------- */
async function saleView(){
  const b=await api("/api/datasets/batches");
  const opts=b.rows.map(r=>`<option value="${r[0]}">${esc(r[1])} (${esc(String(r[7]).replace(/_/g," "))})</option>`).join("");
  return `<div class="page"><div class="pagehead"><h2>Test a sale</h2><p>The database trigger checks the batch before any sale is saved. Try selling a recalled, fake or expired batch and watch MySQL reject it.</p></div>
 <form class="panel" id="salef" style="margin-top:16px"><div class="row"><div><label for="sb">Batch</label><select id="sb">${opts}</select></div><div><label for="sq">Quantity</label><input id="sq" type="number" value="1" min="1"></div><button class="btn" type="submit">Attempt sale</button></div><div id="sr"></div><div id="ssql"></div></form>
 <div class="panel"><p class="note" style="margin:0">The attempt is made and then undone automatically, so no real sale row is kept. The result you see is the database rule's decision.</p></div></div>`}
async function testSale(e){
  e.preventDefault();
  const sr=$("#sr");sr.innerHTML='<div class="res warn">Attempting…</div>';$("#ssql").innerHTML="";
  try{
    const j=await api("/api/sales/attempt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId:$("#sb").value,quantity:$("#sq").value})});
    sr.innerHTML=`<div class="res ${j.blocked?"bad":"ok"}">${j.blocked?"BLOCKED — ":""}${esc(j.message)}</div>`;
    $("#ssql").innerHTML=sqlBlock(j.sql,{open:false,trigger:j.trigger,error:j.error});
    toast(j.blocked?"Sale blocked by trigger":"Sale allowed",j.blocked?j.message:"The trigger let the sale through",j.blocked?"bad":"ok");
  }catch(err){sr.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}

/* ---------- recall ---------- */
async function recallView(){
  const b=await api("/api/datasets/batches");
  const opts=b.rows.filter(r=>r[7]==="genuine").map(r=>`<option value="${r[0]}">${esc(r[1])} – ${esc(r[2])}</option>`).join("")||`<option value="">No genuine batches</option>`;
  return `<div class="page"><div class="pagehead"><h2>Issue a recall</h2><p>Recalling a batch flips its status to recalled and writes an audit-log row automatically, through database triggers.</p></div>
 <form class="panel" id="rf" style="margin-top:16px"><div class="row"><div><label for="rb">Batch</label><select id="rb">${opts}</select></div><div><label for="rr">Reason</label><input id="rr" placeholder="e.g. Failed dissolution test"></div><div><label for="rs">Severity</label><select id="rs"><option>low</option><option>medium</option><option selected>high</option><option>critical</option></select></div><button class="btn" type="submit">Recall batch</button></div><div id="rcr"></div><div id="rsql"></div></form></div>`}
async function issueRecall(e){
  e.preventDefault();
  const box=$("#rcr");box.innerHTML='<div class="res warn">Issuing…</div>';$("#rsql").innerHTML="";
  try{
    const j=await api("/api/recalls",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId:$("#rb").value,reason:$("#rr").value,severity:$("#rs").value,regulatorId:8})});
    const logs=j.audit.map(a=>`<li>#${a.log_id}: ${esc(a.old_status)} → <b>${esc(a.new_status)}</b> at ${esc(shortTime(a.changed_at))} (${esc(a.reason||"")})</li>`).join("");
    box.innerHTML=`<div class="res bad">Batch ${esc(j.batch.batch_code)} is now <b>${esc(j.batch.status)}</b>.<div style="font-weight:400;margin-top:8px">Audit log entries written by the trigger:</div><ul class="chain" style="margin-top:6px">${logs}</ul></div>`;
    $("#rsql").innerHTML=sqlBlock(j.sql,{open:false,trigger:j.trigger});
    toast("Recall issued",`${j.batch.batch_code} is now ${j.batch.status}`,"bad");
    META=await api("/api/meta");buildNav();await loadNotifications();
  }catch(err){box.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}

/* ---------- schema ---------- */
let SCHEMA=null;
const KEYBADGE=c=>{
  const out=[];
  if(c.isPk)out.push('<span class="kb pk">PK</span>');
  if(c.isFk)out.push('<span class="kb fk">FK</span>');
  if(c.isUq)out.push('<span class="kb uq">UK</span>');
  if(!c.nullable&&!c.isPk)out.push('<span class="kb nn">NN</span>');
  return out.join("");
};
function tableCard(t){
  const rows=t.columns.map(c=>`<div class="c"><span class="n">${esc(c.name)}</span>${KEYBADGE(c)}<span class="t">${esc(c.type)}</span></div>`).join("");
  const fk=t.foreignKeys.map(f=>`<b>${esc(f.col)}</b> → ${esc(f.refTable)}.${esc(f.refCol)}`).join(", ");
  return `<div class="tcard" data-tbl="${esc(t.name)}">
    <div class="hd"><span class="nm">${esc(t.name)}</span><span class="cnt">${num(META.datasets[t.name]?.count??0)} rows</span></div>
    <div class="pur">${esc(t.note)}</div>
    <div class="cols">${rows}</div>
    ${fk?`<div class="rel"><b>Foreign keys:</b> ${fk}</div>`:""}
    <button class="ddlbtn" data-ddl="${esc(t.name)}">Show CREATE TABLE ▾</button>
    <div class="ddl" id="ddl-${esc(t.name)}"><pre>${hl(SCHEMA.ddl[t.name]||"")}</pre></div>
  </div>`;
}
function relGraph(){
  const seen=new Map();
  SCHEMA.tables.forEach(t=>t.foreignKeys.forEach(f=>{
    const k=`${t.name}.${f.col}->${f.refTable}.${f.refCol}`;
    if(!seen.has(k))seen.set(k,{from:`${t.name}.${f.col}`,to:`${f.refTable}.${f.refCol}`,cn:f.name});
  }));
  return `<div class="relgraph"><ul>${[...seen.values()].map(r=>
    `<li><span class="from">${esc(r.from)}</span><span class="arrow">──▶</span><span class="to">${esc(r.to)}</span><span class="cn">${esc(r.cn)}</span></li>`
  ).join("")}</ul></div>`;
}
function ddlBank(title,sub,items){
  return `<div class="sectitle"><h3>${esc(title)}</h3><p>${esc(sub)}</p></div>
  <div class="sqlbank">${items.map(it=>`<details><summary>${esc(it.name)}<span class="meta">${esc(it.meta||"")}</span></summary><div class="b"><pre>${hl(it.ddl)}</pre></div></details>`).join("")}</div>`;
}
async function schemaView(){
  if(!SCHEMA)SCHEMA=await api("/api/schema");
  const t=SCHEMA.tables;
  const totalRows=t.reduce((a,x)=>a+(META.datasets[x.name]?.count??0),0);
  const fkCount=t.reduce((a,x)=>a+x.foreignKeys.length,0);
  return `<div class="page">
  <div class="pagehead"><h2>Database schema</h2><p>Every table, key, view and trigger below is read live from the MySQL database <code>${esc(SCHEMA.database)}</code> — the same schema this website runs on.</p></div>

  <div class="schematop" style="margin-top:16px">
    <div class="erd">
      <div class="bar"><h3>Entity–Relationship diagram</h3><div class="sp"><button class="btn ghost sm" id="erzoom">Zoom</button><a class="btn ghost sm" href="/er-diagram.jpg" download>Download</a></div></div>
      <div class="frame"><img id="erimg" src="/er-diagram.jpg" alt="Entity-Relationship diagram of the medicine_traceability database"></div>
    </div>
    <div class="sidefacts">
      <div class="fact"><h3>At a glance</h3><dl>
        <dt>Tables</dt><dd>${t.length}</dd>
        <dt>Views</dt><dd>${SCHEMA.views.length}</dd>
        <dt>Triggers</dt><dd>${SCHEMA.triggers.length}</dd>
        <dt>Foreign keys</dt><dd>${fkCount}</dd>
        <dt>Total rows</dt><dd>${num(totalRows)}</dd>
        <dt>Engine</dt><dd>InnoDB</dd>
        <dt>Charset</dt><dd>utf8mb4</dd>
      </dl></div>
      <div class="fact"><h3>How to rebuild</h3>
        <p class="note" style="margin:0">This schema is rebuilt automatically from <span class="mono">medtrace_script.sql</span> and <span class="mono">db/business_rules.sql</span> when the database is set up.</p>
      </div>
    </div>
  </div>

  <div class="sectitle"><h3>Tables (${t.length})</h3><p>PK primary key · FK foreign key · UK unique · NN not null</p></div>
  <div class="tgrid">${t.map(tableCard).join("")}</div>

  <div class="sectitle"><h3>Relationships</h3><p>Every foreign key between the tables</p></div>
  ${relGraph()}

  ${ddlBank("Views ("+SCHEMA.views.length+")","Saved queries the Trace feature uses",SCHEMA.views.map(v=>({name:v.name,meta:"CREATE VIEW",ddl:v.ddl})))}
  ${ddlBank("Triggers ("+SCHEMA.triggers.length+")","Automatic rules that enforce the business logic",SCHEMA.triggers.map(g=>({name:g.name,meta:`${g.timing} ${g.event} ON ${g.table}`,ddl:g.ddl})))}
  </div>`;
}
function focusTable(name){
  const card=document.querySelector(`.tcard[data-tbl="${CSS.escape(name)}"]`);
  if(!card)return;
  const btn=card.querySelector(".ddlbtn");
  const ddl=card.querySelector(".ddl");
  if(ddl&&!ddl.classList.contains("open")){ddl.classList.add("open");if(btn)btn.textContent="Hide CREATE TABLE ▴"}
  card.scrollIntoView({behavior:"smooth",block:"center"});
  card.classList.add("hl");
  setTimeout(()=>card.classList.remove("hl"),2200);
}
function wireSchema(){
  const z=$("#erzoom"),img=$("#erimg");
  if(z&&img)z.onclick=()=>img.classList.toggle("zoom");
  $$(".tcard .ddlbtn").forEach(b=>b.onclick=()=>{
    const d=$("#ddl-"+CSS.escape(b.dataset.ddl));
    if(!d)return;
    const open=d.classList.toggle("open");
    b.textContent=(open?"Hide":"Show")+" CREATE TABLE "+(open?"▴":"▾");
  });
}

/* ---------- reports (SQL query library) ---------- */
let QLIB=null;
// Trim ISO timestamps to "YYYY-MM-DD HH:MM"; leave other strings untouched.
const qcell=s=>/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)?s.replace("T"," ").slice(0,16):s;
// Friendly icon + blurb per report, so the page reads as a report gallery, not a console.
const REPORTS={
  joins_full_trace:["🧭","trace"], group_by_org:["🚚","shipments"], having_blocked:["⛔","blocked"],
  subquery_top_customers:["🏆","customers"], view_batch_flow:["➡️","trace"],
  view_batch_customers:["👥","customers"], inventory_low:["📦","stock"],
  audit_trail:["📜","audit"], scan_summary:["🔎","verification"],
};
async function sqlView(){
  if(!QLIB)QLIB=await api("/api/queries");
  const items=QLIB.queries;
  return `<div class="page">
  <div class="pagehead"><h2>Reports</h2><p>Ready-made reports built on the real MySQL database. Pick one and press <b>Run report</b> to see its results. The query behind each report is available under <b>View query</b>.</p></div>
  <div class="qlist" style="margin-top:16px">
    ${items.map(q=>{const [ic]=REPORTS[q.id]||["📄"];return `<div class="qcard" data-id="${esc(q.id)}">
      <div class="qhd">
        <span class="qic">${ic}</span>
        <div><div class="qtitle">${esc(q.title)}</div><div class="qconcept">${esc(q.concept)}</div></div>
        <button class="btn sm qrun" data-id="${esc(q.id)}">Run report</button>
      </div>
      <p class="qnote">${esc(q.note)}</p>
      <button class="sqlhint" data-q="${esc(q.id)}">View query</button>
      <div class="qsql" id="qsql-${esc(q.id)}"></div>
      <div class="qres" id="qres-${esc(q.id)}"></div>
    </div>`}).join("")}
  </div></div>`;
}
async function showQuery(id){
  const box=$("#qsql-"+CSS.escape(id));
  if(!box)return;
  if(box.innerHTML){box.innerHTML="";return}
  box.innerHTML='<div class="loading">Loading query…</div>';
  try{
    const j=await api("/api/queries/"+encodeURIComponent(id));
    box.innerHTML=`<pre>${hl(j.sql)}</pre>`;
  }catch(err){box.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}
async function runQuery(id){
  const res=$("#qres-"+CSS.escape(id));
  const sqlbox=$("#qsql-"+CSS.escape(id));
  const btn=$(`.qrun[data-id="${CSS.escape(id)}"]`);
  res.innerHTML='<div class="loading">Running…</div>';
  if(btn)btn.disabled=true;
  try{
    const j=await api("/api/queries/"+encodeURIComponent(id));
    sqlbox.innerHTML=`<pre>${hl(j.sql)}</pre>`;
    if(!j.rows.length){res.innerHTML='<div class="empty" style="padding:18px">No rows returned.</div>';return}
    const numeric=new Set();
    j.rows.forEach(r=>r.forEach((v,i)=>{if(typeof v==="number")numeric.add(i)}));
    res.innerHTML=`<div class="qmeta">${j.rows.length} row${j.rows.length===1?"":"s"} returned</div>
    <div class="tw"><table><thead><tr>${j.columns.map((c,i)=>`<th class="${numeric.has(i)?"r":""}" scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${j.rows.map(r=>`<tr>${r.map((v,i)=>`<td class="${numeric.has(i)?"r":""}">${v==null?'<span class="muted">NULL</span>':esc(typeof v==="number"?num(v):qcell(String(v)))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }catch(err){res.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
  finally{if(btn)btn.disabled=false}
}
function wireSqlView(){
  $$(".qrun").forEach(b=>b.onclick=()=>runQuery(b.dataset.id));
  $$(".sqlhint").forEach(b=>b.onclick=()=>showQuery(b.dataset.q));
}

// On load: fetch the catalogue, then try to restore a previous session so a
// page refresh does not sign the user out.
(async()=>{
  try{
    await loadMeta();
    try{
      const j=await api("/api/session");
      user=j.user;
      await boot();
    }catch{ showTab("signin"); }
  }catch(err){
    liEr.textContent="Cannot reach the server: "+err.message;
  }
})();
