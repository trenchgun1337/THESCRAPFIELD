/* ================================================================
   themes.js — Theme Switcher
   Themes: "darkaero" (default) | "legacy" (amber)
   Unlock via Ryuguu Code: themes / theme / skins / skin  (silent)
   ================================================================ */

(function () {
  'use strict';

  var THEMES = {
    darkaero: { name: 'Dark Aero', accent: '#cc1a1a' },
    legacy:   { name: 'Legacy',    accent: '#ffc820' }
  };

  var _current        = 'darkaero';
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

    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    if (name !== 'darkaero') {
      document.documentElement.setAttribute('data-theme', name);
      document.body.setAttribute('data-theme', name);
    }

    var bgMap = {
      darkaero: "url('assets/images/BACKGROUNDRENA.jpg') no-repeat center center fixed",
      legacy:   "url('assets/images/SITEBACKGROUND.png') no-repeat center center fixed"
    };
    document.body.style.background     = bgMap[name];
    document.body.style.backgroundSize = 'cover';

    updateThemesButton(name);
    try { localStorage.setItem('_scrapTheme', name); } catch(e) {}
  }

  /* ── Button color: dark-aero=grey, legacy=orange ── */
  function updateThemesButton(name) {
    var btn = document.getElementById('_themesBtn');
    if (!btn) return;
    btn.removeAttribute('style');
    if (name === 'darkaero') {
      btn.style.cssText = [
        'width:100%',
        'background:linear-gradient(to bottom,rgba(58,58,58,.94) 0%,rgba(28,28,28,.98) 50%,rgba(6,6,6,1) 50%,rgba(20,20,20,.96) 100%)',
        'border:1px solid rgba(180,180,180,.50)',
        'border-top:1px solid rgba(255,255,255,.18)',
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.12),rgba(0,0,0,.5) 0 2px 4px',
        'color:#d8d8d8',
        'font-size:11px',
        'font-family:Tahoma,sans-serif',
        'padding:5px 4px 7px',
        'cursor:pointer',
        'text-shadow:0 1px 2px rgba(0,0,0,.9)',
        'letter-spacing:.3px',
        'position:relative'
      ].join(';');
    } else {
      /* Legacy = orange button */
      btn.style.cssText = [
        'width:100%',
        'background:linear-gradient(to bottom,rgba(160,90,5,.94) 0%,rgba(100,55,2,.98) 50%,rgba(60,28,0,1) 50%,rgba(80,40,2,.96) 100%)',
        'border:1px solid rgba(220,140,20,.70)',
        'border-top:1px solid rgba(255,210,80,.28)',
        'box-shadow:inset 0 1px 0 rgba(255,220,80,.18),rgba(0,0,0,.5) 0 2px 4px',
        'color:#ffd060',
        'font-size:11px',
        'font-family:Tahoma,sans-serif',
        'padding:5px 4px 7px',
        'cursor:pointer',
        'text-shadow:0 1px 2px rgba(0,0,0,.9)',
        'letter-spacing:.3px',
        'position:relative'
      ].join(';');
    }
  }

  /* ── Build panel (fixed to right side, bottom-anchored) ── */
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
      'box-shadow:-4px -4px 20px rgba(0,0,0,.90)',
      'scrollbar-width:thin',
      'scrollbar-color:rgba(110,110,110,.4) rgba(0,0,0,.2)'
    ].join(';');

    var hdr = document.createElement('div');
    hdr.style.cssText = [
      'background:linear-gradient(to bottom,rgba(46,46,46,.97) 0%,rgba(20,20,20,.98) 50%,rgba(4,4,4,1) 50%,rgba(14,14,14,.99) 100%)',
      'color:#c8c8c8',
      'font-size:11px',
      'text-align:center',
      'padding:5px 8px 7px',
      'border-bottom:1px solid rgba(110,110,110,.18)',
      'letter-spacing:.5px',
      'text-transform:uppercase',
      'position:sticky',
      'top:0',
      'z-index:1',
      'text-shadow:0 1px 2px rgba(0,0,0,.9)'
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

      var nameEl = document.createElement('span');
      nameEl.style.cssText = [
        'font-size:12px',
        'display:block',
        'font-family:Tahoma,sans-serif',
        'letter-spacing:.3px',
        'color:' + (key === _current ? th.accent : '#888')
      ].join(';');
      nameEl.textContent = th.name + (key === _current ? ' \u2713' : '');
      btn.appendChild(nameEl);

      btn.addEventListener('click', function () {
        applyTheme(key);
        panel.remove();
        setTimeout(buildPanel, 40);
      });
      panel.appendChild(btn);
    });

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

  document.addEventListener('DOMContentLoaded', function () {
    var saved = null;
    try { saved = localStorage.getItem('_scrapTheme'); } catch(e) {}

    if (saved === 'legacy') {
      _themesUnlocked = true;
      var wrap = document.getElementById('_themesBtnWrap');
      if (wrap) wrap.style.display = 'block';
      applyTheme('legacy');
    } else {
      applyTheme('darkaero');
    }

    /* Always hide Rena & Rika on load — themes.js manages initial state */
    var rena = document.getElementById('renaChan');
    var rika = document.getElementById('rikaChan');
    if (rena) rena.style.display = 'none';
    if (rika) rika.style.display = 'none';
  });
})();
