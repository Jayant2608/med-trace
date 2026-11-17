const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString("en-IN"):v};
const money=v=>"₹"+Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const shortTime=s=>String(s||"").replace("T"," ").slice(0,16);
const clockTime=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
const initials=n=>String(n||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();

const BADGE={genuine:"ok",received:"ok",delivered:"ok",active:"warn",completed:"info",withdrawn:"info",recalled:"bad",suspected_fake:"bad",expired:"warn",unknown:"info",in_transit:"info",cancelled:"info",high:"bad",critical:"bad",low:"info",medium:"warn",manufacturer:"info",distributor:"info",pharmacy:"info",regulator:"info"};
const NUMERIC=new Set(["id","number","money"]);

let META=null,user=null,cur="",sortCol=-1,sortDir=1,q="",rows=[],cols=[],lastSql=[];
let page=1,pageSize=10,currentRow=null;

/* ---------- api ---------- */
async function api(path,opts={}){
  const headers={...(opts.headers||{})};
  try{const t=localStorage.getItem("mt-token");if(t)headers["x-auth-token"]=t}catch{}
  let r;
  try{
    r=await fetch(path,{...opts,headers});
  }catch{
    const e=new Error("Cannot reach the server. Check that it is running, then try again.");
    e.status=0;
    throw e;
  }
  let j=null;
  if((r.headers.get("content-type")||"").includes("application/json")){
    try{j=await r.json()}catch{j=null}
  }
  if(!j){
    const e=new Error(r.status===401?"Your session has expired. Please sign in again."
      :`The server sent an unexpected response (${r.status}). Please try again.`);
    e.status=r.status;
    throw e;
  }
  if(!j.ok){
    const e=new Error(j.error||"Request failed");
    e.status=r.status;
    throw e;
  }
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
  const err=opts.error?`<div class="errline">Database error ${esc(opts.error.sqlState||"")} · ${esc(opts.error.code||"")}: ${esc(opts.error.message||"")}</div>`:"";
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

/* ---------- auth (sign in / customer sign-up / staff application) ---------- */
const liE=$("#li-e"),liP=$("#li-p"),liEr=$("#li-er");
const suN=$("#su-n"),suE=$("#su-e"),suP=$("#su-p"),suC=$("#su-c"),suEr=$("#su-er");
const apN=$("#ap-n"),apE=$("#ap-e"),apR=$("#ap-r"),apO=$("#ap-o"),apNote=$("#ap-note"),apP=$("#ap-p"),apC=$("#ap-c"),apEr=$("#ap-er");

function showTab(which){
  const map={signin:"#lf",signup:"#sf",apply:"#af"};
  for(const [name,sel] of Object.entries(map)) $(sel).classList.toggle("hide",name!==which);
  for(const name of Object.keys(map)){
    const t=$("#tab-"+name);
    t.classList.toggle("on",name===which);
    t.setAttribute("aria-selected",String(name===which));
  }
  liEr.textContent="";suEr.textContent="";apEr.textContent="";
}
$("#tab-signin").onclick=()=>showTab("signin");
$("#tab-signup").onclick=()=>showTab("signup");
$("#tab-apply").onclick=()=>showTab("apply");

// One toggle handler for every password box, driven by the data-for attribute.
$$(".ptog").forEach(b=>b.onclick=()=>{const p=$("#"+b.dataset.for);const show=p.type==="password";p.type=show?"text":"password";b.textContent=show?"Hide":"Show"});

function storeSession(token){try{localStorage.setItem("mt-token",token)}catch{}}
function clearSession(){try{localStorage.removeItem("mt-token")}catch{}}

async function enterApp(j){
  storeSession(j.token);
  user=j.user;
  await boot();
}

async function doLogin(){
  if(liEr.dataset.busy)return;
  liEr.textContent="";
  const btn=$("#lf button[type=submit]");
  const email=liE.value.trim(), password=liP.value;
  if(!email){liEr.textContent="Enter your email address.";liE.focus();return}
  if(!password){liEr.textContent="Enter your password.";liP.focus();return}
  liEr.dataset.busy="1";
  btn.disabled=true;btn.textContent="Signing in…";
  try{
    const j=await api("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,password})});
    await enterApp(j);
    liP.value="";
    toast("Signed in",`Welcome, ${user.name}`);
  }catch(err){liEr.textContent=err.message;liP.select?.()}
  finally{delete liEr.dataset.busy;btn.disabled=false;btn.textContent="Sign in"}
}

// Customers only. The server rejects any other role here, so the UI simply
// does not offer one.
async function doSignup(){
  if(suEr.dataset.busy)return;
  suEr.textContent="";
  const btn=$("#sf button[type=submit]");
  const name=suN.value.trim(), email=suE.value.trim(), password=suP.value, confirm=suC.value;
  if(name.length<2){suEr.textContent="Enter your full name.";suN.focus();return}
  if(!email){suEr.textContent="Enter your email address.";suE.focus();return}
  if(!password){suEr.textContent="Choose a password.";suP.focus();return}
  if(password!==confirm){suEr.textContent="The two passwords do not match.";suC.focus();return}
  suEr.dataset.busy="1";
  btn.disabled=true;btn.textContent="Creating account…";
  try{
    const j=await api("/api/signup",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,email,role:"customer",password,confirm})});
    await enterApp(j);
    toast("Account created",`Signed in as ${user.email}`);
  }catch(err){suEr.textContent=err.message}
  finally{delete suEr.dataset.busy;btn.disabled=false;btn.textContent="Create account"}
}

// Staff apply; a regulator approves and the account is created then.
async function doApply(){
  if(apEr.dataset.busy)return;
  apEr.textContent="";
  const btn=$("#af button[type=submit]");
  const name=apN.value.trim(), email=apE.value.trim(), password=apP.value, confirm=apC.value;
  if(name.length<2){apEr.textContent="Enter your full name.";apN.focus();return}
  if(!email){apEr.textContent="Enter your work email address.";apE.focus();return}
  if(!apO.value){apEr.textContent="Choose the organization you work for.";apO.focus();return}
  if(!password){apEr.textContent="Choose a password.";apP.focus();return}
  if(password!==confirm){apEr.textContent="The two passwords do not match.";apC.focus();return}
  apEr.dataset.busy="1";
  btn.disabled=true;btn.textContent="Submitting…";
  try{
    const j=await api("/api/account-requests",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,email,role:apR.value,org_id:Number(apO.value),note:apNote.value.trim(),password,confirm})});
    $("#af").reset();
    fillOrgOptions(apR.value,apO);
    toast("Application submitted",j.message||"A regulator will review it.");
    showTab("signin");
  }catch(err){apEr.textContent=err.message}
  finally{delete apEr.dataset.busy;btn.disabled=false;btn.textContent="Submit application"}
}

$("#lf").addEventListener("submit",e=>{e.preventDefault();doLogin()});
$("#sf").addEventListener("submit",e=>{e.preventDefault();doSignup()});
$("#af").addEventListener("submit",e=>{e.preventDefault();doApply()});
$$("[data-demo]").forEach(b=>b.onclick=()=>{showTab("signin");liE.value=b.dataset.demo;liP.value="demo1234";doLogin()});

/* ---------- public verification (no account) ---------- */
$("#pv").addEventListener("submit",async e=>{
  e.preventDefault();
  const code=$("#pv-code").value.trim();
  const out=$("#pv-result");
  if(!code){out.innerHTML=`<div class="pvres bad"><b>Enter a batch code</b>Type the code printed on the pack.</div>`;return}
  out.innerHTML=`<div class="pvres"><b>Checking…</b></div>`;
  try{
    const j=await api("/api/public/verify",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({code})});
    out.innerHTML=pvResultHtml(j.result,j.pack,code);
  }catch(err){out.innerHTML=`<div class="pvres bad"><b>Could not check</b>${esc(err.message)}</div>`}
});

// The public result deliberately shows only what is printed on the pack.
const PV={
  genuine:{cls:"ok",title:"Genuine",line:"This batch code is registered and the batch is not recalled, counterfeit or expired."},
  recalled:{cls:"bad",title:"Recalled — do not use",line:"This batch has been recalled by a regulator. Return it to the pharmacy."},
  suspected_fake:{cls:"bad",title:"Unsafe — suspected counterfeit",line:"This batch is under investigation as a suspected counterfeit. Do not use it."},
  expired:{cls:"warn",title:"Expired",line:"This batch is past its expiry date. Do not use it."},
  unknown:{cls:"bad",title:"Not recognised",line:"No batch matches this code. This may be fake medicine — report it to a regulator."},
};
function pvResultHtml(result,pack,code){
  const info=PV[result]||PV.unknown;
  const rows=pack?`<dl>
    <dt>Medicine</dt><dd>${esc(pack.medicine)}</dd>
    <dt>Manufacturer</dt><dd>${esc(pack.manufacturer)}</dd>
    <dt>Batch code</dt><dd>${esc(pack.batch_code)}</dd>
    <dt>Manufactured</dt><dd>${esc(String(pack.mfg_date||"").slice(0,10))}</dd>
    <dt>Expires</dt><dd>${esc(String(pack.expiry_date||"").slice(0,10))}</dd>
  </dl>`:`<p class="muted" style="margin:8px 0 0">Code checked: <span class="mono">${esc(code)}</span></p>`;
  return `<div class="pvres ${info.cls}"><b>${esc(info.title)}</b>${esc(info.line)}${rows}</div>`;
}

// Keep the organization list in step with the chosen role on the staff form:
// only organizations of the matching type are offered, so a false pairing
// cannot be picked.
let ORGS=[];
function fillOrgOptions(role,select){
  const mine=ORGS.filter(o=>o[2]===role);
  select.innerHTML=mine.map(o=>`<option value="${o[0]}">${esc(o[1])}</option>`).join("")
    ||`<option value="">No organization of that type is listed</option>`;
}
apR.addEventListener("change",()=>fillOrgOptions(apR.value,apO));

try{const t=localStorage.getItem("mt-theme");if(t)document.documentElement.dataset.theme=t}catch{}
async function loadMeta(){
  META=await api("/api/meta");
}
// Organizations for the staff form are public (name + type only).
async function loadOrgs(){
  try{
    const j=await api("/api/public/organizations");
    ORGS=j.organizations.map(o=>[o.org_id,o.name,o.org_type]);
    fillOrgOptions(apR.value,apO);
  }catch{}
}

/* ---------- shell ---------- */
async function boot(){
  await loadMeta();
  __alerts=[];__events=[];__unseen=0;__alertSig="";
  $("#login").classList.add("hide");$("#app").classList.remove("hide");
  $("#who").innerHTML=`<b>${esc(user.name)}</b><br>${esc(roleLabel(user.role))} · ${esc(user.org)}`;
  $("#ini").textContent=initials(user.name);
  $("#aname").textContent=user.name.split(" ")[0];
  buildNav();
  await loadNotifications();
  go("_home");
  startLive();
}
function buildNav(){
  const allowed=META.access[user.role]||[];
  const r=user.role;
  let h=`<button data-k="_home">Overview</button><button data-k="_verify">Verify a batch code</button>`;
  if(r!=="customer")h+=`<button data-k="_trace">Trace a batch</button>`;
  else h+=`<button data-k="_ctrace">Trace your medicine</button>`;
  // "Test a sale" demonstrates the sale-blocking trigger; it is a QA tool, so it
  // is shown to the roles that record or inspect sales.
  if(r==="pharmacy"||r==="regulator"||r==="admin")h+=`<button data-k="_sale">Test a sale</button>`;
  if(r==="regulator"||r==="admin")h+=`<button data-k="_recall">Recall management</button><button data-k="_requests">Account requests</button>`;
  if(r==="manufacturer"||r==="distributor")h+=`<button data-k="_newship">New shipment</button>`;
  if(r==="manufacturer")h+=`<button data-k="_newmed">Add medicine or batch</button>`;
  if(r==="pharmacy")h+=`<button data-k="_newsale">Record a sale</button>`;
  if(r==="regulator"||r==="admin")h+=`<button data-k="_schema">Database schema</button><button data-k="_sql">Reports</button>`;
  META.groups.forEach(([g,ks])=>{const k2=ks.filter(k=>allowed.includes(k));if(k2.length)h+=`<div class="grp">${g}</div>`+k2.map(k=>`<button data-k="${k}">${esc(META.datasets[k].title)}<span>${META.datasets[k].count}</span></button>`).join("")});
  $("#nav").innerHTML=h;
  markActiveNav();
}
// Re-apply the "current" highlight after the nav is rebuilt (e.g. by a live refresh).
function markActiveNav(){$$("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.k===cur))}
$("#nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b)go(b.dataset.k)});
$("#lo").onclick=async()=>{
  try{await fetch("/api/logout",{method:"POST"})}catch{}
  clearSession();
  user=null;closeAllPop();stopLive();
  __alerts=[];__events=[];__unseen=0;__alertSig="";paintBell();
  $("#app").classList.add("hide");$("#login").classList.remove("hide");
  liP.value="";liEr.textContent="";suP.value="";suC.value="";suEr.textContent="";apP.value="";apC.value="";apEr.textContent="";
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
  m.innerHTML=`<div class="menu"><div class="hdr"><b>${esc(user.name)}</b><small>${esc(roleLabel(user.role))} · ${esc(user.org)}</small></div>
   <button data-a="profile">View profile</button><button data-a="theme">Switch theme</button><button data-a="help">Keyboard shortcuts</button><button data-a="out">Sign out</button></div>`};
$("#bellbtn").onclick=e=>{e.stopPropagation();const p=$("#bellpop");if(p.innerHTML){p.innerHTML="";return}
  p.innerHTML=renderBellBody();
  markBellSeen();};
document.addEventListener("click",e=>{if(!e.target.closest("#avmenu")&&!e.target.closest("#avatar")&&!e.target.closest("#bellpop")&&!e.target.closest("#bellbtn")&&!e.target.closest("#gres")&&!e.target.closest("#gq"))closeAllPop()});
$("#avmenu").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const a=b.dataset.a;closeAllPop();
  if(a==="out")$("#lo").click();
  else if(a==="theme")$("#th").click();
  else if(a==="help")$("#help").classList.add("open");
  else if(a==="profile")openDrawer("Your profile",`<dl class="kv"><dt>Name</dt><dd>${esc(user.name)}</dd><dt>Email</dt><dd>${esc(user.email)}</dd><dt>Role</dt><dd><span class="b info">${esc(roleLabel(user.role))}</span></dd><dt>Organization</dt><dd>${esc(user.org)}</dd><dt>Datasets you can open</dt><dd>${(META.access[user.role]||[]).length}</dd></dl>`);
});

/* ---------- notifications ---------- */
// Two things live in the bell:
//   1. Standing alerts derived from the current data (recalled / fake / expired
//      batches, unknown scans, shipments in transit). They are recomputed from
//      the live dashboard on every refresh, so they are never stale.
//   2. An event log: every database change — ours or anyone else's, from the API,
//      MySQL Workbench or the mysql CLI — is appended here, newest first, with a
//      running count of what moved. This is the "notification centre" the user
//      asked for; there are no more floating "Live update" toasts.
let __alerts=[];        // derived standing alerts
let __events=[];        // change-event log, newest first
let __unseen=0;         // events + alerts added since the bell was last opened
let __alertSig="";      // signature of the last alert set, to detect new alerts

function derivedAlerts(d){
  const notes=[];
  d.batchesByStatus.filter(b=>b.status==="recalled"||b.status==="suspected_fake").forEach(b=>{
    notes.push({icon:"⛔",kind:"bad",html:`<b>${esc(b.status.replace(/_/g," "))}</b> — ${b.n} batch${b.n===1?"":"es"} blocked from sale`,when:"now"});
  });
  const unknown=(d.scansByResult.find(s=>s.result==="unknown")||{}).n||0;
  if(unknown)notes.push({icon:"⚠",kind:"warn",html:`<b>${unknown} unknown</b> batch code${unknown===1?"":"s"} scanned — possible fake medicine`,when:"recent"});
  const intransit=(d.shipmentsByStatus.find(s=>s.status==="in_transit")||{}).n||0;
  if(intransit)notes.push({icon:"🚚",kind:"info",html:`<b>${intransit}</b> shipment${intransit===1?"":"s"} still in transit`,when:"open"});
  d.batchesByStatus.filter(b=>b.status==="expired").forEach(b=>notes.push({icon:"⌛",kind:"warn",html:`<b>${b.n}</b> expired batch${b.n===1?"":"es"} to withdraw`,when:"open"}));
  return notes;
}

// Append one change event to the log. `changed` is the list of table names the
// watcher reported (or a friendly label such as "account_requests").
function logChangeEvent(changed){
  const tables=(changed&&changed.length?changed:["data"]);
  const html=`<b>Data changed</b> — ${esc(tables.map(t=>META?.datasets?.[t]?.title||t.replace(/_/g," ")).join(", "))}`;
  __events.unshift({icon:"🔄",kind:"info",html,when:clockTime()});
  if(__events.length>30)__events.length=30;
  __unseen++;
  paintBell();
}

function renderBellBody(){
  const alertItems=__alerts.map(n=>`<div class="item ${n.kind||""}"><span class="ic">${n.icon}</span><div>${n.html}</div><span class="t">${esc(n.when)}</span></div>`);
  const eventItems=__events.map(n=>`<div class="item ${n.kind||""}"><span class="ic">${n.icon}</span><div>${n.html}</div><span class="t">${esc(n.when)}</span></div>`);
  const body=`
    ${alertItems.length?`<div class="nhead">Needs attention</div>${alertItems.join("")}`:""}
    <div class="nhead">Activity</div>
    ${eventItems.length?eventItems.join(""):`<div class="item empty">No changes recorded yet. Actions you take, or edits made directly in MySQL, appear here.</div>`}`;
  return `<div class="pop"><h4>Notifications</h4>${body}</div>`;
}

function paintBell(){
  const total=__alerts.length+__events.length;
  const el=$("#bellcount");
  el.textContent=__unseen;
  el.style.display=__unseen?"grid":"none";
  // The dot is a quiet "there is something here" cue even when nothing is unseen.
  $("#bellbtn").classList.toggle("hasnotes",total>0);
}
function markBellSeen(){__unseen=0;paintBell()}

async function loadNotifications(){
  try{
    const d=await api("/api/dashboard");
    const next=derivedAlerts(d);
    const sig=next.map(n=>n.html).join("|");
    if(__alertSig&&sig!==__alertSig){
      const added=next.length-__alerts.length;
      if(added>0)__unseen+=added;
    }
    __alertSig=sig;
    __alerts=next;
    paintBell();
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
      const j=await api(`/api/search?q=${encodeURIComponent(val)}`);
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
  if(k==="_home"){m.innerHTML=home();crumbs("<b>Overview</b>");if(user.role==="customer")wireCustomerHome();else await renderCharts()}
  else if(k==="_verify"){m.innerHTML=verifyView();crumbs("<b>Verify a batch code</b>");$("#vf").onsubmit=verify}
  else if(k==="_trace"){m.innerHTML=await traceView();crumbs("<b>Trace a batch</b>");$("#tf").onsubmit=trace}
  else if(k==="_sale"){m.innerHTML=await saleView();crumbs("<b>Test a sale</b>");$("#salef").onsubmit=testSale}
  else if(k==="_recall"){m.innerHTML=await recallView();crumbs("<b>Recall management</b>");$("#rf").onsubmit=issueRecall}
  else if(k==="_requests"){m.innerHTML=await requestsView();crumbs("<b>Account requests</b>");wireRequests()}
  else if(k==="_newship"){m.innerHTML=await newShipmentView();crumbs("<b>New shipment</b>");$("#shf").onsubmit=createShipment}
  else if(k==="_newmed"){m.innerHTML=await newMedicineView();crumbs("<b>Add medicine or batch</b>");wireNewMedicine()}
  else if(k==="_newsale"){m.innerHTML=await recordSaleView();crumbs("<b>Record a sale</b>");$("#rsf").onsubmit=recordSale}
  else if(k==="_ctrace"){m.innerHTML=ctraceView();crumbs("<b>Trace your medicine</b>");$("#ctf").onsubmit=customerTrace}
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
  if(k==="badge")return `<td><span class="b ${BADGE[v]||"info"}">${esc(typeLabel(String(v).replace(/_/g," ")))}</span></td>`;
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
  const kv=cols.map((c,ci)=>`<dt>${esc(c.label)}</dt><dd>${c.kind==="badge"?`<span class="b ${BADGE[currentRow[ci]]||"info"}">${esc(typeLabel(String(currentRow[ci]).replace(/_/g," ")))}</span>`:c.kind==="money"?money(currentRow[ci]):c.kind==="code"?`<span class="mono">${esc(currentRow[ci])}</span>`:esc(currentRow[ci]??"–")}</dd>`).join("");
  openDrawer(`${title} #${currentRow[0]}`,`<dl class="kv">${kv}</dl><div class="dsec" id="drel"><h4>Related records</h4><div class="loading">Loading related records…</div></div>`);
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
  const r=user.role;
  const acts=[["🔎","Verify a batch code","Check a printed code is genuine","_verify",""]];
  if(r!=="customer")acts.push(["🧭","Trace a batch","Follow a batch to every receiver","_trace","alt"]);
  else acts.push(["🧭","Trace your medicine","Follow your batch from factory to pharmacy","_ctrace","alt"]);
  if(r==="pharmacy"||r==="regulator"||r==="admin")acts.push(["🛒","Test a sale","See an unsafe sale get blocked","_sale","warn"]);
  if(r==="regulator"||r==="admin")acts.push(["🚨","Recall management","Issue, complete or withdraw recalls","_recall","warn"]);
  if(r==="regulator"||r==="admin")acts.push(["✅","Account requests","Approve or reject staff applications","_requests","alt"]);
  if(r==="manufacturer"||r==="distributor")acts.push(["🚚","New shipment","Move stock to another organization","_newship","alt"]);
  if(r==="manufacturer")acts.push(["🏭","Add medicine or batch","Register a product or production run","_newmed","alt"]);
  if(r==="pharmacy")acts.push(["🧾","Record a sale","Sell stock to a customer","_newsale","alt"]);
  if(r==="regulator"||r==="admin")acts.push(["📊","Reports","Run the project's SQL reports","_sql","alt"]);
  return `<div class="quick">${acts.map(([ic,t,s,k,c])=>`<button class="qaction ${c}" data-go="${k}"><span class="qaic">${ic}</span><span><b>${esc(t)}</b><small>${esc(s)}</small></span></button>`).join("")}</div>`;
}
// A live "factory to customer" pipeline. Every node is a table count read from
// MySQL, and each role only sees the stages it is allowed to see.
function pipeline(){
  const d=META.datasets;
  const has=k=>!!d[k];
  const steps=[];
  if(has("medicines"))steps.push(["Medicines",d.medicines.count,"registered products"]);
  if(has("batches"))steps.push(["Batches",d.batches.count,"produced"]);
  if(has("shipments"))steps.push(["Shipments",d.shipments.count,"moved between organizations"]);
  if(has("inventory"))steps.push(["In stock",d.inventory.count,"inventory lines"]);
  if(has("sales"))steps.push(["Sales",d.sales.count,"dispensed"]);
  if(has("verification_scans"))steps.push(["Verified",d.verification_scans.count,"scans checked"]);
  return `<div class="panel"><h3>From factory to customer — live data flow</h3>
    <div class="pipe">${steps.map(([t,n,sub])=>`<div class="pstep ${n>0?"done":""}"><div class="pdot">${n>0?num(n):"—"}</div><b>${esc(t)}</b><small>${esc(sub)}</small></div>`).join("")}</div>
    <p class="note">Each stage shows how many records are at that point for ${esc(user.org)}. Open any batch and use <b>Trace a batch</b> to follow one end-to-end.</p></div>`;
}
// The overview adapts to the role: a manufacturer tracks production, a pharmacy
// tracks stock and sales, a regulator watches the whole chain, and a customer
// only verifies codes so it gets a purpose-built page instead of empty charts.
function home(){
  const s=META.stats;
  const r=user.role;
  if(r==="customer")return customerHome();
  const kpis=[["Batches in view",s.batches,`${s.genuine} genuine`,"batches"]];
  if(r!=="customer")kpis.push(["Recalled",s.recalled,"blocked from sale","recalls"]);
  kpis.push(["Suspected fake",s.suspected_fake,"under investigation","batches"]);
  kpis.push(["Expired",s.expired,"withdraw from shelves","batches"]);
  kpis.push(["Verification scans",s.scans,"all-time checks","verification_scans"]);
  if(r==="regulator"||r==="admin")kpis.push(["Active recalls",s.recalls,"across all organizations","recalls"]);

  const panels=[];
  panels.push(`<div class="grid2">
      <div class="panel"><h3>Batches by status</h3><div class="chartbox"><canvas id="cStatus"></canvas></div></div>
      <div class="panel"><h3>Verification scans by result</h3><div class="chartbox"><canvas id="cScans"></canvas></div></div>
    </div>`);
  panels.push(`<div class="grid2">
      <div class="panel"><h3>${r==="pharmacy"?"Your stock on hand":"Inventory held"}</h3><div class="chartbox"><canvas id="cInv"></canvas></div></div>
      <div class="panel"><h3>Recent status changes (audit log)</h3><ul class="feed" id="fActivity"><li class="loading">Loading…</li></ul></div>
    </div>`);
  if(r==="pharmacy"||r==="regulator"||r==="admin"){
    panels.push(`<div class="panel"><h3>Sales recorded</h3><div class="chartbox"><canvas id="cSales"></canvas></div></div>`);
  }
  panels.push(`<div class="panel"><h3>Recent verification scans</h3><ul class="feed" id="fScans"><li class="loading">Loading…</li></ul></div>`);
  panels.push(`<div class="panel"><h3>How a batch moves</h3>${illusTrace()}<ul class="chain" style="margin-top:10px"><li>Manufacturer produces a batch of a medicine</li><li>Shipments carry it to distributors, then pharmacies, and inventory is updated</li><li>A pharmacy sells it to a customer; sales of recalled, fake or expired batches are blocked</li><li>A regulator can recall it; every status change goes to the audit log</li><li>Anyone can verify the batch code</li></ul></div>`);

  return `<div class="page">
    <div class="pagehead"><h2>Welcome, ${esc(user.name.split(" ")[0])}</h2><p>You are signed in as <b>${esc(roleLabel(r))}</b> for ${esc(user.org)}. ${roleBlurb(r)}</p></div>
    <div class="kpis" style="margin-top:18px">${kpis.map(k=>`<button class="kpi" data-goto="${k[3]}"><span class="lbl">${esc(k[0])}</span><div class="val">${num(k[1])}</div><div class="sub">${esc(k[2])}</div></button>`).join("")}</div>
    ${quickActions()}
    ${pipeline()}
    ${panels.join("")}
    <div class="panel"><p class="note" style="margin:0">Everything here is limited to what your role may see. Open any batch to see its history, or use <b>Trace a batch</b> to follow one from factory to customer.</p></div>
  </div>`;
}
const ROLE_LABEL={admin:"System administrator",regulator:"Regulator",manufacturer:"Manufacturer",distributor:"Distributor",pharmacy:"Pharmacy",customer:"Customer"};
const roleLabel=r=>ROLE_LABEL[r]||r;
// Organization types come back from MySQL lowercase; show them as proper labels.
const typeLabel=t=>ROLE_LABEL[String(t).toLowerCase()]||String(t??"");
// Customers have no operational datasets, so their home page is about the one
// thing they can do: check a printed code. It is not an empty dashboard.
function customerHome(){
  return `<div class="page">
    <div class="pagehead"><h2>Welcome, ${esc(user.name.split(" ")[0])}</h2><p>You can check any printed batch code. If a code is not recognised, the medicine may be fake — report it to a regulator.</p></div>
    <div class="vlayout" style="margin-top:18px">
      <div class="panel"><h3>Check a batch code</h3>
        <div class="row"><div><label for="ch-code">Batch code</label><input id="ch-code" placeholder="e.g. PCM-2025-A01" autocomplete="off"></div><button class="btn" id="ch-go">Check batch</button></div>
        <div id="ch-res"></div>
      </div>
      <aside class="panel sideillus"><div class="illusmini">${illusShield()}</div><p class="note" style="margin:0">A valid code confirms the batch exists and is safe to use on paper. It cannot prove the physical strip is authentic, since a counterfeit can copy a real code.</p></aside>
    </div>
    <div class="panel"><h3>Trace your medicine</h3><p class="note" style="margin-top:0">Have a pack in hand? Enter its batch code to see the batch's journey from the factory, through shipments and stock, to the pharmacy that holds it.</p>
      <div class="row"><div><label for="ch-tcode">Batch code</label><input id="ch-tcode" placeholder="e.g. PCM-2025-A01" autocomplete="off"></div><button class="btn" id="ch-tgo">Trace this batch</button></div>
      <div id="ch-tres"></div>
    </div>
    <div class="panel"><h3>How a batch moves</h3>${illusTrace()}<ul class="chain" style="margin-top:10px"><li>Manufacturer produces a batch of a medicine</li><li>Shipments carry it to distributors, then pharmacies, and inventory is updated</li><li>A pharmacy sells it to a customer; sales of recalled, fake or expired batches are blocked</li><li>A regulator can recall it; every status change goes to the audit log</li><li>Anyone can verify the batch code</li></ul></div>
    <div class="panel"><h3>What the result means</h3><dl class="kv">
      <dt><span class="b ok">genuine</span></dt><dd>Registered and not recalled, counterfeit or expired. Safe on paper.</dd>
      <dt><span class="b bad">recalled</span></dt><dd>A regulator pulled this batch. Do not use it; return it to the pharmacy.</dd>
      <dt><span class="b bad">suspected fake</span></dt><dd>Under investigation as a counterfeit. Do not use it.</dd>
      <dt><span class="b warn">expired</span></dt><dd>Past its expiry date. Do not use it.</dd>
      <dt><span class="b bad">not recognised</span></dt><dd>No batch matches the code. This may be fake medicine — report it.</dd>
    </dl></div>
  </div>`;
}
function wireCustomerHome(){
  const form=$("#ch-go");if(!form)return;
  const run=async()=>{
    const code=$("#ch-code").value.trim();
    const out=$("#ch-res");
    if(!code){out.innerHTML=`<div class="res warn">Enter a batch code.</div>`;return}
    out.innerHTML='<div class="res warn">Checking…</div>';
    try{
      const j=await api("/api/public/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
      out.innerHTML=pvResultHtml(j.result,j.pack,code);
    }catch(err){out.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
  };
  form.onclick=run;
  $("#ch-code").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();run()}});

  const tgo=$("#ch-tgo");
  if(tgo){
    const runTrace=async()=>{
      const code=$("#ch-tcode").value.trim();
      const out=$("#ch-tres");
      if(!code){out.innerHTML=`<div class="res warn">Enter a batch code.</div>`;return}
      out.innerHTML='<div class="res warn">Tracing…</div>';
      try{
        const j=await api("/api/customer/trace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
        out.innerHTML=customerTraceHtml(j,code);
      }catch(err){out.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
    };
    tgo.onclick=runTrace;
    $("#ch-tcode").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runTrace()}});
  }
}
function roleBlurb(r){
  return {
    admin:"You can see and do everything, across all organizations.",
    regulator:"You oversee the whole chain: every organization, batch, recall and audit entry.",
    manufacturer:"You see your own products, batches and the shipments you sent.",
    distributor:"You see the batches and stock your organization handled, and the shipments you sent or received.",
    pharmacy:"You see your own stock, the customers you sold to, and the sales you recorded.",
    customer:"You can verify batch codes. Customer accounts do not open the operational datasets.",
  }[r]||"";
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
  Chart.defaults.font.family='"Plus Jakarta Sans",system-ui,sans-serif';
  Chart.defaults.color=mute;
  charts.forEach(c=>c.destroy());charts=[];
  const mk=(id,cfg)=>{const el=$("#"+id);if(el)charts.push(new Chart(el,cfg))};
  mk("cStatus",{type:"bar",data:{labels:dashData.batchesByStatus.map(b=>b.status.replace(/_/g," ")),datasets:[{label:"Batches",data:dashData.batchesByStatus.map(b=>b.n),backgroundColor:dashData.batchesByStatus.map(b=>PALETTE[b.status]||"#2a5d9f"),borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:grid},ticks:{precision:0}}}}});
  mk("cInv",{type:"bar",data:{labels:dashData.inventoryByOrg.map(i=>i.org),datasets:[{label:"Units on hand",data:dashData.inventoryByOrg.map(i=>Number(i.units)),backgroundColor:"#0b6b63",borderRadius:6}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:grid}},y:{grid:{display:false}}}}});
  mk("cScans",{type:"doughnut",data:{labels:dashData.scansByResult.map(s=>s.result),datasets:[{data:dashData.scansByResult.map(s=>s.n),backgroundColor:dashData.scansByResult.map(s=>PALETTE[s.result]||"#2a5d9f"),borderColor:cssv("--panel"),borderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"right"}}}});
  if($("#cSales"))mk("cSales",{type:"line",data:{labels:dashData.salesByMonth.map(m=>m.ym),datasets:[{label:"Revenue",data:dashData.salesByMonth.map(m=>Number(m.revenue)),borderColor:"#0b6b63",backgroundColor:"#0b6b6322",fill:true,tension:.3,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:grid}}}}});
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
function verifyView(){return `<div class="page"><div class="pagehead"><h2>Verify a batch code</h2><p>Type the batch code printed on the strip. The result is genuine, recalled, suspected counterfeit, expired or unknown.</p></div>
 <div class="vlayout">
 <form class="panel" id="vf" style="margin-top:16px"><div class="row"><div><label for="bcode">Batch code</label><input id="bcode" placeholder="e.g. PCM-2025-A01" autocomplete="off"></div><button class="btn" type="submit">Check batch</button></div><p class="note">Try PCM-2025-A01, PCM-2025-B02, SYR-2025-A01, CTZ-2024-A01 or a made-up code. Each check is written to the verification_scans table.</p><div id="vr"></div><div id="vsql"></div></form>
 <aside class="panel sideillus"><div class="illusmini">${illusShield()}</div><p class="note" style="margin:0">A valid code confirms the batch exists and is safe to use on paper. It cannot prove the physical strip is authentic, since a counterfeit can copy a real code.</p></aside>
 </div></div>`}
async function verify(e){
  e.preventDefault();
  const vr=$("#vr");vr.innerHTML='<div class="res warn">Checking…</div>';$("#vsql").innerHTML="";
  try{
    const j=await api("/api/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:$("#bcode").value})});
    const info=PV[j.result]||PV.unknown;
    const cls=info.cls;
    const detail=j.batch?`<div style="font-weight:400;margin-top:6px">${esc(j.batch.medicine)} · made by ${esc(j.batch.manufacturer)} · expires ${esc(String(j.batch.expiry_date).slice(0,10))}</div>`:"";
    vr.innerHTML=`<div class="res ${cls}"><b>${esc(info.title)}.</b> ${esc(info.line)}${detail}</div>`;
    $("#vsql").innerHTML=sqlBlock(j.sql,{open:false});
    toast(j.result==="genuine"?"Batch verified":j.result==="unknown"?"Unknown code":"Blocked",`${j.result} · ${$("#bcode").value}`,j.result==="genuine"?"ok":j.result==="unknown"?"warn":"bad");
    await loadNotifications();
  }catch(err){vr.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}

/* ---------- trace ---------- */
// Batch dropdowns show the batch code and medicine only — never the status, so
// a user cannot read a safety verdict off the option label. Status is revealed
// only by actually verifying or tracing.
async function batchOptions(){
  const b=await api("/api/datasets/batches");
  const codeIdx=b.columns.findIndex(c=>c.key==="batch_code");
  const medIdx=b.columns.findIndex(c=>c.key==="medicine");
  return b.rows.map(r=>`<option value="${r[0]}">${esc(r[codeIdx])} – ${esc(r[medIdx])}</option>`).join("")
    ||`<option value="">No batches are visible to your account</option>`;
}
// Customer-facing trace: enter a printed batch code and see the journey. Only
// public facts — where the batch travelled, who holds it, and any recalls. No
// personal data and no other organization's internal detail is exposed.
function ctraceView(){
  return `<div class="page"><div class="pagehead"><h2>Trace your medicine</h2><p>Type the batch code printed on the pack to follow that batch from the factory, through shipments and stock, to the pharmacy. You will see the journey and any safety recalls — never anyone's personal details.</p></div>
 <form class="panel" id="ctf" style="margin-top:16px"><div class="row"><div><label for="ct-code">Batch code</label><input id="ct-code" placeholder="e.g. PCM-2025-A01" autocomplete="off"></div><button class="btn" type="submit">Trace this batch</button></div><p class="note">Try PCM-2025-A01 (a shipped batch), PCM-2025-B02 (recalled) or any code you like.</p></form><div id="ctr"></div></div>`;
}
async function customerTrace(e){
  e.preventDefault();
  const out=$("#ctr");
  const code=$("#ct-code").value.trim();
  if(!code){out.innerHTML=`<div class="panel"><div class="res warn">Enter a batch code.</div></div>`;return}
  out.innerHTML='<div class="panel"><div class="loading">Tracing…</div></div>';
  try{
    const j=await api("/api/customer/trace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
    out.innerHTML=`<div class="panel">${customerTraceHtml(j,code)}</div>`;
  }catch(err){out.innerHTML=`<div class="panel"><div class="res bad">${esc(err.message)}</div></div>`}
}
// Render a customer trace result. Shared by the dedicated view and the customer
// overview so both read identically.
function customerTraceHtml(j,code){
  if(!j.found){
    return `<div class="res bad"><b>No batch matches ${esc(code)}.</b> This code is not recognised — it may be counterfeit. Report it to a regulator.</div>`;
  }
  const b=j.batch;
  const info=PV[b.status]||{cls:"warn",title:b.status};
  const flow=j.flow.map(f=>`<li>${esc(f.from_org)} → ${esc(f.to_org)}: ${num(f.quantity)} units <span class="b ${BADGE[f.shipment_status]||"info"}">${esc(String(f.shipment_status).replace(/_/g," "))}</span> on ${esc(shortTime(f.shipped_at))}</li>`);
  const stock=j.stock.map(s=>`<li>${esc(s.organization)} (${esc(typeLabel(s.org_type))}) holds stock, last updated ${esc(shortTime(s.last_updated))}</li>`);
  const rec=j.recalls.map(r=>`<li>${esc(r.regulator)}: ${esc(r.reason)} <span class="b ${BADGE[r.severity]||"info"}">${esc(r.severity)}</span> on ${esc(shortTime(r.recall_date))}</li>`);
  const sec=(t,a,n)=>`<h4>${t}</h4>${a.length?`<ul class="chain">${a.join("")}</ul>`:`<p class="note">${n}</p>`}`;
  return `<div class="res ${info.cls}" style="margin:0 0 6px"><b>${esc(b.batch_code)}</b>: ${esc(b.medicine)} by ${esc(b.manufacturer)}. ${esc(info.title)}.</div>
    <dl class="kv"><dt>Medicine</dt><dd>${esc(b.medicine)}</dd><dt>Manufacturer</dt><dd>${esc(b.manufacturer)}</dd><dt>Made on</dt><dd>${esc(shortTime(b.mfg_date))}</dd><dt>Expires</dt><dd>${esc(shortTime(b.expiry_date))}</dd></dl>
    ${sec("Journey (shipments)",flow,"This batch has not been shipped yet.")}${sec("Where it is now",stock,"No organization currently holds stock of this batch.")}${sec("Recalls",rec,"No recalls recorded for this batch.")}`;
}
async function traceView(){
  const opts=await batchOptions();
  return `<div class="page"><div class="pagehead"><h2>Trace a batch</h2><p>Follow one batch through shipments, stock and sales to find everyone who received it. Use this after a recall.</p></div>
 <form class="panel" id="tf" style="margin-top:16px"><div class="row"><div><label for="tb2">Batch</label><select id="tb2">${opts}</select></div><button class="btn" type="submit">Trace batch</button></div></form><div id="tr"></div></div>`}
async function trace(e){
  e.preventDefault();
  const tr=$("#tr");tr.innerHTML='<div class="panel"><div class="loading">Tracing…</div></div>';
  try{
    const j=await api(`/api/trace/${$("#tb2").value}`);
    const b=j.batch;
    const info=PV[b.status]||{cls:"warn",title:b.status};
    const sh=j.flow.map(f=>`<li>Shipment #${f.shipment_id}: ${esc(f.from_org)} to ${esc(f.to_org)}, ${num(f.quantity)} units, ${esc(shortTime(f.shipped_at))} <span class="b ${BADGE[f.shipment_status]||"info"}">${esc(String(f.shipment_status).replace(/_/g," "))}</span></li>`);
    const inv=j.stock.map(s=>`<li>${esc(s.organization)} holds ${num(s.quantity_on_hand)} units (updated ${esc(shortTime(s.last_updated))})</li>`);
    const sl=j.customers.map(c=>`<li>${esc(c.customer)}${c.phone?` (${esc(c.phone)})`:""} bought ${num(c.quantity)} unit${c.quantity===1?"":"s"} from ${esc(c.pharmacy)} on ${esc(shortTime(c.sale_date))}</li>`);
    const rec=j.recalls.map(r=>`<li>${esc(r.regulator)}: ${esc(r.reason)} <span class="b ${BADGE[r.severity]||"info"}">${esc(r.severity)}</span> on ${esc(shortTime(r.recall_date))}</li>`);
    const sec=(t,a,n)=>`<h4>${t}</h4>${a.length?`<ul class="chain">${a.join("")}</ul>`:`<p class="note">${n}</p>`}`;
    const custNote=j.customersRestricted
      ? "Customer names and phone numbers are shown only to a regulator and to the pharmacy that made the sale."
      : "No recorded sales, so no customers are affected.";
    tr.innerHTML=`<div class="panel"><div class="res ${info.cls}" style="margin:0 0 6px"><b>${esc(b.batch_code)}</b>: ${esc(b.medicine)}. ${esc(info.title)}.</div>${sec("Shipments",sh,"This batch has not been shipped.")}${sec("Stock held now",inv,"No organization holds stock of this batch.")}${sec("Customers who bought it",sl,custNote)}${sec("Recalls",rec,"No recalls recorded for this batch.")}${sqlBlock(j.sql,{open:false})}</div>`;
  }catch(err){tr.innerHTML=`<div class="panel"><div class="res bad">${esc(err.message)}</div></div>`}
}

/* ---------- test a sale (demo/QA) ---------- */
async function saleView(){
  const opts=await batchOptions();
  return `<div class="page"><div class="pagehead"><h2>Test a sale</h2><p>A safety rule checks the batch before any sale is saved. Try selling a recalled, fake or expired batch and see it get rejected.</p></div>
 <form class="panel" id="salef" style="margin-top:16px"><div class="row"><div><label for="sb">Batch</label><select id="sb">${opts}</select></div><div><label for="sq">Quantity</label><input id="sq" type="number" value="1" min="1"></div><button class="btn" type="submit">Attempt sale</button></div><div id="sr"></div><div id="ssql"></div></form>
 <div class="panel"><p class="note" style="margin:0">This is a QA tool. The attempt is made and then undone automatically, so no real sale row is kept. The result you see is the database rule's decision.</p></div></div>`}
async function testSale(e){
  e.preventDefault();
  const sr=$("#sr");sr.innerHTML='<div class="res warn">Attempting…</div>';$("#ssql").innerHTML="";
  try{
    const j=await api("/api/demo/sales-attempt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId:$("#sb").value,quantity:$("#sq").value})});
    sr.innerHTML=`<div class="res ${j.blocked?"bad":"ok"}">${j.blocked?"BLOCKED — ":""}${esc(j.message)}</div>`;
    $("#ssql").innerHTML=sqlBlock(j.sql,{open:false,trigger:j.trigger,error:j.error});
    toast(j.blocked?"Sale blocked by trigger":"Sale allowed",j.blocked?j.message:"The trigger let the sale through",j.blocked?"bad":"ok");
  }catch(err){sr.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}

/* ---------- recall management (regulator) ---------- */
async function recallView(){
  const list=await api("/api/recalls");
  const active=list.recalls.filter(r=>r.status==="active");
  const canRecall=await batchOptions();
  const rows=list.recalls.map(r=>`<tr>
    <td class="id r">${r.recall_id}</td><td class="code">${esc(r.batch_code)}</td><td>${esc(r.medicine)}</td>
    <td>${esc(r.reason)}</td><td><span class="b ${BADGE[r.severity]||"info"}">${esc(r.severity)}</span></td>
    <td>${esc(shortTime(r.recall_date))}</td><td><span class="b ${BADGE[r.status]||"info"}">${esc(r.status)}</span></td>
    <td class="r">${r.ack_count}</td>
    <td>${r.status==="active"?`<button class="btn ghost sm" data-rc="${r.recall_id}" data-act="completed">Complete</button> <button class="btn ghost sm" data-rc="${r.recall_id}" data-act="withdrawn">Withdraw</button>`:"—"}</td></tr>`).join("");
  return `<div class="page"><div class="pagehead"><h2>Recall management</h2><p>Recalling a batch flips its status to recalled and writes an audit-log row automatically, through database triggers. Completing keeps it recalled; withdrawing returns the batch to genuine (unless it is fake or expired).</p></div>
 <form class="panel" id="rf" style="margin-top:16px"><h3>Issue a recall</h3><div class="row"><div><label for="rb">Batch</label><select id="rb">${canRecall}</select></div><div><label for="rr">Reason</label><input id="rr" placeholder="e.g. Failed dissolution test"></div><div><label for="rs">Severity</label><select id="rs"><option>low</option><option>medium</option><option selected>high</option><option>critical</option></select></div><button class="btn" type="submit">Recall batch</button></div><p class="note">Selecting a batch shows its affected stock and customers before you confirm.</p><div id="rpre"></div><div id="rcr"></div><div id="rsql"></div></form>
 <div class="panel"><h3>All recalls (${list.recalls.length})</h3>
   <div class="tw"><table class="tbl"><thead><tr><th>ID</th><th>Batch</th><th>Medicine</th><th>Reason</th><th>Severity</th><th>Date</th><th>Status</th><th class="r">Acks</th><th>Action</th></tr></thead><tbody>${rows||`<tr><td colspan="9">No recalls recorded.</td></tr>`}</tbody></table></div>
   <p class="note">${active.length} active recall${active.length===1?"":"s"}. A pharmacy or distributor that holds the batch can acknowledge it; the count shows how many have.</p></div></div>`;
}
async function issueRecall(e){
  e.preventDefault();
  const box=$("#rcr");box.innerHTML='<div class="res warn">Issuing…</div>';$("#rsql").innerHTML="";
  try{
    const j=await api("/api/recalls",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId:$("#rb").value,reason:$("#rr").value,severity:$("#rs").value})});
    const logs=j.audit.map(a=>`<li>#${a.log_id}: ${esc(a.old_status)} → <b>${esc(a.new_status)}</b> at ${esc(shortTime(a.changed_at))} (${esc(a.reason||"")})</li>`).join("");
    box.innerHTML=`<div class="res bad">Batch ${esc(j.batch.batch_code)} is now <b>${esc(j.batch.status)}</b>.<div style="font-weight:400;margin-top:8px">Audit log entries written by the trigger:</div><ul class="chain" style="margin-top:6px">${logs}</ul></div>`;
    $("#rsql").innerHTML=sqlBlock(j.sql,{open:false,trigger:j.trigger});
    toast("Recall issued",`${j.batch.batch_code} is now ${j.batch.status}`,"bad");
    META=await api("/api/meta");buildNav();await loadNotifications();
  }catch(err){box.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}
// Preview the affected stock and customers when a batch is chosen.
document.addEventListener("change",async e=>{
  if(e.target.id!=="rb")return;
  const pre=$("#rpre");if(!pre)return;
  if(!e.target.value){pre.innerHTML="";return}
  pre.innerHTML=`<div class="res warn">Checking affected stock…</div>`;
  try{
    const j=await api(`/api/recalls/preview/${e.target.value}`);
    const stock=j.stock.map(s=>`<li>${esc(s.organization)} (${esc(typeLabel(s.org_type))}) holds ${num(s.quantity_on_hand)} units</li>`).join("");
    pre.innerHTML=`<div class="res warn" style="margin-bottom:0"><b>Affected by this recall</b>
      <div style="font-weight:400;margin-top:6px">${num(j.stockUnits)} units on shelves across ${j.stock.length} organization${j.stock.length===1?"":"s"}; ${j.customersAffected} customer${j.customersAffected===1?"":"s"} already bought ${num(j.unitsSold)} units.</div>
      ${stock?`<ul class="chain" style="margin-top:6px">${stock}</ul>`:""}</div>`;
  }catch(err){pre.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
});
// Complete or withdraw a recall.
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-rc]");if(!b)return;
  const note=prompt(`Note for ${b.dataset.act} (optional):`)||"";
  try{
    const j=await api(`/api/recalls/${b.dataset.rc}/status`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:b.dataset.act,note})});
    toast("Recall updated",`Batch ${j.batch.batch_code} is now ${j.batch.status}`,"ok");
    META=await api("/api/meta");await go("_recall");await loadNotifications();
  }catch(err){toast("Could not update recall",err.message,"bad")}
});

/* ---------- account requests (regulator) ---------- */
async function requestsView(){
  const j=await api("/api/account-requests");
  const rows=j.requests.map(r=>`<tr>
    <td class="id r">${r.request_id}</td><td>${esc(r.name)}</td><td>${esc(r.email)}</td>
    <td><span class="b info">${esc(roleLabel(r.role))}</span></td><td>${esc(r.org||"—")}</td>
    <td>${esc(shortTime(r.created_at))}</td><td><span class="b ${r.status==="pending"?"warn":r.status==="approved"?"ok":"bad"}">${esc(r.status)}</span></td>
    <td>${r.status==="pending"?`<button class="btn ghost sm" data-req="${r.request_id}" data-dec="approve">Approve</button> <button class="btn ghost sm" data-req="${r.request_id}" data-dec="reject">Reject</button>`:"—"}</td></tr>`).join("");
  const pending=j.requests.filter(r=>r.status==="pending").length;
  return `<div class="page"><div class="pagehead"><h2>Account requests</h2><p>Staff apply to join an organization; you approve or reject. Approving creates the account with the role and organization the applicant chose. Regulator accounts are never created here — only a system administrator can issue one.</p></div>
 <div class="panel"><h3>${pending} pending application${pending===1?"":"s"}</h3>
  <div class="tw"><table class="tbl"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Organization</th><th>Applied</th><th>Status</th><th>Decision</th></tr></thead><tbody>${rows||`<tr><td colspan="8">No applications yet.</td></tr>`}</tbody></table></div></div></div>`;
}
function wireRequests(){
  document.querySelectorAll("[data-req]").forEach(b=>b.onclick=async()=>{
    try{
      const j=await api(`/api/account-requests/${b.dataset.req}/decision`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({decision:b.dataset.dec})});
      toast("Application "+(b.dataset.dec==="approve"?"approved":"rejected"),j.message,"ok");
      await go("_requests");
    }catch(err){toast("Could not decide",err.message,"bad")}
  });
}

/* ---------- create: shipment (manufacturer / distributor) ---------- */
async function newShipmentView(){
  const [dest,stock,meds]=await Promise.all([
    api("/api/shipping-destinations"),
    api("/api/my-stock"),
    api("/api/datasets/medicines"),
  ]);
  const destOpts=dest.destinations.map(o=>`<option value="${o.org_id}">${esc(o.name)} (${esc(typeLabel(o.org_type))})</option>`).join("")
    ||`<option value="">No other organization is listed</option>`;
  // Only batches the sender actually holds can be shipped. Each option names the
  // medicine as well as the batch, so the list reads as the manufacturer's own
  // catalogue rather than an opaque set of codes.
  const opts=stock.stock.map(s=>`<option value="${s.batch_id}">${esc(s.batch_code)} — ${esc(s.medicine||"")} — ${num(s.quantity_on_hand)} units</option>`).join("")
    ||`<option value="">You hold no stock to ship</option>`;
  const stockRows=stock.stock.map(s=>`<tr><td>${esc(s.medicine||"")}</td><td>${esc(s.batch_code)}</td><td>${num(s.quantity_on_hand)}</td></tr>`).join("");
  const stockTable=stockRows
    ? `<table class="tbl"><thead><tr><th>Medicine</th><th>Batch code</th><th>On hand</th></tr></thead><tbody>${stockRows}</tbody></table>`
    : `<p class="note">You hold no stock yet. Add a medicine and a batch first — the batch becomes stock you hold, ready to ship.</p>`;
  // The manufacturer's own medicines, so it is clear what they can produce.
  const medRows=meds.rows.map(r=>`<li>${esc(r[1])}${r[2]?` — ${esc(r[2])}`:""}${r[4]?` (${esc(r[4])})`:""}</li>`).join("");
  const medList=medRows?`<ul class="chain">${medRows}</ul>`:`<p class="note">You have not registered any medicine yet.</p>`;
  return `<div class="page"><div class="pagehead"><h2>New shipment</h2><p>Ship stock your organization holds to another organization. The sender is always your own organization, and only stock you actually hold can be shipped.</p></div>
 <form class="panel" id="shf" style="margin-top:16px"><div class="row"><div><label for="sh-b">Batch</label><select id="sh-b">${opts}</select></div><div><label for="sh-q">Quantity</label><input id="sh-q" type="number" value="1" min="1"></div><div><label for="sh-to">Ship to</label><select id="sh-to">${destOpts}</select></div><button class="btn" type="submit">Create shipment</button></div><div id="sh-r"></div><div id="sh-sql"></div></form>
 <div class="panel"><h3>Your stock on hand</h3>${stockTable}</div>
 <div class="panel"><h3>Your medicines</h3>${medList}</div></div>`;
}
async function createShipment(e){
  e.preventDefault();
  const box=$("#sh-r");box.innerHTML='<div class="res warn">Creating…</div>';$("#sh-sql").innerHTML="";
  try{
    const j=await api("/api/shipments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to_org_id:$("#sh-to").value,batch_id:$("#sh-b").value,quantity:$("#sh-q").value})});
    box.innerHTML=`<div class="res ok">Shipment #${j.shipment_id} created. Stock moved from your organization to the receiver.</div>`;
    $("#sh-sql").innerHTML=sqlBlock(j.sql,{open:false});
    toast("Shipment created",`#${j.shipment_id}`,"ok");
    META=await api("/api/meta");buildNav();
  }catch(err){box.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
}

/* ---------- create: medicine / batch (manufacturer) ---------- */
async function newMedicineView(){
  const meds=await api("/api/datasets/medicines");
  const opts=meds.rows.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join("")||`<option value="">No medicines yet</option>`;
  return `<div class="page"><div class="pagehead"><h2>Add a medicine or a batch</h2><p>Register a new product, or start a production run for one of your own medicines.</p></div>
 <form class="panel" id="medf" style="margin-top:16px"><h3>New medicine</h3><div class="row"><div><label for="m-n">Name</label><input id="m-n" placeholder="e.g. Azithromycin 250 mg"></div><div><label for="m-c">Composition</label><input id="m-c" placeholder="e.g. Azithromycin"></div><div><label for="m-d">Dosage form</label><input id="m-d" placeholder="e.g. Tablet"></div><div><label for="m-s">Strength</label><input id="m-s" placeholder="e.g. 250 mg"></div><button class="btn" type="submit">Add medicine</button></div><div id="med-r"></div><div id="med-sql"></div></form>
 <form class="panel" id="batf"><h3>New batch</h3><div class="row"><div><label for="b-c">Batch code</label><input id="b-c" placeholder="e.g. AZT-2026-D01"></div><div><label for="b-m">Medicine</label><select id="b-m">${opts}</select></div><div><label for="b-mf">Made on</label><input id="b-mf" type="date"></div><div><label for="b-ex">Expires</label><input id="b-ex" type="date"></div><div><label for="b-q">Quantity</label><input id="b-q" type="number" value="1000" min="1"></div><button class="btn" type="submit">Add batch</button></div><p class="note">A new batch starts as <b>genuine</b>. You can only add batches for your own medicines.</p><div id="bat-r"></div><div id="bat-sql"></div></form></div>`;
}
function wireNewMedicine(){
  // Re-read the medicine list into the batch form's dropdown so a newly added
  // medicine can be picked straight away, without leaving the page.
  const refreshMedicineOptions=async()=>{
    const sel=$("#b-m");if(!sel)return;
    const meds=await api("/api/datasets/medicines");
    sel.innerHTML=meds.rows.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join("")
      ||`<option value="">No medicines yet</option>`;
  };
  $("#medf").onsubmit=async e=>{
    e.preventDefault();
    const box=$("#med-r");box.innerHTML='<div class="res warn">Saving…</div>';$("#med-sql").innerHTML="";
    try{
      const j=await api("/api/medicines",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$("#m-n").value,composition:$("#m-c").value,dosage_form:$("#m-d").value,strength:$("#m-s").value})});
      box.innerHTML=`<div class="res ok">Medicine #${j.medicine_id} added. It is now in the batch list below.</div>`;
      $("#med-sql").innerHTML=sqlBlock(j.sql,{open:false});
      $("#medf").reset();
      await refreshMedicineOptions();
      META=await api("/api/meta");buildNav();
      toast("Medicine added",`#${j.medicine_id}`,"ok");
    }catch(err){box.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
  };
  $("#batf").onsubmit=async e=>{
    e.preventDefault();
    const box=$("#bat-r");box.innerHTML='<div class="res warn">Saving…</div>';$("#bat-sql").innerHTML="";
    try{
      const j=await api("/api/batches",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batch_code:$("#b-c").value,medicine_id:$("#b-m").value,mfg_date:$("#b-mf").value,expiry_date:$("#b-ex").value,quantity:$("#b-q").value})});
      box.innerHTML=`<div class="res ok">Batch #${j.batch_id} added and marked genuine. The quantity is now stock you hold, ready to ship.</div>`;
      $("#bat-sql").innerHTML=sqlBlock(j.sql,{open:false});
      $("#batf").reset();
      META=await api("/api/meta");buildNav();
      toast("Batch added",`#${j.batch_id} — stock on hand`,"ok");
    }catch(err){box.innerHTML=`<div class="res bad">${esc(err.message)}</div>`}
  };
}

/* ---------- record a sale (pharmacy) ---------- */
async function recordSaleView(){
  const stock=await api("/api/my-stock");
  // Only stock the pharmacy actually holds can be sold.
  const bOpts=stock.stock.map(s=>`<option value="${s.batch_id}">${esc(s.batch_code)} — ${esc(s.medicine||"")} — ${num(s.quantity_on_hand)} units</option>`).join("")
    ||`<option value="">You hold no stock to sell</option>`;
  return `<div class="page"><div class="pagehead"><h2>Record a sale</h2><p>Sell stock you hold to a customer. The safety rule runs inside the database: a recalled, fake or expired batch is rejected, and stock must be on hand.</p></div>
 <form class="panel" id="rsf" style="margin-top:16px"><div class="row"><div><label for="rs-cn">Customer name</label><input id="rs-cn" placeholder="e.g. Rohan Mehta"></div><div><label for="rs-ce">Customer email</label><input id="rs-ce" type="email" placeholder="name@gmail.com"></div><div><label for="rs-cp">Customer phone</label><input id="rs-cp" placeholder="e.g. 9810011111"></div></div>
  <div class="row" style="margin-top:8px"><div><label for="rs-b">Batch</label><select id="rs-b">${bOpts}</select></div><div><label for="rs-q">Quantity</label><input id="rs-q" type="number" value="1" min="1"></div><div><label for="rs-p">Unit price</label><input id="rs-p" type="number" value="30" min="0" step="0.01"></div><button class="btn" type="submit">Record sale</button></div>
  <p class="note">Enter the customer's name, and their email and phone if you have them. A repeat email reuses the existing customer record.</p><div id="rs-r"></div><div id="rs-sql"></div></form></div>`;
}
async function recordSale(e){
  e.preventDefault();
  const box=$("#rs-r");box.innerHTML='<div class="res warn">Recording…</div>';$("#rs-sql").innerHTML="";
  const body={items:[{batch_id:$("#rs-b").value,quantity:$("#rs-q").value,unit_price:$("#rs-p").value}]};
  body.customer_name=$("#rs-cn").value.trim();
  body.customer_email=$("#rs-ce").value.trim();
  body.customer_phone=$("#rs-cp").value.trim();
  if(body.customer_name.length<2){box.innerHTML=`<div class="res bad">Enter the customer name.</div>`;$("#rs-cn").focus();return}
  try{
    const j=await api("/api/sales",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(j.blocked){box.innerHTML=`<div class="res bad">BLOCKED — ${esc(j.message)}</div>`;}
    else box.innerHTML=`<div class="res ok">Sale #${j.sale_id} recorded, total ${money(j.total)}.</div>`;
    $("#rs-sql").innerHTML=sqlBlock(j.sql,{open:false,trigger:j.trigger,error:j.error});
    toast(j.blocked?"Sale blocked":"Sale recorded",j.blocked?j.message:"Stock reduced",j.blocked?"bad":"ok");
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
  <div class="pagehead"><h2>Database schema</h2><p>Every table, key, view and trigger this system uses, with the relationships between them.</p></div>

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
  <div class="pagehead"><h2>Reports</h2><p>Ready-made reports. Pick one and press <b>Run report</b> to see its results. The query behind each report is available under <b>View query</b>.</p></div>
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
    // Keep the SQL collapsed behind its own disclosure, never printed inline.
    sqlbox.innerHTML=`<div class="sqlwrap"><details class="sql"><summary>Show the database query behind this<span class="meta">${j.columns.length} columns · ${j.rows.length} row${j.rows.length===1?"":"s"} returned</span></summary><div class="body"><div class="stmt"><pre>${hl(j.sql)}</pre></div></div></details></div>`;
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

/* ---------- live database watch ---------- */
// Reflect changes made to MySQL by anyone — this site, MySQL Workbench, the
// mysql CLI — without a manual reload. The server fingerprints the tables and
// pushes a Server-Sent Event when they change; we then re-read what is on screen.
const FRESHEN={batches:["shipments","shipment_items","inventory","sale_items","recalls","verification_scans","audit_log"],medicines:["batches"],organizations:["medicines","batches","shipments","inventory","sales","recalls","audit_log"]};
let liveSrc=null,liveTimer=null,liveDebounce=null,refreshing=false,liveDown=false;

function setLiveState(state,label){
  const dot=$("#livedot");if(!dot)return;
  dot.className="dot "+(state==="live"?"live":state==="down"?"down":"stale");
  if(label)$("#livetext").textContent=label;
  if(state==="live"){dot.classList.add("beat");setTimeout(()=>dot.classList.remove("beat"),1400)}
}
function flashView(){const v=$("#view");if(!v||matchMedia("(prefers-reduced-motion: reduce)").matches)return;v.classList.add("dbflash");setTimeout(()=>v.classList.remove("dbflash"),1400)}

// Does a change to these tables affect what is currently on screen?
function affectsCurrent(changed){
  if(!changed||!changed.length)return true; // unknown → refresh to be safe
  const set=new Set(changed);
  if(cur.startsWith("_"))return true;        // dashboard / schema / reports read many tables
  if(set.has(cur))return true;
  return (FRESHEN[cur]||[]).some(t=>set.has(t));
}
// Views that hold a result the user is reading (a verdict, a trace, a sale
// outcome). A live update must not re-render these, or it would wipe what the
// user is looking at. The account-request queue is deliberately NOT here, so a
// new application appears on the regulator's screen in real time.
const STATEFUL_VIEWS=new Set(["_verify","_trace","_ctrace","_sale","_recall","_newship","_newmed","_newsale"]);

// Re-read the current view in place, keeping the user's place on the page.
async function liveRefresh(changed){
  if(refreshing)return;
  refreshing=true;
  try{
    META=await api("/api/meta");
    buildNav();
    await loadNotifications();
    const top=mainEl.scrollTop;
    // The customer overview has its own inline verify result; treat it like the
    // other workflow views so a live update cannot wipe what the user is reading.
    if(STATEFUL_VIEWS.has(cur)||(cur==="_home"&&user.role==="customer")){
      // Keep the on-screen form and result exactly as they are; only the sidebar
      // counts and notifications were refreshed above.
      return;
    }
    if(cur.startsWith("_")){
      await go(cur);
    }else{
      await drawTable();          // keeps search, sort and page as they are
    }
    mainEl.scrollTop=top;
    flashView();
  }catch(err){
    // The change is already in the notification centre; nothing more to do.
  }finally{refreshing=false}
}
function onDbChange(changed){
  if(!user)return;              // never act on changes while signed out
  setLiveState("live");
  // Every change goes to the notification centre, whether or not it touches the
  // view on screen. Only the re-read is conditional on relevance.
  logChangeEvent(changed);
  if(!affectsCurrent(changed))return;
  clearTimeout(liveDebounce);
  liveDebounce=setTimeout(()=>liveRefresh(changed),300);
}
// Close the live connection on sign-out so it does not keep polling or push
// "sign in to continue" errors onto the login screen.
function stopLive(){
  if(liveSrc){try{liveSrc.close()}catch{}liveSrc=null}
  if(liveTimer){clearInterval(liveTimer);liveTimer=null}
  if(liveDebounce){clearTimeout(liveDebounce);liveDebounce=null}
  lastTables=null;liveDown=false;
}

function startLive(){
  if(!window.EventSource){startLivePolling();return}
  try{
    liveSrc=new EventSource("/api/changes/stream");
    liveSrc.addEventListener("open",()=>{liveDown=false;setLiveState("live")});
    liveSrc.addEventListener("change",e=>{let d={};try{d=JSON.parse(e.data)}catch{};onDbChange(d.changed||[])});
    liveSrc.addEventListener("error",()=>{
      if(liveSrc&&liveSrc.readyState===EventSource.CLOSED){liveDown=true;setLiveState("down","Reconnecting…");startLivePolling()}
    });
  }catch{startLivePolling()}
}
// Fallback for browsers or proxies without SSE: poll the status endpoint.
let lastTables=null;
function startLivePolling(){
  if(liveTimer)return;
  const tick=async()=>{
    try{
      const s=await api("/api/changes/status");
      if(lastTables){
        const changed=Object.keys(s.tables).filter(k=>lastTables[k]!==s.tables[k]);
        if(changed.length){liveDown=false;setLiveState("live");onDbChange(changed)}
      }
      lastTables=s.tables;
      if(!liveDown)setLiveState("live");
    }catch{setLiveState("down","Database unreachable")}
  };
  tick();
  liveTimer=setInterval(tick,2000);
}

// On load: prepare the public forms, then try to restore a previous session so
// a page refresh does not sign the user out.
(async()=>{
  loadOrgs();
  let token=null;
  try{token=localStorage.getItem("mt-token")}catch{}
  if(!token){showTab("signin");return}
  try{
    const j=await api("/api/session");
    user=j.user;
    await boot();
  }catch(err){
    // An expired or invalid token must not leave the app half-loaded: drop it
    // and show the sign-in form with a clear reason.
    clearSession();
    user=null;
    $("#app").classList.add("hide");
    $("#login").classList.remove("hide");
    showTab("signin");
    if(err.status===401)liEr.textContent="Your session has expired. Please sign in again.";
  }
})();
