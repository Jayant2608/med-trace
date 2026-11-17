====================================================================================================
FILE: public/index.html
====================================================================================================
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>MedTrace – Medicine Traceability System</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="/vendor/chart.umd.min.js" defer></script>
<style>
:root{--bg:#edf2f3;--panel:#fff;--panel2:#f7fafb;--ink:#14262d;--mute:#5d7078;--line:#d5dfe2;--brand:#0b6b63;--brandink:#fff;--side:#0d2b30;--sideink:#c9dde0;--ok:#157347;--okbg:#dff3e7;--bad:#b42318;--badbg:#fde4e1;--warn:#9a5b00;--warnbg:#fdf0d5;--info:#2a5d9f;--infobg:#e1ecfa;--code-bg:#f4f8f9;--code-ink:#14262d;--bgdot:#9fb6bb;--glowA:#0b6b6326;--glowB:#2a5d9f1e;--glowC:#1573471c;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0b1a1e;--panel:#12272c;--panel2:#0f2227;--ink:#e3eef0;--mute:#8fa8ae;--line:#254147;--brand:#3fb5a8;--brandink:#06201d;--side:#07161a;--sideink:#a9c3c8;--ok:#6fd49a;--okbg:#12362a;--bad:#ff9b92;--badbg:#411a17;--warn:#f0c26a;--warnbg:#3a2c0d;--info:#8db9f2;--infobg:#142c4a;--code-bg:#0a1d21;--code-ink:#cfe3e6;--bgdot:#2c4a51;--glowA:#3fb5a833;--glowB:#8db9f226;--glowC:#6fd49a22;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0b1a1e;--panel:#12272c;--panel2:#0f2227;--ink:#e3eef0;--mute:#8fa8ae;--line:#254147;--brand:#3fb5a8;--brandink:#06201d;--side:#07161a;--sideink:#a9c3c8;--ok:#6fd49a;--okbg:#12362a;--bad:#ff9b92;--badbg:#411a17;--warn:#f0c26a;--warnbg:#3a2c0d;--info:#8db9f2;--infobg:#142c4a;--code-bg:#0a1d21;--code-ink:#cfe3e6;--bgdot:#2c4a51;--glowA:#3fb5a833;--glowB:#8db9f226;--glowC:#6fd49a22;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif}

/* ---------- ambient background ---------- */
/* Two fixed layers sit behind everything: a faint molecule/dot grid and a few soft
   colour glows tied to the brand palette. Both read theme vars so they follow the
   light/dark switch, and both are pointer-events:none so they never block the UI. */
body:before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:radial-gradient(var(--bgdot) 1px,transparent 1px),radial-gradient(var(--bgdot) 1px,transparent 1px);
  background-size:26px 26px,26px 26px;background-position:0 0,13px 13px;opacity:.28}
body:after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(620px 420px at 12% 8%,var(--glowA),transparent 70%),
    radial-gradient(560px 460px at 92% 18%,var(--glowB),transparent 72%),
    radial-gradient(700px 520px at 70% 96%,var(--glowC),transparent 74%)}
#login,#app{position:relative;z-index:1}
@media (prefers-reduced-motion:no-preference){
  body:after{animation:drift 26s ease-in-out infinite alternate}
  @keyframes drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(-2.5%,-2%,0)}}
}
.hero{position:relative;overflow:hidden}
.hero:before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(#ffffff1f 1px,transparent 1px);background-size:22px 22px;opacity:.6}
.hero>*{position:relative;z-index:1}
button,input,select,textarea{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.hide{display:none!important}
.mono{font-family:"JetBrains Mono",monospace}

/* ---------- login ---------- */
#login{min-height:100vh;display:grid;grid-template-columns:1.05fr 1fr}
.hero{background:var(--side);color:var(--sideink);padding:56px 48px;display:flex;flex-direction:column;justify-content:space-between;gap:32px}
.hero h1{margin:0 0 12px;font-size:38px;line-height:1.15;color:#fff;font-weight:600;max-width:15ch}
.hero p{margin:0;max-width:44ch}
.hero .pts{list-style:none;margin:22px 0 0;padding:0;display:flex;flex-direction:column;gap:9px;font-size:13.5px}
.hero .pts li{padding-left:22px;position:relative;color:#c9dde0}
.hero .pts li:before{content:"✓";position:absolute;left:0;color:#3fb5a8;font-weight:700}
.formwrap{display:flex;align-items:center;justify-content:center;padding:32px}
.loginright{display:flex;flex-direction:column;justify-content:center;gap:18px;padding:32px 32px 40px;overflow:auto}
.pubverify{width:100%;max-width:440px;margin:0 auto}
.pubverify .card{padding:20px 22px}
.pubverify .row{display:flex;gap:10px;align-items:flex-end}
.pubverify .row label{margin-top:0}
.pvres{margin-top:14px;border-radius:8px;padding:14px 16px;font-size:14px;border:1px solid var(--line)}
.pvres.ok{background:color-mix(in srgb,var(--ok) 10%,transparent);border-color:color-mix(in srgb,var(--ok) 40%,transparent)}
.pvres.warn{background:color-mix(in srgb,var(--warn) 12%,transparent);border-color:color-mix(in srgb,var(--warn) 42%,transparent)}
.pvres.bad{background:color-mix(in srgb,var(--bad) 10%,transparent);border-color:color-mix(in srgb,var(--bad) 40%,transparent)}
.pvres b{display:block;font-size:15px;margin-bottom:4px}
.pvres dl{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin:8px 0 0;font-size:13px}
.pvres dt{color:var(--mute)}
.pvres dd{margin:0;text-align:right}
.demobtns{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.demobtns .btn{flex:1 1 40%}
.muted{color:var(--mute);font-weight:400}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:28px;width:100%;max-width:440px}
.card h2{margin:0 0 4px;font-size:22px}
.card p.sub{margin:0 0 20px;color:var(--mute)}
label{display:block;font-weight:500;margin:14px 0 4px;font-size:14px}
input,select,textarea{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg)}
.pw{position:relative}
.pw input{padding-right:64px}
.pw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:var(--brand);font-size:12.5px;font-weight:600;cursor:pointer;padding:6px}
.authcard{padding:22px 24px 20px}
.authtabs{display:flex;gap:4px;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:4px;margin-bottom:20px}
.authtabs button{flex:1;background:none;border:0;padding:9px;border-radius:6px;font-weight:600;font-size:13.5px;color:var(--mute);cursor:pointer}
.authtabs button:hover{color:var(--ink)}
.authtabs button.on{background:var(--panel);color:var(--brand);box-shadow:0 1px 3px #0002}
.btn{background:var(--brand);color:var(--brandink);border:0;border-radius:6px;padding:11px 16px;font-weight:600;cursor:pointer}
.btn.full{width:100%;margin-top:22px}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.btn.ghost:hover{border-color:var(--brand);color:var(--brand)}
.btn.sm{padding:7px 12px;font-size:13px}
.btn:disabled{opacity:.5;cursor:not-allowed}
.err{color:var(--bad);font-size:14px;margin-top:10px;min-height:20px}
.note{color:var(--mute);font-size:13px;margin-top:14px}
.lfoot{margin-top:20px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;font-size:12px;color:var(--mute);flex-wrap:wrap}
.split{display:flex;align-items:center;gap:12px;margin-top:18px;color:var(--mute);font-size:12.5px}
.split:before,.split:after{content:"";height:1px;background:var(--line);flex:1}

/* ---------- illustrations ---------- */
/* Inline SVGs: no network, crisp at any size, and they inherit theme colours. */
.illus{width:100%;height:auto;display:block}
.illus .ln{stroke:var(--line);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.illus .lnb{stroke:var(--brand);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.illus .lnk{stroke:var(--ok);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.illus .lnw{stroke:var(--warn);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.illus .fillb{fill:var(--brand);opacity:.16}
.illus .fillk{fill:var(--ok);opacity:.16}
.illus .node{fill:var(--panel);stroke:var(--line);stroke-width:2}
.illus .dot{fill:var(--brand)}
.illus .lbl{fill:var(--mute);font:500 11px "Plus Jakarta Sans",sans-serif}
.illus .dash{stroke:var(--brand);stroke-width:2;stroke-dasharray:5 6;fill:none;stroke-linecap:round}
@media (prefers-reduced-motion:no-preference){
  .illus .flow{stroke-dasharray:6 8;animation:flow 1.6s linear infinite}
  @keyframes flow{to{stroke-dashoffset:-28}}
  .illus .pulse{transform-origin:center;animation:pulse 2.6s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}
}
.herocopy{max-width:640px}
.stage{background:#07161a99;border:1px solid #ffffff1f;border-radius:14px;padding:14px 14px 8px;max-width:520px}
.stage figcaption{color:#9fc0c6;font-size:12px;padding:2px 4px 6px}
/* The hero panel is always dark, so pin bright colours there instead of theme vars. */
.stage .ln{stroke:#8fb3b9}
.stage .lnb{stroke:#3fb5a8}
.stage .lnk{stroke:#6fd49a}
.stage .node{fill:#0d2b30;stroke:#3f6b70}
.stage .fillb{fill:#3fb5a8;opacity:.22}
.stage .fillk{fill:#6fd49a;opacity:.22}
.stage .lbl{fill:#9fc0c6}
.stage .dash{stroke:#3fb5a8}

/* ---------- app shell ---------- */
#app{display:grid;grid-template-columns:264px 1fr;height:100vh;height:100dvh;overflow:hidden}
aside{background:var(--side);color:var(--sideink);display:flex;flex-direction:column;height:100vh;height:100dvh;overflow:hidden;border-right:1px solid #ffffff12}
.sidehead{padding:18px 16px 14px;border-bottom:1px solid #ffffff14}
.brand{display:flex;align-items:center;gap:10px}
.brand .logo{width:34px;height:34px;border-radius:9px;background:var(--brand);color:var(--brandink);display:grid;place-items:center;font-weight:700;font-size:13px;flex:none}
.brand strong{display:block;color:#fff;font-size:15px;line-height:1.15}
.brand small{color:#7fa0a6;font-size:11.5px}
aside .who{margin-top:13px;font-size:12.5px;line-height:1.5;color:var(--sideink)}
aside .who b{color:#fff;font-weight:600}
.sidenav{flex:1;overflow-y:auto;padding:10px 10px 16px;scrollbar-width:thin}
aside .grp{margin:14px 8px 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#7fa0a6}
aside button{display:flex;justify-content:space-between;gap:8px;align-items:center;width:100%;text-align:left;background:none;border:0;color:inherit;padding:8px;border-radius:6px;cursor:pointer;font-size:13.5px}
aside button:hover{background:#ffffff14}
aside button.on{background:var(--brand);color:var(--brandink);font-weight:600}
aside button span{opacity:.7;font-size:11.5px}
.sidefoot{padding:12px 14px;border-top:1px solid #ffffff14;display:flex;flex-direction:column;gap:9px}
.dbstatus{display:flex;align-items:center;gap:7px;font-size:11.5px;color:#8fb0b6}
.dbstatus .dot{width:7px;height:7px;border-radius:50%;background:#5fd39a;box-shadow:0 0 0 3px #5fd39a26;flex:none}
.dbstatus .dot.live{background:#5fd39a;box-shadow:0 0 0 3px #5fd39a26}
.dbstatus .dot.live.beat{animation:beat 1.4s ease-out}
.dbstatus .dot.stale{background:#e0b34d;box-shadow:0 0 0 3px #e0b34d26}
.dbstatus .dot.down{background:#e06a5f;box-shadow:0 0 0 3px #e06a5f26}
@keyframes beat{from{box-shadow:0 0 0 3px #5fd39a59}to{box-shadow:0 0 0 3px #5fd39a26}}
.dbflash{animation:dbflash 1.4s ease-out}
@keyframes dbflash{from{background:color-mix(in srgb,var(--ok) 14%,transparent)}}
@media (prefers-reduced-motion:reduce){.dbstatus .dot.live.beat,.dbflash{animation:none}}
.sidebtns{display:flex;gap:8px}
.sidebtns .btn{flex:1;justify-content:center;padding:8px;font-size:12.5px;color:inherit;border-color:#ffffff33}
.sidebtns a.btn{display:flex;align-items:center;text-decoration:none}
main{overflow:auto;height:100vh;height:100dvh;min-width:0;scroll-behavior:smooth}
.page{padding:0 32px 56px;max-width:1440px}

/* ---------- global header ---------- */
.ghead{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;padding:12px 32px;margin:0 0 22px;background:var(--panel);border-bottom:1px solid var(--line);flex-wrap:wrap}
.crumbs{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mute);white-space:nowrap}
.crumbs b{color:var(--ink);font-weight:600}
.crumbs .sep{opacity:.45}
.gsearch{position:relative;flex:1;max-width:440px;min-width:180px}
.gsearch input{background:var(--bg);padding-left:34px}
.gsearch:before{content:"⌕";position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--mute);font-size:16px;z-index:1}
.gres{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;box-shadow:0 14px 40px #0003;max-height:400px;overflow:auto;z-index:40}
.gres .hit{display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:10px 14px;cursor:pointer}
.gres .hit:hover{background:var(--panel2)}
.gres .hit small{display:block;color:var(--mute);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em}
.gres .hit b{font-weight:500;font-size:13.5px}
.gres .none{padding:16px;color:var(--mute);font-size:13.5px}
.gright{margin-left:auto;display:flex;align-items:center;gap:10px}
.iconbtn{position:relative;width:38px;height:38px;border-radius:8px;border:1px solid var(--line);background:var(--bg);cursor:pointer;display:grid;place-items:center;font-size:15px}
.iconbtn:hover{border-color:var(--brand)}
.iconbtn .badge{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;border-radius:9px;background:var(--bad);color:#fff;font-size:10.5px;font-weight:700;display:grid;place-items:center;padding:0 4px}
.avatar{display:flex;align-items:center;gap:9px;background:none;border:1px solid var(--line);border-radius:30px;padding:4px 12px 4px 4px;cursor:pointer}
.avatar:hover{border-color:var(--brand)}
.avatar .ini{width:30px;height:30px;border-radius:50%;background:var(--brand);color:var(--brandink);display:grid;place-items:center;font-weight:700;font-size:12.5px;flex:none}
.avatar span{font-size:13px;font-weight:500;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.menu{position:absolute;top:calc(100% + 8px);right:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;box-shadow:0 14px 40px #0003;min-width:230px;padding:6px;z-index:40}
.menu .hdr{padding:10px 12px;border-bottom:1px solid var(--line);margin-bottom:6px}
.menu .hdr b{display:block;font-size:13.5px}
.menu .hdr small{color:var(--mute);font-size:12px}
.menu button{display:block;width:100%;text-align:left;background:none;border:0;padding:9px 12px;border-radius:6px;cursor:pointer;font-size:13.5px}
.menu button:hover{background:var(--panel2)}
.pop{position:absolute;top:calc(100% + 8px);right:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;box-shadow:0 14px 40px #0003;width:330px;max-height:420px;overflow:auto;z-index:40}
.pop h4{margin:0;padding:12px 14px;border-bottom:1px solid var(--line);font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--mute)}
.pop .nhead{padding:9px 14px 5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--mute)}
.pop .item{padding:11px 14px;border-bottom:1px solid var(--line);font-size:13px;display:flex;gap:10px;align-items:flex-start}
.pop .item:last-child{border-bottom:0}
.pop .item .ic{flex:none;font-size:15px;line-height:1.3}
.pop .item.bad{background:color-mix(in srgb,var(--bad) 7%,transparent)}
.pop .item.warn{background:color-mix(in srgb,var(--warn) 7%,transparent)}
.pop .item.empty{color:var(--mute);display:block}
.pop .item .t{color:var(--mute);font-size:11.5px;white-space:nowrap;margin-left:auto}
.iconbtn.hasnotes{color:var(--brand)}
.rel{position:relative}
.pagehead h2{margin:0;font-size:23px}
.pagehead p{margin:4px 0 0;color:var(--mute);max-width:78ch}
.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.tools input{width:230px}
.chip{font-size:12px;color:var(--mute);border:1px solid var(--line);border-radius:20px;padding:5px 11px;background:var(--bg);white-space:nowrap}

/* ---------- tables ---------- */
.tw{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:auto;max-height:calc(100vh - 320px)}
table{border-collapse:separate;border-spacing:0;width:100%;min-width:620px}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line);white-space:nowrap}
th{position:sticky;top:0;z-index:2;font-weight:600;color:var(--mute);font-size:12.5px;cursor:pointer;user-select:none;background:var(--bg);box-shadow:inset 0 -1px 0 var(--line)}
th:hover{color:var(--brand)}
tbody tr:nth-child(even){background:var(--panel2)}
tbody tr:hover{background:var(--infobg)}
td.r,th.r{text-align:right;font-variant-numeric:tabular-nums}
tr:last-child td{border-bottom:0}
td.id{color:var(--mute);font-variant-numeric:tabular-nums}
td.code{font-family:"JetBrains Mono",monospace}
td.money{font-variant-numeric:tabular-nums}
.pager{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:10px 14px;border-top:1px solid var(--line);background:var(--panel);flex-wrap:wrap;font-size:13px;color:var(--mute)}
.pager .pgs{display:flex;gap:6px;align-items:center}
.pager button{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12.5px}
.pager button:hover:not(:disabled){border-color:var(--brand);color:var(--brand)}
.pager button:disabled{opacity:.4;cursor:default}
.pager select{width:auto;padding:5px 8px}
.skel{padding:0}
.skel .r{height:42px;display:flex;gap:14px;align-items:center;padding:0 14px;border-bottom:1px solid var(--line)}
.skel .r i{height:11px;border-radius:5px;background:linear-gradient(90deg,var(--line) 25%,var(--panel2) 50%,var(--line) 75%);background-size:200% 100%;animation:sh 1.2s infinite;display:block}
@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
.empty{padding:34px;color:var(--mute);text-align:center}
.empty b{display:block;color:var(--ink);margin-bottom:4px}

/* ---------- badges / cards ---------- */
.b{display:inline-block;padding:2px 9px;border-radius:20px;font-size:12.5px;font-weight:600}
.b.ok{background:var(--okbg);color:var(--ok)}.b.bad{background:var(--badbg);color:var(--bad)}.b.warn{background:var(--warnbg);color:var(--warn)}.b.info{background:var(--infobg);color:var(--info)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:22px;margin-bottom:16px}
.panel h3{margin:0 0 14px;font-size:15px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
.row>div{flex:1;min-width:220px}
.row .btn{margin-bottom:0}
.res{margin-top:16px;padding:16px;border-radius:8px;font-weight:500}
.res.ok{background:var(--okbg);color:var(--ok)}.res.bad{background:var(--badbg);color:var(--bad)}.res.warn{background:var(--warnbg);color:var(--warn)}
.chain{list-style:none;margin:0;padding:0}
.chain li{padding:8px 0 8px 22px;border-left:2px solid var(--line);position:relative;margin-left:6px}
.chain li:before{content:"";position:absolute;left:-6px;top:15px;width:10px;height:10px;border-radius:50%;background:var(--brand)}
.chain h4{margin:14px 0 2px;font-size:14px;color:var(--mute);font-weight:600}
.loading{padding:28px;color:var(--mute)}

/* ---------- dashboard ---------- */
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:18px}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px 18px;text-align:left;cursor:pointer;font:inherit;color:inherit}
.kpi:hover{border-color:var(--brand)}
.kpi .lbl{color:var(--mute);font-size:12.5px;text-transform:uppercase;letter-spacing:.04em}
.kpi .val{font-size:30px;font-weight:600;line-height:1.15;margin-top:6px;font-variant-numeric:tabular-nums}
.kpi .sub{font-size:12.5px;color:var(--mute);margin-top:2px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.grid2>.panel{margin-bottom:0}
.vlayout{display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start}
.vlayout>.panel{margin-top:16px}
.sideillus{text-align:center}
dl.kv{display:grid;grid-template-columns:auto 1fr;gap:10px 16px;margin:0;font-size:13.5px}
dl.kv dt{color:var(--mute)}
dl.kv dd{margin:0}
@media (max-width:960px){.vlayout{grid-template-columns:1fr}}
.chartbox{position:relative;height:260px}

/* ---------- dashboard GUI: quick actions + journey pipeline ---------- */
.quick{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-bottom:16px}
.qaction{display:flex;align-items:center;gap:13px;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px;cursor:pointer;font:inherit;color:inherit}
.qaction:hover{border-color:var(--brand);transform:translateY(-1px);box-shadow:0 6px 18px #0001}
.qaction .qaic{width:40px;height:40px;flex:none;border-radius:10px;background:var(--brand);color:var(--brandink);display:grid;place-items:center;font-size:18px}
.qaction.alt .qaic{background:var(--info)}
.qaction.warn .qaic{background:var(--warn)}
.qaction b{display:block;font-size:14px}
.qaction small{color:var(--mute);font-size:12.5px}
.pipe{display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;padding:4px 0 2px}
.pstep{flex:1;min-width:132px;text-align:center;position:relative}
.pstep .pdot{width:46px;height:46px;margin:0 auto;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:15px;background:var(--panel2);border:2px solid var(--line);color:var(--ink);font-variant-numeric:tabular-nums}
.pstep.done .pdot{background:var(--okbg);border-color:var(--ok);color:var(--ok)}
.pstep.warn .pdot{background:var(--warnbg);border-color:var(--warn);color:var(--warn)}
.pstep b{display:block;margin-top:8px;font-size:12.5px}
.pstep small{color:var(--mute);font-size:11.5px}
.pstep:not(:last-child):after{content:"";position:absolute;top:23px;left:calc(50% + 30px);width:calc(100% - 60px);height:2px;background:var(--line)}
.pstep.done:not(:last-child):after{background:var(--ok)}

.feed{list-style:none;margin:0;padding:0;max-height:290px;overflow:auto}
.feed li{padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px;display:flex;gap:10px;align-items:center}
.feed li:last-child{border-bottom:0}
.feed .when{color:var(--mute);font-size:12px;margin-left:auto;white-space:nowrap}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px}
.stat{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.stat b{font-size:26px;display:block}.stat span{color:var(--mute);font-size:13px}

/* ---------- SQL panel ---------- */
.sqlwrap{margin-top:16px}
.sqlwrap details{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.sqlwrap summary{cursor:pointer;padding:12px 16px;font-weight:600;font-size:13.5px;display:flex;align-items:center;gap:9px;list-style:none}
.sqlwrap summary::-webkit-details-marker{display:none}
.sqlwrap summary:before{content:"▸";color:var(--brand);font-size:12px}
.sqlwrap details[open] summary:before{content:"▾"}
.sqlwrap summary .meta{margin-left:auto;color:var(--mute);font-weight:400;font-size:12px}
.sqlwrap .body{padding:0 16px 16px}
.sqlwrap .stmt{margin-top:12px}
.sqlwrap .stmt .lbl{font-size:12px;color:var(--mute);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;display:flex;justify-content:space-between;gap:8px}
.sqlwrap pre{margin:0;background:var(--code-bg);color:var(--code-ink);border-radius:8px;padding:13px 15px;overflow:auto;font:400 12.5px/1.6 "JetBrains Mono",monospace;white-space:pre-wrap;word-break:break-word}
.sqlwrap pre .kw{color:var(--brand);font-weight:600}
.sqlwrap pre .str{color:var(--warn)}
.sqlwrap pre .num{color:var(--info)}
.sqlwrap .errline{background:var(--badbg);color:var(--bad);border-radius:8px;padding:10px 13px;font:400 12.5px/1.6 "JetBrains Mono",monospace;margin-top:10px}
.sqlhint{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--mute);margin-top:14px;cursor:pointer;background:none;border:0;padding:0}
.sqlhint:hover{color:var(--brand)}

/* ---------- database schema page ---------- */
.schematop{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;margin-bottom:16px}
.erd{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px}
.erd .bar{display:flex;align-items:center;gap:10px}
.erd .bar h3{margin:0;font-size:15px}
.erd .bar .sp{margin-left:auto;display:flex;gap:8px}
.erd .frame{background:var(--panel2);border:1px solid var(--line);border-radius:8px;overflow:auto;max-height:520px;text-align:center;padding:10px}
.erd .frame img{max-width:100%;height:auto;border-radius:4px;background:#fff}
.erd .frame img.zoom{max-width:none;cursor:zoom-out}
.erd .frame img:not(.zoom){cursor:zoom-in}
.sidefacts{display:flex;flex-direction:column;gap:16px}
.fact{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px}
.fact h3{margin:0 0 12px;font-size:14px}
.fact dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:13px}
.fact dt{color:var(--mute)}
.fact dd{margin:0;text-align:right;font-variant-numeric:tabular-nums}
.sectitle{display:flex;align-items:baseline;gap:10px;margin:26px 0 12px}
.sectitle h3{margin:0;font-size:16px}
.sectitle p{margin:0;color:var(--mute);font-size:13px}
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
.tcard{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;scroll-margin-top:20px}
.tcard.hl{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 22%,transparent)}
.tcard .hd{padding:12px 15px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:9px;background:var(--panel2)}
.tcard .hd .nm{font-family:"JetBrains Mono",monospace;font-weight:600;font-size:14px}
.tcard .hd .cnt{margin-left:auto;color:var(--mute);font-size:12px;white-space:nowrap}
.tcard .pur{padding:11px 15px 0;color:var(--mute);font-size:12.5px;line-height:1.45}
.tcard .cols{padding:8px 15px 13px;display:flex;flex-direction:column}
.tcard .c{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--line);font-size:12.5px}
.tcard .c:last-child{border-bottom:0}
.tcard .c .n{font-family:"JetBrains Mono",monospace}
.tcard .c .t{margin-left:auto;color:var(--mute);font-family:"JetBrains Mono",monospace;font-size:11.5px;text-align:right}
.kb{font-size:9.5px;font-weight:700;letter-spacing:.03em;padding:1px 5px;border-radius:4px;border:1px solid transparent;white-space:nowrap}
.kb.pk{background:var(--warnbg);color:var(--warn);border-color:var(--warn)}
.kb.fk{background:var(--infobg);color:var(--info);border-color:var(--info)}
.kb.uq{background:var(--okbg);color:var(--ok);border-color:var(--ok)}
.kb.nn{background:var(--panel2);color:var(--mute);border-color:var(--line)}
.tcard .rel{padding:10px 15px;border-top:1px solid var(--line);background:var(--panel2);font-size:11.5px;color:var(--mute);line-height:1.5}
.tcard .rel b{color:var(--ink);font-weight:600}
.tcard .ddlbtn{width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;padding:9px 15px;font-size:12px;color:var(--brand);cursor:pointer;font-weight:600}
.tcard .ddlbtn:hover{background:var(--panel2)}
.tcard .ddl{display:none;padding:0 15px 14px}
.tcard .ddl.open{display:block}
.tcard .ddl pre{margin:0;background:var(--code-bg);color:var(--code-ink);border-radius:8px;padding:12px 14px;overflow:auto;font:400 11.5px/1.55 "JetBrains Mono",monospace;white-space:pre-wrap;word-break:break-word;max-height:340px}
.tcard .ddl pre .kw{color:var(--brand);font-weight:600}
.tcard .ddl pre .str{color:var(--warn)}
.tcard .ddl pre .num{color:var(--info)}
.tcard .ddl pre .cm{color:var(--mute);font-style:italic}
.relgraph{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px;overflow:auto}
.relgraph ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.relgraph li{font-family:"JetBrains Mono",monospace;font-size:12.5px;padding:6px 0;border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.relgraph li:last-child{border-bottom:0}
.relgraph .from{color:var(--ink)}
.relgraph .arrow{color:var(--brand);font-weight:700}
.relgraph .to{color:var(--info)}
.relgraph .cn{color:var(--mute);font-size:11px;margin-left:auto}
.sqlbank{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.sqlbank details{border-bottom:1px solid var(--line)}
.sqlbank details:last-child{border-bottom:0}
.sqlbank summary{cursor:pointer;padding:12px 16px;font-weight:600;font-size:13.5px;display:flex;align-items:center;gap:9px;list-style:none}
.sqlbank summary::-webkit-details-marker{display:none}
.sqlbank summary:before{content:"▸";color:var(--brand);font-size:12px}
.sqlbank details[open] summary:before{content:"▾"}
.sqlbank summary .meta{margin-left:auto;color:var(--mute);font-weight:400;font-size:12px}
.sqlbank .b{padding:0 16px 16px}
.sqlbank pre{margin:0 0 12px;background:var(--code-bg);color:var(--code-ink);border-radius:8px;padding:13px 15px;overflow:auto;font:400 12.5px/1.6 "JetBrains Mono",monospace;white-space:pre-wrap;word-break:break-word}
.sqlbank pre .kw{color:var(--brand);font-weight:600}
.sqlbank pre .str{color:var(--warn)}
.sqlbank pre .num{color:var(--info)}
.sqlbank pre .cm{color:var(--mute);font-style:italic}
@media (max-width:1000px){.schematop{grid-template-columns:1fr}}

/* ---------- SQL query library ---------- */
.qlist{display:flex;flex-direction:column;gap:16px}
.qcard{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px 20px}
.qhd{display:flex;align-items:flex-start;gap:12px}
.qic{width:40px;height:40px;flex:none;border-radius:10px;background:var(--panel2);border:1px solid var(--line);display:grid;place-items:center;font-size:18px}
.qtitle{font-weight:600;font-size:15px}
.qconcept{color:var(--mute);font-size:12.5px;margin-top:2px;font-family:"JetBrains Mono",monospace}
.qhd .btn{margin-left:auto;white-space:nowrap}
.qnote{color:var(--mute);font-size:13px;margin:8px 0 0;max-width:80ch}
.qsql{margin-top:12px}
.qsql pre{margin:0;background:var(--code-bg);color:var(--code-ink);border-radius:8px;padding:13px 15px;overflow:auto;font:400 12.5px/1.6 "JetBrains Mono",monospace;white-space:pre-wrap;word-break:break-word}
.qsql pre .kw{color:var(--brand);font-weight:600}
.qsql pre .str{color:var(--warn)}
.qsql pre .num{color:var(--info)}
.qsql pre .cm{color:var(--mute);font-style:italic}
.qres{margin-top:12px}
.qmeta{color:var(--mute);font-size:12.5px;margin-bottom:8px}
.qres .tw{margin-top:0}
.qres table{width:100%;border-collapse:collapse;font-size:13px}
.qres th,.qres td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
.qres th{color:var(--mute);font-weight:600;font-size:12px;position:sticky;top:0;background:var(--panel)}
.qres td.r,.qres th.r{text-align:right;font-variant-numeric:tabular-nums}
.muted{color:var(--mute)}

/* ---------- illustrations ---------- */
.illuscard{padding:16px 18px 6px}
.illuscard .illus{max-height:190px}
.illusmini{width:96px;flex:none;margin:0 auto 4px}
@media (max-width:720px){.illusmini{display:none}}

/* ---------- toasts ---------- */
#toasts{position:fixed;right:20px;bottom:20px;z-index:90;display:flex;flex-direction:column;gap:10px;max-width:360px}
.toast{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--brand);border-radius:10px;padding:13px 15px;box-shadow:0 14px 40px #0003;display:flex;gap:11px;align-items:flex-start;animation:slidein .25s ease-out}
.toast.ok{border-left-color:var(--ok)}.toast.bad{border-left-color:var(--bad)}.toast.warn{border-left-color:var(--warn)}
.toast .ic{font-weight:700}
.toast.ok .ic{color:var(--ok)}.toast.bad .ic{color:var(--bad)}.toast.warn .ic{color:var(--warn)}
.toast b{display:block;font-size:13.5px}
.toast small{color:var(--mute);font-size:12.5px}
.toast .x{margin-left:auto;background:none;border:0;cursor:pointer;color:var(--mute);font-size:16px;line-height:1}
@keyframes slidein{from{opacity:0;transform:translateX(20px)}}

/* ---------- drawer ---------- */
#drawer{position:fixed;inset:0;z-index:80;display:none}
#drawer.open{display:block}
#drawer .scrim{position:absolute;inset:0;background:#0006;animation:fade .2s}
@keyframes fade{from{opacity:0}}
#drawer .sheet{position:absolute;top:0;right:0;height:100%;width:min(560px,100%);background:var(--panel);border-left:1px solid var(--line);box-shadow:-20px 0 60px #0004;overflow:auto;animation:slide .25s ease-out}
@keyframes slide{from{transform:translateX(40px);opacity:.6}}
#drawer .dhead{position:sticky;top:0;background:var(--panel);border-bottom:1px solid var(--line);padding:16px 20px;display:flex;align-items:center;gap:12px;z-index:2}
#drawer .dhead h3{margin:0;font-size:17px}
#drawer .dbody{padding:18px 20px 40px}
#drawer .kv{display:grid;grid-template-columns:150px 1fr;gap:8px 14px;font-size:13.5px;margin:0}
#drawer .kv dt{color:var(--mute)}
#drawer .kv dd{margin:0}
#drawer .dsec{margin-top:22px}
#drawer .dsec h4{margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--mute)}
.minitbl{width:100%;border-collapse:collapse;font-size:13px}
.minitbl th,.minitbl td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
.minitbl th{color:var(--mute);font-weight:600;font-size:12px}

/* ---------- misc ---------- */
.scrollctl{position:fixed;right:22px;bottom:22px;z-index:30;display:flex;flex-direction:column;gap:6px}
.scrollctl button{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:13px;cursor:pointer;box-shadow:0 6px 18px #0003;display:grid;place-items:center}
.scrollctl button:hover{background:var(--brand);color:var(--brandink);border-color:var(--brand)}
.scrollctl button:disabled{opacity:.35;cursor:default}
.help{position:fixed;inset:0;z-index:95;display:none;place-items:center;background:#0006}
.help.open{display:grid}
.help .box{background:var(--panel);border-radius:12px;padding:24px;max-width:520px;width:92%;border:1px solid var(--line)}
.help h3{margin:0 0 14px}
.help table{min-width:0;width:100%}
.help td{border:0;padding:7px 0;white-space:normal}
.help kbd{background:var(--bg);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:2px 7px;font:500 12px "JetBrains Mono",monospace}
.kbd{background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:0 5px;font:500 11.5px "JetBrains Mono",monospace;color:var(--mute)}

@media print{
 aside,.ghead,.scrollctl,.pager,.tools,.sqlwrap,.erd .bar .sp,#toasts,.hero,#login{display:none!important}
 .schematop{grid-template-columns:1fr}
 .erd .frame{max-height:none}
 .tcard .ddl{display:block!important}
 .tcard .ddlbtn{display:none}
 #app{display:block;height:auto;overflow:visible}
 main{height:auto;overflow:visible}
 .page{padding:0;max-width:none}
 .tw{max-height:none;border:0;overflow:visible}
 th{position:static}
 body{background:#fff}
 body:before,body:after{display:none!important}
 .illus{max-height:150px}
}
@media (max-width:1000px){.grid2{grid-template-columns:1fr}}
@media (max-width:900px){
 #login{grid-template-columns:1fr}.hero{padding:32px 24px}.hero h1{font-size:28px}
 .stage{max-width:none}
 #app{grid-template-columns:1fr;height:auto;overflow:visible}
 aside{height:auto;position:static;flex-direction:row;flex-wrap:wrap;align-items:center;gap:10px;border-right:0;border-bottom:1px solid #ffffff1a}
 .sidehead{border-bottom:0;flex:1;min-width:200px;padding:14px 16px}
 .sidenav{order:3;flex-basis:100%;display:flex;gap:6px;overflow-x:auto;padding:0 12px 12px}
 .sidenav .grp{display:none}
 .sidenav button{width:auto;white-space:nowrap;background:#ffffff0f}
 .sidefoot{border-top:0;flex-direction:row;align-items:center;padding:14px 16px}
 .dbstatus{display:none}
 main{height:auto;overflow:visible}
 .page{padding:0 16px 60px}
 .ghead{margin:0 0 18px;padding:12px 16px}
 .tools input{width:100%}
 .tw{max-height:none}
 .scrollctl{right:14px;bottom:14px}
 .avatar span{display:none}
}
@media (prefers-reduced-motion:no-preference){.res{animation:pop .2s ease-out}@keyframes pop{from{opacity:0;transform:translateY(4px)}}}

/* ---------- motion ---------- */
/* Subtle, consistent motion: interactive elements ease, cards lift on hover, and
   view content fades in. Everything is opt-in under prefers-reduced-motion. */
.btn,.iconbtn,.avatar,.chip,.pager button,.qrun,.qaction,.kpi,.stat,.panel,.tcard,.qcard,.menu button,.hit,.ddlbtn,.sqlhint,.sqlwrap summary,.sqlbank summary{transition:background-color .18s ease,border-color .18s ease,color .18s ease,box-shadow .22s ease,transform .22s ease}
.btn{transition:background-color .18s ease,color .18s ease,box-shadow .22s ease,transform .12s ease}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px color-mix(in srgb,var(--brand) 26%,transparent)}
.btn:active:not(:disabled){transform:translateY(0) scale(.985);box-shadow:none}
.btn.ghost:hover:not(:disabled){box-shadow:none;background:color-mix(in srgb,var(--brand) 8%,transparent)}
.iconbtn:hover,.avatar:hover{transform:translateY(-1px);box-shadow:0 4px 14px #00000012}
.iconbtn:active,.avatar:active{transform:translateY(0) scale(.97)}
aside button{transition:background-color .16s ease,color .16s ease,transform .16s ease,padding-left .16s ease}
aside button:hover{transform:translateX(2px)}
aside button.on{transform:none}
.sidenav button:hover{padding-left:11px}
.kpi:hover,.qaction:hover,.stat:hover{transform:translateY(-2px);box-shadow:0 10px 26px #00000014}
.panel,.tcard,.qcard,.tw{transition:box-shadow .25s ease,border-color .2s ease,transform .25s ease}
.tcard:hover,.qcard:hover{border-color:color-mix(in srgb,var(--brand) 45%,var(--line));box-shadow:0 10px 26px #00000012;transform:translateY(-2px)}
.tcard .ddlbtn:hover,.sqlwrap summary:hover,.sqlbank summary:hover{background:var(--panel2);color:var(--brand)}
tbody tr{transition:background-color .14s ease}
.gres .hit,.pop .item{transition:background-color .14s ease,padding-left .14s ease}
.gres .hit:hover{padding-left:17px}
.menu button:hover{transform:translateX(2px)}
.sqlhint:hover{transform:translateX(2px)}
@media (prefers-reduced-motion:no-preference){
  /* Each new view fades and lifts in slightly. */
  .page{animation:fadeup .34s cubic-bezier(.22,.61,.36,1) both}
  @keyframes fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  /* KPI / stat / quick-action tiles arrive in a short stagger. */
  .kpis>*,.stats>*,.quick>*{animation:fadeup .4s cubic-bezier(.22,.61,.36,1) both}
  .kpis>*:nth-child(1),.stats>*:nth-child(1),.quick>*:nth-child(1){animation-delay:.02s}
  .kpis>*:nth-child(2),.stats>*:nth-child(2),.quick>*:nth-child(2){animation-delay:.06s}
  .kpis>*:nth-child(3),.stats>*:nth-child(3),.quick>*:nth-child(3){animation-delay:.1s}
  .kpis>*:nth-child(4),.stats>*:nth-child(4),.quick>*:nth-child(4){animation-delay:.14s}
  .kpis>*:nth-child(5),.stats>*:nth-child(5),.quick>*:nth-child(5){animation-delay:.18s}
  .kpis>*:nth-child(6),.stats>*:nth-child(6),.quick>*:nth-child(6){animation-delay:.22s}
  .kpis>*:nth-child(n+7),.stats>*:nth-child(n+7),.quick>*:nth-child(n+7){animation-delay:.26s}
  /* Disclosure panels expand smoothly. */
  .sqlwrap details[open] .body,.sqlbank details[open] .b{animation:reveal .22s ease-out}
  @keyframes reveal{from{opacity:0;transform:translateY(-4px)}}
  .menu,.pop,.gres{animation:menuin .16s ease-out}
  @keyframes menuin{from{opacity:0;transform:translateY(-5px) scale(.99)}}
}
@media (prefers-reduced-motion:reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
}
</style>
</head>
<body>

<section id="login">
  <div class="hero">
    <div class="herocopy">
      <h1>Every batch, from factory to customer.</h1>
      <p>MedTrace follows each medicine batch through shipments, stock and sales. Recalled, fake or expired batches are blocked from sale, and anyone can check a batch code.</p>
      <ul class="pts">
        <li>Every batch tracked from factory to customer</li>
        <li>Recalled, fake or expired stock blocked from sale</li>
        <li>Anyone can verify a printed batch code</li>
      </ul>
    </div>
    <figure class="stage">
      <svg class="illus" viewBox="0 0 520 200" role="img" aria-label="A batch moving from a manufacturer through a distributor to a pharmacy and a customer, with a verification check">
        <title>Batch traceability chain</title>
        <!-- connecting line -->
        <path class="dash flow" d="M96 104 H424"/>
        <!-- manufacturer -->
        <rect class="node" x="20" y="66" width="76" height="76" rx="10"/>
        <path class="lnb" d="M40 122 V100 l18 -14 l18 14 v22"/>
        <path class="lnb" d="M58 122 v-12 h0"/>
        <rect class="fillb" x="40" y="86" width="36" height="10" rx="3"/>
        <text class="lbl" x="58" y="162" text-anchor="middle">Manufacturer</text>
        <!-- distributor / truck -->
        <g>
          <rect class="node" x="152" y="70" width="96" height="68" rx="10"/>
          <path class="ln" d="M168 118 v-24 h34 v24 M202 94 h18 l14 14 v10 h-32"/>
          <circle class="ln" cx="182" cy="126" r="7"/>
          <circle class="ln" cx="216" cy="126" r="7"/>
          <rect class="fillb" x="168" y="94" width="34" height="24" rx="3"/>
        </g>
        <text class="lbl" x="200" y="162" text-anchor="middle">Distributor</text>
        <!-- pharmacy -->
        <g>
          <rect class="node" x="288" y="66" width="76" height="76" rx="10"/>
          <path class="lnk" d="M326 90 v48 M302 114 h48"/>
          <circle class="fillk" cx="326" cy="114" r="20"/>
          <path class="lnk" d="M326 90 v48 M302 114 h48"/>
        </g>
        <text class="lbl" x="326" y="162" text-anchor="middle">Pharmacy</text>
        <!-- customer + verified tick -->
        <g class="pulse">
          <rect class="node" x="404" y="66" width="76" height="76" rx="10"/>
          <circle class="ln" cx="442" cy="98" r="12"/>
          <path class="ln" d="M424 134 c0 -12 8 -18 18 -18 s18 6 18 18"/>
        </g>
        <text class="lbl" x="442" y="162" text-anchor="middle">Customer</text>
        <!-- verified badge -->
        <g>
          <circle class="fillk" cx="480" cy="52" r="15"/>
          <circle class="lnk" cx="480" cy="52" r="15"/>
          <path class="lnk" d="M472 52 l6 6 l10 -12"/>
        </g>
      </svg>
      <figcaption>Batch <span class="mono">PCM-2025-A01</span> · Paracetamol 500 mg · Exp 31/05/2027 — a valid code confirms the pack on paper, not the strip in your hand.</figcaption>
    </figure>
  </div>

  <!-- Right column: public verification on top, sign-in / sign-up below. -->
  <div class="loginright">
  <!-- PUBLIC verification: no account needed, and it only ever reveals what is
       printed on the pack — never stock, shipments, sales or customer data. -->
  <div class="pubverify">
    <div class="card">
      <h2>Check a batch code</h2>
      <p class="sub">Anyone can check a printed batch code. No account needed. You will see the medicine, the manufacturer, the dates and a safety result — nothing else.</p>
      <form id="pv" novalidate>
        <div class="row">
          <div style="flex:1"><label for="pv-code">Batch code</label>
            <input id="pv-code" placeholder="e.g. PCM-2025-A01" autocomplete="off"></div>
          <button class="btn" type="submit">Check</button>
        </div>
      </form>
      <div id="pv-result" aria-live="polite"></div>
    </div>
  </div>

  <div class="formwrap">
    <div class="card authcard">
      <div class="authtabs" role="tablist">
        <button type="button" id="tab-signin" class="on" role="tab" aria-selected="true">Sign in</button>
        <button type="button" id="tab-signup" role="tab" aria-selected="false">Customer sign-up</button>
        <button type="button" id="tab-apply" role="tab" aria-selected="false">Staff access</button>
      </div>

      <form id="lf" novalidate>
        <h2>Sign in to MedTrace</h2>
        <p class="sub">Enter the email and password for your account.</p>
        <label for="li-e">Email</label>
        <input id="li-e" type="email" autocomplete="email" placeholder="name@organization.com">
        <label for="li-p">Password</label>
        <div class="pw"><input id="li-p" type="password" autocomplete="current-password" placeholder="Your password"><button type="button" class="ptog" data-for="li-p" aria-label="Show password">Show</button></div>
        <div class="err" id="li-er" role="alert"></div>
        <button class="btn full" type="submit">Sign in</button>
        <div class="split">demo accounts</div>
        <div class="demobtns">
          <button class="btn ghost sm" type="button" data-demo="asha.mehta@cdsco.gov.in">Regulator</button>
          <button class="btn ghost sm" type="button" data-demo="ravi.kumar@sunpharma.in">Manufacturer</button>
          <button class="btn ghost sm" type="button" data-demo="neha.sharma@medplus.in">Distributor</button>
          <button class="btn ghost sm" type="button" data-demo="imran@apollopharmacy.in">Pharmacy</button>
          <button class="btn ghost sm" type="button" data-demo="priya.nair@example.com">Customer</button>
        </div>
      </form>

      <!-- Public registration is CUSTOMERS ONLY. Staff accounts are issued by a
           regulator after review, or created by a system administrator. -->
      <form id="sf" class="hide" novalidate>
        <h2>Create a customer account</h2>
        <p class="sub">Customers can self-register to verify batch codes. Staff accounts (manufacturer, distributor, pharmacy) and regulators are not self-service — use <b>Staff access</b> or contact a regulator.</p>
        <label for="su-n">Full name</label>
        <input id="su-n" autocomplete="name" placeholder="e.g. Priya Nair">
        <label for="su-e">Email</label>
        <input id="su-e" type="email" autocomplete="email" placeholder="you@example.com">
        <label for="su-p">Password</label>
        <div class="pw"><input id="su-p" type="password" autocomplete="new-password" placeholder="At least 8 characters, with a number"><button type="button" class="ptog" data-for="su-p" aria-label="Show password">Show</button></div>
        <label for="su-c">Confirm password</label>
        <div class="pw"><input id="su-c" type="password" autocomplete="new-password" placeholder="Type the password again"><button type="button" class="ptog" data-for="su-c" aria-label="Show password">Show</button></div>
        <div class="err" id="su-er" role="alert"></div>
        <button class="btn full" type="submit">Create account</button>
      </form>

      <!-- Staff apply; a regulator approves and the account is created then. -->
      <form id="af" class="hide" novalidate>
        <h2>Apply for a staff account</h2>
        <p class="sub">Manufacturers, distributors and pharmacies apply here. A regulator reviews your application and issues the account. Regulator accounts are created only by a system administrator.</p>
        <label for="ap-n">Full name</label>
        <input id="ap-n" autocomplete="name" placeholder="e.g. Ravi Kumar">
        <label for="ap-e">Work email</label>
        <input id="ap-e" type="email" autocomplete="email" placeholder="name@organization.com">
        <label for="ap-r">Your role</label>
        <select id="ap-r">
          <option value="manufacturer">Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <label for="ap-o">Organization</label><select id="ap-o"></select>
        <label for="ap-note">Note to the regulator <span class="muted">(optional)</span></label>
        <input id="ap-note" placeholder="e.g. License number, contact person">
        <label for="ap-p">Password</label>
        <div class="pw"><input id="ap-p" type="password" autocomplete="new-password" placeholder="At least 8 characters, with a number"><button type="button" class="ptog" data-for="ap-p" aria-label="Show password">Show</button></div>
        <label for="ap-c">Confirm password</label>
        <div class="pw"><input id="ap-c" type="password" autocomplete="new-password" placeholder="Type the password again"><button type="button" class="ptog" data-for="ap-c" aria-label="Show password">Show</button></div>
        <div class="err" id="ap-er" role="alert"></div>
        <button class="btn full" type="submit">Submit application</button>
      </form>

      <p class="note">Your password is salted and hashed — never saved as text.</p>
      <div class="lfoot"><span>MedTrace v1.0.0 · build 2026.03</span></div>
    </div>
  </div>
  </div><!-- /loginright -->
</section>

<section id="app" class="hide">
  <aside>
    <div class="sidehead">
      <div class="brand"><span class="logo">MT</span><span><strong>MedTrace</strong><small>Medicine traceability</small></span></div>
      <div class="who" id="who"></div>
    </div>
    <nav class="sidenav" id="nav" aria-label="Datasets"></nav>
    <div class="sidefoot">
      <div class="dbstatus" id="dbstatus"><span class="dot live" id="livedot"></span><span id="livetext">Live updates on</span></div>
      <div class="sidebtns">
        <button class="btn ghost" id="th" title="Switch theme">Theme</button>
        <a class="btn ghost" id="dlzip" href="/medtrace-project.zip" download title="Download the full project source as a zip">Download</a>
        <button class="btn ghost" id="lo">Sign out</button>
      </div>
    </div>
  </aside>
  <main id="main">
    <header class="ghead">
      <div class="crumbs" id="crumbs"></div>
      <div class="gsearch rel">
        <input id="gq" type="search" placeholder="Search medicines, batches, organizations…" aria-label="Global search" autocomplete="off">
        <div id="gres"></div>
      </div>
      <div class="gright">
        <button class="iconbtn" id="helpbtn" title="Keyboard shortcuts (?)">?</button>
        <div class="rel">
          <button class="iconbtn" id="bellbtn" title="Notifications">🔔<span class="badge" id="bellcount">0</span></button>
          <div id="bellpop"></div>
        </div>
        <div class="rel">
          <button class="avatar" id="avatar"><span class="ini" id="ini">AM</span><span id="aname">Asha</span></button>
          <div id="avmenu"></div>
        </div>
      </div>
    </header>
    <div id="view"></div>
    <div class="scrollctl">
      <button id="up" title="Scroll to top" aria-label="Scroll to top">▲</button>
      <button id="down" title="Scroll to bottom" aria-label="Scroll to bottom">▼</button>
    </div>
  </main>
</section>

<div id="drawer"><div class="scrim" data-close></div><div class="sheet"><div class="dhead"><h3 id="dtitle">Details</h3><button class="btn ghost sm" data-close style="margin-left:auto">Close</button></div><div class="dbody" id="dbody"></div></div></div>
<div id="toasts"></div>
<div class="help" id="help"><div class="box"><h3>Keyboard shortcuts</h3><table><tbody>
<tr><td><kbd>/</kbd></td><td>Focus the global search box</td></tr>
<tr><td><kbd>g</kbd> then <kbd>o</kbd></td><td>Go to Overview</td></tr>
<tr><td><kbd>g</kbd> then <kbd>b</kbd></td><td>Go to Batches</td></tr>
<tr><td><kbd>g</kbd> then <kbd>s</kbd></td><td>Go to Shipments</td></tr>
<tr><td><kbd>g</kbd> then <kbd>v</kbd></td><td>Go to Verify a batch code</td></tr>
<tr><td><kbd>g</kbd> then <kbd>d</kbd></td><td>Go to Database schema (ER diagram)</td></tr>
<tr><td><kbd>g</kbd> then <kbd>q</kbd></td><td>Go to Reports</td></tr>
<tr><td><kbd>Esc</kbd></td><td>Close panels, menus and this help</td></tr>
<tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
</tbody></table><button class="btn" id="helpclose" style="margin-top:16px">Close</button></div></div>

<script src="/app.js"></script>
</body>
</html>
```

====================================================================================================
FILE: public/app.js
====================================================================================================
```javascript
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
```

====================================================================================================
FILE: server/server.js
====================================================================================================
```javascript
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pool, { authPool } from './db.js';
import { hashPassword, verifyPassword, signToken, verifyToken, passwordProblem, STAFF_ROLES } from './auth.js';
import { DATASETS, ACCESS, GROUPS, scopedSql, canSee, ALL_DATASETS } from './access.js';
import { subscribe, unsubscribe, snapshot, notify } from './live.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const ok = (res, data) => res.json({ ok: true, ...data });
const fail = (res, code, message) => res.status(code).json({ ok: false, error: message });

// Render a query for display only (the app always runs parameterised queries).
function showSql(sql, params = []) {
  let i = 0;
  return sql.replace(/\s+/g, ' ').trim().replace(/\?/g, () => {
    const v = params[i++];
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  });
}
const sqlLog = (entries) => entries.filter(Boolean).map((e) => ({ label: e.label, sql: e.sql, rows: e.rows ?? null }));

// ---------------------------------------------------------------------------
// Authentication + authorization. The role and organization ALWAYS come from the
// stored account, never from anything the client sends.
// ---------------------------------------------------------------------------
async function loadUser(req) {
  const userId = verifyToken(req.headers['x-auth-token']);
  if (!userId) return null;
  const [[row]] = await authPool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
  if (!row || row.status !== 'active') return null;
  return { userId: row.user_id, name: row.name, email: row.email, role: row.role, orgId: row.org_id ?? null, org: null };
}
async function attachUser(req, _res, next) {
  try { req.user = await loadUser(req); } catch { req.user = null; }
  next();
}
app.use(attachUser);
function requireAuth(roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Sign in to continue.');
    if (roles && !roles.includes(req.user.role)) return fail(res, 403, 'Your role is not allowed to do that.');
    next();
  };
}
async function orgNameFor(orgId) {
  if (!orgId) return 'Not listed / individual';
  const [[row]] = await pool.query('SELECT name FROM organizations WHERE org_id = ?', [orgId]);
  return row ? row.name : 'Not listed / individual';
}
async function publicUser(user) {
  return { name: user.name, email: user.email, role: user.role, org: await orgNameFor(user.orgId) };
}

// ---------------------------------------------------------------------------
// Meta: dataset catalogue, access map and live stats (scoped to the caller).
// ---------------------------------------------------------------------------
app.get('/api/meta', requireAuth(), async (req, res) => {
  try {
    const meta = {};
    for (const name of ALL_DATASETS) {
      if (!canSee(req.user.role, name)) continue;
      const d = DATASETS[name];
      const { sql, params } = scopedSql(name, req.user);
      const [[{ n }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${sql}) t`, params);
      meta[name] = { title: d.title, desc: d.desc, columns: d.columns, count: n, pii: !!d.pii };
    }
    const batchScope = scopedSql('batches', req.user);
    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS n FROM (${batchScope.sql}) b GROUP BY status`, batchScope.params);
    const status = Object.fromEntries(statusRows.map((r) => [r.status, r.n]));
    const batchTotal = Object.values(status).reduce((a, b) => a + b, 0);
    const scanScope = scopedSql('verification_scans', req.user);
    const [[{ n: scanTotal }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${scanScope.sql}) v`, scanScope.params);
    const recallScope = scopedSql('recalls', req.user);
    const [[{ n: recallTotal }]] = await pool.query(`SELECT COUNT(*) AS n FROM (${recallScope.sql}) r`, recallScope.params);
    ok(res, {
      database: process.env.DB_NAME || 'medicine_traceability',
      datasets: meta, access: ACCESS, groups: GROUPS, user: await publicUser(req.user),
      stats: { batches: batchTotal, genuine: status.genuine || 0, recalled: status.recalled || 0,
        suspected_fake: status.suspected_fake || 0, expired: status.expired || 0, scans: scanTotal, recalls: recallTotal },
    });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Accounts. Public registration is CUSTOMER ONLY. Staff apply and a regulator
// approves; regulators are created only by an administrator.
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
async function orgMatchesRole(orgId, role) {
  if (role === 'customer') return orgId == null;
  if (orgId == null) return false;
  const [[row]] = await pool.query('SELECT org_type FROM organizations WHERE org_id = ?', [orgId]);
  return !!row && row.org_type === role;
}

app.post('/api/signup', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const role = String(req.body?.role ?? '');
    const password = String(req.body?.password ?? '');
    const confirm = String(req.body?.confirm ?? '');
    if (name.length < 2) return fail(res, 400, 'Enter your full name.');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (role !== 'customer')
      return fail(res, 403, 'Public sign-up is for customers only. Staff accounts are issued by a regulator or administrator.');
    const pwErr = passwordProblem(password);
    if (pwErr) return fail(res, 400, pwErr);
    if (password !== confirm) return fail(res, 400, 'The two passwords do not match.');
    const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (dupe) return fail(res, 409, 'An account with that email already exists. Sign in instead.');
    const [[req2]] = await authPool.query('SELECT request_id FROM account_requests WHERE email = ?', [email]);
    if (req2) return fail(res, 409, 'An application with that email is already awaiting review.');
    const [result] = await authPool.query(
      'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, NULL, ?)',
      [name, email, role, hashPassword(password)]);
    ok(res, { token: signToken(result.insertId), user: await publicUser({ name, email, role, orgId: null }) });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/account-requests', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const role = String(req.body?.role ?? '');
    const orgId = req.body?.org_id ? Number(req.body.org_id) : null;
    const password = String(req.body?.password ?? '');
    const confirm = String(req.body?.confirm ?? '');
    const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
    if (name.length < 2) return fail(res, 400, 'Enter your full name.');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (!STAFF_ROLES.includes(role))
      return fail(res, 400, 'Choose a valid role. Only manufacturer, distributor and pharmacy apply here.');
    if (!(await orgMatchesRole(orgId, role)))
      return fail(res, 400, 'Choose an organization that matches the role you selected.');
    const pwErr = passwordProblem(password);
    if (pwErr) return fail(res, 400, pwErr);
    if (password !== confirm) return fail(res, 400, 'The two passwords do not match.');
    const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (dupe) return fail(res, 409, 'An account with that email already exists. Sign in instead.');
    const [[pending]] = await authPool.query('SELECT request_id FROM account_requests WHERE email = ?', [email]);
    if (pending) return fail(res, 409, 'An application with that email is already awaiting review.');
    await authPool.query(
      'INSERT INTO account_requests (name, email, role, org_id, password_hash, note) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, role, orgId, hashPassword(password), note]);
    notify('account_requests');
    ok(res, { pending: true, message: 'Application received. A regulator will review it.' });
  } catch (e) { fail(res, 500, e.message); }
});

app.get('/api/account-requests', requireAuth(['regulator', 'admin']), async (_req, res) => {
  try {
    const db = process.env.DB_NAME || 'medicine_traceability';
    const [rows] = await authPool.query(
      `SELECT r.request_id, r.name, r.email, r.role, r.org_id, o.name AS org, r.note, r.status, r.created_at, r.decided_at, r.decision_note
         FROM account_requests r
         LEFT JOIN \`${db}\`.organizations o ON o.org_id = r.org_id
        ORDER BY r.status = 'pending' DESC, r.created_at DESC`);
    ok(res, { requests: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/account-requests/:id/decision', requireAuth(['regulator', 'admin']), async (req, res) => {
  const id = Number(req.params.id);
  const decision = String(req.body?.decision || '');
  const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid request id.');
  if (!['approve', 'reject'].includes(decision)) return fail(res, 400, 'Decision must be approve or reject.');
  try {
    const [[r]] = await authPool.query('SELECT * FROM account_requests WHERE request_id = ?', [id]);
    if (!r) return fail(res, 404, 'Application not found.');
    if (r.status !== 'pending') return fail(res, 409, 'That application has already been decided.');
    if (decision === 'approve') {
      const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [r.email]);
      if (dupe) return fail(res, 409, 'An account with that email already exists.');
      await authPool.query(
        'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
        [r.name, r.email, r.role, r.org_id, r.password_hash]);
    }
    await authPool.query(
      'UPDATE account_requests SET status = ?, decided_at = NOW(), decided_by = ?, decision_note = ? WHERE request_id = ?',
      [decision === 'approve' ? 'approved' : 'rejected', req.user.userId, note, id]);
    notify('account_requests');
    ok(res, { message: decision === 'approve' ? 'Application approved and account created.' : 'Application rejected.' });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address.');
    if (!password) return fail(res, 400, 'Enter your password.');
    const [[row]] = await authPool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!row || !verifyPassword(password, row.password_hash)) return fail(res, 401, 'Email or password is incorrect.');
    if (row.status !== 'active') return fail(res, 403, 'This account is disabled. Contact a regulator.');
    await authPool.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [row.user_id]);
    ok(res, { token: signToken(row.user_id), user: await publicUser({ name: row.name, email: row.email, role: row.role, orgId: row.org_id ?? null }) });
  } catch (e) { fail(res, 500, e.message); }
});

app.get('/api/session', async (req, res) => {
  try {
    if (!req.user) return fail(res, 401, 'Not signed in.');
    ok(res, { user: await publicUser(req.user) });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/logout', (_req, res) => ok(res, {}));

// ---------------------------------------------------------------------------
// Generic dataset endpoint with server-side search, always scoped to the caller.
// ---------------------------------------------------------------------------
app.get('/api/datasets/:name', requireAuth(), async (req, res) => {
  const name = req.params.name;
  const d = DATASETS[name];
  if (!d) return fail(res, 404, 'Unknown dataset.');
  if (!canSee(req.user.role, name)) return fail(res, 403, 'Your role cannot open that dataset.');
  const q = String(req.query.q || '').trim();
  try {
    const scoped = scopedSql(name, req.user);
    let sql = scoped.sql;
    let params = scoped.params;
    if (q) {
      const concat = d.columns.map((c) => `COALESCE(t.\`${c.key}\`, '')`).join(", ' ', ");
      sql = `SELECT * FROM (${sql}) t WHERE CONCAT_WS(' ', ${concat}) LIKE ? ORDER BY 1`;
      params = [...params, `%${q}%`];
    }
    const [rows] = await pool.query(sql, params);
    ok(res, { title: d.title, desc: d.desc, columns: d.columns, rows: rows.map((r) => d.columns.map((c) => r[c.key])),
      pii: !!d.pii, sql: sqlLog([{ label: `SELECT from ${name}`, sql: showSql(sql, params), rows: rows.length }]) });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// PUBLIC verification. No account required, and it never reveals stock,
// shipments, sales or customer data — only what is printed on the pack.
// ---------------------------------------------------------------------------
const PUBLIC_LOOKUP_SQL = `SELECT b.batch_id, b.batch_code, b.expiry_date, b.mfg_date, b.status,
              m.name AS medicine, o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_code = ?`;

// Map a batch to the public-facing safety result. suspected_fake is shown as its
// own clear result rather than being folded into "recalled".
function publicResult(batch, today) {
  if (!batch) return 'unknown';
  if (batch.status === 'recalled') return 'recalled';
  if (batch.status === 'suspected_fake') return 'suspected_fake';
  if (batch.status === 'expired' || batch.expiry_date < today) return 'expired';
  return 'genuine';
}

// Public list of organizations, used by the staff-application form so an
// applicant can pick the organization that matches their role. Only the name and
// type are exposed — never licenses, addresses or contact details.
app.get('/api/public/organizations', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT org_id, name, org_type FROM organizations WHERE org_type IN ('manufacturer','distributor','pharmacy') ORDER BY org_type, name");
    ok(res, { organizations: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/public/verify', async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code to check.');
  try {
    const [rows] = await pool.query(PUBLIC_LOOKUP_SQL, [code]);
    const today = new Date().toISOString().slice(0, 10);
    const result = publicResult(rows[0] || null, today);
    await pool.query('INSERT INTO verification_scans (batch_code_entered, batch_id, result) VALUES (?, ?, ?)',
      [code, rows[0]?.batch_id ?? null, result]);
    const pack = rows[0]
      ? { batch_code: rows[0].batch_code, medicine: rows[0].medicine, manufacturer: rows[0].manufacturer,
          mfg_date: rows[0].mfg_date, expiry_date: rows[0].expiry_date }
      : null;
    ok(res, { result, pack });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/verify', requireAuth(), async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code to check.');
  try {
    const [rows] = await pool.query(PUBLIC_LOOKUP_SQL, [code]);
    const today = new Date().toISOString().slice(0, 10);
    const result = publicResult(rows[0] || null, today);
    const insParams = [code, rows[0]?.batch_id ?? null, result];
    const insSql = 'INSERT INTO verification_scans (batch_code_entered, batch_id, result) VALUES (?, ?, ?)';
    const [ins] = await pool.query(insSql, insParams);
    ok(res, { result, batch: rows[0] || null,
      sql: sqlLog([
        { label: 'Look up the batch code', sql: showSql(PUBLIC_LOOKUP_SQL, [code]), rows: rows.length },
        { label: 'Record the scan', sql: showSql(insSql, insParams), rows: ins.affectedRows },
      ]) });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Forward trace of a batch. Customer names/phones are REGULATOR-ONLY; a
// pharmacy sees only its own customers; manufacturers/distributors see none.
// ---------------------------------------------------------------------------
const BATCH_BY_ID_SQL = `SELECT b.batch_id, b.batch_code, b.status, b.expiry_date, m.name AS medicine,
              o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_id = ?`;

const BATCH_BY_CODE_SQL = `SELECT b.batch_id, b.batch_code, b.status, b.mfg_date, b.expiry_date,
              m.name AS medicine, o.name AS manufacturer
       FROM batches b
       JOIN medicines m ON m.medicine_id = b.medicine_id
       JOIN organizations o ON o.org_id = b.manufacturer_id
       WHERE b.batch_code = ?`;

async function canTraceBatch(user, batchId) {
  if (user.role === 'regulator' || user.role === 'admin') return true;
  const scoped = scopedSql('batches', user);
  const [[row]] = await pool.query(`SELECT 1 AS ok FROM (${scoped.sql}) t WHERE t.batch_id = ? LIMIT 1`, [...scoped.params, batchId]);
  return !!row;
}

app.get('/api/trace/:batchId', requireAuth(['regulator', 'admin', 'manufacturer', 'distributor', 'pharmacy']), async (req, res) => {
  const id = Number(req.params.batchId);
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid batch id.');
  try {
    if (!(await canTraceBatch(req.user, id))) return fail(res, 403, 'You can only trace batches your organization handled.');
    const [[batch]] = await pool.query(BATCH_BY_ID_SQL, [id]);
    if (!batch) return fail(res, 404, 'Batch not found.');
    const FLOW_SQL = 'SELECT * FROM v_batch_flow WHERE batch_id = ? ORDER BY shipment_id';
    const STOCK_SQL = `SELECT o.name AS organization, i.quantity_on_hand, i.last_updated
       FROM inventory i JOIN organizations o ON o.org_id = i.org_id
       WHERE i.batch_id = ? ORDER BY o.name`;
    const RECALL_SQL = `SELECT r.reason, r.severity, r.recall_date, r.status, o.name AS regulator
       FROM recalls r JOIN organizations o ON o.org_id = r.regulator_id
       WHERE r.batch_id = ? ORDER BY r.recall_date`;
    const [flow] = await pool.query(FLOW_SQL, [id]);
    const [stock] = await pool.query(STOCK_SQL, [id]);
    const [recalls] = await pool.query(RECALL_SQL, [id]);
    let customers = [];
    let customersRestricted = false;
    if (req.user.role === 'regulator' || req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM v_batch_customers WHERE batch_id = ? ORDER BY sale_date', [id]);
      customers = rows;
    } else if (req.user.role === 'pharmacy') {
      const [rows] = await pool.query('SELECT * FROM v_batch_customers WHERE batch_id = ? AND pharmacy = ? ORDER BY sale_date',
        [id, await orgNameFor(req.user.orgId)]);
      customers = rows;
    } else {
      customersRestricted = true;
    }
    ok(res, { batch, flow, stock, recalls, customers, customersRestricted,
      sql: sqlLog([
        { label: 'Batch and its medicine', sql: showSql(BATCH_BY_ID_SQL, [id]), rows: 1 },
        { label: 'Shipment flow (view v_batch_flow)', sql: showSql(FLOW_SQL, [id]), rows: flow.length },
        { label: 'Stock held (inventory)', sql: showSql(STOCK_SQL, [id]), rows: stock.length },
        ...(customersRestricted ? [] : [{ label: 'Customers who bought it (view v_batch_customers)',
          sql: showSql('SELECT * FROM v_batch_customers WHERE batch_id = ? ORDER BY sale_date', [id]), rows: customers.length }]),
        { label: 'Recalls for this batch', sql: showSql(RECALL_SQL, [id]), rows: recalls.length },
      ]) });
  } catch (e) { fail(res, 500, e.message); }
});

// Customer-facing trace. A customer knows the printed batch code, not our
// internal ids, so this looks the batch up by code and returns only the journey
// and safety facts: where the batch travelled, who holds it and any recalls.
// No customer personal data is ever included.
app.post('/api/customer/trace', requireAuth(['customer']), async (req, res) => {
  const code = String(req.body?.code ?? '').trim().toUpperCase();
  if (!code) return fail(res, 400, 'Enter a batch code.');
  try {
    const [[batch]] = await pool.query(BATCH_BY_CODE_SQL, [code]);
    if (!batch) return ok(res, { found: false, code });
    const FLOW_SQL = 'SELECT from_org, to_org, quantity, shipped_at, received_at, shipment_status FROM v_batch_flow WHERE batch_id = ? ORDER BY shipment_id';
    const STOCK_SQL = `SELECT o.name AS organization, o.org_type, i.last_updated
       FROM inventory i JOIN organizations o ON o.org_id = i.org_id
       WHERE i.batch_id = ? ORDER BY o.name`;
    const RECALL_SQL = `SELECT r.reason, r.severity, r.recall_date, r.status, o.name AS regulator
       FROM recalls r JOIN organizations o ON o.org_id = r.regulator_id
       WHERE r.batch_id = ? ORDER BY r.recall_date`;
    const [flow] = await pool.query(FLOW_SQL, [batch.batch_id]);
    const [stock] = await pool.query(STOCK_SQL, [batch.batch_id]);
    const [recalls] = await pool.query(RECALL_SQL, [batch.batch_id]);
    ok(res, { found: true, batch: { batch_code: batch.batch_code, medicine: batch.medicine,
      manufacturer: batch.manufacturer, mfg_date: batch.mfg_date, expiry_date: batch.expiry_date, status: batch.status },
      flow, stock, recalls });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Recalls. Only a regulator may issue or change one. The database triggers flip
// the batch status and write the audit log — the app never does that itself.
// ---------------------------------------------------------------------------
const REGULATOR_ROLES = ['regulator', 'admin'];

app.get('/api/recalls', requireAuth(['regulator', 'admin', 'manufacturer', 'distributor', 'pharmacy']), async (req, res) => {
  try {
    const scoped = scopedSql('recalls', req.user);
    const idsSql = scoped.sql.replace(/^SELECT[\s\S]*?FROM recalls r\b/i, 'SELECT r.recall_id FROM recalls r');
    const [rows] = await pool.query(
      `SELECT r.recall_id, r.batch_id, b.batch_code, m.name AS medicine, o.name AS regulator,
              r.reason, r.severity, r.recall_date, r.status, r.decision_note,
              (SELECT COUNT(*) FROM recall_acknowledgements a WHERE a.recall_id = r.recall_id) AS ack_count
         FROM recalls r
         JOIN batches b ON b.batch_id = r.batch_id
         JOIN medicines m ON m.medicine_id = b.medicine_id
         JOIN organizations o ON o.org_id = r.regulator_id
        WHERE r.recall_id IN (${idsSql})
        ORDER BY r.recall_date DESC, r.recall_id DESC`, scoped.params);
    ok(res, { recalls: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.get('/api/recalls/preview/:batchId', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const id = Number(req.params.batchId);
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid batch id.');
  try {
    const [[batch]] = await pool.query(BATCH_BY_ID_SQL, [id]);
    if (!batch) return fail(res, 404, 'Batch not found.');
    const [stock] = await pool.query(
      `SELECT o.name AS organization, o.org_type, i.quantity_on_hand
         FROM inventory i JOIN organizations o ON o.org_id = i.org_id
        WHERE i.batch_id = ? ORDER BY i.quantity_on_hand DESC`, [id]);
    const [[cust]] = await pool.query('SELECT COUNT(DISTINCT customer_id) AS n FROM v_batch_customers WHERE batch_id = ?', [id]);
    const [[units]] = await pool.query('SELECT COALESCE(SUM(quantity), 0) AS n FROM v_batch_customers WHERE batch_id = ?', [id]);
    ok(res, { batch, stock, stockUnits: stock.reduce((a, s) => a + s.quantity_on_hand, 0),
      customersAffected: cust.n, unitsSold: units.n });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/recalls', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const { batchId, reason } = req.body || {};
  const severity = req.body?.severity || 'high';
  if (!batchId) return fail(res, 400, 'Choose a batch to recall.');
  if (!reason || String(reason).trim().length < 3) return fail(res, 400, 'Give a reason for the recall.');
  if (!['low', 'medium', 'high', 'critical'].includes(severity)) return fail(res, 400, 'Choose a valid severity.');
  const regulatorId = req.user.orgId;
  if (!regulatorId) return fail(res, 400, 'Your account is not linked to a regulator organization.');
  const conn = await pool.getConnection();
  try {
    const [[batchRow]] = await conn.query('SELECT batch_id, status FROM batches WHERE batch_id = ?', [Number(batchId)]);
    if (!batchRow) return fail(res, 404, 'Batch not found.');
    if (batchRow.status === 'recalled') return fail(res, 409, 'That batch already has an active recall.');
    await conn.query('SET @medtrace_actor_org_id = ?', [regulatorId]);
    const recParams = [Number(batchId), regulatorId, String(reason).trim(), severity];
    const recSql = `INSERT INTO recalls (batch_id, regulator_id, reason, severity, recall_date, status)
       VALUES (?, ?, ?, ?, CURDATE(), 'active')`;
    const [rec] = await conn.query(recSql, recParams);
    const batchSql = 'SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?';
    const [[batch]] = await conn.query(batchSql, [Number(batchId)]);
    const auditSql = `SELECT log_id, old_status, new_status, changed_at, reason
       FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5`;
    const [audit] = await conn.query(auditSql, [Number(batchId)]);
    ok(res, { batch, audit, recall_id: rec.insertId,
      sql: sqlLog([
        { label: 'Insert the recall', sql: showSql(recSql, recParams), rows: rec.affectedRows },
        { label: 'Batch status after the trigger ran', sql: showSql(batchSql, [Number(batchId)]), rows: 1 },
        { label: 'Audit rows written by the trigger', sql: showSql(auditSql, [Number(batchId)]), rows: audit.length },
      ]), trigger: 'trg_recall_sets_status + trg_audit_batch_status' });
  } catch (e) { fail(res, 500, e.message); }
  finally { conn.release(); }
});

app.post('/api/recalls/:id/status', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || '');
  const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid recall id.');
  if (!['active', 'completed', 'withdrawn'].includes(status)) return fail(res, 400, 'Invalid recall status.');
  try {
    const [[r]] = await pool.query('SELECT * FROM recalls WHERE recall_id = ?', [id]);
    if (!r) return fail(res, 404, 'Recall not found.');
    if (r.status === status) return fail(res, 409, `That recall is already ${status}.`);
    const conn = await pool.getConnection();
    try {
      await conn.query('SET @medtrace_actor_org_id = ?', [req.user.orgId]);
      await conn.query('UPDATE recalls SET status = ?, decision_note = ? WHERE recall_id = ?', [status, note, id]);
      const [[batch]] = await conn.query('SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?', [r.batch_id]);
      const [audit] = await conn.query('SELECT log_id, old_status, new_status, changed_at, reason FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5', [r.batch_id]);
      ok(res, { batch, audit,
        sql: sqlLog([
          { label: 'Update the recall lifecycle', sql: showSql('UPDATE recalls SET status = ?, decision_note = ? WHERE recall_id = ?', [status, note, id]), rows: 1 },
          { label: 'Batch status after the trigger ran', sql: showSql('SELECT batch_id, batch_code, status FROM batches WHERE batch_id = ?', [r.batch_id]), rows: 1 },
          { label: 'Audit rows written by the trigger', sql: showSql('SELECT log_id, old_status, new_status, changed_at, reason FROM audit_log WHERE batch_id = ? ORDER BY log_id DESC LIMIT 5', [r.batch_id]), rows: audit.length },
        ]), trigger: 'trg_recall_lifecycle + trg_audit_batch_status' });
    } finally { conn.release(); }
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/recalls/:id/acknowledge', requireAuth(['pharmacy', 'distributor']), async (req, res) => {
  const id = Number(req.params.id);
  const note = String(req.body?.note ?? '').trim().slice(0, 250) || null;
  if (!Number.isInteger(id)) return fail(res, 400, 'Invalid recall id.');
  try {
    const [[r]] = await pool.query('SELECT * FROM recalls WHERE recall_id = ?', [id]);
    if (!r) return fail(res, 404, 'Recall not found.');
    const orgId = req.user.orgId;
    const [[holds]] = await pool.query('SELECT quantity_on_hand FROM inventory WHERE org_id = ? AND batch_id = ?', [orgId, r.batch_id]);
    if (!holds) return fail(res, 403, 'Your organization does not hold stock of that batch.');
    await pool.query(
      `INSERT INTO recall_acknowledgements (recall_id, org_id, ack_by_user_id, note) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE acknowledged_at = NOW(), ack_by_user_id = VALUES(ack_by_user_id), note = VALUES(note)`,
      [id, orgId, req.user.userId, note]);
    ok(res, { message: 'Recall acknowledged. The regulator can see your organization has acted.' });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Create actions, restricted by role. Manufacturers create medicines/batches,
// manufacturers and distributors create shipments, pharmacies create sales.
// ---------------------------------------------------------------------------
app.post('/api/medicines', requireAuth(['manufacturer']), async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const composition = String(req.body?.composition ?? '').trim() || null;
  const dosageForm = String(req.body?.dosage_form ?? '').trim() || null;
  const strength = String(req.body?.strength ?? '').trim() || null;
  if (name.length < 2) return fail(res, 400, 'Enter the medicine name.');
  try {
    const params = [name, composition, dosageForm, strength, req.user.orgId];
    const sql = 'INSERT INTO medicines (name, composition, dosage_form, strength, manufacturer_id) VALUES (?, ?, ?, ?, ?)';
    const [r] = await pool.query(sql, params);
    ok(res, { medicine_id: r.insertId, sql: sqlLog([{ label: 'Insert the medicine', sql: showSql(sql, params), rows: r.affectedRows }]) });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/batches', requireAuth(['manufacturer']), async (req, res) => {
  const batchCode = String(req.body?.batch_code ?? '').trim().toUpperCase();
  const medicineId = Number(req.body?.medicine_id);
  const mfgDate = String(req.body?.mfg_date ?? '').trim();
  const expiryDate = String(req.body?.expiry_date ?? '').trim();
  const quantity = Number(req.body?.quantity);
  if (batchCode.length < 2) return fail(res, 400, 'Enter a batch code.');
  if (!Number.isInteger(medicineId)) return fail(res, 400, 'Choose a medicine.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(mfgDate) || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return fail(res, 400, 'Enter valid dates (YYYY-MM-DD).');
  if (expiryDate <= mfgDate) return fail(res, 400, 'The expiry date must be after the manufacturing date.');
  if (!Number.isInteger(quantity) || quantity <= 0) return fail(res, 400, 'Enter a quantity greater than zero.');
  try {
    const [[med]] = await pool.query('SELECT manufacturer_id FROM medicines WHERE medicine_id = ?', [medicineId]);
    if (!med) return fail(res, 404, 'Medicine not found.');
    if (med.manufacturer_id !== req.user.orgId) return fail(res, 403, 'You can only add batches for your own medicines.');
    const params = [batchCode, medicineId, req.user.orgId, mfgDate, expiryDate, quantity];
    const sql = "INSERT INTO batches (batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status) VALUES (?, ?, ?, ?, ?, ?, 'genuine')";
    const invSql = `INSERT INTO inventory (org_id, batch_id, quantity_on_hand) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand)`;
    const conn = await pool.getConnection();
    let batchId;
    try {
      await conn.beginTransaction();
      const [r] = await conn.query(sql, params);
      batchId = r.insertId;
      // A batch the manufacturer has just produced is stock they hold, so it can
      // be shipped right away. Without this the batch exists but has nowhere to go.
      await conn.query(invSql, [req.user.orgId, batchId, quantity]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally { conn.release(); }
    ok(res, { batch_id: batchId,
      sql: sqlLog([
        { label: 'Insert the batch', sql: showSql(sql, params), rows: 1 },
        { label: 'Add the produced stock to inventory', sql: showSql(invSql, [req.user.orgId, batchId, quantity]), rows: 1 },
      ]) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return fail(res, 409, 'That batch code already exists.');
    fail(res, 500, e.message);
  }
});

// Destinations a sender may ship to: every organization except its own.
app.get('/api/shipping-destinations', requireAuth(['manufacturer', 'distributor']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT org_id, name, org_type FROM organizations WHERE org_id <> ? ORDER BY org_type, name`,
      [req.user.orgId]);
    ok(res, { destinations: rows });
  } catch (e) { fail(res, 500, e.message); }
});

// Stock on hand for the signed-in organization only, with batch codes.
app.get('/api/my-stock', requireAuth(['manufacturer', 'distributor', 'pharmacy']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.batch_id, b.batch_code, m.name AS medicine, i.quantity_on_hand
         FROM inventory i
         JOIN batches b ON b.batch_id = i.batch_id
         JOIN medicines m ON m.medicine_id = b.medicine_id
        WHERE i.org_id = ? ORDER BY b.batch_code`, [req.user.orgId]);
    ok(res, { stock: rows });
  } catch (e) { fail(res, 500, e.message); }
});

app.post('/api/shipments', requireAuth(['manufacturer', 'distributor']), async (req, res) => {
  const toOrgId = Number(req.body?.to_org_id);
  const batchId = Number(req.body?.batch_id);
  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(toOrgId) || !Number.isInteger(batchId)) return fail(res, 400, 'Choose a destination and a batch.');
  if (!Number.isInteger(quantity) || quantity <= 0) return fail(res, 400, 'Enter a quantity greater than zero.');
  const fromOrgId = req.user.orgId;
  if (toOrgId === fromOrgId) return fail(res, 400, 'You cannot ship to your own organization.');
  const conn = await pool.getConnection();
  try {
    const [[dest]] = await conn.query('SELECT org_id FROM organizations WHERE org_id = ?', [toOrgId]);
    if (!dest) return fail(res, 404, 'Destination organization not found.');
    const [[stock]] = await conn.query('SELECT quantity_on_hand FROM inventory WHERE org_id = ? AND batch_id = ?', [fromOrgId, batchId]);
    if (!stock || stock.quantity_on_hand < quantity) return fail(res, 400, 'Not enough stock on hand to ship that many units.');
    await conn.beginTransaction();
    const shipSql = `INSERT INTO shipments (from_org_id, to_org_id, shipped_at, status) VALUES (?, ?, NOW(), 'in_transit')`;
    const [ship] = await conn.query(shipSql, [fromOrgId, toOrgId]);
    const shipmentId = ship.insertId;
    const itemSql = 'INSERT INTO shipment_items (shipment_id, batch_id, quantity) VALUES (?, ?, ?)';
    await conn.query(itemSql, [shipmentId, batchId, quantity]);
    await conn.query('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [quantity, fromOrgId, batchId]);
    await conn.query(
      `INSERT INTO inventory (org_id, batch_id, quantity_on_hand) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand)`,
      [toOrgId, batchId, quantity]);
    await conn.commit();
    ok(res, { shipment_id: shipmentId,
      sql: sqlLog([
        { label: 'Create the shipment', sql: showSql(shipSql, [fromOrgId, toOrgId]), rows: 1 },
        { label: 'Add the batch to it', sql: showSql(itemSql, [shipmentId, batchId, quantity]), rows: 1 },
        { label: 'Reduce stock at the sender', sql: showSql('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [quantity, fromOrgId, batchId]), rows: 1 },
        { label: 'Add stock at the receiver', sql: showSql('INSERT INTO inventory (org_id, batch_id, quantity_on_hand) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand)', [toOrgId, batchId, quantity]), rows: 1 },
      ]) });
  } catch (e) {
    await conn.rollback();
    fail(res, 500, e.message);
  } finally { conn.release(); }
});

app.post('/api/sales', requireAuth(['pharmacy']), async (req, res) => {
  const customerId = Number(req.body?.customer_id);
  const customerName = String(req.body?.customer_name ?? '').trim();
  const customerEmail = String(req.body?.customer_email ?? '').trim().toLowerCase() || null;
  const customerPhone = String(req.body?.customer_phone ?? '').trim() || null;
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!Number.isInteger(customerId) && customerName.length < 2) return fail(res, 400, 'Choose a customer, or enter the customer name.');
  if (customerEmail && !EMAIL_RE.test(customerEmail)) return fail(res, 400, 'Enter a valid customer email address.');
  if (customerPhone && !/^[0-9+\-\s()]{6,20}$/.test(customerPhone)) return fail(res, 400, 'Enter a valid customer phone number.');
  if (!items.length) return fail(res, 400, 'Add at least one batch to the sale.');
  const conn = await pool.getConnection();
  try {
    const pharmacyId = req.user.orgId;
    await conn.query('SET @medtrace_actor_org_id = ?', [pharmacyId]);
    await conn.beginTransaction();
    // Either an existing customer was chosen, or a new one is recorded from the
    // name (and optional email/phone) the pharmacy typed in. An email already on
    // file is reused rather than duplicated.
    let resolvedCustomerId = Number.isInteger(customerId) ? customerId : null;
    const logs = [];
    if (!resolvedCustomerId) {
      let existing = null;
      if (customerEmail) {
        const [[row]] = await conn.query('SELECT customer_id FROM customers WHERE email = ?', [customerEmail]);
        existing = row;
      }
      if (existing) {
        resolvedCustomerId = existing.customer_id;
        await conn.query('UPDATE customers SET name = ?, phone = COALESCE(?, phone) WHERE customer_id = ?',
          [customerName, customerPhone, resolvedCustomerId]);
      } else {
        const custSql = 'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)';
        const [c] = await conn.query(custSql, [customerName, customerPhone, customerEmail]);
        resolvedCustomerId = c.insertId;
        logs.push({ label: 'Record the new customer', sql: showSql(custSql, [customerName, customerPhone, customerEmail]), rows: 1 });
      }
    }
    let total = 0;
    const lines = [];
    for (const it of items) {
      const batchId = Number(it.batch_id);
      const qty = Number(it.quantity);
      const price = Number(it.unit_price ?? 0);
      if (!Number.isInteger(batchId) || !Number.isInteger(qty) || qty <= 0) { await conn.rollback(); return fail(res, 400, 'Each line needs a batch and a positive quantity.'); }
      const [[b]] = await conn.query('SELECT batch_id FROM batches WHERE batch_id = ?', [batchId]);
      if (!b) { await conn.rollback(); return fail(res, 404, `Batch ${batchId} not found.`); }
      lines.push({ batchId, qty, price });
      total += qty * price;
    }
    const saleSql = 'INSERT INTO sales (pharmacy_id, customer_id, sale_date, total_amount) VALUES (?, ?, CURDATE(), ?)';
    const [sale] = await conn.query(saleSql, [pharmacyId, resolvedCustomerId, total.toFixed(2)]);
    const saleId = sale.insertId;
    const itemSql = 'INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES (?, ?, ?, ?)';
    logs.push({ label: 'Create the sale', sql: showSql(saleSql, [pharmacyId, resolvedCustomerId, total.toFixed(2)]), rows: 1 });
    for (const l of lines) {
      await conn.query(itemSql, [saleId, l.batchId, l.qty, l.price]);
      await conn.query('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [l.qty, pharmacyId, l.batchId]);
      logs.push({ label: 'Add a line (the trigger inspects the batch here)', sql: showSql(itemSql, [saleId, l.batchId, l.qty, l.price]), rows: 1 });
      logs.push({ label: 'Reduce pharmacy stock', sql: showSql('UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE org_id = ? AND batch_id = ?', [l.qty, pharmacyId, l.batchId]), rows: 1 });
    }
    await conn.commit();
    ok(res, { sale_id: saleId, total: Number(total.toFixed(2)), sql: sqlLog(logs), trigger: 'trg_block_bad_sale' });
  } catch (e) {
    await conn.rollback();
    if (e.sqlState === '45000') {
      return ok(res, { blocked: true, message: e.sqlMessage, trigger: 'trg_block_bad_sale',
        error: { sqlState: e.sqlState, code: e.code, message: e.sqlMessage } });
    }
    fail(res, 500, e.message);
  } finally { conn.release(); }
});

// Demo/QA only: prove the sale-blocking rule without persisting a sale.
app.post('/api/demo/sales-attempt', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const batchId = Number(req.body?.batchId);
  const quantity = Number(req.body?.quantity || 1);
  if (!batchId) return fail(res, 400, 'Choose a batch.');
  const conn = await pool.getConnection();
  let saleSql = null, itemSql = null, itemParams = null;
  try {
    const [[ph]] = await conn.query("SELECT org_id FROM organizations WHERE org_type = 'pharmacy' ORDER BY org_id LIMIT 1");
    const [[cu]] = await conn.query('SELECT customer_id FROM customers ORDER BY customer_id LIMIT 1');
    if (!ph || !cu) return fail(res, 400, 'No pharmacy or customer rows exist to run the demo.');
    saleSql = `INSERT INTO sales (pharmacy_id, customer_id, sale_date, total_amount) VALUES (${ph.org_id}, ${cu.customer_id}, CURDATE(), 0)`;
    itemSql = 'INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES (?, ?, ?, 30)';
    await conn.query('SET @medtrace_actor_org_id = ?', [ph.org_id]);
    await conn.beginTransaction();
    await conn.query(saleSql);
    const [sale] = await conn.query('SELECT LAST_INSERT_ID() AS id');
    itemParams = [sale[0].id, batchId, quantity];
    await conn.query(itemSql, itemParams);
    await conn.rollback();
    ok(res, { blocked: false, message: 'Sale allowed: this batch is safe to sell.',
      sql: sqlLog([
        { label: 'Create the sale row', sql: showSql(saleSql), rows: 1 },
        { label: 'Add the line item (the trigger inspects the batch here)', sql: showSql(itemSql, itemParams), rows: 1 },
      ]), trigger: 'trg_block_bad_sale', rolledBack: true });
  } catch (e) {
    await conn.rollback();
    if (e.sqlState === '45000') {
      return ok(res, { blocked: true, message: e.sqlMessage,
        sql: sqlLog([
          { label: 'Create the sale row', sql: showSql(saleSql), rows: 1 },
          { label: 'Add the line item (rejected by the trigger)', sql: showSql(itemSql, itemParams), rows: 0 },
        ]), trigger: 'trg_block_bad_sale', error: { sqlState: e.sqlState, code: e.code, message: e.sqlMessage }, rolledBack: true });
    }
    fail(res, 500, e.message);
  } finally { conn.release(); }
});

// ---------------------------------------------------------------------------
// Dashboard. The shape of the data depends on the role, and every query is
// scoped to what that role may see.
// ---------------------------------------------------------------------------
app.get('/api/dashboard', requireAuth(), async (req, res) => {
  const role = req.user.role;
  const u = req.user;
  try {
    const batchScope = scopedSql('batches', u);
    const [batchesByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n, SUM(quantity) AS units FROM (${batchScope.sql}) b GROUP BY status ORDER BY n DESC`, batchScope.params);
    const invScope = scopedSql('inventory', u);
    const [inventoryByOrg] = await pool.query(
      `SELECT t.organization AS org, SUM(t.quantity_on_hand) AS units
         FROM (${invScope.sql}) t
        GROUP BY t.organization ORDER BY units DESC`, invScope.params);
    const scanScope = scopedSql('verification_scans', u);
    const [scansByResult] = await pool.query(
      `SELECT result, COUNT(*) AS n FROM (${scanScope.sql}) v GROUP BY result ORDER BY n DESC`, scanScope.params);
    const shipScope = scopedSql('shipments', u);
    const [shipmentsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n FROM (${shipScope.sql}) s GROUP BY status ORDER BY n DESC`, shipScope.params);
    const [recentScans] = await pool.query(
      `SELECT batch_code_entered, result, scanned_at FROM (${scanScope.sql}) v ORDER BY scanned_at DESC LIMIT 6`, scanScope.params);
    let recentActivity = [];
    if (canSee(role, 'audit_log')) {
      const aScope = scopedSql('audit_log', u);
      [recentActivity] = await pool.query(
        `SELECT a.log_id, a.batch_code, a.old_status, a.new_status, a.changed_by, a.changed_at, a.reason
           FROM (${aScope.sql}) a
          ORDER BY a.changed_at DESC, a.log_id DESC LIMIT 8`, aScope.params);
    }
    let salesByPharmacy = [], salesByMonth = [], totalSales = 0, revenue = 0;
    if (canSee(role, 'sales')) {
      const sScope = scopedSql('sales', u);
      [salesByPharmacy] = await pool.query(
        `SELECT s.pharmacy, COUNT(s.sale_id) AS bills, SUM(s.total_amount) AS revenue
           FROM (${sScope.sql}) s
          GROUP BY s.pharmacy ORDER BY revenue DESC`, sScope.params);
      [salesByMonth] = await pool.query(
        `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS ym, COUNT(*) AS n, SUM(total_amount) AS revenue
           FROM (${sScope.sql}) s GROUP BY ym ORDER BY ym`, sScope.params);
      const [[t]] = await pool.query(`SELECT COUNT(*) AS n, COALESCE(SUM(total_amount),0) AS revenue FROM (${sScope.sql}) s`, sScope.params);
      totalSales = t.n; revenue = Number(t.revenue);
    }
    const recallScope = scopedSql('recalls', u);
    const [recallsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS n FROM (${recallScope.sql}) r GROUP BY status ORDER BY n DESC`, recallScope.params);
    ok(res, { role, batchesByStatus, inventoryByOrg, scansByResult, shipmentsByStatus, salesByPharmacy,
      recentActivity, recentScans, salesByMonth, recallsByStatus, totals: { sales: totalSales, revenue } });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Global search, restricted to the datasets this role may open (and scoped).
// ---------------------------------------------------------------------------
app.get('/api/search', requireAuth(), async (req, res) => {
  const q = String(req.query.q || '').trim();
  const allowed = (ACCESS[req.user.role] || []).filter((n) => canSee(req.user.role, n));
  if (q.length < 2) return ok(res, { q, hits: [] });
  // Role and organization-type enums are stored lowercase; show them as labels.
  const ROLE_LABEL = { admin: 'System administrator', regulator: 'Regulator', manufacturer: 'Manufacturer', distributor: 'Distributor', pharmacy: 'Pharmacy', customer: 'Customer' };
  try {
    const hits = [];
    for (const name of allowed) {
      const d = DATASETS[name];
      const scoped = scopedSql(name, req.user);
      // Search and label the human-readable columns only. Id columns would match
      // every row on a numeric query and read as noise in the result list.
      const shown = d.columns.filter((c) => c.kind !== 'id');
      const concat = shown.map((c) => `COALESCE(t.\`${c.key}\`, '')`).join(", ' ', ");
      const sql = `SELECT * FROM (${scoped.sql}) t WHERE CONCAT_WS(' ', ${concat}) LIKE ? ORDER BY 1 LIMIT 5`;
      const [rows] = await pool.query(sql, [...scoped.params, `%${q}%`]);
      for (const r of rows) {
        hits.push({ dataset: name, title: d.title,
          label: shown.map((c) => ROLE_LABEL[r[c.key]] || r[c.key]).filter((v) => v !== null && v !== '').slice(0, 3).join(' · '),
          row: d.columns.map((c) => r[c.key]) });
      }
      if (hits.length >= 25) break;
    }
    ok(res, { q, hits: hits.slice(0, 25) });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Schema: real DDL read back from MySQL. Regulator/admin only.
// ---------------------------------------------------------------------------
const TABLE_NOTES = {
  organizations: 'Everyone who handles medicine: manufacturers, distributors, pharmacies and regulators.',
  medicines: 'The product catalogue: name, composition, dosage form and strength.',
  batches: 'The heart of the system. One production run per row, with the printed batch code and status.',
  shipments: 'One organization sending stock to another.',
  shipment_items: 'Junction table: which batches travel in each shipment (many-to-many).',
  inventory: 'Junction table: how much of each batch an organization holds right now.',
  customers: 'People who buy medicine from a pharmacy.',
  sales: 'One bill per sale, made by a pharmacy to a customer.',
  sale_items: 'Junction table: the lines on a bill — which batches, how many, at what price.',
  recalls: 'Problems a regulator found in a batch, with severity and date.',
  verification_scans: 'Every time someone types a batch code to check it.',
  audit_log: 'A row for each batch status change — who, when and why.',
};
const RELATIONS = {
  organizations: 'medicines.manufacturer_id, batches.manufacturer_id, shipments.from_org_id / to_org_id, inventory.org_id, sales.pharmacy_id, recalls.regulator_id, audit_log.changed_by_org_id',
  medicines: 'batches.medicine_id',
  batches: 'shipment_items.batch_id, inventory.batch_id, sale_items.batch_id, verification_scans.batch_id, recalls.batch_id, audit_log.batch_id',
  shipments: 'shipment_items.shipment_id',
  shipment_items: 'shipment_id to shipments, batch_id to batches (composite PK)',
  inventory: 'org_id to organizations, batch_id to batches (composite PK)',
  customers: 'sales.customer_id, verification_scans.customer_id',
  sales: 'sale_items.sale_id',
  sale_items: 'sale_id to sales, batch_id to batches (composite PK)',
  recalls: 'batch_id to batches, regulator_id to organizations',
  verification_scans: 'batch_id to batches (nullable), customer_id to customers (nullable)',
  audit_log: 'batch_id to batches, changed_by_org_id to organizations',
};

app.get('/api/schema', requireAuth(['regulator', 'admin']), async (_req, res) => {
  const db = process.env.DB_NAME || 'medicine_traceability';
  try {
    const [cols] = await pool.query(
      `SELECT TABLE_NAME AS tbl, COLUMN_NAME AS col, COLUMN_TYPE AS type, IS_NULLABLE AS nullable,
              COLUMN_KEY AS ckey, COLUMN_DEFAULT AS dflt, EXTRA AS extra, ORDINAL_POSITION AS pos
         FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION`, [db]);
    const [keyRows] = await pool.query(
      `SELECT TABLE_NAME AS tbl, CONSTRAINT_NAME AS name, COLUMN_NAME AS col,
              REFERENCED_TABLE_NAME AS ref_tbl, REFERENCED_COLUMN_NAME AS ref_col
         FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY TABLE_NAME, CONSTRAINT_NAME`, [db]);
    const [indexRows] = await pool.query(
      `SELECT TABLE_NAME AS tbl, INDEX_NAME AS name, COLUMN_NAME AS col, NON_UNIQUE AS non_unique
         FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`, [db]);
    const order = Object.keys(TABLE_NOTES);
    const byTable = {};
    for (const r of cols) { if (!order.includes(r.tbl)) continue; (byTable[r.tbl] ||= []).push(r); }
    const fksByTable = {};
    for (const r of keyRows) (fksByTable[r.tbl] ||= []).push(r);
    const idxByTable = {};
    for (const r of indexRows) (idxByTable[r.tbl] ||= []).push(r);
    const tables = order.map((t) => {
      const cs = byTable[t] || [];
      const colsOut = cs.map((c) => ({
        name: c.col, type: c.type, nullable: c.nullable === 'YES', key: c.ckey, default: c.dflt, extra: c.extra,
        isPk: c.ckey === 'PRI', isFk: (fksByTable[t] || []).some((f) => f.col === c.col), isUq: c.ckey === 'UNI' }));
      const fks = [...new Map((fksByTable[t] || []).map((f) => [f.name, f])).values()].map((f) => ({
        name: f.name, col: f.col, refTable: f.ref_tbl, refCol: f.ref_col }));
      return { name: t, note: TABLE_NOTES[t], relations: RELATIONS[t], columns: colsOut,
        primaryKey: cs.filter((c) => c.ckey === 'PRI').map((c) => c.col),
        uniqueKeys: cs.filter((c) => c.ckey === 'UNI').map((c) => c.col),
        foreignKeys: fks, indexes: [...new Set((idxByTable[t] || []).map((i) => i.name))] };
    });
    const ddl = {};
    for (const t of order) { const [r] = await pool.query(`SHOW CREATE TABLE \`${t}\``); ddl[t] = r[0]['Create Table']; }
    const [viewRows] = await pool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.VIEWS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`, [db]);
    const views = [];
    for (const v of viewRows) { const [r] = await pool.query(`SHOW CREATE VIEW \`${v.name}\``); views.push({ name: v.name, ddl: r[0]['Create View'] }); }
    const [trigRows] = await pool.query(
      `SELECT TRIGGER_NAME AS name, EVENT_MANIPULATION AS event, EVENT_OBJECT_TABLE AS tbl, ACTION_TIMING AS timing
         FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? ORDER BY TRIGGER_NAME`, [db]);
    const triggers = [];
    for (const tr of trigRows) {
      const [r] = await pool.query(`SHOW CREATE TRIGGER \`${tr.name}\``);
      triggers.push({ name: tr.name, event: tr.event, table: tr.tbl, timing: tr.timing, ddl: r[0]['SQL Original Statement'] });
    }
    ok(res, { database: db, tables, views, triggers, ddl });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// SQL report library. Regulator/admin only — the reports read across the whole
// database, which would defeat the per-organization isolation for staff.
// ---------------------------------------------------------------------------
const QUERIES = [
  { id: 'joins_full_trace', title: 'Full trace: batch to shipment to organizations', concept: 'INNER JOIN across 5 tables',
    note: 'Follows one batch through every shipment it travelled in, showing who sent it and who received it.',
    sql: `SELECT b.batch_code, m.name AS medicine, s.shipment_id, o1.name AS from_org, o2.name AS to_org, si.quantity, s.status AS shipment_status
  FROM batches b JOIN medicines m ON m.medicine_id = b.medicine_id
  JOIN shipment_items si ON si.batch_id = b.batch_id JOIN shipments s ON s.shipment_id = si.shipment_id
  JOIN organizations o1 ON o1.org_id = s.from_org_id JOIN organizations o2 ON o2.org_id = s.to_org_id
 ORDER BY b.batch_code, s.shipment_id` },
  { id: 'group_by_org', title: 'Shipments per organization', concept: 'GROUP BY with COUNT',
    note: 'Counts how many shipments each organization sent (from) and received (to).',
    sql: `SELECT o.name AS organization, o.org_type, COUNT(DISTINCT s_out.shipment_id) AS sent, COUNT(DISTINCT s_in.shipment_id) AS received
  FROM organizations o LEFT JOIN shipments s_out ON s_out.from_org_id = o.org_id LEFT JOIN shipments s_in ON s_in.to_org_id = o.org_id
 GROUP BY o.org_id, o.name, o.org_type ORDER BY sent DESC, received DESC` },
  { id: 'having_blocked', title: 'Batches that cannot be sold', concept: 'WHERE + ORDER BY on an ENUM status',
    note: 'Lists every batch a pharmacy must pull from the shelf because it is recalled, fake or expired.',
    sql: `SELECT b.batch_code, m.name AS medicine, b.status, b.expiry_date,
       CASE WHEN b.status='recalled' THEN 'Recall in force' WHEN b.status='suspected_fake' THEN 'Under investigation'
            WHEN b.expiry_date < CURDATE() THEN 'Past expiry date' ELSE 'Safe to sell' END AS reason
  FROM batches b JOIN medicines m ON m.medicine_id = b.medicine_id
 WHERE b.status <> 'genuine' OR b.expiry_date < CURDATE() ORDER BY b.status` },
  { id: 'subquery_top_customers', title: 'Customers ranked by units bought', concept: 'JOIN + GROUP BY + HAVING + SUM',
    note: 'Shows which customers bought the most medicine, counting only customers above 2 units.',
    sql: `SELECT c.name AS customer, c.phone, COUNT(si.sale_id) AS line_items, SUM(si.quantity) AS units, SUM(si.quantity * si.unit_price) AS spend
  FROM customers c JOIN sales s ON s.customer_id = c.customer_id JOIN sale_items si ON si.sale_id = s.sale_id
 GROUP BY c.customer_id, c.name, c.phone HAVING units > 2 ORDER BY units DESC` },
  { id: 'view_batch_flow', title: 'Forward trace using the view', concept: 'SELECT from a VIEW (v_batch_flow)',
    note: 'The same trace as the first query, but reading the saved view the Trace page uses.',
    sql: `SELECT batch_code, medicine, shipment_id, from_org, to_org, quantity, shipment_status FROM v_batch_flow ORDER BY batch_code, shipment_id` },
  { id: 'view_batch_customers', title: 'Who received a batch', concept: 'SELECT from a VIEW (v_batch_customers)',
    note: 'For each batch, the customers who bought it — the list a recall would notify.',
    sql: `SELECT batch_code, customer, phone, quantity, unit_price, sale_date, pharmacy FROM v_batch_customers ORDER BY batch_code, sale_date` },
  { id: 'inventory_low', title: 'Stock held per organization', concept: 'Multi-table JOIN + SUM',
    note: 'Total stock on hand for every organization and batch, useful for spotting low inventory.',
    sql: `SELECT o.name AS organization, m.name AS medicine, b.batch_code, i.quantity_on_hand, i.last_updated
  FROM inventory i JOIN organizations o ON o.org_id = i.org_id JOIN batches b ON b.batch_id = i.batch_id JOIN medicines m ON m.medicine_id = b.medicine_id
 ORDER BY i.quantity_on_hand ASC` },
  { id: 'audit_trail', title: 'Audit trail of status changes', concept: 'JOIN + ORDER BY on the log table',
    note: 'Every status change of a batch, written automatically by the audit trigger.',
    sql: `SELECT a.log_id, b.batch_code, a.old_status, a.new_status, o.name AS changed_by, a.changed_at, a.reason
  FROM audit_log a JOIN batches b ON b.batch_id = a.batch_id LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id
 ORDER BY a.changed_at DESC` },
  { id: 'scan_summary', title: 'Verification scans by result', concept: 'GROUP BY on an ENUM with COUNT',
    note: 'How many batch-code checks ended genuine, recalled, expired, suspected counterfeit or unknown.',
    sql: `SELECT result, COUNT(*) AS scans FROM verification_scans GROUP BY result ORDER BY scans DESC` },
];

app.get('/api/queries', requireAuth(REGULATOR_ROLES), (_req, res) => {
  ok(res, { queries: QUERIES.map(({ id, title, concept, note }) => ({ id, title, concept, note })) });
});

app.get('/api/queries/:id', requireAuth(REGULATOR_ROLES), async (req, res) => {
  const qy = QUERIES.find((q) => q.id === req.params.id);
  if (!qy) return fail(res, 404, 'Unknown query.');
  try {
    const [rows] = await pool.query(qy.sql);
    const columns = rows.length ? Object.keys(rows[0]) : [];
    const data = rows.map((r) => columns.map((c) => (r[c] instanceof Date ? r[c].toISOString() : r[c])));
    ok(res, { id: qy.id, title: qy.title, concept: qy.concept, note: qy.note, sql: qy.sql, columns, rows: data });
  } catch (e) { fail(res, 500, e.message); }
});

// ---------------------------------------------------------------------------
// Live database watch (unchanged): reflect changes made to MySQL by anyone.
// ---------------------------------------------------------------------------
app.get('/api/changes/status', async (_req, res) => {
  try { const s = await snapshot(); ok(res, { at: s.at, tables: s.tables }); }
  catch (e) { fail(res, 500, e.message); }
});

app.get('/api/changes/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write(': connected\n\n');
  subscribe(res);
  const beat = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 20000);
  if (beat.unref) beat.unref();
  req.on('close', () => { clearInterval(beat); unsubscribe(res); });
});

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------
const publicDir = join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(join(publicDir, 'index.html')));

const PORT = Number(process.env.PORT || 12000);
app.listen(PORT, () => console.log(`MedTrace running on http://localhost:${PORT}`));
```

====================================================================================================
FILE: server/access.js
====================================================================================================
```javascript
// Access control: which datasets each role may open, and the SQL that limits
// every read to the rows that role is allowed to see. This is the single source
// of truth for row-level security — the API never trusts a role or org id sent
// by the client, it always derives them from the signed-in account.

export const DATASETS = {
  organizations: {
    title: 'Organizations',
    desc: 'Everyone who handles medicine: manufacturers, distributors, pharmacies and regulators.',
    sql: `SELECT o.org_id, o.name, o.org_type, o.license_no, o.address, o.city, o.country
          FROM organizations o`,
    columns: [
      { key: 'org_id', label: 'Org ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'org_type', label: 'Type', kind: 'badge' },
      { key: 'license_no', label: 'License No', kind: 'code' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
    ],
  },
  medicines: {
    title: 'Medicines',
    desc: 'The product catalogue and who makes each medicine.',
    sql: `SELECT m.medicine_id, m.name, m.composition, m.dosage_form, m.strength,
                 o.name AS manufacturer
          FROM medicines m JOIN organizations o ON o.org_id = m.manufacturer_id`,
    columns: [
      { key: 'medicine_id', label: 'Medicine ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'composition', label: 'Composition' },
      { key: 'dosage_form', label: 'Dosage Form' },
      { key: 'strength', label: 'Strength' },
      { key: 'manufacturer', label: 'Manufacturer', kind: 'org' },
    ],
  },
  batches: {
    title: 'Batches',
    desc: 'Each production run, with its printed batch code and current status.',
    sql: `SELECT b.batch_id, b.batch_code, m.name AS medicine, o.name AS manufacturer,
                 b.mfg_date, b.expiry_date, b.quantity, b.status
          FROM batches b
          JOIN medicines m ON m.medicine_id = b.medicine_id
          JOIN organizations o ON o.org_id = b.manufacturer_id`,
    columns: [
      { key: 'batch_id', label: 'Batch ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'medicine', label: 'Medicine', kind: 'medicine' },
      { key: 'manufacturer', label: 'Manufacturer', kind: 'org' },
      { key: 'mfg_date', label: 'Mfg Date', kind: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', kind: 'date' },
      { key: 'quantity', label: 'Quantity', kind: 'number' },
      { key: 'status', label: 'Status', kind: 'badge' },
    ],
  },
  shipments: {
    title: 'Shipments',
    desc: 'Stock moving from one organization to another.',
    sql: `SELECT s.shipment_id, o1.name AS from_org, o2.name AS to_org,
                 s.shipped_at, s.received_at, s.status
          FROM shipments s
          JOIN organizations o1 ON o1.org_id = s.from_org_id
          JOIN organizations o2 ON o2.org_id = s.to_org_id`,
    columns: [
      { key: 'shipment_id', label: 'Shipment ID', kind: 'id' },
      { key: 'from_org', label: 'From', kind: 'org' },
      { key: 'to_org', label: 'To', kind: 'org' },
      { key: 'shipped_at', label: 'Shipped', kind: 'date' },
      { key: 'received_at', label: 'Received', kind: 'date' },
      { key: 'status', label: 'Status', kind: 'badge' },
    ],
  },
  shipment_items: {
    title: 'Shipment items',
    desc: 'Which batches, and how many, travel in each shipment.',
    sql: `SELECT si.shipment_id, b.batch_code, si.quantity
          FROM shipment_items si JOIN batches b ON b.batch_id = si.batch_id`,
    columns: [
      { key: 'shipment_id', label: 'Shipment ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity', label: 'Quantity', kind: 'number' },
    ],
  },
  inventory: {
    title: 'Inventory',
    desc: 'How much of each batch an organization holds right now.',
    sql: `SELECT o.name AS organization, b.batch_code, i.quantity_on_hand, i.last_updated
          FROM inventory i
          JOIN organizations o ON o.org_id = i.org_id
          JOIN batches b ON b.batch_id = i.batch_id`,
    columns: [
      { key: 'organization', label: 'Organization', kind: 'org' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity_on_hand', label: 'On Hand', kind: 'number' },
      { key: 'last_updated', label: 'Last Updated', kind: 'date' },
    ],
  },
  customers: {
    title: 'Customers',
    desc: 'People who bought medicine from a pharmacy. Personal data — restricted.',
    sql: `SELECT customer_id, name, phone, email FROM customers`,
    columns: [
      { key: 'customer_id', label: 'Customer ID', kind: 'id' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ],
    pii: true,
  },
  sales: {
    title: 'Sales',
    desc: 'One bill per sale, from a pharmacy to a customer.',
    sql: `SELECT s.sale_id, o.name AS pharmacy, c.name AS customer,
                 s.sale_date, s.total_amount
          FROM sales s
          JOIN organizations o ON o.org_id = s.pharmacy_id
          JOIN customers c ON c.customer_id = s.customer_id`,
    columns: [
      { key: 'sale_id', label: 'Sale ID', kind: 'id' },
      { key: 'pharmacy', label: 'Pharmacy', kind: 'org' },
      { key: 'customer', label: 'Customer', kind: 'customer' },
      { key: 'sale_date', label: 'Sale Date', kind: 'date' },
      { key: 'total_amount', label: 'Total', kind: 'money' },
    ],
    pii: true,
  },
  sale_items: {
    title: 'Sale items',
    desc: 'The lines on each bill.',
    sql: `SELECT si.sale_id, b.batch_code, si.quantity, si.unit_price
          FROM sale_items si JOIN batches b ON b.batch_id = si.batch_id`,
    columns: [
      { key: 'sale_id', label: 'Sale ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'quantity', label: 'Quantity', kind: 'number' },
      { key: 'unit_price', label: 'Unit Price', kind: 'money' },
    ],
  },
  recalls: {
    title: 'Recalls',
    desc: 'Problems found by a regulator, with severity and reason.',
    sql: `SELECT r.recall_id, b.batch_code, o.name AS regulator, r.reason,
                 r.severity, r.recall_date, r.status
          FROM recalls r
          JOIN batches b ON b.batch_id = r.batch_id
          JOIN organizations o ON o.org_id = r.regulator_id`,
    columns: [
      { key: 'recall_id', label: 'Recall ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'regulator', label: 'Regulator', kind: 'org' },
      { key: 'reason', label: 'Reason' },
      { key: 'severity', label: 'Severity', kind: 'badge' },
      { key: 'recall_date', label: 'Recall Date', kind: 'date' },
      { key: 'status', label: 'Status', kind: 'badge' },
    ],
  },
  verification_scans: {
    title: 'Verification scans',
    desc: 'Every time someone checked a batch code. Unknown codes may point to fake medicine.',
    sql: `SELECT v.scan_id, v.batch_code_entered, b.batch_code AS matched_code,
                 v.scanned_at, v.result
          FROM verification_scans v
          LEFT JOIN batches b ON b.batch_id = v.batch_id`,
    columns: [
      { key: 'scan_id', label: 'Scan ID', kind: 'id' },
      { key: 'batch_code_entered', label: 'Code Entered', kind: 'code' },
      { key: 'matched_code', label: 'Matched Batch', kind: 'code' },
      { key: 'scanned_at', label: 'Scanned At', kind: 'date' },
      { key: 'result', label: 'Result', kind: 'badge' },
    ],
  },
  audit_log: {
    title: 'Audit log',
    desc: 'A record of every batch status change: who, when and why.',
    sql: `SELECT a.log_id, b.batch_code, a.old_status, a.new_status,
                 o.name AS changed_by, a.changed_at, a.reason
          FROM audit_log a
          JOIN batches b ON b.batch_id = a.batch_id
          LEFT JOIN organizations o ON o.org_id = a.changed_by_org_id`,
    columns: [
      { key: 'log_id', label: 'Log ID', kind: 'id' },
      { key: 'batch_code', label: 'Batch Code', kind: 'code' },
      { key: 'old_status', label: 'Old Status', kind: 'badge' },
      { key: 'new_status', label: 'New Status', kind: 'badge' },
      { key: 'changed_by', label: 'Changed By', kind: 'org' },
      { key: 'changed_at', label: 'Changed At', kind: 'date' },
      { key: 'reason', label: 'Reason' },
    ],
  },
};

export const ALL_DATASETS = Object.keys(DATASETS);

// Which datasets each role can open at all. Regulator and admin see everything;
// customers have no dataset access (they only get the public verify page).
export const ACCESS = {
  admin: ALL_DATASETS,
  regulator: ALL_DATASETS,
  manufacturer: ['medicines', 'batches', 'shipments', 'shipment_items', 'inventory', 'recalls', 'verification_scans', 'audit_log'],
  distributor: ['medicines', 'batches', 'shipments', 'shipment_items', 'inventory', 'recalls', 'verification_scans'],
  pharmacy: ['medicines', 'batches', 'inventory', 'customers', 'sales', 'sale_items', 'recalls', 'verification_scans'],
  customer: [],
};

export const GROUPS = [
  ['Master data', ['organizations', 'medicines', 'batches']],
  ['Movement', ['shipments', 'shipment_items', 'inventory']],
  ['Sales', ['customers', 'sales', 'sale_items']],
  ['Safety', ['recalls', 'verification_scans', 'audit_log']],
];

// Roles that act on behalf of one organization and therefore only ever see
// that organization's rows.
const isStaff = (role) => ['manufacturer', 'distributor', 'pharmacy'].includes(role);
const isGlobal = (role) => role === 'regulator' || role === 'admin';

// SQL for "the batch ids this user may see", reused by every batch-related
// dataset so the isolation rule is written once.
function visibleBatches(role, orgId) {
  if (isGlobal(role)) return { sql: 'SELECT batch_id FROM batches', params: [] };
  if (role === 'manufacturer') return { sql: 'SELECT batch_id FROM batches WHERE manufacturer_id = ?', params: [orgId] };
  if (role === 'distributor') {
    return {
      sql: `SELECT batch_id FROM batches WHERE batch_id IN (SELECT batch_id FROM inventory WHERE org_id = ?)
            OR batch_id IN (SELECT si.batch_id FROM shipment_items si JOIN shipments s ON s.shipment_id = si.shipment_id
                            WHERE s.from_org_id = ? OR s.to_org_id = ?)`,
      params: [orgId, orgId, orgId],
    };
  }
  if (role === 'pharmacy') {
    return {
      sql: `SELECT batch_id FROM batches WHERE batch_id IN (SELECT batch_id FROM inventory WHERE org_id = ?)
            OR batch_id IN (SELECT si.batch_id FROM sale_items si JOIN sales sa ON sa.sale_id = si.sale_id
                            WHERE sa.pharmacy_id = ?)`,
      params: [orgId, orgId],
    };
  }
  return { sql: 'SELECT batch_id FROM batches WHERE 1 = 0', params: [] }; // customer / unknown: nothing
}

// The WHERE clause (and its parameters) that restrict one dataset to the rows
// this user may see. Returns { where, params } — where may be empty for a role
// that can see everything.
export function scopeFor(dataset, user) {
  const role = user?.role;
  const orgId = user?.orgId ?? null;
  if (isGlobal(role)) return { where: '', params: [] };

  switch (dataset) {
    case 'organizations':
      // Staff see only their own organization; the customer sees none.
      return isStaff(role) ? { where: 'WHERE o.org_id = ?', params: [orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'medicines': {
      if (role === 'manufacturer') return { where: 'WHERE m.manufacturer_id = ?', params: [orgId] };
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE m.medicine_id IN (SELECT medicine_id FROM batches WHERE batch_id IN (${vb.sql}))`, params: vb.params };
    }

    case 'batches': {
      if (role === 'manufacturer') return { where: 'WHERE b.manufacturer_id = ?', params: [orgId] };
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE b.batch_id IN (${vb.sql})`, params: vb.params };
    }

    case 'shipments':
      return isStaff(role) ? { where: 'WHERE s.from_org_id = ? OR s.to_org_id = ?', params: [orgId, orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'shipment_items':
      return isStaff(role)
        ? { where: 'WHERE si.shipment_id IN (SELECT shipment_id FROM shipments WHERE from_org_id = ? OR to_org_id = ?)', params: [orgId, orgId] }
        : { where: 'WHERE 1 = 0', params: [] };

    case 'inventory':
      return isStaff(role) ? { where: 'WHERE i.org_id = ?', params: [orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'customers':
      // Only a pharmacy sees the customers it sold to; nobody else.
      return role === 'pharmacy'
        ? { where: 'WHERE customer_id IN (SELECT customer_id FROM sales WHERE pharmacy_id = ?)', params: [orgId] }
        : { where: 'WHERE 1 = 0', params: [] };

    case 'sales':
      return role === 'pharmacy' ? { where: 'WHERE s.pharmacy_id = ?', params: [orgId] } : { where: 'WHERE 1 = 0', params: [] };

    case 'sale_items':
      return role === 'pharmacy'
        ? { where: 'WHERE si.sale_id IN (SELECT sale_id FROM sales WHERE pharmacy_id = ?)', params: [orgId] }
        : { where: 'WHERE 1 = 0', params: [] };

    case 'recalls': {
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE r.batch_id IN (${vb.sql})`, params: vb.params };
    }

    case 'verification_scans': {
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE v.batch_id IN (${vb.sql})`, params: vb.params };
    }

    case 'audit_log': {
      const vb = visibleBatches(role, orgId);
      return { where: `WHERE a.batch_id IN (${vb.sql})`, params: vb.params };
    }

    default:
      return { where: 'WHERE 1 = 0', params: [] };
  }
}

// The full, scoped SQL for a dataset and a user (dataset.sql has no ORDER BY /
// WHERE of its own, so we append the scope and the ordering).
export function scopedSql(dataset, user) {
  const d = DATASETS[dataset];
  const { where, params } = scopeFor(dataset, user);
  return { sql: `${d.sql} ${where} ORDER BY 1`.trim(), params };
}

export const canSee = (role, dataset) => (ACCESS[role] || []).includes(dataset);
```

====================================================================================================
FILE: server/auth.js
====================================================================================================
```javascript
// Password hashing and session tokens for the account store.
// Passwords are never stored or compared in plain text: each one gets a random
// salt and a scrypt hash, and comparison is timing-safe.
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'medtrace-dev-secret-change-me';
const KEYLEN = 64;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Roles that belong to an organization, and the org_type each must match.
export const STAFF_ROLES = ['manufacturer', 'distributor', 'pharmacy'];
export const ALL_ROLES = ['admin', 'regulator', 'manufacturer', 'distributor', 'pharmacy', 'customer'];
// Roles a member of the public may not obtain by self-registration.
export const PRIVILEGED_ROLES = ['admin', 'regulator'];

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const expected = Buffer.from(parts[2], 'hex');
  if (!expected.length) return false;
  const actual = scryptSync(password, parts[1], expected.length);
  return timingSafeEqual(expected, actual);
}

// Stateless signed token: "<userId>.<expiry>.<hmac>". Survives a server restart,
// so a signed-in session is not lost when the process reloads.
export function signToken(userId, ttlMs = WEEK_MS) {
  const exp = Date.now() + ttlMs;
  const payload = `${userId}.${exp}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = createHmac('sha256', SECRET).update(`${userId}.${exp}`).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return null;
  return Number(userId);
}

// Rules the signup form and the API both state, so the messages stay in step.
export function passwordProblem(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password)) return 'Password must include at least one letter.';
  if (!/\d/.test(password)) return 'Password must include at least one number.';
  return null;
}
```

====================================================================================================
FILE: server/db.js
====================================================================================================
```javascript
import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'medtrace',
  database: process.env.DB_NAME || 'medicine_traceability',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  multipleStatements: false,
});

// Accounts live in their own database (see db/auth.sql) so the traceability
// schema stays the 12 tables the ER diagram shows.
export const authPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'medtrace',
  database: process.env.AUTH_DB_NAME || 'medtrace_auth',
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: true,
  multipleStatements: false,
});

export default pool;
```

====================================================================================================
FILE: server/live.js
====================================================================================================
```javascript
// Live database watch.
//
// The website must reflect changes made to MySQL by *anyone* — MySQL Workbench,
// the mysql CLI, another app — not just changes made through this site's API.
// So instead of hooking only the API, we watch the tables themselves.
//
// Every POLL_MS we fingerprint all 12 tables with `CHECKSUM TABLE` (one
// round-trip, ~15 ms for this dataset) and compare it with the previous
// fingerprint. When it differs we tell every connected browser which tables
// changed, over Server-Sent Events. The browser then re-reads what it shows.
// External INSERT/UPDATE/DELETE is therefore picked up within one poll.
import pool from './db.js';

export const TABLES = [
  'organizations', 'medicines', 'batches', 'shipments', 'shipment_items', 'inventory',
  'customers', 'sales', 'sale_items', 'recalls', 'verification_scans', 'audit_log',
];

const POLL_MS = Number(process.env.LIVE_POLL_MS || 1500);
const CHECKSUM_SQL = 'CHECKSUM TABLE ' + TABLES.map((t) => `\`${t}\``).join(', ');

let last = null;                 // watcher's own previous fingerprint
const clients = new Set();       // connected SSE responses
let timer = null;

// A fingerprint of every table's contents. Pure: it never touches watcher state,
// so the status endpoint and the watcher cannot race each other.
export async function computeSignature() {
  const [rows] = await pool.query(CHECKSUM_SQL);
  const tables = {};
  for (const r of rows) tables[String(r.Table).split('.').pop()] = r.Checksum;
  const signature = TABLES.map((t) => `${t}:${tables[t]}`).join('|');
  return { at: new Date().toISOString(), tables, signature };
}

export const snapshot = computeSignature;

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  for (const res of clients) {
    try { send(res, event, data); } catch { clients.delete(res); }
  }
}

export function subscribe(res) {
  clients.add(res);
  ensureWatcher();
}

export function unsubscribe(res) {
  clients.delete(res);
}

// Announce a change that is not in a watched domain table — e.g. the account
// queue, which lives in the auth database. The client re-reads what it shows.
export function notify(changed) {
  broadcast('change', { at: new Date().toISOString(), changed, tables: last ? last.tables : {} });
}

// One poll: compare the fresh fingerprint with the previous one and announce the
// tables that moved. Self-scheduling so a slow query can never stack up polls.
async function poll() {
  try {
    const next = await computeSignature();
    if (last && next.signature !== last.signature) {
      const changed = TABLES.filter((t) => last.tables[t] !== next.tables[t]);
      broadcast('change', { at: next.at, changed, tables: next.tables });
    }
    last = next;
  } catch (e) {
    broadcast('error', { message: e.message });
  } finally {
    schedule();
  }
}

function schedule() {
  timer = setTimeout(poll, POLL_MS);
  if (timer.unref) timer.unref();
}

function ensureWatcher() {
  if (timer) return;
  if (!last) { poll(); return; }
  schedule();
}
```

====================================================================================================
FILE: server/init-db.js
====================================================================================================
```javascript
// Creates the schema, loads sample data and installs the triggers.
// Usage: npm run init-db
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';
import { hashPassword } from './auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// medtrace_script.sql is the project's own script: it creates the database, all
// tables and the sample data (the single versioned seed). business_rules.sql
// then adds the triggers, views and operational tables the website needs.
// auth.sql creates the account store.
const files = [
  join(rootDir, 'medtrace_script.sql'),
  join(rootDir, 'db', 'business_rules.sql'),
  join(rootDir, 'db', 'auth.sql'),
];

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'medtrace',
  multipleStatements: true,
});

// Splits a .sql file into individual statements. Understands the `DELIMITER`
// directive (used for trigger bodies) which the mysql CLI supports but a driver
// does not, so we handle it ourselves.
function splitStatements(sql) {
  const stmts = [];
  let delim = ';';
  let buf = '';
  for (const line of sql.split('\n')) {
    const m = line.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
    if (m) { delim = m[1]; continue; }
    buf += line + '\n';
    if (buf.trimEnd().endsWith(delim)) {
      const stmt = buf.trimEnd().slice(0, -delim.length).trim();
      if (stmt) stmts.push(stmt);
      buf = '';
    }
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

for (const file of files) {
  const name = file.split('/').pop();
  process.stdout.write(`Running ${name}... `);
  const sql = readFileSync(file, 'utf8');
  const statements = name === 'medtrace_script.sql' ? [sql] : splitStatements(sql);
  for (const statement of statements) {
    await conn.query(statement);
  }
  console.log(`done (${statements.length} statement${statements.length > 1 ? 's' : ''})`);
}

const dbName = process.env.DB_NAME || 'medicine_traceability';
const [rows] = await conn.query(
  "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'", [dbName]);
const [trg] = await conn.query('SELECT COUNT(*) AS n FROM information_schema.triggers WHERE trigger_schema = ?', [dbName]);

// Seed one demo account per role so every dashboard can be shown without
// signing up first. Passwords are hashed exactly like real signups. This is the
// ONE versioned place demo accounts are defined.
//
// The regulator's organization is resolved from the data (a regulator org in
// India) rather than a hardcoded org_id, so the demo regulator always belongs to
// an Indian regulator organization even if the sample data is reordered.
const [[regOrg]] = await conn.query(
  "SELECT org_id, name FROM medicine_traceability.organizations WHERE org_type = 'regulator' AND country = 'India' ORDER BY org_id LIMIT 1");
if (!regOrg) {
  console.error('Seed data has no regulator organization in India — cannot create the demo regulator.');
  process.exit(1);
}
const [[mfgOrg]] = await conn.query("SELECT org_id FROM medicine_traceability.organizations WHERE org_type = 'manufacturer' ORDER BY org_id LIMIT 1");
const [[dstOrg]] = await conn.query("SELECT org_id FROM medicine_traceability.organizations WHERE org_type = 'distributor' ORDER BY org_id LIMIT 1");
const [[phmOrg]] = await conn.query("SELECT org_id FROM medicine_traceability.organizations WHERE org_type = 'pharmacy' ORDER BY org_id LIMIT 1");

const DEMO = [
  ['Asha Mehta',   'asha.mehta@cdsco.gov.in',   'regulator',    regOrg.org_id, 'demo1234'],
  ['Ravi Kumar',   'ravi.kumar@sunpharma.in',   'manufacturer', mfgOrg.org_id, 'demo1234'],
  ['Neha Sharma',  'neha.sharma@medplus.in',    'distributor',  dstOrg.org_id, 'demo1234'],
  ['Imran Qureshi','imran@apollopharmacy.in',   'pharmacy',     phmOrg.org_id, 'demo1234'],
  ['Priya Nair',   'priya.nair@example.com',    'customer',     null,          'demo1234'],
  ['System Admin', 'admin@medtrace.local',      'admin',        null,          'demo1234'],
];
await conn.query('USE medtrace_auth');
await conn.query('DELETE FROM account_requests');
await conn.query('DELETE FROM users');
for (const [name, email, role, orgId, pw] of DEMO) {
  await conn.query(
    'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, role, orgId, hashPassword(pw)]);
}

console.log(`Database ready: ${rows[0].n} tables, ${trg[0].n} triggers, ${DEMO.length} demo accounts (regulator: ${regOrg.name}).`);
await conn.end();
```

====================================================================================================
FILE: server/create-regulator.js
====================================================================================================
```javascript
// System administrator task: create a regulator (or admin) account.
// Regulators are never self-registered through the website; they are issued
// here, by someone with access to the server.
//
// Usage:
//   npm run create-regulator -- --name "Asha Mehta" --email asha@cdsco.gov.in \
//     --org 8 --password "secret123"
//   npm run create-regulator -- --name "Root" --email root@medtrace.local \
//     --role admin --password "secret123"
import 'dotenv/config';
import pool, { authPool } from './db.js';
import { hashPassword, passwordProblem } from './auth.js';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const name = (arg('name') || '').trim();
const email = (arg('email') || '').trim().toLowerCase();
const password = arg('password') || '';
const role = (arg('role') || 'regulator').trim();
const orgArg = arg('org');
const orgId = orgArg ? Number(orgArg) : null;

if (!name || !email || !password) {
  console.error('Usage: npm run create-regulator -- --name "Full Name" --email user@example.org --password "secret123" [--org 8] [--role regulator]');
  process.exit(1);
}
if (!['regulator', 'admin'].includes(role)) {
  console.error('Only --role regulator or --role admin is allowed here.');
  process.exit(1);
}
if (role === 'regulator' && !orgId) {
  console.error('A regulator needs --org <organizations.org_id> (a regulator organization).');
  process.exit(1);
}
const pwErr = passwordProblem(password);
if (pwErr) { console.error(pwErr); process.exit(1); }

try {
  if (orgId) {
    const [[org]] = await pool.query('SELECT org_id, org_type FROM organizations WHERE org_id = ?', [orgId]);
    if (!org) { console.error(`No organization with org_id ${orgId}.`); process.exit(1); }
    if (role === 'regulator' && org.org_type !== 'regulator') {
      console.error(`Organization ${orgId} is a ${org.org_type}, not a regulator.`); process.exit(1);
    }
  }
  const [[dupe]] = await authPool.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (dupe) { console.error('An account with that email already exists.'); process.exit(1); }
  const [r] = await authPool.query(
    'INSERT INTO users (name, email, role, org_id, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, role, orgId, hashPassword(password)]);
  console.log(`Created ${role} account #${r.insertId} for ${email}.`);
} catch (e) {
  console.error('Failed:', e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
  await authPool.end();
}
```

====================================================================================================
FILE: medtrace_script.sql
====================================================================================================
```sql
DROP DATABASE IF EXISTS medicine_traceability;

CREATE DATABASE medicine_traceability
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medicine_traceability;
CREATE TABLE organizations (
  org_id      INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  org_type    ENUM('manufacturer','distributor','pharmacy','regulator') NOT NULL,
  license_no  VARCHAR(40)  NOT NULL UNIQUE,
  address     VARCHAR(200),
  city        VARCHAR(60),
  country     VARCHAR(60)  NOT NULL DEFAULT 'India'
);

CREATE TABLE medicines (
  medicine_id     INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  composition     VARCHAR(200),
  dosage_form     VARCHAR(40),
  strength        VARCHAR(40),
  manufacturer_id INT NOT NULL,
  FOREIGN KEY (manufacturer_id) REFERENCES organizations(org_id)
);

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(15),
  email       VARCHAR(100) UNIQUE
);
CREATE TABLE batches (
  batch_id        INT AUTO_INCREMENT PRIMARY KEY,
  batch_code      VARCHAR(40) NOT NULL UNIQUE,
  medicine_id     INT NOT NULL,
  manufacturer_id INT NOT NULL,
  mfg_date        DATE NOT NULL,
  expiry_date     DATE NOT NULL,
  quantity        INT  NOT NULL,
  status ENUM('genuine','recalled','suspected_fake','expired') NOT NULL DEFAULT 'genuine',
  FOREIGN KEY (medicine_id)     REFERENCES medicines(medicine_id),
  FOREIGN KEY (manufacturer_id) REFERENCES organizations(org_id),
  CHECK (expiry_date > mfg_date),
  CHECK (quantity > 0)
);

CREATE TABLE shipments (
  shipment_id INT AUTO_INCREMENT PRIMARY KEY,
  from_org_id INT NOT NULL,
  to_org_id   INT NOT NULL,
  shipped_at  DATETIME NOT NULL,
  received_at DATETIME NULL,
  status ENUM('in_transit','delivered','cancelled') NOT NULL DEFAULT 'in_transit',
  FOREIGN KEY (from_org_id) REFERENCES organizations(org_id),
  FOREIGN KEY (to_org_id)   REFERENCES organizations(org_id),
  CHECK (from_org_id <> to_org_id)
);

CREATE TABLE shipment_items (
  shipment_id INT NOT NULL,
  batch_id    INT NOT NULL,
  quantity    INT NOT NULL,
  PRIMARY KEY (shipment_id, batch_id),
  FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id)    REFERENCES batches(batch_id),
  CHECK (quantity > 0)
);

CREATE TABLE inventory (
  org_id           INT NOT NULL,
  batch_id         INT NOT NULL,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  last_updated     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (org_id, batch_id),
  FOREIGN KEY (org_id)   REFERENCES organizations(org_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  CHECK (quantity_on_hand >= 0)
);
CREATE TABLE sales (
  sale_id      INT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id  INT NOT NULL,
  customer_id  INT NOT NULL,
  sale_date    DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pharmacy_id) REFERENCES organizations(org_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE sale_items (
  sale_id    INT NOT NULL,
  batch_id   INT NOT NULL,
  quantity   INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (sale_id, batch_id),
  FOREIGN KEY (sale_id)  REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  CHECK (quantity > 0)
);
CREATE TABLE verification_scans (
  scan_id            INT AUTO_INCREMENT PRIMARY KEY,
  batch_code_entered VARCHAR(40) NOT NULL,
  batch_id           INT NULL,
  customer_id        INT NULL,
  scanned_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result ENUM('genuine','recalled','expired','unknown') NOT NULL,
  FOREIGN KEY (batch_id)    REFERENCES batches(batch_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE recalls (
  recall_id    INT AUTO_INCREMENT PRIMARY KEY,
  batch_id     INT NOT NULL,
  regulator_id INT NOT NULL,
  reason       VARCHAR(250) NOT NULL,
  severity     ENUM('low','medium','high','critical') NOT NULL,
  recall_date  DATE NOT NULL,
  status       ENUM('active','completed','withdrawn') NOT NULL DEFAULT 'active',
  FOREIGN KEY (batch_id)     REFERENCES batches(batch_id),
  FOREIGN KEY (regulator_id) REFERENCES organizations(org_id)
);

CREATE TABLE audit_log (
  log_id            INT AUTO_INCREMENT PRIMARY KEY,
  batch_id          INT NOT NULL,
  old_status        ENUM('genuine','recalled','suspected_fake','expired') NOT NULL,
  new_status        ENUM('genuine','recalled','suspected_fake','expired') NOT NULL,
  changed_by_org_id INT NULL,
  changed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason            VARCHAR(250),
  FOREIGN KEY (batch_id)          REFERENCES batches(batch_id),
  FOREIGN KEY (changed_by_org_id) REFERENCES organizations(org_id)
);
INSERT INTO organizations (org_id, name, org_type, license_no, address, city, country) VALUES
(1, 'Sun Pharmaceutical Industries Ltd', 'manufacturer', 'MFG-MH-1001', 'Sun House, Goregaon East',        'Mumbai',    'India'),
(2, 'Cipla Ltd',                         'manufacturer', 'MFG-MH-1002', 'Cipla House, Peninsula Business Park', 'Mumbai', 'India'),
(3, 'MedPlus Health Services Ltd',       'distributor',  'DST-TS-3001', 'MedPlus Towers, Banjara Hills',   'Hyderabad', 'India'),
(4, 'Apollo Pharmacies Ltd',             'distributor',  'DST-TN-3002', 'Apollo Hospitals Campus, Greams Road', 'Chennai', 'India'),
(5, 'Apollo Pharmacy, Connaught Place',  'pharmacy',     'PHM-DL-4001', 'Connaught Place, Block A',        'New Delhi', 'India'),
(6, 'MedPlus Pharmacy, Lajpat Nagar',    'pharmacy',     'PHM-DL-4002', 'Lajpat Nagar Central Market',     'New Delhi', 'India'),
(7, 'Wellness Forever Medicare Ltd',     'pharmacy',     'PHM-MH-4003', 'Andheri West, Link Road',         'Mumbai',    'India'),
(8, 'Central Drugs Standard Control Organization', 'regulator', 'REG-IN-0001', 'FDA Bhawan, Kotla Road', 'New Delhi', 'India');

INSERT INTO medicines (medicine_id, name, composition, dosage_form, strength, manufacturer_id) VALUES
(1, 'Paracetamol',        'Paracetamol IP',          'Tablet',  '500 mg', 1),
(2, 'Amoxicillin',        'Amoxicillin Trihydrate',  'Capsule', '250 mg', 2),
(3, 'Cetirizine',         'Cetirizine Hydrochloride','Tablet',  '10 mg',  1),
(4, 'Azithromycin',       'Azithromycin Dihydrate',  'Tablet',  '500 mg', 2),
(5, 'Cough Relief Syrup', 'Dextromethorphan + CPM',  'Syrup',   '100 ml', 1);

INSERT INTO customers (customer_id, name, phone, email) VALUES
(1, 'Rohan Mehta',  '9810011111', 'rohan.mehta@example.com'),
(2, 'Priya Sharma', '9810022222', 'priya.sharma@example.com'),
(3, 'Amit Verma',   '9810033333', 'amit.verma@example.com'),
(4, 'Sneha Iyer',   '9840044444', 'sneha.iyer@example.com'),
(5, 'Karan Singh',  '9810055555', 'karan.singh@example.com'),
(6, 'Neha Gupta',   '9810066666', 'neha.gupta@example.com');

INSERT INTO batches (batch_id, batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status) VALUES
(1, 'PCM-2025-A01', 1, 1, '2025-06-01', '2027-05-31', 10000, 'genuine'),
(2, 'PCM-2025-B02', 1, 1, '2025-09-01', '2027-08-31',  8000, 'recalled'),
(3, 'AMX-2025-A01', 2, 2, '2025-03-15', '2027-03-14',  5000, 'genuine'),
(4, 'CTZ-2024-A01', 3, 1, '2024-01-10', '2026-01-09',  6000, 'expired'),
(5, 'AZT-2025-C01', 4, 2, '2025-07-20', '2027-07-19',  4000, 'genuine'),
(6, 'SYR-2025-A01', 5, 1, '2025-11-05', '2027-11-04',  3000, 'suspected_fake'),
(7, 'PCM-2026-A01', 1, 1, '2026-02-01', '2028-01-31', 12000, 'genuine'),
(8, 'AMX-2024-Z09', 2, 2, '2024-02-01', '2026-01-31',  2000, 'expired');

INSERT INTO shipments (shipment_id, from_org_id, to_org_id, shipped_at, received_at, status) VALUES
(1,  1, 3, '2025-07-01 10:00:00', '2025-07-03 15:30:00', 'delivered'),
(2,  2, 4, '2025-04-01 09:00:00', '2025-04-04 12:00:00', 'delivered'),
(3,  3, 5, '2025-07-15 11:00:00', '2025-07-16 14:00:00', 'delivered'),
(4,  3, 6, '2025-10-01 10:30:00', '2025-10-02 13:00:00', 'delivered'),
(5,  4, 7, '2025-05-01 09:30:00', '2025-05-03 16:00:00', 'delivered'),
(6,  1, 3, '2026-03-01 08:00:00', NULL,                  'in_transit'),
(7,  2, 4, '2025-08-01 10:00:00', '2025-08-03 11:30:00', 'delivered'),
(8,  4, 7, '2025-08-15 10:00:00', '2025-08-17 12:00:00', 'delivered'),
(9,  1, 3, '2024-03-01 09:00:00', '2024-03-03 10:00:00', 'delivered'),
(10, 2, 4, '2024-03-10 09:00:00', '2024-03-13 10:00:00', 'delivered');

INSERT INTO shipment_items (shipment_id, batch_id, quantity) VALUES
(1, 1, 3000), (1, 2, 2000),
(2, 3, 2000),
(3, 1,  500), (3, 2,  300),
(4, 1,  400), (4, 2,  200),
(5, 3,  800),
(6, 7, 5000),
(7, 5, 1500),
(8, 5,  600),
(9, 4, 1000),
(10, 8, 500);

INSERT INTO inventory (org_id, batch_id, quantity_on_hand, last_updated) VALUES
(1, 7, 7000, '2026-03-01 08:00:00'),
(3, 1, 2100, '2025-10-01 10:30:00'),
(3, 2, 1500, '2025-10-01 10:30:00'),
(3, 4,  600, '2025-06-01 10:00:00'),
(4, 3, 1200, '2025-05-01 09:30:00'),
(4, 5,  900, '2025-08-15 10:00:00'),
(4, 8,  200, '2025-02-01 10:00:00'),
(5, 1,  493, '2025-11-02 18:00:00'),
(5, 2,  296, '2025-09-18 17:00:00'),
(6, 1,  396, '2025-10-20 16:00:00'),
(6, 2,  197, '2026-01-15 12:00:00'),
(7, 3,  798, '2025-10-25 15:00:00'),
(7, 5,  599, '2025-10-25 15:00:00');

INSERT INTO sales (sale_id, pharmacy_id, customer_id, sale_date, total_amount) VALUES
(1, 5, 1, '2025-09-10',  90.00),
(2, 5, 2, '2025-09-18',  90.00),
(3, 6, 3, '2025-10-20', 180.00),
(4, 7, 4, '2025-10-25', 490.00),
(5, 5, 5, '2025-11-02', 150.00),
(6, 6, 1, '2026-01-15',  30.00);

INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price) VALUES
(1, 1, 2,  30.00), (1, 2, 1,  30.00),
(2, 2, 3,  30.00),
(3, 1, 4,  30.00), (3, 2, 2,  30.00),
(4, 3, 2, 120.00), (4, 5, 1, 250.00),
(5, 1, 5,  30.00),
(6, 2, 1,  30.00);

INSERT INTO verification_scans (scan_id, batch_code_entered, batch_id, customer_id, scanned_at, result) VALUES
(1, 'PCM-2025-A01', 1,    1,    '2025-09-11 09:15:00', 'genuine'),
(2, 'PCM-2025-B02', 2,    2,    '2026-01-12 18:40:00', 'recalled'),
(3, 'CTZ-2024-A01', 4,    3,    '2026-02-02 11:05:00', 'expired'),
(4, 'FAKE-XYZ-999', NULL, 4,    '2026-03-05 20:10:00', 'unknown'),
(5, 'SYR-2025-A01', 6,    NULL, '2026-02-10 14:25:00', 'recalled'),
(6, 'AMX-2025-A01', 3,    5,    '2025-10-26 10:00:00', 'genuine'),
(7, 'PCM-2026-A01', 7,    NULL, '2026-03-10 09:00:00', 'genuine'),
(8, 'PCM-2025-A1',  NULL, 2,    '2026-03-11 21:30:00', 'unknown');

INSERT INTO recalls (recall_id, batch_id, regulator_id, reason, severity, recall_date, status) VALUES
(1, 2, 8, 'Failed dissolution test in lab sampling',  'high',     '2026-01-10', 'active'),
(2, 6, 8, 'Counterfeit packaging detected in market', 'critical', '2026-02-05', 'active');

INSERT INTO audit_log (log_id, batch_id, old_status, new_status, changed_by_org_id, changed_at, reason) VALUES
(1, 2, 'genuine', 'recalled',       8, '2026-01-10 10:00:00', 'Recall 1: failed dissolution test'),
(2, 6, 'genuine', 'suspected_fake', 8, '2026-02-05 12:00:00', 'Recall 2: counterfeit packaging'),
(3, 4, 'genuine', 'expired',        8, '2026-01-10 00:00:00', 'Expiry date passed'),
(4, 8, 'genuine', 'expired',        8, '2026-02-01 00:00:00', 'Expiry date passed');

SELECT 'organizations' AS tbl, COUNT(*) AS `rows` FROM organizations UNION ALL
SELECT 'medicines', COUNT(*) FROM medicines UNION ALL
SELECT 'customers', COUNT(*) FROM customers UNION ALL
SELECT 'batches', COUNT(*) FROM batches UNION ALL
SELECT 'shipments', COUNT(*) FROM shipments UNION ALL
SELECT 'shipment_items', COUNT(*) FROM shipment_items UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory UNION ALL
SELECT 'sales', COUNT(*) FROM sales UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items UNION ALL
SELECT 'verification_scans', COUNT(*) FROM verification_scans UNION ALL
SELECT 'recalls', COUNT(*) FROM recalls UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
```

====================================================================================================
FILE: db/business_rules.sql
====================================================================================================
```sql
-- MedTrace business rules: triggers, views and the operational tables the
-- website needs on top of the core 12-table ER model.
-- Loaded AFTER medtrace_script.sql (which creates the schema and sample data).
--
-- The project script itself has no triggers/views; these add the enforcement
-- the website demonstrates: block bad sales, keep an audit trail, drive the
-- recall lifecycle, and the views used by the trace feature.
USE medicine_traceability;

DROP TRIGGER IF EXISTS trg_block_bad_sale;
DROP TRIGGER IF EXISTS trg_audit_batch_status;
DROP TRIGGER IF EXISTS trg_recall_sets_status;
DROP TRIGGER IF EXISTS trg_recall_lifecycle;
DROP VIEW IF EXISTS v_batch_flow;
DROP VIEW IF EXISTS v_batch_customers;
DROP TABLE IF EXISTS recall_acknowledgements;

-- Operational extension (not part of the core ER diagram): a pharmacy or
-- distributor signs off on a recall so the regulator can see who has acted.
CREATE TABLE recall_acknowledgements (
  recall_id       INT NOT NULL,
  org_id          INT NOT NULL,
  acknowledged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ack_by_user_id  INT NULL,
  note            VARCHAR(250) NULL,
  PRIMARY KEY (recall_id, org_id),
  FOREIGN KEY (recall_id) REFERENCES recalls(recall_id) ON DELETE CASCADE,
  FOREIGN KEY (org_id)    REFERENCES organizations(org_id)
);

-- A scan can end 'suspected_fake' as well, so a counterfeit batch reads
-- differently from a recalled one on the public verify result.
ALTER TABLE verification_scans
  MODIFY result ENUM('genuine','recalled','suspected_fake','expired','unknown') NOT NULL;

-- The regulator's note when a recall is completed or withdrawn.
ALTER TABLE recalls ADD COLUMN decision_note VARCHAR(250) NULL;

DELIMITER $$

-- Business rule: a batch that is recalled, suspected fake or expired cannot be sold.
CREATE TRIGGER trg_block_bad_sale
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_expiry DATE;
    DECLARE v_stock  INT;
    SELECT status, expiry_date INTO v_status, v_expiry
      FROM batches WHERE batch_id = NEW.batch_id;

    IF v_status = 'recalled' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is recalled.';
    ELSEIF v_status = 'suspected_fake' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is suspected counterfeit.';
    ELSEIF v_status = 'expired' OR v_expiry < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale blocked: batch is expired.';
    END IF;

    -- Stock must exist for the selling pharmacy. The actor's organization is
    -- passed in a session variable by the API (the only writer of sales).
    IF @medtrace_actor_org_id IS NOT NULL THEN
        SELECT quantity_on_hand INTO v_stock FROM inventory
          WHERE org_id = @medtrace_actor_org_id AND batch_id = NEW.batch_id;
        IF v_stock IS NULL OR v_stock < NEW.quantity THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Sale blocked: not enough stock on hand.';
        END IF;
    END IF;
END$$

-- Audit trail: record every batch status change automatically, with the
-- organization that caused it (taken from the API's session variable).
CREATE TRIGGER trg_audit_batch_status
AFTER UPDATE ON batches
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO audit_log (batch_id, old_status, new_status, changed_by_org_id, reason)
        VALUES (NEW.batch_id, OLD.status, NEW.status, @medtrace_actor_org_id, @medtrace_audit_reason);
    END IF;
END$$

-- Issuing an active recall flips the batch status to 'recalled'.
CREATE TRIGGER trg_recall_sets_status
AFTER INSERT ON recalls
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        SET @medtrace_audit_reason = CONCAT('Recall #', NEW.recall_id, ': ', NEW.reason);
        UPDATE batches SET status = 'recalled' WHERE batch_id = NEW.batch_id;
    END IF;
END$$

-- Recall lifecycle: withdrawing a recall returns the batch to genuine, unless
-- it is flagged fake or already expired. Completing a recall keeps it recalled.
CREATE TRIGGER trg_recall_lifecycle
AFTER UPDATE ON recalls
FOR EACH ROW
BEGIN
    IF NEW.status = 'withdrawn' AND OLD.status <> 'withdrawn' THEN
        SET @medtrace_audit_reason = CONCAT('Recall #', NEW.recall_id, ' withdrawn: ',
            COALESCE(NEW.decision_note, 'no reason given'));
        UPDATE batches b
           SET b.status = CASE
                 WHEN b.status = 'suspected_fake' THEN 'suspected_fake'
                 WHEN b.expiry_date < CURDATE()  THEN 'expired'
                 ELSE 'genuine'
               END
         WHERE b.batch_id = NEW.batch_id AND b.status = 'recalled';
    END IF;
END$$

DELIMITER ;

-- Full forward trace: batch -> shipment -> organizations.
CREATE VIEW v_batch_flow AS
SELECT b.batch_id, b.batch_code, m.name AS medicine, b.status,
       s.shipment_id, o1.name AS from_org, o2.name AS to_org,
       si.quantity, s.shipped_at, s.received_at, s.status AS shipment_status
FROM batches b
JOIN medicines m   ON m.medicine_id = b.medicine_id
JOIN shipment_items si ON si.batch_id = b.batch_id
JOIN shipments s   ON s.shipment_id = si.shipment_id
JOIN organizations o1 ON o1.org_id = s.from_org_id
JOIN organizations o2 ON o2.org_id = s.to_org_id;

-- Who bought a batch: batch -> sale -> customer.
CREATE VIEW v_batch_customers AS
SELECT b.batch_id, b.batch_code, c.customer_id, c.name AS customer,
       c.phone, si.quantity, si.unit_price, s.sale_date, o.name AS pharmacy
FROM batches b
JOIN sale_items si ON si.batch_id = b.batch_id
JOIN sales s       ON s.sale_id = si.sale_id
JOIN customers c   ON c.customer_id = s.customer_id
JOIN organizations o ON o.org_id = s.pharmacy_id;
```

====================================================================================================
FILE: db/auth.sql
====================================================================================================
```sql
-- MedTrace account store.
-- Kept in its own database so the traceability schema (medicine_traceability)
-- stays exactly the 12 tables shown in the ER diagram. Accounts are a website
-- concern, not part of the medicine-tracking domain model.
--
-- Onboarding policy (enforced here and in server/server.js):
--   * customers self-register
--   * manufacturers / distributors / pharmacies apply and a regulator approves
--   * regulators are created only by a system administrator (npm run create-regulator)
CREATE DATABASE IF NOT EXISTS medtrace_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medtrace_auth;

DROP TABLE IF EXISTS account_requests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  role          ENUM('admin','regulator','manufacturer','distributor','pharmacy','customer') NOT NULL,
  org_id        INT NULL,                -- organizations.org_id; NULL for individual customers
  password_hash VARCHAR(200) NOT NULL,   -- "scrypt$<salt>$<hash>"; never the raw password
  status        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_users_email (email)
);

-- Applications from staff who want an account. A regulator (or the system
-- administrator) approves or rejects them; only on approval is a `users` row
-- created. The password is hashed at application time so no plaintext is stored.
CREATE TABLE account_requests (
  request_id    INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  role          ENUM('manufacturer','distributor','pharmacy') NOT NULL,
  org_id        INT NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  note          VARCHAR(250) NULL,
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at    DATETIME NULL,
  decided_by    INT NULL,
  decision_note VARCHAR(250) NULL,
  UNIQUE KEY uq_requests_email (email)
);
```

====================================================================================================
FILE: tests/e2e.mjs
====================================================================================================
```javascript
// End-to-end checks for MedTrace: the data model, the MySQL rules, and the
// role-based access model. Run with: npm test  (the server must be running).
import { authPool, default as pool } from '../server/db.js';

const B = 'http://localhost:12000';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};
const get = async (p, tok) => {
  const r = await fetch(B + p, tok ? { headers: { 'x-auth-token': tok } } : {});
  return { status: r.status, body: await r.json().catch(() => null) };
};
const post = async (p, b, tok) => {
  const h = { 'Content-Type': 'application/json' };
  if (tok) h['x-auth-token'] = tok;
  const r = await fetch(B + p, { method: 'POST', headers: h, body: JSON.stringify(b) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const login = async (email) => (await post('/api/login', { email, password: 'demo1234' })).body?.token;

console.log('--- static assets ---');
for (const f of ['/', '/app.js', '/er-diagram.jpg', '/vendor/chart.umd.min.js']) {
  const r = await fetch(B + f);
  check(`${f} → 200`, r.status === 200, `got ${r.status}`);
}

console.log('--- sign in as each role ---');
const T = {
  regulator: await login('asha.mehta@cdsco.gov.in'),
  manufacturer: await login('ravi.kumar@sunpharma.in'),
  distributor: await login('neha.sharma@medplus.in'),
  pharmacy: await login('imran@apollopharmacy.in'),
  customer: await login('priya.nair@example.com'),
  admin: await login('admin@medtrace.local'),
};
for (const [role, tok] of Object.entries(T)) check(`${role} can sign in`, !!tok);

console.log('--- protected endpoints require a session ---');
for (const p of ['/api/meta', '/api/dashboard', '/api/datasets/batches', '/api/search?q=para', '/api/schema', '/api/queries']) {
  check(`${p} without a token → 401`, (await get(p)).status === 401, String((await get(p)).status));
}
check('tampered token rejected', (await get('/api/session', '1.9999999999999.deadbeef')).status === 401);
check('missing token rejected', (await get('/api/session')).status === 401);

console.log('--- meta is scoped to the role ---');
const metaReg = await get('/api/meta', T.regulator);
check('regulator sees all 12 datasets', Object.keys(metaReg.body?.datasets || {}).length === 12, String(Object.keys(metaReg.body?.datasets || {}).length));
const metaMfr = await get('/api/meta', T.manufacturer);
check('manufacturer sees fewer datasets', Object.keys(metaMfr.body?.datasets || {}).length < 12);
check('manufacturer cannot see customers', !metaMfr.body?.datasets?.customers);
check('manufacturer cannot see sales', !metaMfr.body?.datasets?.sales);
check('customer sees no datasets', Object.keys((await get('/api/meta', T.customer)).body?.datasets || {}).length === 0);
check('regulator batch total >= manufacturer total', metaReg.body.stats.batches >= metaMfr.body.stats.batches);

console.log('--- organization isolation (row-level) ---');
const orgCount = async (tok) => (await get('/api/datasets/organizations', tok)).body?.rows?.length;
check('regulator sees all 8 organizations', (await orgCount(T.regulator)) === 8);
for (const role of ['manufacturer', 'distributor', 'pharmacy']) {
  check(`${role} CANNOT open organizations`, (await get('/api/datasets/organizations', T[role])).status === 403);
}
check('customer CANNOT open organizations', (await get('/api/datasets/organizations', T.customer)).status === 403);
const regBatches = (await get('/api/datasets/batches', T.regulator)).body.rows.length;
const mfrBatches = (await get('/api/datasets/batches', T.manufacturer)).body.rows.length;
check('regulator sees all batches', regBatches >= 8, String(regBatches));
check('manufacturer sees only its own batches', mfrBatches > 0 && mfrBatches < regBatches, String(mfrBatches));
check('manufacturer sees only Sun Pharma batches',
  (await get('/api/datasets/batches', T.manufacturer)).body.rows.every(r => r[3] === 'Sun Pharmaceutical Industries Ltd'));

console.log('--- dataset access matrix ---');
const canOpen = async (tok, d) => (await get('/api/datasets/' + d, tok)).status;
check('pharmacy CAN open customers', (await canOpen(T.pharmacy, 'customers')) === 200);
check('manufacturer CANNOT open customers', (await canOpen(T.manufacturer, 'customers')) === 403);
check('manufacturer CANNOT open sales', (await canOpen(T.manufacturer, 'sales')) === 403);
check('customer CANNOT open batches', (await canOpen(T.customer, 'batches')) === 403);
check('manufacturer CAN open audit_log', (await canOpen(T.manufacturer, 'audit_log')) === 200);
check('distributor CANNOT open audit_log', (await canOpen(T.distributor, 'audit_log')) === 403);
check('unknown dataset → 404', (await canOpen(T.regulator, 'not_a_table')) === 404);

console.log('--- public verification needs no account and hides everything else ---');
const pv1 = await post('/api/public/verify', { code: 'PCM-2025-A01' });
check('public verify genuine', pv1.body?.ok === true && pv1.body?.result === 'genuine', JSON.stringify(pv1.body?.result));
check('public verify shows only pack fields',
  JSON.stringify(Object.keys(pv1.body?.pack || {}).sort()) === JSON.stringify(['batch_code', 'expiry_date', 'manufacturer', 'medicine', 'mfg_date']));
check('public verify never returns ids', !('batch_id' in (pv1.body?.pack || {})));
check('public verify unknown code', (await post('/api/public/verify', { code: 'NOPE-999' })).body?.result === 'unknown');
check('public verify suspected fake', (await post('/api/public/verify', { code: 'SYR-2025-A01' })).body?.result === 'suspected_fake');
check('public organizations lists names + types only',
  (await get('/api/public/organizations')).body.organizations.every(o => Object.keys(o).sort().join() === 'name,org_id,org_type'));

console.log('--- signed-in verify ---');
check('verify genuine (signed in)', (await post('/api/verify', { code: 'PCM-2025-A01' }, T.regulator)).body?.result === 'genuine');
check('verify recalled', (await post('/api/verify', { code: 'PCM-2025-B02' }, T.regulator)).body?.result === 'recalled');
check('verify expired', (await post('/api/verify', { code: 'CTZ-2024-A01' }, T.regulator)).body?.result === 'expired');
check('verify suspected fake (not folded into recalled)', (await post('/api/verify', { code: 'SYR-2025-A01' }, T.regulator)).body?.result === 'suspected_fake');
check('verify needs a session', (await post('/api/verify', { code: 'PCM-2025-A01' })).status === 401);

console.log('--- trace: personal data is restricted by role ---');
const traceReg = await get('/api/trace/1', T.regulator);
check('regulator sees customers on a trace', traceReg.body?.customers?.length > 0 && traceReg.body?.customersRestricted === false);
const tracePha = await get('/api/trace/1', T.pharmacy);
check('pharmacy sees only its own customers', tracePha.body?.customersRestricted === false && tracePha.body.customers.every(c => c.pharmacy === 'Apollo Pharmacy, Connaught Place'));
const traceMfr = await get('/api/trace/1', T.manufacturer);
check('manufacturer cannot see customer data', traceMfr.body?.customersRestricted === true && traceMfr.body?.customers?.length === 0);
check('manufacturer cannot trace another maker batch', (await get('/api/trace/3', T.manufacturer)).status === 403);
check('customer cannot trace at all', (await get('/api/trace/1', T.customer)).status === 403);

console.log('--- business rule: an unsafe sale is blocked by the trigger ---');
const blocked = await post('/api/demo/sales-attempt', { batchId: 2, quantity: 1 }, T.regulator);
check('recalled batch sale blocked', blocked.body?.blocked === true, JSON.stringify(blocked.body).slice(0, 160));
check('block comes from the trigger', blocked.body?.trigger === 'trg_block_bad_sale');
check('demo sale tool is regulator-only', (await post('/api/demo/sales-attempt', { batchId: 2 }, T.pharmacy)).status === 403);

console.log('--- create actions are role-restricted ---');
check('manufacturer CAN add a medicine', (await post('/api/medicines', { name: 'E2E Med' }, T.manufacturer)).status === 200);
check('pharmacy CANNOT add a medicine', (await post('/api/medicines', { name: 'X' }, T.pharmacy)).status === 403);
check('regulator CANNOT add a medicine', (await post('/api/medicines', { name: 'X' }, T.regulator)).status === 403);
check('distributor CANNOT add a batch', (await post('/api/batches', { batch_code: 'ZZ-1' }, T.distributor)).status === 403);
check('distributor CAN create a shipment', (await post('/api/shipments', { to_org_id: 5, batch_id: 1, quantity: 1 }, T.distributor)).status === 200);
check('pharmacy CANNOT create a shipment', (await post('/api/shipments', { to_org_id: 3, batch_id: 1, quantity: 1 }, T.pharmacy)).status === 403);
check('regulator CANNOT create a shipment', (await post('/api/shipments', { to_org_id: 3, batch_id: 1, quantity: 1 }, T.regulator)).status === 403);
check('pharmacy CAN record a sale', (await post('/api/sales', { customer_id: 1, items: [{ batch_id: 1, quantity: 1, unit_price: 10 }] }, T.pharmacy)).status === 200);
check('regulator CANNOT record a sale', (await post('/api/sales', { customer_id: 1, items: [{ batch_id: 1, quantity: 1, unit_price: 10 }] }, T.regulator)).status === 403);

console.log('--- a new batch becomes stock the manufacturer can ship ---');
const newMed = await post('/api/medicines', { name: 'E2E Batch Med' }, T.manufacturer);
const newBatch = await post('/api/batches', {
  batch_code: 'E2E-' + Date.now(), medicine_id: newMed.body.medicine_id,
  mfg_date: '2026-01-01', expiry_date: '2028-01-01', quantity: 500 }, T.manufacturer);
check('manufacturer CAN add a batch', newBatch.status === 200 && !!newBatch.body?.batch_id, JSON.stringify(newBatch.body).slice(0, 160));
const stockAfter = await get('/api/my-stock', T.manufacturer);
check('the new batch is now stock on hand',
  stockAfter.body?.stock?.some(s => s.batch_id === newBatch.body.batch_id && s.quantity_on_hand === 500));
check('my-stock names the medicine', stockAfter.body?.stock?.every(s => typeof s.medicine === 'string' && s.medicine.length > 0));

console.log('--- pharmacy can sell to a new customer with email + phone ---');
const custEmail = 'cust.' + Date.now() + '@gmail.com';
const newCustSale = await post('/api/sales', {
  customer_name: 'Walk-in E2E', customer_email: custEmail, customer_phone: '9810012345',
  items: [{ batch_id: 1, quantity: 1, unit_price: 12 }] }, T.pharmacy);
check('sale to a brand-new customer succeeds', newCustSale.status === 200 && !!newCustSale.body?.sale_id, JSON.stringify(newCustSale.body).slice(0, 160));
const custRows = await get('/api/datasets/customers', T.pharmacy);
const stored = custRows.body?.rows?.find(r => r[3] === custEmail);
check('the new customer is stored with name, phone and email', !!stored && stored[1] === 'Walk-in E2E' && stored[2] === '9810012345');
check('a sale with no customer and no name is refused',
  (await post('/api/sales', { items: [{ batch_id: 1, quantity: 1, unit_price: 1 }] }, T.pharmacy)).status === 400);
check('an invalid customer email is refused',
  (await post('/api/sales', { customer_name: 'Bad Email', customer_email: 'not-an-email', items: [{ batch_id: 1, quantity: 1, unit_price: 1 }] }, T.pharmacy)).status === 400);

console.log('--- customer traces a batch by code (no personal data) ---');
const ctrace = await post('/api/customer/trace', { code: 'PCM-2025-A01' }, T.customer);
check('customer trace finds the batch', ctrace.body?.found === true && ctrace.body?.batch?.batch_code === 'PCM-2025-A01');
check('customer trace shows the journey', Array.isArray(ctrace.body?.flow) && ctrace.body.flow.length > 0);
check('customer trace exposes no personal data', !/phone|email|customer/i.test(JSON.stringify(ctrace.body)));
check('customer trace unknown code is not found', (await post('/api/customer/trace', { code: 'NOPE-1' }, T.customer)).body?.found === false);
check('staff cannot use the customer trace route', (await post('/api/customer/trace', { code: 'PCM-2025-A01' }, T.manufacturer)).status === 403);
check('customer trace needs a session', (await post('/api/customer/trace', { code: 'PCM-2025-A01' })).status === 401);

console.log('--- shipment helpers are scoped to the sender ---');
const dest = await get('/api/shipping-destinations', T.manufacturer);
check('destinations exclude the sender', dest.body?.destinations?.every(d => d.org_id !== 1));
check('destinations cover the whole chain', dest.body?.destinations?.some(d => d.org_type === 'pharmacy'));
check('destinations are sender-only', (await get('/api/shipping-destinations', T.pharmacy)).status === 403);
const myStock = await get('/api/my-stock', T.manufacturer);
check('my-stock returns only own stock', myStock.body?.stock?.every(s => 'batch_code' in s && 'quantity_on_hand' in s));
check('my-stock is not public', (await get('/api/my-stock')).status === 401);

console.log('--- recall lifecycle (regulator only) ---');
const ship = await post('/api/shipments', { to_org_id: 5, batch_id: 7, quantity: 5 }, T.manufacturer);
check('manufacturer ships its own batch', ship.status === 200, JSON.stringify(ship.body).slice(0, 160));
const rec = await post('/api/recalls', { batchId: 7, reason: 'E2E dissolution failure', severity: 'high' }, T.regulator);
check('regulator issues a recall', rec.status === 200 && !!rec.body?.recall_id, JSON.stringify(rec.body).slice(0, 160));
check('issuing a recall flips the batch to recalled', rec.body?.batch?.status === 'recalled');
check('the recall wrote an audit row via the trigger', rec.body?.audit?.length >= 1);
check('manufacturer CANNOT issue a recall', (await post('/api/recalls', { batchId: 1, reason: 'nope' }, T.manufacturer)).status === 403);
check('pharmacy CANNOT issue a recall', (await post('/api/recalls', { batchId: 1, reason: 'nope' }, T.pharmacy)).status === 403);
const preview = await get('/api/recalls/preview/7', T.regulator);
check('recall preview shows affected stock', preview.body?.ok === true && typeof preview.body?.stockUnits === 'number');
check('recall preview is regulator-only', (await get('/api/recalls/preview/7', T.pharmacy)).status === 403);
check('pharmacy can acknowledge a recall it holds stock for', (await post(`/api/recalls/${rec.body.recall_id}/acknowledge`, {}, T.pharmacy)).status === 200);
check('acknowledgement is counted', (await get('/api/recalls', T.regulator)).body.recalls.find(r => r.recall_id === rec.body.recall_id).ack_count >= 1);
const wd = await post(`/api/recalls/${rec.body.recall_id}/status`, { status: 'withdrawn', note: 'retest passed' }, T.regulator);
check('withdrawing a recall returns the batch to genuine', wd.body?.batch?.status === 'genuine', JSON.stringify(wd.body?.batch));
check('manufacturer CANNOT change a recall', (await post(`/api/recalls/${rec.body.recall_id}/status`, { status: 'completed' }, T.manufacturer)).status === 403);

console.log('--- schema + reports are regulator-only ---');
const sch = await get('/api/schema', T.regulator);
check('schema ok', sch.body?.ok === true);
check('schema 12 tables', sch.body?.tables?.length === 12, String(sch.body?.tables?.length));
check('schema 2 views', sch.body?.views?.length === 2);
check('schema 4 triggers', sch.body?.triggers?.length === 4, String(sch.body?.triggers?.length));
check('schema DDL for all tables', Object.keys(sch.body?.ddl || {}).length === 12);
const batches = sch.body?.tables?.find(t => t.name === 'batches');
check('batches PK = batch_id', batches?.primaryKey?.[0] === 'batch_id');
check('batches has 2 FKs', batches?.foreignKeys?.length === 2);
check('batches status is ENUM', batches?.columns?.find(c => c.name === 'status')?.type?.startsWith('enum'));
check('schema blocked for manufacturer', (await get('/api/schema', T.manufacturer)).status === 403);
check('schema blocked for customer', (await get('/api/schema', T.customer)).status === 403);
const ql = await get('/api/queries', T.regulator);
check('9 report queries', ql.body?.queries?.length === 9, String(ql.body?.queries?.length));
for (const q of ql.body?.queries || []) {
  const r = await get('/api/queries/' + q.id, T.regulator);
  check(`query ${q.id} runs`, r.body?.ok === true && Array.isArray(r.body?.rows), r.body?.error || '');
}
check('unknown query → 404', (await get('/api/queries/does_not_exist', T.regulator)).status === 404);
check('reports blocked for pharmacy', (await get('/api/queries', T.pharmacy)).status === 403);

console.log('--- ER diagram matches the live schema ---');
const erExpected = {
  organizations: ['org_id','name','org_type','license_no','address','city','country'],
  medicines: ['medicine_id','name','composition','dosage_form','strength','manufacturer_id'],
  batches: ['batch_id','batch_code','medicine_id','manufacturer_id','mfg_date','expiry_date','quantity','status'],
  shipments: ['shipment_id','from_org_id','to_org_id','shipped_at','received_at','status'],
  shipment_items: ['shipment_id','batch_id','quantity'],
  inventory: ['org_id','batch_id','quantity_on_hand','last_updated'],
  customers: ['customer_id','name','phone','email'],
  sales: ['sale_id','pharmacy_id','customer_id','sale_date','total_amount'],
  sale_items: ['sale_id','batch_id','quantity','unit_price'],
  recalls: ['recall_id','batch_id','regulator_id','reason','severity','recall_date','status','decision_note'],
  verification_scans: ['scan_id','batch_code_entered','batch_id','customer_id','scanned_at','result'],
  audit_log: ['log_id','batch_id','old_status','new_status','changed_by_org_id','changed_at','reason'],
};
for (const [t, cols] of Object.entries(erExpected)) {
  const live = sch.body?.tables?.find(x => x.name === t)?.columns?.map(c => c.name) || [];
  check(`ER ${t} columns match`, JSON.stringify(live) === JSON.stringify(cols), `live=${JSON.stringify(live)}`);
}

console.log('--- search + dashboard are scoped ---');
const sReg = await get('/api/search?q=para', T.regulator);
check('regulator search returns hits', sReg.body?.hits?.length > 0);
check('search labels never lead with a raw row id', sReg.body.hits.every(h => !/^\d+ · /.test(h.label)));
const sMfr = await get('/api/search?q=para', T.manufacturer);
check('manufacturer search never returns sales rows', !sMfr.body?.hits?.some(h => ['sales', 'customers', 'sale_items'].includes(h.dataset)));
const sNum = await get('/api/search?q=1', T.regulator);
check('numeric search does not match every row by id', sNum.body.hits.every(h => !/^\d+ · /.test(h.label)));
const dReg = await get('/api/dashboard', T.regulator);
const dMfr = await get('/api/dashboard', T.manufacturer);
check('regulator dashboard ok', dReg.body?.ok === true);
check('manufacturer dashboard has no sales block', Array.isArray(dMfr.body?.salesByPharmacy) && dMfr.body.salesByPharmacy.length === 0);
check('customer dashboard ok', (await get('/api/dashboard', T.customer)).body?.ok === true);

console.log('--- onboarding: customers self-register, staff apply, regulators are admin-made ---');
const uniq = 'e2e.' + Date.now() + '@example.test';
check('public signup as regulator is REFUSED (403)', (await post('/api/signup', { name: 'Evil Reg', email: uniq, role: 'regulator', password: 'secret123', confirm: 'secret123' })).status === 403);
check('public signup as pharmacy is REFUSED (403)', (await post('/api/signup', { name: 'Evil Pharm', email: uniq, role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret123' })).status === 403);
check('public signup as admin is REFUSED (403)', (await post('/api/signup', { name: 'Evil Admin', email: uniq, role: 'admin', password: 'secret123', confirm: 'secret123' })).status === 403);
const cust = await post('/api/signup', { name: 'E2E Customer', email: uniq, role: 'customer', password: 'secret123', confirm: 'secret123' });
check('customer signup succeeds', cust.body?.ok === true && cust.body?.user?.role === 'customer');
check('customer has no organization', cust.body?.user?.org === 'Not listed / individual');
check('short password rejected', (await post('/api/signup', { name: 'Weak', email: 'w.' + uniq, role: 'customer', password: 'abc', confirm: 'abc' })).status === 400);
check('mismatched confirm rejected', (await post('/api/signup', { name: 'Mismatch', email: 'm.' + uniq, role: 'customer', password: 'secret123', confirm: 'secret124' })).status === 400);
check('duplicate email rejected (409)', (await post('/api/signup', { name: 'Dupe', email: 'asha.mehta@cdsco.gov.in', role: 'customer', password: 'secret123', confirm: 'secret123' })).status === 409);

const applEmail = 'apply.' + Date.now() + '@example.test';
const appl = await post('/api/account-requests', { name: 'Apply Pharm', email: applEmail, role: 'pharmacy', org_id: 5, password: 'secret123', confirm: 'secret123', note: 'license 123' });
check('staff application accepted', appl.body?.ok === true && appl.body?.pending === true);
check('application with a mismatched organization rejected', (await post('/api/account-requests', { name: 'Bad Org', email: 'bo.' + uniq, role: 'pharmacy', org_id: 8, password: 'secret123', confirm: 'secret123' })).status === 400);
check('application cannot sign in before approval', (await post('/api/login', { email: applEmail, password: 'secret123' })).status === 401);
const queue = await get('/api/account-requests', T.regulator);
check('regulator sees the pending application', queue.body?.requests?.some(r => r.email === applEmail && r.status === 'pending'));
check('manufacturer CANNOT see the application queue', (await get('/api/account-requests', T.manufacturer)).status === 403);
const reqId = queue.body.requests.find(r => r.email === applEmail).request_id;
check('regulator approves the application', (await post(`/api/account-requests/${reqId}/decision`, { decision: 'approve' }, T.regulator)).body?.ok === true);
check('approved account can now sign in', (await post('/api/login', { email: applEmail, password: 'secret123' })).body?.ok === true);
check('deciding twice is refused (409)', (await post(`/api/account-requests/${reqId}/decision`, { decision: 'reject' }, T.regulator)).status === 409);

console.log('--- live database watch (real-time changes) ---');
const st1 = await get('/api/changes/status');
check('changes/status ok', st1.body?.ok === true);
check('status fingerprints 12 tables', Object.keys(st1.body?.tables || {}).length === 12, String(Object.keys(st1.body?.tables || {}).length));
const sseEvents = [];
const sseCtrl = new AbortController();
const sseRes = await fetch(B + '/api/changes/stream', { signal: sseCtrl.signal });
check('changes/stream is event-stream', sseRes.headers.get('content-type')?.includes('text/event-stream'));
(async () => {
  const reader = sseRes.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
        const ev = (chunk.match(/^event: (.+)$/m) || [])[1];
        const data = (chunk.match(/^data: (.+)$/m) || [])[1];
        if (ev === 'change') sseEvents.push(JSON.parse(data));
      }
    }
  } catch {}
})();
await new Promise((r) => setTimeout(r, 400));
const extCode = 'E2E-LIVE-' + Date.now();
const [extIns] = await pool.query(
  "INSERT INTO batches (batch_code, medicine_id, manufacturer_id, mfg_date, expiry_date, quantity, status) VALUES (?, 1, 1, '2026-01-01', '2028-01-01', 42, 'genuine')",
  [extCode]
);
await new Promise((r) => setTimeout(r, 3500));
check('external INSERT raises a change event', sseEvents.length >= 1, `events=${sseEvents.length}`);
check('change event names the batches table', sseEvents.some((e) => e.changed.includes('batches')));
const sigAfter = await get('/api/changes/status');
check('fingerprint differs after the INSERT', sigAfter.body?.tables?.batches !== st1.body?.tables?.batches);
await pool.query('DELETE FROM audit_log WHERE batch_id = ?', [extIns.insertId]);
await pool.query('DELETE FROM batches WHERE batch_id = ?', [extIns.insertId]);
sseCtrl.abort();
await new Promise((r) => setTimeout(r, 200));

console.log(`\n==== ${pass} passed, ${fail} failed ====`);
await authPool.query('DELETE FROM account_requests WHERE email LIKE ?', ['apply.%@example.test']);
await authPool.query('DELETE FROM users WHERE email LIKE ? OR email LIKE ? OR email = ?', ['e2e.%@example.test', 'apply.%@example.test', uniq]);
await authPool.end();
process.exit(fail ? 1 : 0);
```

====================================================================================================
FILE: package.json
====================================================================================================
```json
{
  "name": "med-trace",
  "version": "1.0.0",
  "description": "MedTrace - Medicine Traceability System (MySQL backed)",
  "type": "module",
  "main": "server/server.js",
  "scripts": {
    "start": "node server/server.js",
    "init-db": "node server/init-db.js",
    "test": "node tests/e2e.mjs",
    "create-regulator": "node server/create-regulator.js",
    "zip": "python3 scripts/build-zip.py"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mysql2": "^3.11.0"
  }
}
```

====================================================================================================
FILE: .env.example
====================================================================================================
```ini
# MedTrace database connection
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=medtrace
DB_NAME=medicine_traceability

# Web server
PORT=12000

# Real-time database watch: how often the server checks the tables for changes (ms)
LIVE_POLL_MS=1500

# Account store (website logins; separate from the traceability schema)
AUTH_DB_NAME=medtrace_auth
SESSION_SECRET=medtrace-dev-secret-change-me
```

====================================================================================================
FILE: docker-compose.yml
====================================================================================================
```yaml
services:
  db:
    image: mysql:8.0
    container_name: medtrace-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: medtrace
      MYSQL_DATABASE: medicine_traceability
    ports:
      - "3306:3306"
    volumes:
      - medtrace-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-pmedtrace"]
      interval: 5s
      timeout: 5s
      retries: 20

  app:
    image: node:22-alpine
    container_name: medtrace-app
    working_dir: /app
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: medtrace
      DB_NAME: medicine_traceability
      PORT: 12000
    command: sh -c "npm install && npm run init-db && npm start"
    ports:
      - "12000:12000"
    volumes:
      - .:/app

volumes:
  medtrace-data:
```
