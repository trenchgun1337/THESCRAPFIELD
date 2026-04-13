/* ================================================================
   soundnew.js — The Watanagashi Archive
   Sons: entrada (1x por visita ao browser), click, hover
   API pública: window.SiteSound.setOn(bool) / .toggle() / .isOn()
   Compatibilidade: window.toggleSound(), window._soundsOn
   Botão: #soundToggle (qualquer página que tiver esse id)
   ================================================================ */

(function () {
  'use strict';

  /* ── Caminhos dos áudios ── */
  var BASE = 'assets/audio/';
  var S = {
    start:  BASE + 'sitestart.mp3',
    button: BASE + 'sitebuttonclick.mp3',
    hover:  BASE + 'text.mp3',
  };

  /* ── Estado ── */
  var _on = true;

  /* Restaura preferência da sessão */
  try {
    var _stored = sessionStorage.getItem('_soundsOn');
    if (_stored === 'false') _on = false;
  } catch (e) {}

  /* ── Cache de objetos Audio ── */
  var _cache = {};

  function _getAudio(src) {
    if (!_cache[src]) {
      var a = new Audio(src);
      a.preload = 'auto';
      _cache[src] = a;
    }
    return _cache[src];
  }

  /* ── Toca um som (ignora se desligado ou erro) ── */
  function _play(src) {
    if (!_on) return;
    try {
      var a = _getAudio(src);
      /* Reinicia caso já esteja tocando */
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function(){});
    } catch (e) {}
  }

  /* ── Som de entrada: 1x por sessão de BROWSER (sessionStorage) ── */
  function _playStart() {
    try {
      if (sessionStorage.getItem('_wa_started')) return;
      sessionStorage.setItem('_wa_started', '1');
    } catch (e) {}
    /* Aguarda interação do usuário caso autoplay bloqueado */
    function _tryPlay() {
      _play(S.start);
      document.removeEventListener('click',    _tryPlay, { once: true });
      document.removeEventListener('keydown',  _tryPlay, { once: true });
      document.removeEventListener('touchstart', _tryPlay, { once: true });
    }
    /* Tenta imediatamente; se falhar (autoplay policy), toca no primeiro input */
    try {
      var a = _getAudio(S.start);
      var p = a.play();
      if (p && p.catch) {
        p.catch(function () {
          document.addEventListener('click',     _tryPlay, { once: true });
          document.addEventListener('keydown',   _tryPlay, { once: true });
          document.addEventListener('touchstart', _tryPlay, { once: true });
        });
      }
    } catch (e) {
      document.addEventListener('click',     _tryPlay, { once: true });
      document.addEventListener('keydown',   _tryPlay, { once: true });
      document.addEventListener('touchstart', _tryPlay, { once: true });
    }
  }

  /* ── Delegação global: click em botões e links ── */
  function _initClickSound() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      /* Sobe até encontrar um <a> ou <button> clicável */
      while (t && t !== document.body) {
        if (
          (t.tagName === 'A'      && !t.getAttribute('style')?.includes('pointer-events:none')) ||
          (t.tagName === 'BUTTON' && t.id !== 'soundToggle' && !t.disabled)
        ) {
          _play(S.button);
          break;
        }
        t = t.parentElement;
      }
    }, true);
  }

  /* ── Delegação global: hover em links e botões ── */
  var _hoverTimer = null;
  function _initHoverSound() {
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      while (t && t !== document.body) {
        if (
          (t.tagName === 'A'      && !t.getAttribute('style')?.includes('pointer-events:none')) ||
          (t.tagName === 'BUTTON' && t.id !== 'soundToggle')
        ) {
          /* Throttle: não spamma se o mouse passar rápido por vários links */
          if (_hoverTimer) return;
          _hoverTimer = setTimeout(function(){ _hoverTimer = null; }, 120);
          _play(S.hover);
          break;
        }
        t = t.parentElement;
      }
    }, true);
  }

  /* ── Sincroniza o botão #soundToggle ── */
  function _syncBtn() {
    var btn = document.getElementById('soundToggle');
    if (!btn) return;
    btn.textContent = _on ? 'Sounds: On' : 'Sounds: Off';
    if (_on) { btn.classList.remove('off'); }
    else     { btn.classList.add('off');    }
  }

  /* ── Liga / desliga ── */
  function _setOn(val) {
    _on = !!val;
    try { sessionStorage.setItem('_soundsOn', String(_on)); } catch (e) {}
    /* Compatibilidade legado */
    window._soundsOn = _on;
    _syncBtn();
    /* Muta todos os media elements na página */
    document.querySelectorAll('audio, video').forEach(function (el) {
      el.muted = !_on;
    });
  }

  /* ── Botão #soundToggle ── */
  function _initBtn() {
    var btn = document.getElementById('soundToggle');
    if (!btn) return;
    _syncBtn();
    btn.onclick = function () {
      _setOn(!_on);
    };
  }

  /* ── API pública ── */
  window.SiteSound = {
    isOn:   function ()    { return _on; },
    setOn:  function (val) { _setOn(val); },
    toggle: function ()    { _setOn(!_on); },
    play:   function (key) { _play(S[key] || key); },
    /* Tocar áudio customizado de qualquer lugar: SiteSound.playUrl('assets/audio/foo.mp3') */
    playUrl: function (url) { _play(url); }
  };

  /* Compatibilidade com sounds.js legado */
  window.toggleSound = function () { _setOn(!_on); };
  window._soundsOn = _on;

  /* ── Init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      _syncBtn();
      _initBtn();
      _playStart();
      _initClickSound();
      _initHoverSound();
    });
  } else {
    _syncBtn();
    _initBtn();
    _playStart();
    _initClickSound();
    _initHoverSound();
  }

})();