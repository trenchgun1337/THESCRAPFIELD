/* ================================================================
   sounds.js — Site Sound Effects System
   ================================================================ */

(function () {
  'use strict';

  const SOUND_BASE = 'assets/audio/';

  const SOUNDS = {
    start:   SOUND_BASE + 'sitestart.mp3',
    alert:   SOUND_BASE + 'sitealert.mp3',
    dislike: SOUND_BASE + 'sitedislikeclick.mp3',
    like:    SOUND_BASE + 'sitelikeclick.mp3',
    sort:    SOUND_BASE + 'sitesortclick.mp3',
    button:  SOUND_BASE + 'sitebuttonclick.mp3',
    hover:   SOUND_BASE + 'text.mp3',
  };

  let _soundsOn = true;
  const _cache  = {};

  function _loadPref() {
    try {
      const s = JSON.parse(localStorage.getItem('_scrapPrefs') || '{}');
      _soundsOn = s.soundsOn !== false;
    } catch(e) { _soundsOn = true; }
  }

  function _savePref(val) {
    try {
      const s = JSON.parse(localStorage.getItem('_scrapPrefs') || '{}');
      s.soundsOn = val;
      localStorage.setItem('_scrapPrefs', JSON.stringify(s));
    } catch(e) {}
  }

  function _getAudio(key) {
    if (!_cache[key]) {
      const a = new Audio(SOUNDS[key]);
      a.preload = 'auto';
      _cache[key] = a;
    }
    return _cache[key];
  }

  function _play(key) {
    if (!_soundsOn) return;
    try {
      const a = _getAudio(key);
      const clone = a.cloneNode();
      clone.volume = key === 'hover' ? 0.30 : 0.52;
      clone.play().catch(() => {});
    } catch(e) {}
  }

  window.SiteSound = {
    play:   _play,
    isOn:   () => _soundsOn,
    setOn:  function(val) {
      _soundsOn = !!val;
      _savePref(_soundsOn);
      _updateNavBtn();
    },
    toggle: function() { this.setOn(!_soundsOn); },
    preload: function() { Object.keys(SOUNDS).forEach(k => _getAudio(k)); }
  };

  function _updateNavBtn() {
    const btn = document.getElementById('navSoundToggle');
    if (!btn) return;
    btn.textContent = _soundsOn ? 'Sounds: On' : 'Sounds: Off';
  }

  function _createNavBtn() {
    const nav = document.getElementById('navigationMenu');
    if (!nav) return;

    /* Se o botão já existe no HTML estático, só sincroniza label e adiciona listener */
    const existing = document.getElementById('navSoundToggle');
    if (existing) {
      existing.textContent = _soundsOn ? 'Sounds: On' : 'Sounds: Off';
      if (!existing._soundWired) {
        existing._soundWired = true;
        existing.addEventListener('click', () => window.SiteSound.toggle());
      }
      return;
    }

    /* Cria dinamicamente caso não exista no HTML */
    const wrap = document.createElement('div');
    wrap.id = '_navSoundWrap';
    wrap.style.cssText = 'padding:4px 5px 2px; margin-top:4px;';

    const btn = document.createElement('button');
    btn.id = 'navSoundToggle';
    btn._soundWired = true;
    btn.textContent = _soundsOn ? 'Sounds: On' : 'Sounds: Off';
    btn.addEventListener('click', () => window.SiteSound.toggle());

    wrap.appendChild(btn);

    const themeWrap = document.getElementById('_themesBtnWrap');
    if (themeWrap) {
      nav.insertBefore(wrap, themeWrap);
    } else {
      nav.appendChild(wrap);
    }
  }

  /* ── Hover throttle: max 1 per 90ms ── */
  let _hoverThrottle = 0;

  function _isInteractive(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'SELECT') return true;
    if (tag === 'INPUT' && el.type !== 'range') return true;
    const cl = el.classList;
    if (cl && (
      cl.contains('nav-link') ||
      cl.contains('gi-star-interactive') ||
      cl.contains('vg-entry') ||
      cl.contains('gi-card-imgwrap') ||
      cl.contains('mp-ctrl-btn') ||
      cl.contains('vg-pager-btn') ||
      cl.contains('comm-tab') ||
      cl.contains('vi-icon-vote-btn') ||
      cl.contains('mp-download-btn') ||
      cl.contains('vi-url-full') ||
      cl.contains('gi-lb-arrow') ||
      cl.contains('gi-lb-close')
    )) return true;
    const cs = window.getComputedStyle(el);
    if (cs && cs.cursor === 'pointer') return true;
    return false;
  }

  function _onHover(e) {
    if (!_soundsOn) return;
    const now = Date.now();
    if (now - _hoverThrottle < 90) return;
    if (_isInteractive(e.target)) {
      _hoverThrottle = now;
      _play('hover');
    }
  }

  function _onClick(e) {
    if (!_soundsOn) return;
    const el = e.target;

    if (el.closest) {
      if (el.closest('#mpLikeBtn') || el.closest('#vUpvoteBtn'))   { _play('like');   return; }
      if (el.closest('#mpDislikeBtn') || el.closest('#vDownvoteBtn')) { _play('dislike'); return; }
      if (
        el.closest('#vPopSortToggle') || el.closest('#mpPopSortToggle') ||
        el.closest('#galPlusBtn')     || el.closest('#vPlusBtn') ||
        el.closest('#mpPlusBtn')      || el.closest('#vSortSubmenu') ||
        el.closest('#mpSortSubmenu')  || el.closest('#galSortItems') ||
        el.closest('#galPlusPopup')
      ) { _play('sort'); return; }
    }

    if (_isInteractive(el)) _play('button');
  }

  /* ── Patch _showExternalLinkWarn to play alert ── */
  function _patchAlert() {
    if (typeof window._showExternalLinkWarn !== 'function') return;
    if (window._showExternalLinkWarn._sp) return;
    const _orig = window._showExternalLinkWarn;
    window._showExternalLinkWarn = function(url) {
      _play('alert');
      _orig(url);
    };
    window._showExternalLinkWarn._sp = true;
  }

  function _init() {
    _loadPref();
    _createNavBtn();
    _patchAlert();

    document.addEventListener('mouseover', _onHover, { passive: true });
    document.addEventListener('click', _onClick, true);

    /* Start sound — once per session */
    if (!sessionStorage.getItem('_siteStartPlayed')) {
      sessionStorage.setItem('_siteStartPlayed', '1');
      setTimeout(() => _play('start'), 700);
    }

    /* Preload on first interaction */
    document.addEventListener('pointerdown', () => window.SiteSound.preload(), { once: true, passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  window.addEventListener('load', _patchAlert);

})();
