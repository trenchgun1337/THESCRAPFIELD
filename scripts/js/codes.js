/* ================================================================
   codes.js — Rena Chan / Rika Chan interactions
   ================================================================ */
(function () {
  var BASE = 'assets/images/';

  ['renaidle1.png','renaidle2.png','renaidle1fixed.png','renaidle2fixed.png',
   'renadance.png','renadance2.png','renasad.png',
   'rikaidle.png','rikanipah.png','renatransformation.png']
    .forEach(function (n) { var i = new Image(); i.src = BASE + n; });

  window._rikaMode = false;

  var state        = 0;
  var locked       = false;
  var blinkInt     = null;
  var inFixed      = false;

  var holdTimer    = null;
  var holdActive   = false;
  var _justHeld    = false;

  var spamCount    = 0;
  var spamTimer    = null;
  var spamActive   = false;
  var SPAM_LIMIT   = 6;
  var SPAM_WINDOW  = 1200;

  var videoActive   = false;
  var musicPlaying  = false;
  var videosPlaying = false;

  var danceInt       = null;
  var danceDelay     = null;
  var danceFrame     = false;
  var danceSquishUp  = true;

  var _currentTrackTitle = '';

  var rena = document.getElementById('renaChan');

  /* Create Rika element — display:none by default */
  var rika = document.createElement('div');
  rika.id = 'rikaChan';
  rika.style.cssText = [
    'position:fixed','bottom:0','right:0',
    'width:250px','height:350px',
    'background-image:url(\'' + BASE + 'rikaidle.png\')',
    'background-size:contain','background-repeat:no-repeat','background-position:bottom right',
    'z-index:9999','cursor:pointer','display:none'
  ].join(';');
  document.body.appendChild(rika);

  /* Rika right-click does NOTHING */
  rika.addEventListener('contextmenu', function(e) { e.preventDefault(); e.stopPropagation(); return false; });

  function activeEl() { return window._rikaMode ? rika : rena; }

  var NIPAH_URL          = BASE + 'nipah.mp3';
  var RIKA_TRANSFORM_SND = BASE + 'rikatransformationsound.mp3';

  function normalizeStr(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  }

  /* ── Code map ── */
  var CODE_MAP = [
    { keys: ['mitski'],                                    special: 'mitski' },
    { keys: ['rika'],                                      special: 'rika'   },
    { keys: ['themes','theme','skins','skin'],             special: 'themes' },

    { keys: ['awesome'],                                   embed: 'Tbu_7WtAjU8' },
    { keys: ['peanut butter jelly time','peanut butter','jelly time'], embed: 'eRBOgtp0Hac' },
    { keys: ['creu','creucat'],                            embed: 'gUMaaa3AymE' },
    { keys: ['facebook'],                                  embed: 'v9PgkZET65I' },
    { keys: ['sorriso ronaldo'],                           embed: 'wko2BMFyVF8' },
    { keys: ['feijao com farinha'],                        embed: 'fTsjwIoDXT0' },
    { keys: ['brasil','jeitinho brasileiro','br','huehue',
              'memes brasil','memes brasileiros','memes br'],
      playlist: 'PL-LwtYLXkTh1FtSNFuxPZ2ubOcVxgtJV7' },
    { keys: ['mc gorilla','cheio de sal','chei de sal','chei di sal'], embed: 'N4Q4j1oSdUU' },
    { keys: ['tuts','tuts tuts','tuts tuts tuts','tuts quero ver','quero ver',
              'tuts tuts quero ver','tuts tuts tuts quero','tuts edy lemond ver'], embed: '3rNs-3qZhH4' },
    { keys: ['madagascar edy lemond'],                     embed: 'b3m9G4gADPQ' },
    { keys: ['abner','abner donate'],                      embed: 'BsXKRwWsOnc' },
    { keys: ['nao me chupa','chupa'],                      embed: '6gcjLAYMQ28' },
    { keys: ['todos os paus','todos os pals','pal','pals',
              'dave jones pal','davy jones pau',
              'quero todos os pal','quero todos os paus'],  embed: 'OI5N7JO8GnE' },
    { keys: ['monster com leite','8 gramas de proteina','oito gramas de proteina',
              'davy jones monster','no finalzinho'],         embed: 'f5pCVs10uZs' },
    { keys: ['davy jones gemendo','davy','davy jones'],     embed: '1ExVwzULhLo' },
    { keys: ['volibear','volibear morrendo'],               embed: 'LPIRR18Fhp4' },
    { keys: ['dark souls','mr dark souls','jean dark souls'], embed: 'QkAd7Ms3oWs' },
    { keys: ['daniel paladino','edron'],                    embed: '8jmKSFBW3zY' }
  ];

  function entryToEmbedUrl(entry) {
    if (entry.playlist)
      return 'https://www.youtube.com/embed/videoseries?list=' + entry.playlist + '&autoplay=1&rel=0';
    return 'https://www.youtube.com/embed/' + entry.embed + '?autoplay=1&rel=0';
  }

  function findCode(raw) {
    var val = normalizeStr(raw);
    for (var i = 0; i < CODE_MAP.length; i++) {
      var entry = CODE_MAP[i];
      for (var j = 0; j < entry.keys.length; j++) {
        if (normalizeStr(entry.keys[j]) === val) return entry;
      }
    }
    return null;
  }

  /* ── Helpers ── */
  function stopBlink() { if (blinkInt) { clearInterval(blinkInt); blinkInt = null; } }
  function setImgOn(el, name) { if (el) el.style.backgroundImage = "url('" + BASE + name + "')"; }
  function playAudio(src, onEnd, vol) {
    var sfx = new Audio(src.indexOf('http') === 0 ? src : BASE + src);
    if (vol !== undefined) sfx.volume = vol;
    if (onEnd) sfx.addEventListener('ended', onEnd);
    sfx.play().catch(function () {});
    return sfx;
  }

  /* ── isBlocked: no interaction during music or video ── */
  function isBlocked() { return inFixed || videoActive || musicPlaying || videosPlaying; }

  function updateBlockedState() {
    var el = activeEl();
    if (!el) return;
    var blocked = musicPlaying || videosPlaying;
    el.style.pointerEvents = blocked ? 'none' : '';
    el.style.cursor = blocked ? 'default' : (locked || inFixed ? 'default' : 'pointer');
    el.style.filter = 'none';
    if (!blocked && !locked && !inFixed) el.title = window._rikaMode ? 'Click for Nipah!' : 'Right-click for Ryuguu Codes!';
  }

  function resetToIdle() {
    stopBlink(); stopDance();
    if (danceDelay) { clearTimeout(danceDelay); danceDelay = null; }
    locked = false; holdActive = false; inFixed = false; state = 0;
    setIdleImg();
    var el = activeEl();
    if (el && !musicPlaying && !videosPlaying) {
      el.style.pointerEvents = '';
      el.style.cursor = 'pointer';
      el.style.transform = 'scaleX(1) scaleY(1)';
      el.style.filter = 'none';
      el.title = window._rikaMode ? 'Click for Nipah!' : 'Right-click for Ryuguu Codes!';
    }
  }

  function setIdleImg()      { window._rikaMode ? setImgOn(rika,'rikaidle.png')       : setImgOn(rena,'renaidle1.png'); }
  function setIdleImg2()     { window._rikaMode ? setImgOn(rika,'rikanipah.png')       : setImgOn(rena,'renaidle2.png'); }
  function setIdleImgFixed() { window._rikaMode ? setImgOn(rika,'rikaidle.png')        : setImgOn(rena,'renaidle1fixed.png'); }
  function setIdleImg2Fixed(){ window._rikaMode ? setImgOn(rika,'rikanipah.png')       : setImgOn(rena,'renaidle2fixed.png'); }

  /* ── Transformation: renatransformation.png → stepped fade → renafades.mp3 → rika fadein ── */
  function activateRika() {
    if (!rena) return;

    /* Step 1: swap to transformation sprite immediately */
    rena.style.transition = 'none';
    rena.style.opacity = '1';
    rena.style.backgroundImage = "url('assets/images/renatransformation.png')";

    /* Step 2: stepped (non-smooth/stepped) fade out in ~12 steps over ~1.6 seconds */
    const STEPS = 12;
    const STEP_DURATION = 130; /* ms per step */
    let step = 0;

    /* Start renafades.mp3 after a short delay (mid-fade) */
    var fadeAudio = null;
    var audioStarted = false;

    var fadeInterval = setInterval(function() {
      step++;
      /* Stepped opacity - no CSS transition, just jump */
      rena.style.transition = 'none';
      rena.style.opacity = String(Math.max(0, 1 - step / STEPS));

      /* Start audio at step 5 (mid-fade) */
      if (step >= 5 && !audioStarted) {
        audioStarted = true;
        fadeAudio = new Audio('assets/audio/renafades.mp3');
        fadeAudio.volume = 0.85;
        fadeAudio.play().catch(function(){});
      }

      if (step >= STEPS) {
        clearInterval(fadeInterval);
        rena.style.opacity = '0';
        rena.style.display = 'none';
        rena.style.opacity = '';
        rena.style.transition = '';

        window._rikaMode = true;
        var prefHide = (typeof PREFS !== 'undefined' && PREFS.alwaysHideRena);
        if (!prefHide) {
          /* Fade in Rika in steps */
          rika.style.transition = 'none';
          rika.style.opacity = '0';
          rika.style.backgroundImage = "url('assets/images/rikaidle.png')";
          rika.style.display = '';

          var rikaStep = 0, RIKA_STEPS = 8;
          var rikaIn = setInterval(function() {
            rikaStep++;
            rika.style.opacity = String(Math.min(1, rikaStep / RIKA_STEPS));
            if (rikaStep >= RIKA_STEPS) {
              clearInterval(rikaIn);
              rika.style.opacity = '1';
              rika.style.transition = '';
            }
          }, 80);
        }

        locked = false; holdActive = false; inFixed = false; state = 0;
        rika.style.pointerEvents = '';
        rika.style.cursor = 'pointer';
        rika.style.transform = 'scaleX(1) scaleY(1)';
        rika.style.filter = 'none';
        rika.title = 'Click for Nipah!';
        _addRikaPref();
        var hideBtn = document.getElementById('_hideRenaBtn');
        if (hideBtn) hideBtn.textContent = 'Hide Rika';
      }
    }, STEP_DURATION);
  }

  function _addRikaPref() {
    /* Rebuild preferences page to show Rika/Rena toggle */
    if (typeof buildPreferencesUI === 'function') buildPreferencesUI();
  }

  /* ── Themes unlock ── */
  function triggerThemesUnlock() {
    try {
      var s = JSON.parse(localStorage.getItem('_scrapPrefs') || '{}');
      s.themesUnlocked = true;
      localStorage.setItem('_scrapPrefs', JSON.stringify(s));
    } catch(e) {}
    if (typeof window._unlockThemes === 'function') window._unlockThemes();
  }

  /* ── Gabberzon detection ── */
  function _isGabberzon() {
    return _currentTrackTitle.toLowerCase().indexOf('gabberzon') !== -1;
  }

  /* ── Dance (only for Gabberzon) ── */
  function startDance() {
    if (danceInt || window._rikaMode || !_isGabberzon()) return;
    stopBlink(); danceFrame = false; danceSquishUp = true;
    danceInt = setInterval(function () {
      danceFrame = !danceFrame;
      setImgOn(rena, danceFrame ? 'renadance2.png' : 'renadance.png');
      rena.style.transition = 'transform 0.18s ease'; rena.style.transformOrigin = 'bottom right';
      var sy = danceSquishUp ? 0.88 : 1.04, sx = danceSquishUp ? 1.06 : 0.96;
      danceSquishUp = !danceSquishUp;
      rena.style.transform = 'scaleX('+sx+') scaleY('+sy+')';
    }, 220);
    rena.style.cursor = 'default'; rena.style.filter = 'none';
    updateBlockedState();
  }

  function stopDance() {
    if (danceInt) { clearInterval(danceInt); danceInt = null; }
    var el = activeEl();
    if (el) { el.style.transition = 'none'; el.style.transform = 'scaleX(1) scaleY(1)'; }
  }

  window.renaOnTrackChange = function (trackTitle) {
    _currentTrackTitle = trackTitle || '';
    if (danceDelay) { clearTimeout(danceDelay); danceDelay = null; }
    stopDance();
    if (musicPlaying && _isGabberzon() && !window._rikaMode) {
      danceDelay = setTimeout(function () {
        if (musicPlaying && !window._rikaMode && _isGabberzon()) startDance();
      }, 7000);
    } else if (musicPlaying && !window._rikaMode) {
      setIdleImg();
    }
  };
  window.rikaOnTrackChange = window.renaOnTrackChange;

  window.renaSetMusicPlaying = function (playing) {
    musicPlaying = playing;
    if (playing) {
      closeCodeVideo(); closeCodes(); locked = false;
      if (_isGabberzon() && !window._rikaMode) {
        if (danceDelay) clearTimeout(danceDelay);
        danceDelay = setTimeout(function () {
          if (musicPlaying && !window._rikaMode && _isGabberzon()) startDance();
        }, 7000);
      } else if (!window._rikaMode) {
        setIdleImg();
      }
    } else {
      if (danceDelay) { clearTimeout(danceDelay); danceDelay = null; }
      stopDance(); resetToIdle();
    }
    updateBlockedState();
  };
  window.rikaSetMusicPlaying = window.renaSetMusicPlaying;

  window.renaSetVideosPlaying = function (playing) {
    videosPlaying = playing;
    var el = activeEl(); if (el) el.style.filter = 'none';
    updateBlockedState();
  };
  window.rikaSetVideosPlaying = window.renaSetVideosPlaying;

  /* ── Mitski ── */
  function triggerMitski() {
    closeCodeVideo(); stopDance(); stopBlink();
    locked = true; inFixed = false; state = 0;
    setIdleImg();
    var el = activeEl();
    if (el) { el.style.pointerEvents = 'none'; el.style.cursor = 'default'; el.title = ''; }
    playAudio('renavoicemitski.wav', function() {
      locked = false;
      var e2 = activeEl();
      if (e2 && !musicPlaying && !videosPlaying) {
        e2.style.pointerEvents = '';
        e2.style.cursor = 'pointer';
        e2.title = window._rikaMode ? 'Click for Nipah!' : 'Right-click for Ryuguu Codes!';
      }
      updateBlockedState();
    });
  }

  /* ── Spam ── */
  function enterSpam() {
    if (!spamActive) {
      spamActive = true; locked = true; stopBlink(); setIdleImg2Fixed();
      var el = activeEl(); if (el) el.style.cursor = 'default';
    }
    window._rikaMode ? playAudio(NIPAH_URL,null,0.6) : playAudio('renavoice4.wav',null,0.4);
  }
  function exitSpam() {
    if (!spamActive) return;
    spamActive = false; spamCount = 0;
    if (spamTimer) { clearTimeout(spamTimer); spamTimer = null; }
    state = 0; resetToIdle();
  }
  function tickSpam() {
    spamCount++;
    if (spamTimer) clearTimeout(spamTimer);
    if (spamCount >= SPAM_LIMIT || spamActive) { enterSpam(); spamTimer = setTimeout(exitSpam, 1500); return true; }
    spamTimer = setTimeout(function () { spamCount = 0; }, SPAM_WINDOW);
    return false;
  }

  /* ── Stage 3 ── */
  function stage3() {
    locked = true; inFixed = true;
    var el = activeEl(); if (el) { el.style.cursor = 'default'; el.style.filter = 'none'; } updateBlockedState();
    if (window._rikaMode) {
      var times = Math.random() < 0.5 ? 3 : 4, count = 0;
      function doNipah() {
        if (count >= times) { resetToIdle(); return; } count++;
        setImgOn(rika,'rikanipah.png');
        playAudio(NIPAH_URL, function () {
          if (!spamActive && !inFixed && !musicPlaying) setImgOn(rika,'rikaidle.png');
          if (count < times) setTimeout(doNipah, 80); else resetToIdle();
        });
      }
      doNipah(); return;
    }
    var times = Math.random() < 0.5 ? 3 : 4, playCount = 0, blink = false;
    function doPlay() {
      if (playCount >= times) { resetToIdle(); return; } playCount++;
      blink = false; setImgOn(rena,'renaidle1fixed.png');
      blinkInt = setInterval(function () { blink = !blink; setImgOn(rena, blink ? 'renaidle2fixed.png' : 'renaidle1fixed.png'); }, 200);
      playAudio('renavoice3.wav', function () {
        stopBlink(); setImgOn(rena,'renaidle1fixed.png');
        if (playCount < times) setTimeout(doPlay, 80); else resetToIdle();
      });
    }
    doPlay();
  }

  /* ── Rena click handlers ── */
  function attachRenaHandlers(el) {
    if (!el) return;
    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (musicPlaying || videosPlaying) return;
      if (spamActive) exitSpam();
      if (isBlocked()) return;
      holdTimer = setTimeout(function () {
        holdActive = true; locked = true; el.style.cursor = 'default';
        setImgOn(rena,'renaidle2.png'); playAudio('renavoice5.wav',null);
      }, 400);
      el.style.transition = 'transform 0.18s ease'; el.style.transformOrigin = 'bottom right';
      el.style.transform = 'scaleX(1.14) scaleY(0.86)';
    });
    el.addEventListener('mouseleave', function () {
      if (!musicPlaying) { el.style.transition = 'transform 0.28s ease-out'; el.style.transform = 'scaleX(1) scaleY(1)'; }
    });
    el.addEventListener('click', function () {
      if (musicPlaying || videosPlaying) return;
      if (_justHeld) { _justHeld = false; return; }
      if (window._rikaMode || isBlocked() || holdActive) return;
      var isSpam = tickSpam(); if (isSpam) return; if (locked) return;
      if (state === 0) {
        state = 1; locked = true; el.style.cursor = 'default'; setImgOn(rena,'renaidle2.png');
        playAudio(Math.random()<0.5?'renavoice1.wav':'renavoice5.wav', function () {
          if (!spamActive && !inFixed && !musicPlaying) { locked=false; el.style.cursor='pointer'; setImgOn(rena,'renaidle1.png'); updateBlockedState(); }
        });
      } else if (state === 1) {
        state = 2; locked = true; el.style.cursor = 'default'; setImgOn(rena,'renaidle2fixed.png');
        playAudio(Math.random()<0.5?'renavoice2.wav':'renahyuu.mp3', function () {
          if (!spamActive && !inFixed && !musicPlaying) { locked=false; el.style.cursor='pointer'; setImgOn(rena,'renaidle1.png'); updateBlockedState(); }
        });
      } else if (state === 2) { state = 3; stage3(); }
    });
  }

  /* ── Rika click handlers ── */
  function attachRikaHandlers(el) {
    if (!el) return;
    el.addEventListener('mouseleave', function () { el.style.transition='transform 0.28s ease-out'; el.style.transform='scaleX(1) scaleY(1)'; });
    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || !window._rikaMode) return;
      if (musicPlaying || videosPlaying) return;
      el.style.transition='transform 0.18s ease'; el.style.transformOrigin='bottom right'; el.style.transform='scaleX(1.14) scaleY(0.86)';
    });
    el.addEventListener('click', function () {
      if (!window._rikaMode || musicPlaying || videosPlaying) return;
      setImgOn(rika,'rikanipah.png'); playAudio(NIPAH_URL, function () { setImgOn(rika,'rikaidle.png'); }, 0.8);
    });
  }

  document.addEventListener('mouseup', function () {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (!window._rikaMode && rena) { rena.style.transition='transform 0.28s ease-out'; rena.style.transform='scaleX(1) scaleY(1)'; }
    if (window._rikaMode && rika) { rika.style.transition='transform 0.28s ease-out'; rika.style.transform='scaleX(1) scaleY(1)'; }
    if (!window._rikaMode && holdActive && rena) {
      holdActive = false; _justHeld = true;
      if (!spamActive && !inFixed && !musicPlaying) { locked=false; state=0; setImgOn(rena,'renaidle1.png'); rena.style.cursor='pointer'; rena.style.filter='none'; updateBlockedState(); }
    } else if (window._rikaMode) { holdActive=false; _justHeld=false; }
  });

  attachRenaHandlers(rena);
  attachRikaHandlers(rika);

  /* ── Code box ── */
  var codeBox = null;
  function openCodeBox() {
    if (codeBox) { closeCodes(); return; }
    codeBox = document.createElement('div');
    codeBox.id = '_renaCodeBox';
    codeBox.style.cssText = 'position:fixed;bottom:360px;right:10px;background:rgba(8,8,8,.97);border:1px solid rgba(140,140,140,.35);padding:8px 10px;z-index:10001;display:flex;gap:5px;align-items:center;font-family:Tahoma,sans-serif;font-size:11px;color:#ccc';
    var inp = document.createElement('input');
    inp.type='text'; inp.placeholder='ryuguu codes?...';
    inp.style.cssText='background:rgba(255,255,255,.06);border:1px solid rgba(140,140,140,.30);color:#ccc;font-family:Tahoma,sans-serif;font-size:11px;padding:3px 6px;outline:none;width:140px;';
    var btn = document.createElement('button');
    btn.textContent='ok';
    btn.style.cssText='background:linear-gradient(to bottom,rgba(55,55,55,.7),rgba(18,18,18,.95));border:1px solid rgba(120,120,120,.45);color:#ccc;font-family:Tahoma,sans-serif;font-size:11px;padding:2px 8px;cursor:pointer;';
    codeBox.appendChild(inp); codeBox.appendChild(btn); document.body.appendChild(codeBox); inp.focus();
    var _renaWasHidden = rena && rena.style.display === 'none';
    if (_renaWasHidden && rena && !window._rikaMode) rena.style.display = '';
    function submitCode() {
      var raw = inp.value.trim(); closeCodes();
      if (_renaWasHidden && rena && !window._rikaMode) rena.style.display = 'none';
      if (!raw) return;
      var entry = findCode(raw);
      if (!entry)                   { triggerInvalidCode(); return; }
      if (entry.special==='mitski') { triggerMitski();      return; }
      if (entry.special==='rika')   { activateRika();       return; }
      if (entry.special==='themes') { triggerThemesUnlock();return; }
      triggerCodeVideo(entryToEmbedUrl(entry));
    }
    btn.addEventListener('click', submitCode);
    inp.addEventListener('keydown', function (ev) {
      if (ev.key==='Enter') submitCode();
      if (ev.key==='Escape') { closeCodes(); if(_renaWasHidden&&rena&&!window._rikaMode) rena.style.display='none'; }
    });
  }

  /* Rena right-click opens code box; Rika right-click does nothing */
  if (rena) rena.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if(window._rikaMode) return;
    openCodeBox();
  });

  function closeCodes() { if(codeBox&&codeBox.parentNode) codeBox.parentNode.removeChild(codeBox); codeBox=null; }

  /* ── Invalid code ── */
  function triggerInvalidCode() {
    locked=true; inFixed=true;
    var el=activeEl(), _wasHidden=el&&el.style.display==='none';
    if(_wasHidden&&el) el.style.display='';
    if(el){el.style.cursor='default';el.title='Invalid Code!';}
    if(window._rikaMode){
      setImgOn(rika,'rikanipah.png');
      playAudio(NIPAH_URL,function(){locked=false;inFixed=false;state=0;setImgOn(rika,'rikaidle.png');rika.style.cursor='pointer';updateBlockedState();});
    } else {
      setImgOn(rena,'renasad.png');
      playAudio('renavoice6.wav',function(){locked=false;inFixed=false;state=0;setImgOn(rena,'renaidle1.png');rena.style.cursor='pointer';if(_wasHidden&&rena)rena.style.display='none';updateBlockedState();});
    }
  }

  /* ── Video overlay ── */
  function closeCodeVideo() {
    var ov=document.getElementById('codeVideoOverlay');
    if(ov){var ifr=ov.querySelector('iframe');if(ifr)ifr.src='about:blank';if(ov.parentNode)ov.parentNode.removeChild(ov);}
    videoActive=false;
  }
  function buildOverlay(embedSrc) {
    closeCodeVideo();
    var overlay=document.createElement('div'); overlay.id='codeVideoOverlay';
    overlay.style.cssText='position:fixed;bottom:360px;right:10px;width:280px;background:rgba(4,4,4,.98);border:1px solid rgba(120,120,120,.35);z-index:10002;';
    var titleBar=document.createElement('div');
    titleBar.style.cssText='background:rgba(8,8,8,.97);border-bottom:1px solid rgba(110,110,110,.20);display:flex;align-items:stretch;justify-content:flex-end;min-height:24px;';
    var closeBtn=document.createElement('div'); closeBtn.textContent='X close';
    closeBtn.style.cssText='color:#bbb;font-size:11px;height:26px;padding:0 10px;cursor:pointer;font-family:Tahoma,sans-serif;display:flex;align-items:center;';
    titleBar.appendChild(closeBtn);
    var iframe=document.createElement('iframe');
    iframe.src=embedSrc;iframe.width='280';iframe.height='158';iframe.style.cssText='display:block;border:none;';
    iframe.setAttribute('allow','autoplay; encrypted-media');iframe.setAttribute('allowfullscreen','');
    overlay.appendChild(titleBar);overlay.appendChild(iframe);document.body.appendChild(overlay);
    function onClose(){iframe.src='about:blank';if(overlay.parentNode)overlay.parentNode.removeChild(overlay);videoActive=false;locked=false;state=0;setIdleImg();var el=activeEl();if(el){el.style.cursor='pointer';el.style.filter='none';}updateBlockedState();}
    closeBtn.addEventListener('click',onClose);
  }
  function triggerCodeVideo(embedSrc){locked=true;videoActive=true;var el=activeEl();if(el){el.style.cursor='default';el.style.filter='none';}setIdleImg();updateBlockedState();buildOverlay(embedSrc);}

  document.addEventListener('dragstart',function(e){if(e.target.tagName==='IMG') e.preventDefault();});
  if(rena) rena.title='Right-click for Ryuguu Codes!';
  rika.title='Click for Nipah!';

  /* ── な unlock: wired after DOM ready ── */
  document.addEventListener('DOMContentLoaded', function() {
    /* Find the な span in the motto */
    var naSpan = document.querySelector('.na-span, [data-na-unlock], .h-motto span[style*="cc1a1a"]');
    if (!naSpan) {
      /* fallback: find by text content */
      var mottoSpans = document.querySelectorAll('.h-motto span');
      mottoSpans.forEach(function(sp) {
        if (sp.textContent.indexOf('な') !== -1) naSpan = sp;
      });
    }
    if (naSpan) {
      naSpan.style.cursor = 'pointer';
      naSpan.addEventListener('click', function() {
        /* Unlock hide rena preference */
        if (typeof PREFS !== 'undefined') {
          if (!PREFS.hideRenaUnlocked) {
            PREFS.hideRenaUnlocked = true;
            PREFS.save();
          }
          /* Show the active character */
          if (!window._rikaMode && rena) {
            rena.style.display = '';
            PREFS.alwaysHideRena = false;
            PREFS.save();
          } else if (window._rikaMode && rika) {
            rika.style.display = '';
          }
          if (typeof buildPreferencesUI === 'function') buildPreferencesUI();
        }
      });
    }
  });
})();
