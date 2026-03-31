/* ================================================================
   themes.js — Theme Switcher  v4
   Themes:
     "next-stage"  (default)  — compact aero chrome bar, site layout
     "rika-menu"              — original sidebar, dark aero
     "legacy"                 — amber/warm palette, sidebar

   ── Themes button NEVER appears as a persistent button ──
   The Ryuguu code opens the panel directly.

   ── Emergency reset ──
   window._resetTheme() in the browser console resets to next-stage.
   ================================================================ */

(function () {
  'use strict';

  var THEMES = {
    'next-stage': { name: 'Next Stage', desc: 'horizontal nav — site layout' },
    'rika-menu':  { name: 'Rika Menu',  desc: 'sidebar menu — classic'       },
    'legacy':     { name: 'Legacy',     desc: 'amber palette — warm'          }
  };

  var _current = 'next-stage';

  /* ── Apply theme ── */
  function applyTheme(name) {
    if (!THEMES[name]) name = 'next-stage';
    _current = name;

    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');

    if (name !== 'rika-menu') {
      document.documentElement.setAttribute('data-theme', name);
      document.body.setAttribute('data-theme', name);
    }

    /* Background override — legacy only */
    if (name === 'legacy') {
      document.body.style.backgroundImage = "url('assets/images/SITEBACKGROUND.png')";
    } else {
      document.body.style.backgroundImage = '';
    }

    try { localStorage.setItem('_watTheme', name); } catch(e) {}
  }

  /* ── Build picker panel ── */
  function buildPanel() {
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
      'min-width:164px',
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
      var isActive = (key === _current);
      var btn = document.createElement('button');
      btn.style.cssText = [
        'display:block',
        'width:100%',
        'background:none',
        'border:none',
        'padding:10px 16px 9px',
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
        'color:' + (isActive ? '#f2f2f2' : '#888')
      ].join(';');
      nameEl.textContent = th.name + (isActive ? ' \u2713' : '');
      btn.appendChild(nameEl);

      var descEl = document.createElement('span');
      descEl.style.cssText = 'font-size:10px;color:#444;font-family:Tahoma,sans-serif;display:block;margin-top:1px;';
      descEl.textContent = th.desc;
      btn.appendChild(descEl);

      btn.addEventListener('click', function () {
        applyTheme(key);
        panel.remove();
        /* Re-open so checkmark updates */
        setTimeout(buildPanel, 40);
      });
      panel.appendChild(btn);
    });

    /* Close */
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

    /* Click outside to close */
    setTimeout(function () {
      document.addEventListener('click', function outsideClose(e) {
        var p = document.getElementById('_themePanel');
        if (!p) { document.removeEventListener('click', outsideClose); return; }
        if (!p.contains(e.target)) {
          p.remove();
          document.removeEventListener('click', outsideClose);
        }
      });
    }, 80);
  }

  /* ── Public API ── */

  /* Called by Ryuguu code — opens the panel directly, no persistent button */
  window._unlockThemes = function () {
    buildPanel();
  };

  /* Emergency reset — type _resetTheme() in the browser console */
  window._resetTheme = function () {
    try { localStorage.removeItem('_watTheme'); } catch(e) {}
    applyTheme('next-stage');
    console.info('[Watanagashi] Theme reset to Next Stage.');
  };

  /* Called by HTML onclick on the themes button (still wired in HTML,
     but the button is always hidden — this is just a safety fallback) */
  window._themesPanelToggle = function (e) {
    if (e) e.stopPropagation();
    buildPanel();
  };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    /* Load saved theme — NO migration from old _scrapTheme key.
       Anyone without a valid _watTheme gets next-stage (the new default).
       Invalid/unknown saves also fall through to next-stage. */
    var saved = null;
    try { saved = localStorage.getItem('_watTheme'); } catch(e) {}

    if (saved && THEMES[saved]) {
      applyTheme(saved);
    } else {
      /* No valid save → force next-stage and persist it */
      applyTheme('next-stage');
    }

    /* Always hide _themesBtnWrap — it's never a persistent button */
    var wrap = document.getElementById('_themesBtnWrap');
    if (wrap) wrap.style.display = 'none';

    /* Hide Rena & Rika on init — revealed by codes.js */
    var rena = document.getElementById('renaChan');
    var rika = document.getElementById('rikaChan');
    if (rena) rena.style.display = 'none';
    if (rika) rika.style.display = 'none';
  });

})();