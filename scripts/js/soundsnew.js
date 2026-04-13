/* ================================================================
   soundnew.js — The Watanagashi Archive
   Sons: entrada (1x por sessão browser), click, hover
   API: window.SiteSound.setOn(bool) / .toggle() / .isOn() / .play(key) / .playUrl(url)
   Compatibilidade legado: window.toggleSound(), window._soundsOn
   Botão: #soundToggle — funciona em qualquer página
   ================================================================ */

(function () {
  'use strict';

  /* ── Path base dos áudios (sempre relativo à raiz do site) ──
     Detecta se está numa subpasta (pages/) e ajusta o prefixo.       */
  var _depth = window.location.pathname.split('/').filter(Boolean).length;
  var _isSubpage = document.currentScript
    ? document.currentScript.src.indexOf('/pages/') !== -1
    : _depth > 1;
  var BASE = _isSubpage ? '../assets/audio/' : 'assets/audio/';

  var S = {
    start:  BASE + 'sitestart.mp3',
    button: BASE + 'sitebuttonclick.mp3',
    hover:  BASE + 'text.mp3',
  };

  /* ── Estado ── */
  var _on = true;
  try {
    if (sessionStorage.getItem('_soundsOn') === 'false') _on = false;
  } catch (e) {}

  /* ── Cache Audio ── */
  var _cache = {};
  function _getAudio(src) {
    if (!_cache[src]) {
      var a = new Audio(src);
      a.preload = 'auto';
      _cache[src] = a;
    }
    return _cache[src];
  }

  /* ── Toca som ── */
  function _play(src) {
    if (!_on) return;
    try {
      var a = _getAudio(src);
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  /* ── Som de entrada: 1x por sessão de browser ──
     Se sair do site e voltar = nova sessão = toca de novo.
     Navegar entre páginas internas = mesma sessão = não repete.      */
  function _playStart() {
    try {
      if (sessionStorage.getItem('_wa_started')) return;
      sessionStorage.setItem('_wa_started', '1');
    } catch (e) {}

    /* Tenta autoplay; se bloqueado, espera primeiro input do usuário */
    var _played = false;
    function _tryPlay() {
      if (_played) return;
      _played = true;
      _play(S.start);
    }

    try {
      var a = _getAudio(S.start);
      var p = a.play();
      if (p && p.catch) {
        p.then(function () { _played = true; })
         .catch(function () {
           /* Autoplay bloqueado — aguarda primeiro gesto */
           document.addEventListener('click',      _tryPlay, { once: true, capture: true });
           document.addEventListener('keydown',    _tryPlay, { once: true, capture: true });
           document.addEventListener('touchstart', _tryPlay, { once: true, capture: true });
         });
      } else {
        _played = true;
      }
    } catch (e) {
      document.addEventListener('click',      _tryPlay, { once: true, capture: true });
      document.addEventListener('keydown',    _tryPlay, { once: true, capture: true });
      document.addEventListener('touchstart', _tryPlay, { once: true, capture: true });
    }
  }

  /* ── Delegação global: click em <a> e <button> ── */
  function _initClickSound() {
    document.addEventListener('click', function (e) {
      if (!_on) return;
      var t = e.target;
      while (t && t !== document.body) {
        var tag = t.tagName;
        var sty = t.getAttribute('style') || '';
        if (tag === 'BUTTON' && t.id !== 'soundToggle' && !t.disabled) {
          _play(S.button); break;
        }
        if (tag === 'A' && sty.indexOf('pointer-events:none') === -1 && sty.indexOf('pointer-events: none') === -1) {
          _play(S.button); break;
        }
        t = t.parentElement;
      }
    }, true);
  }

  /* ── Delegação global: hover em <a> e <button> ── */
  var _hoverCooldown = false;
  function _initHoverSound() {
    document.addEventListener('mouseover', function (e) {
      if (!_on || _hoverCooldown) return;
      var t = e.target;
      while (t && t !== document.body) {
        var tag = t.tagName;
        var sty = t.getAttribute('style') || '';
        if (tag === 'BUTTON' && t.id !== 'soundToggle') {
          _hoverCooldown = true;
          setTimeout(function () { _hoverCooldown = false; }, 120);
          _play(S.hover); break;
        }
        if (tag === 'A' && sty.indexOf('pointer-events:none') === -1 && sty.indexOf('pointer-events: none') === -1) {
          _hoverCooldown = true;
          setTimeout(function () { _hoverCooldown = false; }, 120);
          _play(S.hover); break;
        }
        t = t.parentElement;
      }
    }, true);
  }

  /* ── Sincroniza visual do botão ── */
  function _syncBtn() {
    var btn = document.getElementById('soundToggle');
    if (!btn) return;
    btn.textContent = _on ? 'Sounds: On' : 'Sounds: Off';
    btn.classList.toggle('off', !_on);
  }

  /* ── Liga / desliga ── */
  function _setOn(val) {
    _on = !!val;
    try { sessionStorage.setItem('_soundsOn', String(_on)); } catch (e) {}
    window._soundsOn = _on;
    _syncBtn();
    document.querySelectorAll('audio, video').forEach(function (el) {
      el.muted = !_on;
    });
  }

  /* ── Vincula botão #soundToggle ──
     Tenta imediatamente E re-tenta após DOMContentLoaded,
     garantindo que funcione mesmo se o botão vier depois do script.   */
  function _bindBtn() {
    var btn = document.getElementById('soundToggle');
    if (!btn || btn._sndBound) return;
    btn._sndBound = true;
    _syncBtn();
    btn.onclick = function (e) {
      e.stopPropagation(); /* Não dispara o click-sound no próprio toggle */
      _setOn(!_on);
    };
  }

  /* ── API pública ── */
  window.SiteSound = {
    isOn:    function ()    { return _on; },
    setOn:   function (val) { _setOn(val); },
    toggle:  function ()    { _setOn(!_on); },
    play:    function (key) { _play(S[key] || key); },
    playUrl: function (url) { _play(url); },
  };

  /* Compatibilidade legado */
  window.toggleSound  = function () { _setOn(!_on); };
  window._soundsOn    = _on;

  /* ── Init ── */
  function _init() {
    _bindBtn();
    _playStart();
    _initClickSound();
    _initHoverSound();
  }

  /* Roda assim que possível, e garante re-bind do botão após DOM completo */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      _init();
      /* Re-tenta bind caso botão tenha sido inserido depois */
      setTimeout(_bindBtn, 300);
    });
  } else {
    _init();
    setTimeout(_bindBtn, 0);
  }

})();