/* ================================================================
   WATANAGASHI ARCHIVE — sounds.js
   Sistema de sons compartilhado por todas as páginas.
   Inclua este script ANTES do fechamento do </body>.
   ================================================================ */
(function () {
  'use strict';
  var BASE = 'assets/audio/';
  var S = {
    start:   BASE + 'sitestart.mp3',
    alert:   BASE + 'sitealert.mp3',
    button:  BASE + 'sitebuttonclick.mp3',
    hover:   BASE + 'text.mp3',
    like:    BASE + 'sitelikeclick.mp3',
    dislike: BASE + 'sitedislikeclick.mp3',
    sort:    BASE + 'sitesortclick.mp3',
  };
  var on = localStorage.getItem('_wa_sounds') !== 'off';
  var cache = {};

  function ga(k) {
    if (!cache[k]) { var a = new Audio(S[k]); a.preload = 'auto'; cache[k] = a; }
    return cache[k];
  }

  window.playSound = function (k) {
    if (!on || !S[k]) return;
    try { var c = ga(k).cloneNode(); c.volume = k === 'hover' ? 0.30 : 0.52; c.play().catch(function () {}); } catch (e) {}
  };

  window.toggleSound = function () {
    on = !on;
    localStorage.setItem('_wa_sounds', on ? 'on' : 'off');
    document.querySelectorAll('.wa-sound-toggle').forEach(function (b) {
      b.textContent = on ? 'Sounds: On' : 'Sounds: Off';
      b.classList.toggle('off', !on);
    });
    if (on) window.playSound('button');
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.wa-sound-toggle').forEach(function (b) {
      if (!on) { b.textContent = 'Sounds: Off'; b.classList.add('off'); }
    });
    if (!sessionStorage.getItem('_wa_sp')) {
      sessionStorage.setItem('_wa_sp', '1');
      setTimeout(function () { window.playSound('start'); }, 700);
    }
  });

  /* Preload on first interaction */
  document.addEventListener('pointerdown', function () {
    Object.keys(S).forEach(function (k) { ga(k); });
  }, { once: true, passive: true });

  /* Hover sounds (throttled 400ms) */
  var _ht = 0, _htm = null;
  function _ii(el) {
    if (!el || el === document.body) return false;
    var t = el.tagName;
    if (t === 'BUTTON' || t === 'A') return true;
    try { if (window.getComputedStyle(el).cursor === 'pointer') return true; } catch (e) {}
    return false;
  }
  document.addEventListener('mouseover', function (e) {
    if (e.target.classList && e.target.classList.contains('wa-sound-toggle')) return;
    if (!_ii(e.target)) return;
    clearTimeout(_htm);
    _htm = setTimeout(function () {
      var n = Date.now();
      if (n - _ht < 400) return;
      _ht = n; window.playSound('hover');
    }, 400);
  }, { passive: true });
  document.addEventListener('mouseout', function (e) {
    if (_ii(e.target)) clearTimeout(_htm);
  }, { passive: true });
  document.addEventListener('click', function (e) {
    if (e.target.classList && e.target.classList.contains('wa-sound-toggle')) return;
    if (_ii(e.target)) window.playSound('button');
  }, true);
})();