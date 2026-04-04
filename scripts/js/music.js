<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Music Player — Watanagashi Archive</title>
<link rel="icon" type="image/x-icon" href="../assets/images/favicon.ico">
<link rel="stylesheet" href="../scripts/css/style.css">

<script>
  if (window.location.hash !== '#music')
    history.replaceState(null, '', window.location.pathname + '#music');
</script>

<style>
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
* { -webkit-tap-highlight-color:transparent; }
::selection { background:rgba(80,80,80,.45); color:#fff; }
::-moz-selection { background:rgba(80,80,80,.45); color:#fff; }
*:focus { outline:none !important; }
button:active, button:focus, button:focus-visible { outline:none !important; box-shadow:none !important; }

:root {
  --accent:    #cc1a1a;
  --text:      #111;
  --text-dim:  #2c2c2c;
  --green:     #1a9c2a;
  --grad-bar:  linear-gradient(to bottom,#efefef 0%,#d8d8d8 52%,#c4c4c4 52%,#d0d0d0 100%);
  --shadow-bar: 0 2px 5px rgba(0,0,0,.15);
}

html { scrollbar-width:thin; scrollbar-color:rgba(120,120,120,.50) transparent; }
::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(120,120,120,.50); border-radius:3px; }
::-webkit-scrollbar-thumb:hover { background:rgba(54,54,54,.8); }

body {
  font-family:'Sawarabi Gothic','Sazanami Gothic',Tahoma,'Segoe UI',sans-serif;
  font-size:12px;
  background:#000 center/49% fixed no-repeat;
  color:var(--text);
  padding:12px 6px 40px;
  display:flex; flex-direction:column; align-items:center;
}

img { -webkit-user-drag:none; user-select:none; }
a { color:#000; text-decoration:none; }
a:hover { color:var(--accent); text-decoration:underline; }
p { font-size:12.5px; line-height:18px; color:var(--text); margin:0; }
p + p { margin-top:5px; }
strong { color:var(--accent); font-weight:400; }

.page { display:none; }
.page.active { display:block; }

#_pageShell { width:800px; max-width:100%; display:flex; flex-direction:column; }

#cornerLogo { position:fixed; top:10px; right:14px; z-index:9998; line-height:0; text-decoration:none; }
#cornerLogo img { height:36px; width:auto; object-fit:contain; display:block; opacity:.82; }
#cornerLogo:hover img { opacity:1; }

.aero-bar {
  background:var(--grad-bar); border:2px ridge #727272;
  box-shadow:var(--shadow-bar); color:var(--text); font-size:13px;
  padding:4px 8px; display:flex; align-items:center; gap:6px; margin-bottom:7px;
}
.aero-bar .back-link { flex-shrink:0; padding:2px 3px; display:flex; align-items:center; line-height:0; text-decoration:none; }
.aero-bar .back-link img { height:28px; width:auto; object-fit:contain; display:block; }
.aero-bar .back-link:hover img { filter:brightness(.85); }
.aero-bar .bar-title { flex:1; text-align:center; font-size:12px; letter-spacing:.5px; }

.glass-box { background:#ebebeb; box-shadow:var(--shadow-bar); border:2px ridge #727272; padding:5px; margin-bottom:7px; }
.aero-inner { border:1px solid rgba(0,0,0,.30); background:#f2f2f2; }
.aero-pad { padding:10px 12px; }

.section-bar {
  display:block; background:#000; padding:5px 8px; margin:0; line-height:1.6;
  font-size:11px; font-weight:400; letter-spacing:1.5px; text-transform:uppercase; color:#fff;
}

/* ── LOADING BANNER ── */
#trackLoadBanner {
  display:none; background:var(--grad-bar); border:1px solid rgba(140,140,140,.50);
  box-shadow:var(--shadow-bar); padding:5px 10px; margin-bottom:7px;
  align-items:center; gap:8px; color:var(--text); font-size:11.5px;
}
#trackLoadBanner.visible { display:flex; }
#trackLoadBanner img { height:18px; width:18px; flex-shrink:0; }

/* ── PLAYER OVERRIDES ── */
#musicPlayerContainer .mp-header-bar { display:none !important; }
#musicPlayerContainer .mp-controls-row {
  background:var(--grad-bar) !important; border-top:1px solid rgba(255,255,255,.70) !important;
  border-bottom:1px solid rgba(0,0,0,.15) !important; box-shadow:none !important; order:1;
}
#mpStatusBar { order:2; }
#musicPlayerContainer .mp-progress-row { order:3; }
#musicPlayerContainer { display:flex !important; flex-direction:column !important; }
#musicBackground {
  position:relative !important; overflow:hidden !important; background-color:#f5f5f5 !important;
  background-image:none !important; order:0;
  display:flex !important; flex-direction:row !important; align-items:stretch !important;
}
#mbArtLayer { display:none !important; }
#musicPlayerPlaylist {
  background:repeating-linear-gradient(0deg,rgba(0,0,0,.04) 0px,rgba(0,0,0,.04) 1px,transparent 1px,transparent 3px) !important;
  position:relative !important; z-index:1 !important; flex:1 !important; min-width:0 !important;
}
#playlistLeft { scrollbar-color:rgba(120,120,120,.50) transparent !important; border-right:2px solid #000 !important; box-sizing:border-box; }
#playlistLeft::-webkit-scrollbar { width:6px !important; }
#playlistLeft::-webkit-scrollbar-track { background:rgba(0,0,0,.08) !important; border:1px solid #000 !important; }
#playlistLeft::-webkit-scrollbar-thumb { background:rgba(80,80,80,.70) !important; border-radius:0 !important; border:1px solid #333 !important; }
#playlistRight { display:none !important; }
.pl-group-header { background:linear-gradient(to bottom,#e0e0e0,#d0d0d0) !important; color:var(--accent) !important; border-bottom:1px solid rgba(0,0,0,.15) !important; border-top:1px solid rgba(255,255,255,.60) !important; }
.pl-track-list li { color:var(--text) !important; }
.pl-track-list li a { color:var(--text) !important; }
.pl-track-list li a:hover { color:var(--accent) !important; }
.pl-track-list li a.activeSong { color:var(--accent) !important; }
#visualizerCanvas { display:none !important; }
#cdDisc { display:none !important; }
#spinningDisk { display:none !important; }
#renaChan, #rikaChan { display:none !important; }
* { transition:none !important; }

#musicPlayerContainer .mp-status-bar {
  background:var(--grad-bar) !important; border-top:1px solid rgba(255,255,255,.60) !important;
  border-bottom:1px solid rgba(0,0,0,.15) !important; color:var(--text) !important;
}
#audioName { color:var(--accent) !important; }
#mpLikeVal, #mpDislikeVal { color:#444 !important; }
#mpPlusBtn { color:rgba(0,0,0,.45) !important; }
#musicPlayerContainer .mp-progress-row {
  background:var(--grad-bar) !important; border-bottom:1px solid rgba(0,0,0,.15) !important;
  border-top:1px solid rgba(255,255,255,.60) !important; box-shadow:none !important;
}
#musicPlayerContainer .mp-progress-row span { color:var(--text-dim) !important; }
#timeLeft { color:var(--accent) !important; }
#volumeIndicator { color:var(--accent) !important; }
.mp-progress-track, .mp-vol-wrap {
  background:linear-gradient(to bottom,#ccc,#e0e0e0) !important;
  border:1px solid rgba(0,0,0,.20) !important; box-shadow:inset 0 1px 2px rgba(0,0,0,.10) !important;
}
.mp-progress-fill, .mp-vol-fill { background:linear-gradient(to bottom,#555 0%,#333 45%,#1a1a1a 50%,#444 100%) !important; }
.mp-ctrl-btn img, .mp-ctrl-btn .player-img, .mp-mute-btn img, .mp-loop-btn img { filter:none !important; }
.mp-ctrl-btn:hover img, .mp-ctrl-btn:hover .player-img, .mp-mute-btn:hover img, .mp-loop-btn:hover img { filter:brightness(.75) !important; }

/* ── LIKE / DISLIKE ── */
#mpLikeBtn    { opacity:0.45 !important; }
#mpDislikeBtn { opacity:0.45 !important; }
#mpLikeBtn.voted    { opacity:1.0 !important; }
#mpDislikeBtn.voted { opacity:1.0 !important; }

#soundToggle { position:fixed; bottom:8px; left:10px; z-index:9999; font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:10px; color:#fff; cursor:pointer; user-select:none; padding:2px 0; background:none; border:none; outline:none; }

/* ── CD SIDE PANEL ── */
#_cdSidePanel { display:flex; flex-direction:column; justify-content:center; align-items:center; padding:14px 10px; background:#000; border:3px white ridge; width:150px; flex-shrink:0; }
#_cdSpinWrapper { position:relative; width:130px; height:130px; border-radius:50%; flex-shrink:0; }
#_cdOuter { position:absolute; inset:0; border-radius:50%; background:conic-gradient(from 0deg,#b8b8b8 0deg,#e8e8e8 15deg,#c0c0c0 30deg,#f0f0f0 50deg,#aaaaaa 70deg,#d8d8d8 90deg,#e0e0e0 110deg,#b0b0b0 130deg,#f5f5f5 150deg,#c8c8c8 170deg,#a8a8a8 190deg,#e4e4e4 210deg,#d0d0d0 230deg,#b8b8b8 250deg,#f0f0f0 270deg,#c0c0c0 290deg,#aaaaaa 310deg,#e8e8e8 330deg,#b8b8b8 360deg); box-shadow:0 0 0 1.5px rgba(0,0,0,.25),0 4px 18px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.15); }
#_cdArt { position:absolute; inset:8px; border-radius:50%; background:#c8c8c8 center/cover no-repeat; box-shadow:inset 0 0 8px rgba(0,0,0,.4); overflow:hidden; }
#_cdSheen { position:absolute; inset:8px; border-radius:50%; background:conic-gradient(from 0deg,rgba(255,100,100,.08) 0deg,rgba(255,200,50,.10) 45deg,rgba(100,255,100,.08) 90deg,rgba(50,200,255,.10) 135deg,rgba(150,50,255,.08) 180deg,rgba(255,100,150,.10) 225deg,rgba(255,255,100,.08) 270deg,rgba(100,200,255,.10) 315deg,rgba(255,100,100,.08) 360deg); mix-blend-mode:screen; pointer-events:none; z-index:3; }
#_cdRingBorder { position:absolute; left:37%; top:38%; width:32px; height:32px; border-radius:50%; background:linear-gradient(178deg,#d0d0d0,#a0a0a0,#e0e0e0,#b0b0b0); box-shadow:0 0 0 2px rgba(0,0,0,.30),0 0 0 3.5px rgba(255,255,255,.45),inset 0 0 4px rgba(0,0,0,.35); z-index:4; }
#_cdHole { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:16px; height:16px; border-radius:50%; background:#1a1a1a; box-shadow:inset 0 1px 3px rgba(0,0,0,.9),0 0 0 1px rgba(0,0,0,.5); z-index:5; }
@keyframes cdSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
#_cdSpinWrapper.spinning #_cdOuter,
#_cdSpinWrapper.spinning #_cdArt,
#_cdSpinWrapper.spinning #_cdSheen,
#_cdSpinWrapper.spinning #_cdRingBorder { animation:cdSpin 3.2s linear infinite !important; }
#_cdArt.no-art { background-image:none !important; background-color:#b0b0b0 !important; }
#_cdNowPlayingLabel { margin-top:8px; font-size:11px; color:#fff; text-align:center; letter-spacing:.8px; text-transform:uppercase; max-width:130px; white-space:normal; background:#000; border:3px ridge; }

/* ══ HOST PANEL ══ */
#hostPanel { display:none; }
#hostPanel.visible { display:block; }

.desc-box { background:#fff; padding:8px 10px; margin-bottom:9px; border:1px solid rgba(0,0,0,.30); }
.hf-label { display:block; font-size:10px; color:#888; text-transform:uppercase; letter-spacing:.4px; margin-bottom:3px; }
.hf-input { width:100%; border:1px solid rgba(140,140,140,.45); outline:none; color:#000; font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:12px; padding:7px 10px; background:rgba(255,255,255,.97); }
.hf-input::placeholder { color:#aaa; }
.hf-input:focus { background:#fff; }
.hf-group { margin-bottom:7px; }

.host-tabs { display:flex; border:1px solid rgba(140,140,140,.50); border-bottom:none; overflow:hidden; }
.host-tab { flex:1; background:var(--grad-bar); border:none; border-right:1px solid rgba(140,140,140,.50); font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:10.5px; color:var(--text-dim); cursor:pointer; padding:6px 4px; }
.host-tab:last-child { border-right:none; }
.host-tab.active { background:#fff; color:var(--accent); }
.host-tab:hover:not(.active) { background:#e0e0e0; }

.host-pane { border:1px solid rgba(140,140,140,.50); padding:10px; background:#fff; margin-bottom:6px; display:none; }
.host-pane.active { display:block; }

.host-add-btn { all:unset; box-sizing:border-box; width:100%; background:linear-gradient(to bottom,#5cb85c 0%,#3d8b3d 50%,#2e6b2e 50%,#3a7a3a 100%); border:1px solid rgba(30,90,30,.70); color:#e8ffe6; font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:13px; text-shadow:0 1px 2px rgba(0,0,0,.60); padding:8px 12px 10px; cursor:pointer; display:flex; align-items:center; justify-content:center; min-height:40px; letter-spacing:.3px; margin-top:8px; }
.host-add-btn:hover { filter:brightness(1.12); }
.host-add-btn:active { filter:brightness(.88); }

.host-status { display:none; font-size:11px; padding:5px 10px; margin-top:4px; border:1px solid rgba(140,140,140,.45); background:linear-gradient(to bottom,#e2e2e2,#cecece 50%,#c0c0c0); text-align:center; }
.host-status.visible { display:block; }
.host-status .ok  { color:var(--green); }
.host-status .err { color:var(--accent); }

.note { background:#f5f5f5; border:1px solid rgba(0,0,0,.25); border-left:3px solid rgba(120,120,120,.50); padding:7px 10px; margin-top:6px; font-size:11px; color:var(--text-dim); line-height:1.65; text-align:center; }

/* album pills */
.album-pills { display:flex; flex-wrap:wrap; gap:3px; margin-top:4px; }
.album-pill { font-size:9.5px; padding:2px 7px; background:var(--grad-bar); border:1px solid rgba(140,140,140,.45); color:#444; cursor:pointer; user-select:none; }
.album-pill:hover { background:#fff; color:var(--accent); border-color:var(--accent); }

/* artwork mode radios */
.artwork-mode-row { display:flex; gap:14px; align-items:center; margin-bottom:5px; font-size:11px; color:#555; flex-wrap:wrap; }
.artwork-mode-row label { display:flex; align-items:center; gap:4px; cursor:pointer; }

/* yt preview */
#hostYtPreview { display:none; margin-top:8px; padding:8px; background:#f5f5f5; border:1px solid rgba(140,140,140,.30); align-items:center; gap:8px; }
#hostYtPreviewArt { width:48px; height:48px; object-fit:cover; border:1px solid rgba(0,0,0,.15); border-radius:2px; flex-shrink:0; }

/* upload drop zone */
#uploadDropZone { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:20px 12px; cursor:pointer; background:#fafafa; border:2px dashed rgba(140,140,140,.45); font-size:11px; color:#888; text-align:center; min-height:90px; margin-top:4px; }
#uploadDropZone:hover, #uploadDropZone.over { border-color:var(--accent); background:#fff5f5; color:var(--accent); }

/* pending list */
#uploadPendingList { margin-top:6px; max-height:140px; overflow-y:auto; }
.pf-row { display:flex; align-items:center; gap:5px; padding:3px 5px; border-bottom:1px solid rgba(140,140,140,.15); font-size:10.5px; }
.pf-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pf-size { color:#aaa; flex-shrink:0; }
.pf-del { background:none; border:1px solid rgba(180,0,0,.30); color:var(--accent); font-size:9px; padding:1px 4px; cursor:pointer; flex-shrink:0; font-family:'Sawarabi Gothic',Tahoma,sans-serif; }

/* ══ ALBUM MANAGER ══ */
.album-bucket { border:1px solid rgba(0,0,0,.30); margin-bottom:6px; background:#fff; }
.album-bucket-header { display:flex; align-items:center; gap:6px; background:linear-gradient(to bottom,#e0e0e0,#d0d0d0); padding:5px 8px; border-bottom:1px solid rgba(0,0,0,.15); cursor:pointer; user-select:none; }
.ab-name { flex:1; font-size:11.5px; color:#111; letter-spacing:.5px; text-transform:uppercase; }
.ab-count { font-size:10px; color:#888; }
.ab-del-btn { background:none; border:1px solid rgba(180,0,0,.35); color:var(--accent); font-size:9.5px; padding:1px 5px; cursor:pointer; flex-shrink:0; font-family:'Sawarabi Gothic',Tahoma,sans-serif; }
.ab-del-btn:hover { background:var(--accent); color:#fff; }
.album-bucket-body { padding:4px; min-height:32px; }
.album-bucket-body.drag-over { background:#fff5f5 !important; outline:2px dashed var(--accent); }

.ab-track-item { display:flex; align-items:center; gap:5px; padding:4px 6px; margin-bottom:3px; background:#f8f8f8; border:1px solid rgba(140,140,140,.30); font-size:11px; }
.ab-track-item.draggable { cursor:grab; }
.ab-track-item.draggable:active { cursor:grabbing; }
.abt-handle { color:#aaa; font-size:12px; cursor:grab; flex-shrink:0; user-select:none; }
.abt-art { width:24px; height:24px; object-fit:cover; flex-shrink:0; border:1px solid rgba(0,0,0,.12); border-radius:1px; }
.abt-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#111; }
.abt-badge { font-size:9px; padding:1px 4px; border:1px solid rgba(140,140,140,.35); color:#888; flex-shrink:0; }
.abt-move { font-size:9.5px; padding:1px 3px; border:1px solid rgba(140,140,140,.45); background:#fff; color:#333; cursor:pointer; flex-shrink:0; max-width:100px; font-family:'Sawarabi Gothic',Tahoma,sans-serif; }
.abt-del { background:none; border:1px solid rgba(180,0,0,.30); color:var(--accent); font-size:9px; padding:1px 4px; cursor:pointer; flex-shrink:0; font-family:'Sawarabi Gothic',Tahoma,sans-serif; }
.abt-del:hover { background:var(--accent); color:#fff; }

.album-upload-zone { display:flex; align-items:center; justify-content:center; gap:4px; padding:5px 8px; margin-top:3px; border:1px dashed rgba(140,140,140,.50); background:#fafafa; font-size:10px; color:#999; cursor:pointer; }
.album-upload-zone:hover { border-color:var(--accent); color:var(--accent); background:#fff5f5; }

#_newAlbumRow { display:flex; gap:4px; margin-bottom:6px; align-items:stretch; }
#_newAlbumName { flex:1; border:1px solid rgba(140,140,140,.45); outline:none; color:#000; font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:11.5px; padding:6px 10px; background:#fff; }
#_newAlbumName::placeholder { color:#aaa; }
#_newAlbumBtn { all:unset; box-sizing:border-box; background:linear-gradient(to bottom,#555 0%,#333 50%,#222 50%,#2e2e2e 100%); border:1px solid rgba(0,0,0,.50); color:#eee; font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:11px; padding:6px 12px; cursor:pointer; white-space:nowrap; }
#_newAlbumBtn:hover { filter:brightness(1.2); }

.host-reset-row { display:flex; gap:6px; flex-wrap:wrap; }
.host-reset-btn { all:unset; box-sizing:border-box; background:linear-gradient(to bottom,#c44 0%,#922 50%,#611 50%,#822 100%); border:1px solid rgba(100,0,0,.60); color:#ffe8e8; font-family:'Sawarabi Gothic',Tahoma,sans-serif; font-size:11px; padding:5px 10px; cursor:pointer; white-space:nowrap; text-shadow:0 1px 2px rgba(0,0,0,.60); }
.host-reset-btn:hover { filter:brightness(1.15); }
.host-reset-btn:active { filter:brightness(.85); }

#_footerPromo { margin-top:10px; display:flex; align-items:center; justify-content:center; gap:8px; font-size:12px; color:#e9e9e9; text-align:center; flex-wrap:wrap; }
#_footerPromo a { color:#00ff0a; letter-spacing:.3px; }
#_footerPromo a:hover { text-decoration:underline; }

@media (max-width:600px) {
  body { padding:8px 4px 24px; background-attachment:scroll; }
  #_pageShell { width:100%; }
  #musicBackground { flex-direction:column !important; }
  #_cdSidePanel { width:100%; flex-direction:row; padding:8px; border-left:none; border-top:1px solid rgba(0,0,0,.15); }
  #_cdSpinWrapper { width:96px; height:96px; }
}
</style>
</head>
<body>

<a id="cornerLogo" href="../index.html#introduction" title="Watanagashi Archive — Home">
  <img src="../assets/images/watanagashilogo2.png" alt="Watanagashi Archive" onerror="this.style.display='none'">
</a>

<!-- Hidden stubs for script.js -->
<div style="display:none !important;position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;">
  <aside id="sidebarAside">
    <div id="navigationMenu">
      <a class="nav-link" id="nbtn-introduction" href="#introduction"></a>
      <a class="nav-link" id="nbtn-contact"       href="#contact"></a>
      <a class="nav-link" id="nbtn-resources"     href="#resources"></a>
      <a class="nav-link" id="nbtn-music"         href="#music"></a>
      <a class="nav-link" id="nbtn-videos"        href="#videos"></a>
      <a class="nav-link" id="nbtn-sketchbook"    href="#sketchbook"></a>
      <a class="nav-link" id="nbtn-community"     href="#community"></a>
      <a class="nav-link" id="nbtn-preferences"   href="#preferences"></a>
    </div>
  </aside>
  <main id="mainContent">
    <div id="pg-introduction" class="page"></div>
    <div id="pg-contact"      class="page"></div>
    <div id="pg-resources"    class="page"></div>
    <div id="pg-videos" class="page">
      <div id="videoListAnimes"></div><div id="videoListNostalg"></div><div id="videoListAwesome"></div>
    </div>
    <div id="pg-sketchbook" class="page">
      <div id="galleryGrid"></div><div id="galleryAwesome"></div><div id="paintEmbedWrap"></div>
    </div>
    <div id="pg-community" class="page">
      <div id="commPanelChat"></div>
      <div id="commPanelBlog" style="display:none"></div>
      <button id="commTabChat" class="comm-tab active"></button>
      <button id="commTabBlog" class="comm-tab"></button>
    </div>
    <div id="pg-preferences" class="page"></div>
  </main>
</div>

<div id="_pageShell">

  <div class="aero-bar">
    <a class="back-link" href="../index.html" title="Back to Archive">
      <img src="https://img1.picmix.com/output/stamp/thumb/9/6/4/8/2608469_0fb9f.png" alt="&#8249;"
        onerror="this.outerHTML='<span style=&quot;color:#333;font-size:22px;line-height:1;&quot;>&#8249;</span>'">
    </a>
    <span class="bar-title">MUSIC PLAYER</span>
  </div>

  <div id="trackLoadBanner">
    <img src="https://img1.picmix.com/output/stamp/thumb/9/4/8/1/2841849_403b7.gif" alt="" onerror="this.style.display='none'">
    <span id="trackLoadMsg">Initializing&hellip;</span>
  </div>

  <div class="glass-box">
    <div class="aero-inner">
      <div class="aero-pad" style="display:flex;align-items:flex-start;gap:10px;">
        <img src="../assets/images/MUSICPLAYERNOTESYMBOL.png" alt="" style="height:36px;width:auto;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'">
        <p>Enjoy listening to some bangers below &mdash; based on personal picks :-)</p>
      </div>
    </div>
  </div>

  <div id="pg-music" class="page active" style="display:block !important;">
    <div class="glass-box" id="playerGlassBox">
      <div id="musicPlayerContainer" class="aero-glass-overlay">

        <div class="mp-header-bar">Music Player &#9834;</div>
        <span class="section-bar" style="margin-bottom:0;">MUSICPLAYER LIST</span>

        <div id="musicBackground">
          <div id="mbArtLayer" class="no-art"></div>
          <div id="musicPlayerPlaylist">
            <nav id="playlistLeft"></nav>
            <div class="playlist-right" id="playlistRight">
              <canvas id="visualizerCanvas" width="175" height="96"></canvas>
              <img src="https://frutigeraeroarchive.org/images/music_player/cd.png" id="cdDisc" alt="Album Art" draggable="false">
              <img src="https://frutigeraeroarchive.org/images/music_player/cd.png" id="spinningDisk" alt="" draggable="false">
            </div>
          </div>
          <div id="_cdSidePanel">
            <div id="_cdSpinWrapper">
              <div id="_cdOuter"></div>
              <div id="_cdArt" class="no-art"></div>
              <div id="_cdSheen"></div>
              <div id="_cdRingBorder"></div>
              <div id="_cdHole"></div>
            </div>
            <div id="_cdNowPlayingLabel">— idle —</div>
          </div>
        </div>

        <div class="mp-controls-row">
          <button class="mp-ctrl-btn" id="audioBack" title="Previous">
            <img class="player-img" src="https://frutigeraeroarchive.org/images/music_player/music_player_back.png" alt="Back" draggable="false">
          </button>
          <button class="mp-ctrl-btn" id="audioPlayPause" title="Play/Pause">
            <img class="player-img" id="audioPlayPauseImage" src="https://frutigeraeroarchive.org/images/music_player/music_player_play.png" alt="Play" draggable="false">
          </button>
          <button class="mp-ctrl-btn" id="audioForward" title="Next">
            <img class="player-img" src="https://frutigeraeroarchive.org/images/music_player/music_player_forward.png" alt="Forward" draggable="false">
          </button>
        </div>

        <div id="ytContainer" style="position:fixed;bottom:0;right:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;">
          <div id="_ytEl"></div>
        </div>

        <div class="mp-status-bar" id="mpStatusBar" style="position:relative;display:flex;align-items:center;gap:6px;padding:4px 8px;">
          <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
            <button id="mpLikeBtn" title="Like" style="background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;">
              <img src="https://cdn-icons-png.flaticon.com/128/739/739231.png" style="width:16px;height:16px;pointer-events:none;" draggable="false">
            </button>
            <span id="mpLikeVal" style="font-size:11px;min-width:12px;">0</span>
            <button id="mpDislikeBtn" title="Dislike" style="background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;">
              <img src="https://cdn-icons-png.flaticon.com/128/880/880613.png" style="width:16px;height:16px;pointer-events:none;" draggable="false">
            </button>
            <span id="mpDislikeVal" style="font-size:11px;min-width:12px;">0</span>
          </div>
          <span style="flex:1;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;">
            Currently playing: <span id="audioName">&mdash;</span>
          </span>
          <span id="mpPlusBtn" title="Options" style="cursor:pointer;font-size:15px;font-weight:bold;padding:0 3px;user-select:none;flex-shrink:0;line-height:1;">+</span>
          <div id="mpPlusPopup" style="display:none;position:absolute;right:0;bottom:calc(100% + 2px);z-index:500;min-width:200px;font-size:12px;padding:4px 0;" onclick="event.stopPropagation()">
            <div id="mpPopRandom"     style="padding:7px 16px;cursor:pointer;">Random</div>
            <div id="mpPopShuffle"    style="padding:7px 16px;cursor:pointer;">Shuffle: OFF</div>
            <div style="border-top:1px solid rgba(255,255,255,.12);margin:3px 0;"></div>
            <div id="mpPopSortToggle" style="padding:7px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">Sort <span style="opacity:.5;font-size:10px;">&#9654;</span></div>
            <div id="mpSortSubmenu"   style="display:none;padding:3px 0;"></div>
            <div style="border-top:1px solid rgba(255,255,255,.12);margin:3px 0;"></div>
            <a id="mpPopUrl" style="display:block;padding:7px 16px;cursor:pointer;text-decoration:none;" target="_blank" rel="noopener noreferrer">URL</a>
          </div>
        </div>

        <div class="mp-progress-row">
          <span style="font-size:10px;white-space:nowrap;">Time Left:</span>
          <span id="timeLeft" class="mp-time-val">0:00</span>
          <div class="mp-progress-track" style="flex:1 1 auto;">
            <div id="progressFill" class="mp-progress-fill"></div>
            <input type="range" id="progressBar" class="mp-range" value="0" max="100" step="0.01">
          </div>
          <button id="muteButton" class="mp-mute-btn" title="Mute">
            <img id="volumeImage" src="https://frutigeraeroarchive.org/images/music_player/volume_medium.png" alt="Vol" draggable="false">
          </button>
          <div class="mp-vol-wrap" id="volWrap">
            <div class="mp-vol-fill" id="volFill"></div>
            <input type="range" id="volumeSlider" class="mp-vol-range" min="0" max="100" step="1" value="30">
          </div>
          <span style="font-size:10px;white-space:nowrap;">Vol: <span id="volumeIndicator">30</span></span>
          <button id="audioLoop" class="mp-loop-btn" title="Loop">
            <img id="audioLoopImage" src="https://frutigeraeroarchive.org/images/music_player/music_player_loop_off.png" alt="Loop" draggable="false">
          </button>
        </div>

      </div>
    </div>
  </div>

  <!-- HOST PANEL -->
  <div id="hostPanel" class="glass-box">
    <div class="section-bar">Add Track — Host Only</div>
    <div class="aero-inner">
      <div class="aero-pad">

        <div class="desc-box">
          <p>Add tracks via <strong>YouTube link</strong>, <strong>direct file URL</strong>, or <strong>upload audio files</strong>. Every track belongs to an <strong>Album</strong>. Create albums in the manager below and pick them before adding. Artwork is always optional &mdash; YouTube tracks fall back to their thumbnail.</p>
        </div>

        <!-- Tabs -->
        <div class="host-tabs">
          <button class="host-tab active" id="htabYt"     onclick="_htab('Yt')">YouTube</button>
          <button class="host-tab"        id="htabFile"   onclick="_htab('File')">File URL</button>
          <button class="host-tab"        id="htabUpload" onclick="_htab('Upload')">Upload</button>
        </div>

        <!-- YouTube pane -->
        <div class="host-pane active" id="hpaneYt">
          <div class="hf-group">
            <label class="hf-label">YouTube Video or Playlist URL</label>
            <input type="text" id="hYtUrl" class="hf-input" placeholder="https://www.youtube.com/watch?v=..." autocomplete="off" spellcheck="false" inputmode="url">
          </div>
          <div class="hf-group">
            <label class="hf-label">Track Name <span style="color:#aaa;font-size:9px;">(blank = auto-detect)</span></label>
            <input type="text" id="hYtName" class="hf-input" placeholder="e.g. Higurashi OST — Vol. 1" autocomplete="off">
          </div>
          <div class="hf-group">
            <label class="hf-label">Album <span style="color:#aaa;font-size:9px;">(blank → Uncategorized)</span></label>
            <input type="text" id="hYtAlbum" class="hf-input" placeholder="Pick a tag below or type a new name…" autocomplete="off" list="hDlYt">
            <datalist id="hDlYt"></datalist>
            <div class="album-pills" id="hPillsYt"></div>
          </div>
          <div class="hf-group">
            <label class="hf-label">Artwork</label>
            <div class="artwork-mode-row">
              <label><input type="radio" name="hYtArtMode" value="thumb" checked> YouTube thumbnail per track <span style="color:#aaa;font-size:9px;">(default)</span></label>
              <label><input type="radio" name="hYtArtMode" value="custom"> Custom URL for all tracks</label>
            </div>
            <input type="text" id="hYtArtUrl" class="hf-input" placeholder="https://… custom artwork URL" autocomplete="off" style="display:none;margin-top:4px;">
          </div>
          <div id="hostYtPreview">
            <img id="hostYtPreviewArt" src="" alt="">
            <div>
              <div id="hostYtPreviewName" style="font-size:12px;color:#111;margin-bottom:2px;"></div>
              <div id="hostYtPreviewSub" style="font-size:10px;color:#888;"></div>
            </div>
          </div>
          <button class="host-add-btn" onclick="hostAddYt()">&#65291; ADD YOUTUBE TRACK</button>
        </div>

        <!-- File URL pane -->
        <div class="host-pane" id="hpaneFile">
          <div class="hf-group">
            <label class="hf-label">Direct Audio URL (mp3, ogg, flac…)</label>
            <input type="text" id="hFileUrl" class="hf-input" placeholder="https://example.com/track.mp3" autocomplete="off" spellcheck="false">
          </div>
          <div class="hf-group">
            <label class="hf-label">Track Name <span style="color:var(--accent);">*</span></label>
            <input type="text" id="hFileName" class="hf-input" placeholder="e.g. Artist — Track Title" autocomplete="off">
          </div>
          <div class="hf-group">
            <label class="hf-label">Album <span style="color:#aaa;font-size:9px;">(blank → Uncategorized)</span></label>
            <input type="text" id="hFileAlbum" class="hf-input" placeholder="Pick a tag below or type…" autocomplete="off" list="hDlFile">
            <datalist id="hDlFile"></datalist>
            <div class="album-pills" id="hPillsFile"></div>
          </div>
          <div class="hf-group">
            <label class="hf-label">Artwork URL <span style="color:#aaa;font-size:9px;">(optional)</span></label>
            <input type="text" id="hFileArt" class="hf-input" placeholder="https://… (leave blank = no art)" autocomplete="off">
          </div>
          <button class="host-add-btn" onclick="hostAddFile()">&#65291; ADD FILE TRACK</button>
        </div>

        <!-- Upload pane -->
        <div class="host-pane" id="hpaneUpload">
          <div class="hf-group">
            <label class="hf-label">Album for uploaded files <span style="color:#aaa;font-size:9px;">(blank → Uncategorized)</span></label>
            <input type="text" id="hUploadAlbum" class="hf-input" placeholder="Pick a tag below or type…" autocomplete="off" list="hDlUpload">
            <datalist id="hDlUpload"></datalist>
            <div class="album-pills" id="hPillsUpload"></div>
          </div>
          <label id="uploadDropZone">
            <span style="font-size:20px;">&#9836;</span>
            <span>Click to choose audio files, or <strong style="color:var(--accent);">drag &amp; drop</strong></span>
            <span style="font-size:10px;color:#bbb;">Multiple files supported</span>
            <input type="file" id="hUploadInput" accept="audio/*" multiple style="display:none;">
          </label>
          <label style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:5px;padding:5px 10px;cursor:pointer;background:var(--grad-bar);border:1px solid rgba(140,140,140,.45);font-size:10.5px;color:#555;">
            &#128193; Choose a folder (audio files inside will be added)
            <input type="file" id="hUploadFolder" accept="audio/*" multiple webkitdirectory style="display:none;">
          </label>
          <div id="uploadPendingList"></div>
          <button class="host-add-btn" id="hUploadConfirmBtn" onclick="hostConfirmUpload()" disabled>&#65291; ADD UPLOADED FILES</button>
        </div>

        <div class="host-status" id="hostStatus"></div>

        <!-- Reset tools -->
        <div class="section-bar" style="margin-top:8px;">Reset Tools</div>
        <div style="padding:8px;background:#f5f5f5;border:1px solid rgba(140,140,140,.30);border-top:none;margin-bottom:6px;">
          <div style="font-size:10px;color:#888;margin-bottom:6px;">These actions cannot be undone.</div>
          <div class="host-reset-row">
            <button class="host-reset-btn" onclick="_resetRatings()">&#10008; Reset All Ratings</button>
            <button class="host-reset-btn" onclick="_resetMotw()">&#10008; Reset Music of the Week</button>
            <button class="host-reset-btn" onclick="_resetAllAddedTracks()">&#10008; Clear All Added Tracks</button>
          </div>
        </div>

        <!-- Album manager -->
        <div class="section-bar">Album Manager</div>
        <div style="padding:6px;background:#f5f5f5;border:1px solid rgba(140,140,140,.30);border-top:none;margin-bottom:6px;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">Create New Album — appears first in the playlist</div>
          <div id="_newAlbumRow">
            <input type="text" id="_newAlbumName" placeholder="Album name…" autocomplete="off">
            <button id="_newAlbumBtn" onclick="_createAlbum()">&#65291; Create</button>
          </div>
        </div>
        <div id="_albumBuckets"></div>

        <div class="note">
          Tracks without an album go to <strong>Uncategorized</strong>. Drag tracks between albums or use the Move dropdown. Artwork is always optional — YouTube tracks use their thumbnail by default.
        </div>

      </div>
    </div>
  </div>

  <div id="_footerPromo">
    <span>So you like music? Why don't you try the</span>
    <a href="../pages/downloader.html">Music Convertor</a>
    <span>and get some of those tracks?</span>
  </div>

</div>

<button id="soundToggle" onclick="toggleSound()">Sounds: On</button>

<script src="../scripts/js/music.js"></script>
<script src="../scripts/js/video.js"></script>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="../scripts/js/script.js"></script>

<script>
/* ════════════════════════════════════════════════════════════════
   OUR STORAGE KEYS
   We never touch music.js keys (mp_track_votes, motw, top3, etc.)
   ════════════════════════════════════════════════════════════════ */
var HS_ADDED   = 'host_added_tracks';    // [{_hostId, type, videoId/url, name, album, artwork, addedAt}]
var HS_DELETED = 'host_deleted_ids';     // [hostId, …]
var HS_ALBUMS  = 'host_custom_albums';   // ["Newest","Older",…]  newest at index 0
var HS_VOTES   = '_voteState';           // {trackName: 'like'|'dislike'}

function _ls(k,d){try{var v=localStorage.getItem(k);return v!==null?JSON.parse(v):d;}catch(e){return d;}}
function _lss(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

function getAdded()   {return _ls(HS_ADDED,[]);}
function saveAdded(a) {_lss(HS_ADDED,a);}
function getDeleted() {return _ls(HS_DELETED,[]);}
function saveDeleted(a){_lss(HS_DELETED,a);}
function getCustom()  {return _ls(HS_ALBUMS,[]);}
function saveCustom(a){_lss(HS_ALBUMS,a);}

/* ════════════════════════════════════════════════════════════════
   COLLECT ALL ALBUM NAMES
   Order: custom (newest first) → built-in from TRACKS → Uncategorized last if not already
   ════════════════════════════════════════════════════════════════ */
function _allAlbums(){
  var seen={}, list=[];
  function push(a){if(!seen[a]){seen[a]=true;list.push(a);}}
  getCustom().forEach(push);                          /* custom newest-first */
  getAdded().forEach(function(t){push(t.album||'Uncategorized');});
  if(typeof TRACKS!=='undefined') TRACKS.forEach(function(t){push(t._plLabel||'Uncategorized');});
  push('Uncategorized');                             /* always present */
  return list;
}

/* ════════════════════════════════════════════════════════════════
   REFRESH DATALISTS + PILLS
   ════════════════════════════════════════════════════════════════ */
function _refreshPickers(){
  var albums=_allAlbums();
  [{dl:'hDlYt',pills:'hPillsYt',inp:'hYtAlbum'},
   {dl:'hDlFile',pills:'hPillsFile',inp:'hFileAlbum'},
   {dl:'hDlUpload',pills:'hPillsUpload',inp:'hUploadAlbum'}
  ].forEach(function(c){
    var dl=document.getElementById(c.dl), pills=document.getElementById(c.pills), inp=document.getElementById(c.inp);
    if(dl){dl.innerHTML=''; albums.forEach(function(a){var o=document.createElement('option');o.value=a;dl.appendChild(o);});}
    if(pills&&inp){
      pills.innerHTML='';
      albums.forEach(function(a){
        var p=document.createElement('span'); p.className='album-pill'; p.textContent=a;
        p.addEventListener('click',function(){inp.value=a;}); pills.appendChild(p);
      });
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   INJECT HOST TRACKS INTO TRACKS ARRAY
   ════════════════════════════════════════════════════════════════ */
function _hostInject(){
  if(typeof TRACKS==='undefined') return;

  var deleted=getDeleted(), added=getAdded();

  /* Remove host tracks that were deleted */
  for(var i=TRACKS.length-1;i>=0;i--){
    if(TRACKS[i]._hostOwned && deleted.indexOf(TRACKS[i]._hostId)!==-1) TRACKS.splice(i,1);
  }

  /* Index already-present host IDs */
  var present={};
  TRACKS.forEach(function(t){if(t._hostOwned) present[t._hostId]=true;});

  /* Build list of tracks to insert, in added order (index 0 = newest) */
  var toAdd=[];
  added.forEach(function(t){
    if(deleted.indexOf(t._hostId)!==-1||present[t._hostId]) return;
    var tr={
      _hostOwned:true, _hostId:t._hostId,
      _plLabel:t.album||'Uncategorized',
      title:t.name
    };
    if(t.type==='yt'){
      tr.videoId=t.videoId; tr.type='youtube';
      /* artwork: custom if set, else use YouTube thumbnail (empty string = music.js uses thumb) */
      tr.albumArt = t.artwork ? t.artwork : 'https://img.youtube.com/vi/'+t.videoId+'/mqdefault.jpg';
    } else {
      tr.videoId=null; tr._fileUrl=t.url; tr.type='file';
      tr.albumArt=t.artwork||'';
    }
    toAdd.push(tr);
  });

  /* Insert newest-first at the front */
  for(var j=toAdd.length-1;j>=0;j--) TRACKS.unshift(toAdd[j]);

  if(typeof buildPlaylist==='function') buildPlaylist();
}

/* ════════════════════════════════════════════════════════════════
   BACKGROUND + block musicBackground style mutations
   ════════════════════════════════════════════════════════════════ */
var _BG='https://preview.redd.it/is-there-any-kind-of-higurashi-audio-only-thing-that-i-can-v0-rlmimbxfqz0e1.jpeg?width=1080&crop=smart&auto=webp&s=a4b337ee1258844d21720824a2a0b17b640c122a';
(function(){
  function applyBg(){
    var s=document.getElementById('_mbg');
    if(!s){s=document.createElement('style');s.id='_mbg';document.head.appendChild(s);}
    s.textContent='body{background-image:url("'+_BG+'")!important;background-size:64%!important;background-attachment:fixed!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#000!important;}';
  }
  applyBg();
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.id==='_darkThemeBgStyle'||n.id==='_themeStyle')setTimeout(applyBg,40);});});}).observe(document.head,{childList:true});
})();
var _mb=document.getElementById('musicBackground');
if(_mb){
  new MutationObserver(function(){
    if(_mb.style.backgroundImage&&_mb.style.backgroundImage!=='none'){
      var bg=_mb.style.backgroundImage; _mb.style.backgroundImage='none'; _mb.style.background='';
      var m=bg.match(/url\(["']?([^"')]+)["']?\)/);
      if(m&&m[1]&&m[1].indexOf('cd.png')===-1) _updateCdArt(m[1]);
    }
  }).observe(_mb,{attributes:true,attributeFilter:['style']});
}

/* ════════════════════════════════════════════════════════════════
   SPINNING CD
   ════════════════════════════════════════════════════════════════ */
var _cdArtEl=document.getElementById('_cdArt'), _cdWrap=document.getElementById('_cdSpinWrapper'), _cdLbl=document.getElementById('_cdNowPlayingLabel'), _curArt='';
function _updateCdArt(u){if(!u||u===_curArt)return;_curArt=u;if(_cdArtEl){_cdArtEl.style.backgroundImage='url("'+u+'")';_cdArtEl.classList.remove('no-art');}}
function _cdPlay(p){
  if(!_cdWrap)return;
  if(p){_cdWrap.classList.add('spinning');var n=document.getElementById('audioName');if(_cdLbl&&n)_cdLbl.textContent=n.textContent||'— playing —';}
  else{_cdWrap.classList.remove('spinning');if(_cdLbl)_cdLbl.textContent='— paused —';if(!_curArt&&_cdArtEl)_cdArtEl.classList.add('no-art');}
}
(function(){
  var pp=document.getElementById('audioPlayPauseImage'); if(!pp)return;
  function sync(){_cdPlay((pp.getAttribute('src')||'').indexOf('pause')!==-1);}
  new MutationObserver(sync).observe(pp,{attributes:true,attributeFilter:['src']});
  var btn=document.getElementById('audioPlayPause'); if(btn)btn.addEventListener('click',function(){setTimeout(sync,150);});
  document.addEventListener('DOMContentLoaded',function(){
    var a=document.getElementById('audioPlayer')||document.querySelector('audio');
    if(a){a.addEventListener('play',function(){_cdPlay(true);});a.addEventListener('pause',function(){_cdPlay(false);});a.addEventListener('ended',function(){_cdPlay(false);});}
    sync();
  });
})();
(function(){var c=document.getElementById('cdDisc');if(!c)return;new MutationObserver(function(){var s=c.src||c.getAttribute('src')||'';if(s&&s.indexOf('cd.png')===-1&&s!==_curArt)_updateCdArt(s);}).observe(c,{attributes:true,attributeFilter:['src']});})();
(function(){var n=document.getElementById('audioName');if(!n)return;new MutationObserver(function(){if(_cdWrap&&_cdWrap.classList.contains('spinning')&&_cdLbl)_cdLbl.textContent=n.textContent||'— playing —';}).observe(n,{childList:true,subtree:true,characterData:true});})();

/* ════════════════════════════════════════════════════════════════
   LIKE / DISLIKE — opacity states
   ════════════════════════════════════════════════════════════════ */
(function(){
  var lb=document.getElementById('mpLikeBtn'), db=document.getElementById('mpDislikeBtn'); if(!lb||!db)return;
  function tid(){var n=document.getElementById('audioName');return n?(n.textContent||'').trim():'';}
  function getV(){return _ls(HS_VOTES,{});}
  function saveV(id,type){var v=getV();if(!type)delete v[id];else v[id]=type;_lss(HS_VOTES,v);}
  function sync(){var id=tid();if(!id)return;var s=getV()[id]||null;lb.classList.toggle('voted',s==='like');db.classList.toggle('voted',s==='dislike');}
  lb.addEventListener('click',function(){var id=tid();if(!id)return;var a=lb.classList.contains('voted');lb.classList.toggle('voted',!a);db.classList.remove('voted');saveV(id,a?null:'like');});
  db.addEventListener('click',function(){var id=tid();if(!id)return;var a=db.classList.contains('voted');db.classList.toggle('voted',!a);lb.classList.remove('voted');saveV(id,a?null:'dislike');});
  var n=document.getElementById('audioName');if(n)new MutationObserver(sync).observe(n,{childList:true,subtree:true,characterData:true});
  document.addEventListener('DOMContentLoaded',sync);
})();

/* ════════════════════════════════════════════════════════════════
   LOADING BANNER
   ════════════════════════════════════════════════════════════════ */
(function(){
  var banner=document.getElementById('trackLoadBanner'), msgEl=document.getElementById('trackLoadMsg');
  var msgs=['Initializing\u2026','Loading track list\u2026','Fetching playlist data\u2026','Buffering audio streams\u2026','Syncing track index\u2026'];
  var idx=0, done=false;
  if(msgEl)msgEl.textContent=msgs[0]; banner.classList.add('visible');
  var rotI=setInterval(function(){if(done){clearInterval(rotI);return;}idx=(idx+1)%msgs.length;if(msgEl&&!done)msgEl.textContent=msgs[idx];},1800);
  var pollN=0, pollI=setInterval(function(){
    pollN++;
    if(typeof TRACKS!=='undefined'&&TRACKS.length>0){clearInterval(pollI);done=true;clearInterval(rotI);setTimeout(function(){banner.classList.remove('visible');},700);}
    else if(pollN>40){clearInterval(pollI);done=true;setTimeout(function(){banner.classList.remove('visible');},800);}
  },500);
  if(sessionStorage.getItem('_tl')){done=true;clearInterval(rotI);clearInterval(pollI);banner.classList.remove('visible');}else{sessionStorage.setItem('_tl','1');}
})();

/* ════════════════════════════════════════════════════════════════
   HOST PANEL
   ════════════════════════════════════════════════════════════════ */
(function(){
  var p=new URLSearchParams(window.location.search);
  if(p.get('host')==='1'||localStorage.getItem('hostMode')==='1'){
    document.getElementById('hostPanel').classList.add('visible');
    localStorage.setItem('hostMode','1');
    _refreshPickers();
  }
})();

/* artwork radio */
document.querySelectorAll('input[name="hYtArtMode"]').forEach(function(r){
  r.addEventListener('change',function(){
    var au=document.getElementById('hYtArtUrl');
    if(au) au.style.display=this.value==='custom'?'':'none';
  });
});

/* tab switch */
function _htab(name){
  ['Yt','File','Upload'].forEach(function(t){
    document.getElementById('htab'+t).classList.toggle('active',t===name);
    document.getElementById('hpane'+t).classList.toggle('active',t===name);
  });
  _refreshPickers();
}

/* status */
function setStatus(msg,type){
  var el=document.getElementById('hostStatus');
  el.innerHTML=type?'<span class="'+type+'">'+msg+'</span>':msg;
  el.classList.add('visible');
}

/* ── YouTube helpers ── */
function _ytId(url){var m;m=url.match(/[?&]v=([^&]+)/);if(m)return m[1];m=url.match(/youtu\.be\/([^?&#]+)/);if(m)return m[1];m=url.match(/embed\/([^?&]+)/);if(m)return m[1];return null;}
function _ytList(url){var m=url.match(/[?&]list=([^&]+)/);return m?m[1]:null;}
function _ytThumb(vid){return 'https://img.youtube.com/vi/'+vid+'/mqdefault.jpg';}
function _ytTitle(vid,cb){var x=new XMLHttpRequest();x.open('GET','https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v='+vid+'&format=json',true);x.onload=function(){if(x.status===200){try{cb(null,JSON.parse(x.responseText).title);}catch(e){cb(e,null);}}else{cb(new Error(x.status),null);}};x.onerror=function(){cb(new Error('net'),null);};x.send();}

document.getElementById('hYtUrl').addEventListener('input',function(){
  var vid=_ytId((this.value||'').trim());
  var pre=document.getElementById('hostYtPreview'); if(!vid){if(pre)pre.style.display='none';return;}
  document.getElementById('hostYtPreviewArt').src=_ytThumb(vid);
  document.getElementById('hostYtPreviewName').textContent='Fetching\u2026';
  document.getElementById('hostYtPreviewSub').textContent='ID: '+vid;
  if(pre)pre.style.display='flex';
  _ytTitle(vid,function(e,t){document.getElementById('hostYtPreviewName').textContent=t||('Video '+vid);});
});

/* ════════════════════════════════════════════════════════════════
   ADD YOUTUBE
   ════════════════════════════════════════════════════════════════ */
function hostAddYt(){
  var url  =(document.getElementById('hYtUrl').value||'').trim();
  var name =(document.getElementById('hYtName').value||'').trim();
  var album=(document.getElementById('hYtAlbum').value||'').trim()||'Uncategorized';
  var artMode=document.querySelector('input[name="hYtArtMode"]:checked').value;
  var customArt=(document.getElementById('hYtArtUrl').value||'').trim();
  var art=(artMode==='custom'&&customArt)?customArt:'';  /* '' = thumbnail fallback in inject */

  if(!url){setStatus('Please enter a YouTube URL.','err');return;}
  if(!/youtube\.com|youtu\.be/i.test(url)){setStatus('Only YouTube links are supported.','err');return;}
  var vid=_ytId(url), list=_ytList(url);
  if(!vid&&!list){setStatus('Could not parse YouTube ID.','err');return;}

  if(list&&!vid){
    var t={type:'yt-playlist',_hostId:'pl_'+list,videoId:null,listId:list,name:name||('YouTube Playlist — '+list),album:album,artwork:art,addedAt:Date.now()};
    var aa=getAdded();aa.unshift(t);saveAdded(aa);
    setStatus('Playlist added: '+t.name,'ok');
    _hostInject();_renderAlbums();_refreshPickers();_clearYt();return;
  }

  function finish(title){
    var finalName=name||title||('YouTube — '+vid);
    var t={type:'yt',_hostId:'yt_'+vid,videoId:vid,name:finalName,album:album,artwork:art,addedAt:Date.now()};
    var aa=getAdded();aa.unshift(t);saveAdded(aa);
    setStatus('Added: '+finalName+' \u2192 '+album,'ok');
    _hostInject();_renderAlbums();_refreshPickers();_clearYt();
    document.getElementById('hostYtPreview').style.display='none';
  }
  if(name){finish(name);}else{setStatus('Fetching info\u2026','');_ytTitle(vid,function(e,t){finish(t);});}
}
function _clearYt(){['hYtUrl','hYtName','hYtAlbum','hYtArtUrl'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});document.querySelector('input[name="hYtArtMode"][value="thumb"]').checked=true;var au=document.getElementById('hYtArtUrl');if(au)au.style.display='none';}

/* ════════════════════════════════════════════════════════════════
   ADD FILE URL
   ════════════════════════════════════════════════════════════════ */
function hostAddFile(){
  var url  =(document.getElementById('hFileUrl').value||'').trim();
  var name =(document.getElementById('hFileName').value||'').trim();
  var album=(document.getElementById('hFileAlbum').value||'').trim()||'Uncategorized';
  var art  =(document.getElementById('hFileArt').value||'').trim();
  if(!url){setStatus('Please enter the audio URL.','err');return;}
  if(!name){setStatus('Please enter the track name.','err');return;}
  var id='file_'+url;
  var aa=getAdded();aa.unshift({type:'file',_hostId:id,url:url,name:name,album:album,artwork:art,addedAt:Date.now()});saveAdded(aa);
  setStatus('Added: '+name+' \u2192 '+album,'ok');
  _hostInject();_renderAlbums();_refreshPickers();
  ['hFileUrl','hFileName','hFileAlbum','hFileArt'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
}

/* ════════════════════════════════════════════════════════════════
   UPLOAD FILES
   ════════════════════════════════════════════════════════════════ */
var _pending=[];
function _isAudio(f){return (f.type&&/^audio\//.test(f.type))||/\.(mp3|ogg|wav|flac|aac|opus|m4a|wma|aiff)$/i.test(f.name||'');}
function _addPending(files){
  Array.prototype.forEach.call(files||[],function(f){
    if(!_isAudio(f))return;
    if(!_pending.some(function(x){return x.name===f.name&&x.size===f.size;}))_pending.push(f);
  });
  _renderPending();
}
function _renderPending(){
  var list=document.getElementById('uploadPendingList'),btn=document.getElementById('hUploadConfirmBtn');
  if(!list)return; list.innerHTML='';
  _pending.forEach(function(f,i){
    var row=document.createElement('div');row.className='pf-row';
    var nm=document.createElement('span');nm.className='pf-name';nm.textContent=f.name;
    var sz=document.createElement('span');sz.className='pf-size';sz.textContent=(f.size/1024).toFixed(0)+' KB';
    var d=document.createElement('button');d.className='pf-del';d.textContent='\u00d7';
    (function(idx){d.addEventListener('click',function(){_pending.splice(idx,1);_renderPending();});})(i);
    row.appendChild(nm);row.appendChild(sz);row.appendChild(d);list.appendChild(row);
  });
  if(btn)btn.disabled=_pending.length===0;
}
document.getElementById('hUploadInput').addEventListener('change',function(){_addPending(this.files);this.value='';});
document.getElementById('hUploadFolder').addEventListener('change',function(){_addPending(this.files);this.value='';});
var _dz=document.getElementById('uploadDropZone');
_dz.addEventListener('dragover',function(e){e.preventDefault();_dz.classList.add('over');});
_dz.addEventListener('dragleave',function(){_dz.classList.remove('over');});
_dz.addEventListener('drop',function(e){e.preventDefault();_dz.classList.remove('over');var fs=[];if(e.dataTransfer.items){Array.prototype.forEach.call(e.dataTransfer.items,function(it){if(it.kind==='file'){var f=it.getAsFile();if(f)fs.push(f);}});}else Array.prototype.forEach.call(e.dataTransfer.files||[],function(f){fs.push(f);});_addPending(fs);});
function hostConfirmUpload(){
  if(!_pending.length)return;
  var album=(document.getElementById('hUploadAlbum').value||'').trim()||'Uncategorized';
  var aa=getAdded(),count=0;
  _pending.forEach(function(f){
    var obj=URL.createObjectURL(f),id='file_'+obj;
    aa.unshift({type:'file',_hostId:id,url:obj,name:f.name.replace(/\.[^.]+$/,''),album:album,artwork:'',addedAt:Date.now()});
    count++;
  });
  saveAdded(aa);_pending=[];_renderPending();
  _hostInject();_renderAlbums();_refreshPickers();
  setStatus(count+' file(s) added to "'+album+'"','ok');
}

/* ════════════════════════════════════════════════════════════════
   RESET TOOLS
   ════════════════════════════════════════════════════════════════ */
function _resetRatings(){
  if(!confirm('Reset ALL like/dislike ratings?'))return;
  localStorage.removeItem(HS_VOTES);
  /* common music.js rating keys */
  ['mp_track_votes','_mpVotes','mpVotes','mpRatings'].forEach(function(k){localStorage.removeItem(k);});
  var lv=document.getElementById('mpLikeVal'),dv=document.getElementById('mpDislikeVal');
  if(lv)lv.textContent='0';if(dv)dv.textContent='0';
  document.getElementById('mpLikeBtn').classList.remove('voted');
  document.getElementById('mpDislikeBtn').classList.remove('voted');
  setStatus('All ratings reset.','ok');
}
function _resetMotw(){
  if(!confirm('Reset Music of the Week?'))return;
  /* common motw key names */
  ['mp_music_of_the_week','mp_motw','musicOfTheWeek','motwTrack','motw','_motw'].forEach(function(k){localStorage.removeItem(k);});
  if(typeof resetMusicOfTheWeek==='function')resetMusicOfTheWeek();
  setStatus('Music of the Week reset.','ok');
}
function _resetAllAddedTracks(){
  if(!confirm('Remove ALL host-added tracks? Base tracks from music.js stay.'))return;
  if(typeof TRACKS!=='undefined'){
    for(var i=TRACKS.length-1;i>=0;i--){if(TRACKS[i]._hostOwned)TRACKS.splice(i,1);}
    if(typeof buildPlaylist==='function')buildPlaylist();
  }
  localStorage.removeItem(HS_ADDED);
  localStorage.removeItem(HS_DELETED);
  _renderAlbums();_refreshPickers();
  setStatus('All host-added tracks cleared.','ok');
}

/* ════════════════════════════════════════════════════════════════
   ALBUM MANAGER
   ════════════════════════════════════════════════════════════════ */
function _createAlbum(){
  var inp=document.getElementById('_newAlbumName'),name=(inp.value||'').trim();
  if(!name){setStatus('Please enter an album name.','err');return;}
  var c=getCustom();
  if(c.indexOf(name)!==-1){setStatus('"'+name+'" already exists.','err');return;}
  c.unshift(name);saveCustom(c);     /* newest first */
  inp.value='';
  _renderAlbums();_refreshPickers();
  setStatus('Album "'+name+'" created.','ok');
}

function _deleteAlbum(name){
  if(!confirm('Delete album "'+name+'"? Its tracks move to Uncategorized.'))return;
  var aa=getAdded();aa.forEach(function(t){if(t.album===name)t.album='Uncategorized';});saveAdded(aa);
  if(typeof TRACKS!=='undefined'){TRACKS.forEach(function(t){if(t._plLabel===name)t._plLabel='Uncategorized';});if(typeof buildPlaylist==='function')buildPlaylist();}
  saveCustom(getCustom().filter(function(a){return a!==name;}));
  _renderAlbums();_refreshPickers();
}

function _moveTrack(hostId,newAlbum){
  var aa=getAdded();aa.forEach(function(t){if(t._hostId===hostId)t.album=newAlbum;});saveAdded(aa);
  if(typeof TRACKS!=='undefined'){TRACKS.forEach(function(t){if(t._hostId===hostId)t._plLabel=newAlbum;});if(typeof buildPlaylist==='function')buildPlaylist();}
  _renderAlbums();
}

function _deleteTrack(hostId){
  if(!confirm('Delete this track?'))return;
  var d=getDeleted();if(d.indexOf(hostId)===-1){d.push(hostId);saveDeleted(d);}
  saveAdded(getAdded().filter(function(t){return t._hostId!==hostId;}));
  if(typeof TRACKS!=='undefined'){for(var i=TRACKS.length-1;i>=0;i--){if(TRACKS[i]._hostId===hostId)TRACKS.splice(i,1);}if(typeof buildPlaylist==='function')buildPlaylist();}
  _renderAlbums();setStatus('Track deleted.','ok');
}

/* ════════════════════════════════════════════════════════════════
   RENDER ALBUM MANAGER
   ════════════════════════════════════════════════════════════════ */
function _renderAlbums(){
  var cont=document.getElementById('_albumBuckets');if(!cont)return;
  cont.innerHTML='';

  var albums=_allAlbums();
  var deleted=getDeleted(), added=getAdded();

  /* build album → tracks map */
  var map={};albums.forEach(function(a){map[a]=[];});

  /* host-added tracks */
  added.forEach(function(t){
    if(deleted.indexOf(t._hostId)!==-1)return;
    var a=t.album||'Uncategorized';
    if(!map[a])map[a]=[];
    map[a].push({hostId:t._hostId,name:t.name,artwork:t.artwork,type:t.type,videoId:t.videoId||null,_mine:true});
  });

  /* base TRACKS (music.js) — shown read-only */
  if(typeof TRACKS!=='undefined'){
    TRACKS.forEach(function(t){
      if(t._hostOwned)return;
      var a=t._plLabel||'Uncategorized';
      if(!map[a])map[a]=[];
      map[a].push({hostId:null,name:t.title,artwork:t.albumArt||'',type:t.type||'youtube',videoId:t.videoId||null,_mine:false});
    });
  }

  var custom=getCustom();

  albums.forEach(function(albumName){
    var tracks=map[albumName]||[];
    var bucket=document.createElement('div');bucket.className='album-bucket';

    /* header */
    var hdr=document.createElement('div');hdr.className='album-bucket-header';
    var nm=document.createElement('span');nm.className='ab-name';nm.textContent='\u25bc '+albumName;
    var ct=document.createElement('span');ct.className='ab-count';ct.textContent=tracks.length+' track'+(tracks.length!==1?'s':'');
    hdr.appendChild(nm);hdr.appendChild(ct);

    /* delete album button — only for custom albums */
    if(custom.indexOf(albumName)!==-1){
      var da=document.createElement('button');da.className='ab-del-btn';da.textContent='\u00d7';da.title='Delete album';
      (function(an){da.addEventListener('click',function(e){e.stopPropagation();_deleteAlbum(an);});})(albumName);
      hdr.appendChild(da);
    }

    /* body */
    var body=document.createElement('div');body.className='album-bucket-body';

    /* collapse */
    hdr.addEventListener('click',function(){
      var c=body.style.display==='none';body.style.display=c?'':'none';
      nm.textContent=(c?'\u25bc ':'\u25ba ')+albumName;
    });

    /* drag target */
    body.addEventListener('dragover',function(e){e.preventDefault();body.classList.add('drag-over');});
    body.addEventListener('dragleave',function(){body.classList.remove('drag-over');});
    body.addEventListener('drop',function(e){e.preventDefault();body.classList.remove('drag-over');var hid=e.dataTransfer.getData('text/plain');if(hid)_moveTrack(hid,albumName);});

    /* track rows */
    tracks.forEach(function(t){
      var item=document.createElement('div');item.className='ab-track-item';
      if(t._mine&&t.hostId){item.classList.add('draggable');item.draggable=true;item.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',t.hostId);});}

      var handle=document.createElement('span');handle.className='abt-handle';handle.textContent='\u2807';
      var art=document.createElement('img');art.className='abt-art';
      art.src=t.artwork||(t.videoId?_ytThumb(t.videoId):'https://frutigeraeroarchive.org/images/music_player/cd.png');
      art.onerror=function(){this.src='https://frutigeraeroarchive.org/images/music_player/cd.png';};
      var nameEl=document.createElement('span');nameEl.className='abt-name';nameEl.textContent=t.name;nameEl.title=t.name;
      var badge=document.createElement('span');badge.className='abt-badge';badge.textContent=t._mine?(t.type==='file'?'file':'yt'):'base';

      item.appendChild(handle);item.appendChild(art);item.appendChild(nameEl);item.appendChild(badge);

      if(t._mine&&t.hostId){
        /* move dropdown */
        var ms=document.createElement('select');ms.className='abt-move';ms.title='Move to album';
        var def=document.createElement('option');def.value='';def.textContent='Move\u2026';ms.appendChild(def);
        albums.forEach(function(an){if(an===albumName)return;var o=document.createElement('option');o.value=an;o.textContent=an;ms.appendChild(o);});
        (function(hid){ms.addEventListener('change',function(){if(this.value)_moveTrack(hid,this.value);});})(t.hostId);
        /* delete */
        var del=document.createElement('button');del.className='abt-del';del.textContent='\u00d7';del.title='Delete track';
        (function(hid){del.addEventListener('click',function(e){e.stopPropagation();_deleteTrack(hid);});})(t.hostId);
        item.appendChild(ms);item.appendChild(del);
      }
      body.appendChild(item);
    });

    /* per-album upload shortcut */
    var ulbl=document.createElement('label');ulbl.className='album-upload-zone';ulbl.title='Upload audio into '+albumName;
    ulbl.innerHTML='\uff0b Upload audio files into this album';
    var uinp=document.createElement('input');uinp.type='file';uinp.accept='audio/*';uinp.multiple=true;uinp.style.display='none';
    (function(an){uinp.addEventListener('change',function(){
      var aa=getAdded(),cnt=0;
      Array.prototype.forEach.call(this.files,function(f){
        if(!_isAudio(f))return;
        var obj=URL.createObjectURL(f),id='file_'+obj;
        aa.unshift({type:'file',_hostId:id,url:obj,name:f.name.replace(/\.[^.]+$/,''),album:an,artwork:'',addedAt:Date.now()});
        cnt++;
      });
      saveAdded(aa);this.value='';_hostInject();_renderAlbums();if(cnt)setStatus(cnt+' file(s) \u2192 '+an,'ok');
    });})(albumName);
    ulbl.appendChild(uinp);body.appendChild(ulbl);

    bucket.appendChild(hdr);bucket.appendChild(body);cont.appendChild(bucket);
  });
}

/* ════════════════════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',function(){
  var n=0,iv=setInterval(function(){
    n++;
    if(typeof TRACKS!=='undefined'){
      clearInterval(iv);
      _hostInject();_renderAlbums();_refreshPickers();
    }else if(n>40){clearInterval(iv);_renderAlbums();_refreshPickers();}
  },500);

  var hp=document.getElementById('hostPanel');
  if(hp)new MutationObserver(function(){if(hp.classList.contains('visible')){_renderAlbums();_refreshPickers();}}).observe(hp,{attributes:true,attributeFilter:['class']});
});

/* ════════════════════════════════════════════════════════════════
   SOUNDS
   ════════════════════════════════════════════════════════════════ */
var _SB='../assets/audio/';
var _SND={start:_SB+'sitestart.mp3',alert:_SB+'sitealert.mp3',dislike:_SB+'sitedislikeclick.mp3',like:_SB+'sitelikeclick.mp3',sort:_SB+'sitesortclick.mp3',button:_SB+'sitebuttonclick.mp3',hover:_SB+'text.mp3'};
var _soundsOn=true,_aC={},_ht=0;
function _gA(k){if(!_aC[k]){var a=new Audio(_SND[k]);a.preload='auto';_aC[k]=a;}return _aC[k];}
function playSound(k){if(!_soundsOn)return;try{var c=_gA(k).cloneNode();c.volume=(k==='hover'?.30:.52);c.play().catch(function(){});}catch(e){}}
function toggleSound(){
  _soundsOn=!_soundsOn;var b=document.getElementById('soundToggle');
  if(b){b.textContent=_soundsOn?'Sounds: On':'Sounds: Off';b.classList.toggle('off',!_soundsOn);}
  if(_soundsOn)playSound('button');sessionStorage.setItem('_soundsOn',String(_soundsOn));
}
document.addEventListener('DOMContentLoaded',function(){
  if(sessionStorage.getItem('_soundsOn')==='false'){_soundsOn=false;var b=document.getElementById('soundToggle');if(b){b.textContent='Sounds: Off';b.classList.add('off');}}
  if(!sessionStorage.getItem('_siteStartPlayed')){sessionStorage.setItem('_siteStartPlayed','1');setTimeout(function(){playSound('start');},700);}
});
document.addEventListener('pointerdown',function(){Object.keys(_SND).forEach(function(k){_gA(k);});},{once:true,passive:true});
function _iI(el){if(!el||el===document.body||el===document.documentElement)return false;var t=el.tagName;if(t==='BUTTON'||t==='A'||t==='SELECT'||t==='TEXTAREA')return true;if(t==='INPUT'&&el.type!=='range')return true;var cs=window.getComputedStyle(el);return cs&&cs.cursor==='pointer';}
document.addEventListener('mouseover',function(e){if(e.target.id==='soundToggle')return;if(!_iI(e.target))return;var n=Date.now();if(n-_ht<120)return;_ht=n;playSound('hover');},{passive:true});
document.addEventListener('click',function(e){if(e.target.id==='soundToggle')return;if(_iI(e.target))playSound('button');},true);
(function(){var BAD='\u00e2\u20ac\u00a6';function fix(el){if(!el)return;if(el.textContent&&el.textContent.indexOf(BAD)!==-1)el.textContent=el.textContent.split(BAD).join('\u2026');}var pl=document.getElementById('playlistLeft');if(pl)new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===3)fix(n.parentElement);else if(n.querySelectorAll){n.querySelectorAll('p,span,div').forEach(fix);fix(n);}});});}).observe(pl,{childList:true,subtree:true});})();
</script>
</body>
</html>