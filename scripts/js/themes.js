/* ================================================================
   themes.js — Theme Switcher
   Themes:
     "next-stage"  (default)  — horizontal nav, site-feel, dark aero
     "rika-menu"   (classic)  — original sidebar menu, dark aero
     "legacy"      (amber)    — warm amber palette, sidebar
   
   Unlock via Ryuguu Code: themes / theme / skins / skin (silent)
   ================================================================ */

(function () {
  'use strict';

  var THEMES = {
    'next-stage': { name: 'Next Stage', accent: '#ffffff' },
    'rika-menu':  { name: 'Rika Menu',  accent: '#ffffff' },
    'legacy':     { name: 'Legacy',     accent: '#ffffff' }
  };

  var _current        = 'next-stage';
  var _themesUnlocked = false;

  window._unlockThemes = function () {
    _themesUnlocked = true;
    var wrap = document.getElementById('_themesBtnWrap');
    if (wrap) wrap.style.display = 'block';
    /* silent — no other notification */
  };

  /* ── Apply theme ── */
  function applyTheme(name) {
    if (!THEMES[name]) return;
    _current = name;

    /* Clear existing data-theme from both html and body */
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');

    /* Apply attribute:
       - next-stage → data-theme="next-stage"  (triggers next-stage.css)
       - rika-menu  → no data-theme             (uses :root defaults in style.css)
       - legacy     → data-theme="legacy"       (triggers legacy block in style.css) */
    if (name !== 'rika-menu') {
      document.documentElement.setAttribute('data-theme', name);
      document.body.setAttribute('data-theme', name);
    }

    /* Background — legacy has its own bg, others use CSS default (BACKGROUND2.jpg) */
    if (name === 'legacy') {
      document.body.style.background     = "url('assets/images/SITEBACKGROUND.png') no-repeat center center fixed";
      document.body.style.backgroundSize = 'cover';
    } else {
      document.body.style.background     = '';
      document.body.style.backgroundSize = '';
    }

    updateThemesButton(name);
    try { localStorage.setItem('_watTheme', name); } catch(e) {}
  }

  /* ── Themes button appearance ── */
  function updateThemesButton(name) {
    var btn = document.getElementById('_themesBtn');
    if (!btn) return;
    btn.removeAttribute('style');

    if (name === 'legacy') {
      /* Orange */
      btn.style.cssText = [
        'background:linear-gradient(to bottom,rgba(160,90,5,.94) 0%,rgba(100,55,2,.98) 50%,rgba(60,28,0,1) 50%,rgba(80,40,2,.96) 100%)',
        'border:1px solid rgba(220,140,20,.70)',
        'border-top:1px solid rgba(255,210,80,.28)',
        'box-shadow:inset 0 1px 0 rgba(255,220,80,.18),rgba(0,0,0,.5) 0 2px 4px',
        'color:#ffd060',
        'font-size:11px',
        'font-family:Tahoma,sans-serif',
        'padding:3px 9px 4px',
        'cursor:pointer',
        'text-shadow:0 1px 2px rgba(0,0,0,.9)',
        'letter-spacing:.2px',
        'position:relative',
        'display:inline-block',
        'width:auto'
      ].join(';');
    } else {
      /* Dark aero grey (next-stage & rika-menu) */
      btn.style.cssText = [
        'background:linear-gradient(to bottom,rgba(255,255,255,.22) 0%,rgba(185,185,185,.88) 0%,rgba(120,120,120,.76) 4%,rgba(26,26,26,.98) 52%,rgba(4,4,4,1) 52%,rgba(14,14,14,.99) 100%)',
        'border:1px solid rgba(140,140,140,.44)',
        'border-top:1px solid rgba(255,255,255,.18)',
        'border-bottom:1px solid rgba(0,0,0,.88)',
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.24),rgba(0,0,0,.5) 0 2px 4px',
        'color:#f2f2f2',
        'font-size:11px',
        'font-family:Tahoma,sans-serif',
        'padding:3px 9px 4px',
        'cursor:pointer',
        'text-shadow:0 1px 3px rgba(0,0,0,.98)',
        'letter-spacing:.2px',
        'position:relative',
        'display:inline-block',
        'width:auto'
      ].join(';');
    }
  }

  /* ── Build theme picker panel ── */
  function buildPanel() {
    if (!_themesUnlocked) return;

    var existing = document.getElementById('_themePanel');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '_themePanel';
    panel.style.cssText = [
      'position:fixed',
      'bottom:0',
      'right:0',
      'z-index:20000',
      'background:linear-gradient(to bottom,rgba(2,2,2,.99),rgba(6,6,6,.99))',
      'border:1px solid rgba(130,130,130,.28)',
      'border-bottom:none',
      'min-width:156px',
      'max-height:78vh',
      'overflow-y:auto',
      'font-family:Tahoma,sans-serif',
      'scrollbar-width:thin',
      'scrollbar-color:rgba(110,110,110,.4) rgba(0,0,0,.2)'
    ].join(';');

    /* Header */
    var hdr = document.createElement('div');
    hdr.style.cssText = [
      'background:linear-gradient(to bottom,rgba(255,255,255,.22) 0%,rgba(185,185,185,.88) 0%,rgba(120,120,120,.76) 4%,rgba(26,26,26,.98) 52%,rgba(4,4,4,1) 52%,rgba(14,14,14,.99) 100%)',
      'color:#f2f2f2',
      'font-size:11px',
      'text-align:center',
      'padding:5px 8px 7px',
      'border-bottom:1px solid rgba(0,0,0,.88)',
      'letter-spacing:.5px',
      'text-transform:uppercase',
      'position:sticky',
      'top:0',
      'z-index:1',
      'text-shadow:0 1px 3px rgba(0,0,0,.98)'
    ].join(';');
    hdr.textContent = 'Theme Selector';
    panel.appendChild(hdr);

    Object.keys(THEMES).forEach(function (key) {
      var th = THEMES[key];
      var btn = document.createElement('button');
      btn.style.cssText = [
        'display:block',
        'width:100%',
        'background:none',
        'border:none',
        'padding:11px 16px 10px',
        'cursor:pointer',
        'border-bottom:1px solid rgba(255,255,255,.04)',
        'text-align:left'
      ].join(';');

      btn.addEventListener('mouseover', function () { btn.style.background = 'rgba(255,255,255,.06)'; });
      btn.addEventListener('mouseout',  function () { btn.style.background = 'none'; });

      var isActive = (key === _current);

      var nameEl = document.createElement('span');
      nameEl.style.cssText = [
        'font-size:12px',
        'display:block',
        'font-family:Tahoma,sans-serif',
        'letter-spacing:.3px',
        'color:' + (isActive ? th.accent : '#888')
      ].join(';');
      nameEl.textContent = th.name + (isActive ? ' \u2713' : '');
      btn.appendChild(nameEl);

      var descEl = document.createElement('span');
      descEl.style.cssText = 'font-size:10px;color:#444;font-family:Tahoma,sans-serif;display:block;margin-top:1px;';
      var descs = {
        'next-stage': 'horizontal nav  \u2014  site layout',
        'rika-menu':  'sidebar menu  \u2014  classic',
        'legacy':     'amber palette  \u2014  warm'
      };
      descEl.textContent = descs[key] || '';
      btn.appendChild(descEl);

      btn.addEventListener('click', function () {
        applyTheme(key);
        panel.remove();
        setTimeout(buildPanel, 40);
      });
      panel.appendChild(btn);
    });

    /* Close button */
    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = [
      'display:block',
      'width:100%',
      'background:linear-gradient(to bottom,rgba(32,32,32,.97) 0%,rgba(10,10,10,.99) 50%,rgba(2,2,2,1) 50%,rgba(8,8,8,.99) 100%)',
      'border:none',
      'border-top:1px solid rgba(110,110,110,.14)',
      'color:#777',
      'font-size:11px',
      'padding:7px 0',
      'cursor:pointer',
      'font-family:Tahoma,sans-serif',
      'letter-spacing:.3px',
      'position:sticky',
      'bottom:0',
      'text-shadow:0 1px 2px rgba(0,0,0,.9)'
    ].join(';');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', function () { panel.remove(); });
    panel.appendChild(closeBtn);

    document.body.appendChild(panel);

    /* Close on outside click */
    setTimeout(function () {
      document.addEventListener('click', function outsideClose(e) {
        var p  = document.getElementById('_themePanel');
        var tb = document.getElementById('_themesBtn');
        if (!p) { document.removeEventListener('click', outsideClose); return; }
        if (!p.contains(e.target) && e.target !== tb) {
          p.remove();
          document.removeEventListener('click', outsideClose);
        }
      });
    }, 80);
  }

  window._themesPanelToggle = function (e) {
    if (e) e.stopPropagation();
    buildPanel();
  };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    var saved = null;
    try { saved = localStorage.getItem('_watTheme'); } catch(e) {}

    /* Migrate old storage key */
    if (!saved) {
      try { saved = localStorage.getItem('_scrapTheme'); } catch(e) {}
    }

    if (saved && THEMES[saved]) {
      /* Unlock themes panel if user had a non-default saved */
      if (saved !== 'next-stage') {
        _themesUnlocked = true;
        var wrap = document.getElementById('_themesBtnWrap');
        if (wrap) wrap.style.display = 'block';
      }
      applyTheme(saved);
    } else {
      applyTheme('next-stage');
    }

    /* Rena & Rika: hidden on init, revealed via codes.js */
    var rena = document.getElementById('renaChan');
    var rika = document.getElementById('rikaChan');
    if (rena) rena.style.display = 'none';
    if (rika) rika.style.display = 'none';
  });

})();