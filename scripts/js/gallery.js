/* ================================================================
   gallery.js — Sketchbook Gallery System
   ================================================================ */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBBr6zPaWgGNcGHz9iiNTO8O4EgAzsUMOk",
  authDomain:        "scrapfielddatabase.firebaseapp.com",
  databaseURL:       "https://scrapfielddatabase-default-rtdb.firebaseio.com",
  projectId:         "scrapfielddatabase",
  storageBucket:     "scrapfielddatabase.firebasestorage.app",
  messagingSenderId: "489751764776",
  appId:             "1:489751764776:web:22255a1e9bf05a538bfa1d",
  measurementId:     "G-WN09XFRPTK"
};

/* Hardcoded items — newest first */
const GALLERY_ITEMS_STATIC = [
  {
    src: 'assets/images/alienmaldito.png',
    title: 'Sketch Alien Hominid',
    description: 'aliennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
  },
  {
    src: 'assets/images/rikafurude.png',
    title: 'Neko Rika',
    description: 'nipah~',
  },
  {
    src: 'assets/images/dante2.png',
    title: 'Sketch Dante 2',
    description: 'kewl sworddd',
  },
  {
    src: 'assets/images/dante3.png',
    title: 'Sketch  Dante 1',
    description: 'boooooriiinggg',
  },
  {
    src: 'assets/images/coelho5.png',
    title: 'Do NOT let em in',
    description: 'Army of violent flesh-eating bunnies outside',
  },
  {
    src: 'assets/images/coelho4.png',
    title: 'You Against They',
    description: 'Kill all \'They\'',
  },
  {
    src: 'assets/images/coelho3.png',
    title: 'Bunny MF & MF Bunny',
    description: 'It`s heavily inspired by <a href="https://x.com/sometimes317/status/1861971961259184166" target="_blank" class="gi-link">THAT</a> one blue & yellow paint art',
  },
  {
    src: 'assets/images/coelho2.png',
    title: 'MF Bunny',
    description: 'Lock the doors and close the blinds',
  },
  {
    src: 'assets/images/coelho1.png',
    title: 'MF Bunny rig',
    description: 'A fail rig i made using my cat`s fur texture.',
  },
  {
    src: 'assets/images/nowyouknowhowitfeelslike.png',
    title: 'Now You know how it feels like',
    description: 'Never pet This.',
  },
  {
    src: 'assets/images/princess%20unicorn%20bunny%20kitten%20angel%20the%20most%20beautifulest%20in%20the%20whole%20wide%20world.png',
    title: 'Princess Unicorn Bunny Kitten Angel the most beautifulest in the whole wide world',
    description: 'Love laugh bunnies 4ever.',
  }
];

const STAR_IMG      = 'assets/images/ratestar.png';
const ADMIN_PASSWORD = 'watanagashi2025';
const HOST_SESS_KEY  = '_galHost';

/* ================================================================
   Firebase
   ================================================================ */
const FirebaseManager = {
  db: null, _ready: false,
  _ref:null,_get:null,_set:null,_remove:null,_onValue:null,_push:null,

  init: async function () {
    if (this._ready) return;
    try {
      const { initializeApp }  = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js');
      const { getDatabase, ref, get, set, remove, onValue, push } =
        await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js');
      const app = initializeApp(FIREBASE_CONFIG);
      this.db=getDatabase(app); this._ref=ref; this._get=get;
      this._set=set; this._remove=remove; this._onValue=onValue; this._push=push;
      this._ready = true;
    } catch(e) { this._ready = false; }
  },

  /* Ratings */
  fetchAllRatings: async function () {
    if (!this._ready) return null;
    try { const s=await this._get(this._ref(this.db,'gallery/ratings')); return s.val()||{}; } catch(e) { return null; }
  },
  setUserRating: async function (itemIdx,userId,stars) {
    if (!this._ready) return false;
    try { await this._set(this._ref(this.db,'gallery/ratings/'+itemIdx+'/users/'+userId),stars); return true; } catch(e) { return false; }
  },
  removeUserRating: async function (itemIdx,userId) {
    if (!this._ready) return false;
    try { await this._remove(this._ref(this.db,'gallery/ratings/'+itemIdx+'/users/'+userId)); return true; } catch(e) { return false; }
  },
  onItemRatingChange: function (itemIdx, callback) {
    if (!this._ready) return ()=>{};
    return this._onValue(this._ref(this.db,'gallery/ratings/'+itemIdx), snap=>callback(snap.val()));
  },

  /* Dynamic items (uploaded by host, base64 in DB) */
  fetchItems: async function () {
    if (!this._ready) return {};
    try { const s=await this._get(this._ref(this.db,'gallery/items')); return s.val()||{}; } catch(e) { return {}; }
  },
  pushItem: async function (data) {
    if (!this._ready) throw new Error('Firebase not ready');
    return await this._push(this._ref(this.db,'gallery/items'), data);
  },
  removeItem: async function (fbKey) {
    if (!this._ready) return;
    await this._remove(this._ref(this.db,'gallery/items/'+fbKey));
  },
  onItemsChange: function (callback) {
    if (!this._ready) return ()=>{};
    return this._onValue(this._ref(this.db,'gallery/items'), snap=>callback(snap.val()||{}));
  },
};

function getOrCreateUserId() {
  let id=localStorage.getItem('_giUserId');
  if(!id){id='u_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('_giUserId',id);}
  return id;
}

/* ================================================================
   Host detection
   ================================================================ */
function isHostMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('host')==='1' || sessionStorage.getItem(HOST_SESS_KEY)==='1';
}
function activateHost() {
  sessionStorage.setItem(HOST_SESS_KEY,'1');
}

/* ================================================================
   Image compress → base64
   ================================================================ */
function compressToBase64(file, maxPx, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w=img.naturalWidth, h=img.naturalHeight;
      if (w>maxPx||h>maxPx) {
        if(w>=h){h=Math.round(h*maxPx/w);w=maxPx;}
        else{w=Math.round(w*maxPx/h);h=maxPx;}
      }
      const canvas=document.createElement('canvas');
      canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      resolve(canvas.toDataURL('image/jpeg',quality));
    };
    img.onerror=()=>reject(new Error('Failed to load image'));
    img.src=url;
  });
}

/* ================================================================
   Upload Panel (injected when host)
   ================================================================ */
const UploadPanel = {
  _pendingFiles: [],
  _mounted: false,

  mount: function() {
    if (this._mounted) return;
    this._mounted = true;

    /* Find the sketchbook page to prepend the panel */
    const page = document.getElementById('pg-sketchbook');
    if (!page) return;

    const panel = document.createElement('div');
    panel.id = 'galUploadPanel';
    panel.style.cssText = `
      background:#111; border:1px solid rgba(180,20,20,.45);
      padding:10px 12px; margin-bottom:8px; font-family:Tahoma,sans-serif;
      font-size:11px; color:#ccc;
    `;
    panel.innerHTML = `
      <div style="color:#cc3333;letter-spacing:1.2px;text-transform:uppercase;font-size:10px;margin-bottom:8px;">
        ▲ HOST — Upload Art
      </div>
      <label id="galDropZone" style="
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        border:2px dashed rgba(180,20,20,.4);background:#0a0a0a;
        padding:18px 12px;cursor:pointer;color:#666;font-size:11px;text-align:center;
        gap:4px;margin-bottom:8px;
      ">
        <span style="font-size:22px">🖼</span>
        <strong style="color:#999">Click or drag images here</strong>
        <span>JPG / PNG / GIF / WEBP</span>
        <input type="file" id="galFileInput" accept="image/*" multiple style="display:none">
      </label>
      <div id="galPreviewStrip" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px;"></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
        <input id="galTitleInput" placeholder="Title (optional)"
          style="flex:2;min-width:120px;background:#1a1a1a;border:1px solid #333;color:#ddd;padding:4px 7px;font-family:inherit;font-size:11px;">
        <input id="galAuthorInput" placeholder="Author"
          style="flex:1;min-width:100px;background:#1a1a1a;border:1px solid #333;color:#ddd;padding:4px 7px;font-family:inherit;font-size:11px;">
      </div>
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <input id="galDescInput" placeholder="Description (optional)"
          style="flex:1;background:#1a1a1a;border:1px solid #333;color:#ddd;padding:4px 7px;font-family:inherit;font-size:11px;">
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button id="galUploadBtn" style="
          flex:1;background:linear-gradient(to bottom,#333,#111);border:1px solid rgba(180,20,20,.5);
          color:#fff;padding:6px 12px;cursor:pointer;font-family:inherit;font-size:11px;
          letter-spacing:.5px;text-transform:uppercase;
        ">↑ Upload to Gallery</button>
        <span id="galUploadMsg" style="font-size:10px;color:#888;"></span>
      </div>
    `;

    /* Insert before first child of page */
    const glass = page.querySelector('.glass-borders');
    page.insertBefore(panel, glass || page.firstChild);

    /* Wire file input */
    const fileInput = document.getElementById('galFileInput');
    fileInput.addEventListener('change', () => {
      this._addFiles(Array.from(fileInput.files));
      fileInput.value='';
    });

    /* Drag & drop */
    const dz = document.getElementById('galDropZone');
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor='#cc3333'; });
    dz.addEventListener('dragleave', () => dz.style.borderColor='rgba(180,20,20,.4)');
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.style.borderColor='rgba(180,20,20,.4)';
      this._addFiles(Array.from(e.dataTransfer.files).filter(f=>f.type.match(/^image\//)));
    });

    /* Upload button */
    document.getElementById('galUploadBtn').addEventListener('click', () => this._upload());
  },

  _addFiles: function(files) {
    const imgs = files.filter(f=>f.type.match(/^image\//));
    this._pendingFiles.push(...imgs);
    this._renderPreviews();
  },

  _renderPreviews: function() {
    const strip = document.getElementById('galPreviewStrip');
    if (!strip) return;
    strip.innerHTML='';
    this._pendingFiles.forEach((file,i) => {
      const url = URL.createObjectURL(file);
      const wrap = document.createElement('div');
      wrap.style.cssText='position:relative;width:56px;height:56px;border:1px solid #333;overflow:hidden;background:#222;flex-shrink:0;';
      const img = document.createElement('img');
      img.src=url; img.style.cssText='width:100%;height:100%;object-fit:cover;';
      const rm = document.createElement('div');
      rm.textContent='✕'; rm.style.cssText='position:absolute;top:1px;right:1px;background:rgba(0,0,0,.8);color:#fff;font-size:9px;width:14px;height:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;';
      rm.addEventListener('click', () => { this._pendingFiles.splice(i,1); this._renderPreviews(); });
      wrap.appendChild(img); wrap.appendChild(rm); strip.appendChild(wrap);
    });
  },

  _setMsg: function(txt, color) {
    const el = document.getElementById('galUploadMsg');
    if (el) { el.textContent=txt; el.style.color=color||'#888'; }
  },

  _upload: async function() {
    if (!this._pendingFiles.length) { this._setMsg('No files selected.','#cc8833'); return; }
    const btn = document.getElementById('galUploadBtn');
    const title  = (document.getElementById('galTitleInput').value||'').trim();
    const author = (document.getElementById('galAuthorInput').value||'').trim();
    const desc   = (document.getElementById('galDescInput').value||'').trim();
    btn.disabled=true;

    let ok=0;
    for (let i=0; i<this._pendingFiles.length; i++) {
      const file = this._pendingFiles[i];
      this._setMsg(`Compressing ${i+1}/${this._pendingFiles.length}…`);
      try {
        const base64 = await compressToBase64(file, 900, 0.82);
        this._setMsg(`Saving ${i+1}/${this._pendingFiles.length}…`);
        await FirebaseManager.pushItem({
          src:      base64,
          title:    title ? (this._pendingFiles.length>1 ? title+' '+(i+1) : title) : file.name.replace(/\.[^.]+$/,''),
          author:   author||'',
          description: desc||'',
          addedAt:  Date.now(),
          _dynamic: true,  /* flag: came from DB, not static array */
        });
        ok++;
      } catch(err) {
        this._setMsg('Error: '+err.message,'#cc3333');
      }
    }

    this._pendingFiles=[];
    this._renderPreviews();
    ['galTitleInput','galAuthorInput','galDescInput'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    btn.disabled=false;
    this._setMsg(ok+' image'+(ok!==1?'s':'')+' uploaded!','#44cc77');
    setTimeout(()=>this._setMsg(''), 3000);
  },
};

/* ================================================================
   Gallery System
   ================================================================ */
const GallerySystem = {
  items: [],             /* merged: static + dynamic from DB */
  _dynamicItems: {},     /* raw from Firebase: { fbKey: {...} } */
  _firebaseRatings: {},
  _localRatings: {},
  _useFirebase: false,
  _userId: '',
  _sortMode: 'newest',
  _lbIdx: 0, _lbScale: 1,
  _lbDragging: false, _lbDragStart: null, _lbImgPos: {x:0,y:0},

  init: async function () {
    if (this._initDone) { this._rebuildItems(); this.render(); return; }
    this._initDone = true;
    this._userId = getOrCreateUserId();
    if (typeof PREFS !== 'undefined') this._sortMode = PREFS.gallerySort || 'newest';

    await FirebaseManager.init();
    this._useFirebase = FirebaseManager._ready;

    /* ── Load dynamic items from DB ── */
    if (this._useFirebase) {
      /* Live listener: re-merge whenever DB changes */
      FirebaseManager.onItemsChange(val => {
        this._dynamicItems = val || {};
        this._rebuildItems();
        this.render();
        /* Attach rating listeners for new dynamic items */
        this._attachDynamicRatingListeners();
      });

      /* ── Load ratings ── */
      const data = await FirebaseManager.fetchAllRatings();
      if (data) {
        Object.entries(data).forEach(([k,v]) => {
          this._firebaseRatings[k]=v;
          this._firebaseRatings[Number(k)]=v;
        });
      }
      /* Rating listeners for static items */
      GALLERY_ITEMS_STATIC.forEach((_,i) => {
        FirebaseManager.onItemRatingChange(i, val => {
          if(val){this._firebaseRatings[i]=val;this._firebaseRatings[String(i)]=val;}
          else{delete this._firebaseRatings[i];delete this._firebaseRatings[String(i)];}
          this.updateRatingUI(i); this.updateAwardedSection();
        });
      });
    } else {
      try{this._localRatings=JSON.parse(localStorage.getItem('galleryRatings')||'{}');}catch(e){this._localRatings={};}
    }

    this._rebuildItems();
    this.render();
    this._buildSortPanel();

    /* Host panel */
    if (isHostMode()) {
      activateHost();
      UploadPanel.mount();
    }
  },

  /* Merge static + dynamic items into this.items
     Dynamic items use 'db_fbKey' as their ratingId key */
  _rebuildItems: function() {
    const statics = GALLERY_ITEMS_STATIC.map((item,i) => ({ ...item, _ratingKey: i, _fbKey: null }));
    const dynamics = Object.entries(this._dynamicItems)
      .map(([fbKey, v]) => ({
        src:         v.src,
        title:       v.title || 'Untitled',
        description: v.description || v.desc || '',
        author:      v.author || '',
        addedAt:     v.addedAt || 0,
        _ratingKey:  'db_'+fbKey,
        _fbKey:      fbKey,
        _dynamic:    true,
      }))
      .sort((a,b) => b.addedAt - a.addedAt);  /* newest dynamic first */
    /* Dynamic items go first (newest uploads at top) */
    this.items = [...dynamics, ...statics];
  },

  _attachDynamicRatingListeners: function() {
    Object.keys(this._dynamicItems).forEach(fbKey => {
      const rk = 'db_'+fbKey;
      if (this._ratingListeners && this._ratingListeners[rk]) return; /* already attached */
      if (!this._ratingListeners) this._ratingListeners={};
      this._ratingListeners[rk] = FirebaseManager.onItemRatingChange(rk, val => {
        if(val){this._firebaseRatings[rk]=val;}
        else{delete this._firebaseRatings[rk];}
        /* Find idx */
        const idx = this.items.findIndex(it=>it._ratingKey===rk);
        if(idx>=0){this.updateRatingUI(rk); this.updateAwardedSection();}
      });
    });
  },

  _getRatingData: function (rk) {
    if (this._useFirebase) {
      const d=this._firebaseRatings[rk]||this._firebaseRatings[String(rk)];
      if(!d||!d.users) return {allStars:[],userStars:0};
      const users=d.users;
      return {allStars:Object.values(users).filter(v=>typeof v==='number'&&v>0),userStars:users[this._userId]||0};
    } else {
      const d=this._localRatings[rk]||{ratings:[],userRating:0};
      return {allStars:d.ratings||[],userStars:d.userRating||0};
    }
  },

  getAverage:    function(rk){const{allStars}=this._getRatingData(rk);if(!allStars.length)return 0;return allStars.reduce((a,b)=>a+b,0)/allStars.length;},
  getCount:      function(rk){return this._getRatingData(rk).allStars.length;},
  getUserRating: function(rk){return this._getRatingData(rk).userStars;},

  rate: async function (rk, stars) {
    const prev=this.getUserRating(rk), newStars=prev===stars?0:stars;
    if (this._useFirebase) {
      newStars===0 ? await FirebaseManager.removeUserRating(rk,this._userId) : await FirebaseManager.setUserRating(rk,this._userId,newStars);
    } else {
      if(!this._localRatings[rk]) this._localRatings[rk]={ratings:[],userRating:0};
      const d=this._localRatings[rk];
      if(d.userRating>0){const i=d.ratings.indexOf(d.userRating);if(i>-1)d.ratings.splice(i,1);}
      d.userRating=newStars; if(newStars>0) d.ratings.push(newStars);
      localStorage.setItem('galleryRatings',JSON.stringify(this._localRatings));
      this.updateRatingUI(rk); this.updateAwardedSection();
    }
  },

  getAwardedIdx: function () {
    let topRk=null,topAvg=0,topPos=0;
    this.items.forEach(item=>{
      const rk=item._ratingKey;
      const avg=this.getAverage(rk),cnt=this.getCount(rk),pos=this._getRatingData(rk).allStars.filter(r=>r>=3).length;
      if(cnt>=1&&(avg>topAvg||(avg===topAvg&&pos>topPos))){topRk=rk;topAvg=avg;topPos=pos;}
    });
    return topRk;
  },
  isAwarded: function(rk){return this.getAwardedIdx()===rk;},

  _buildSortPanel: function() {
    const container = document.querySelector('#pg-sketchbook .section-header-row') ||
                      document.querySelector('#pg-sketchbook h2')?.parentElement;
    if (!container) return;

    /* Look for existing galPlusBtn/galPlusPopup first (from index.html) */
    let btn    = document.getElementById('galPlusBtn');
    let popup  = document.getElementById('galPlusPopup');

    /* galSortItems is the injection point in index.html */
    let sortContainer = document.getElementById('galSortItems');
    if (!sortContainer && popup) { sortContainer = popup; }

    if (!btn || !sortContainer) return;

    const sorts=[['newest','Newest First'],['oldest','Oldest First'],['highest','Highest Rated'],['lowest','Lowest Rated'],['rated','Only Rated'],['awarded','Awarded Only']];
    sortContainer.innerHTML='';
    sorts.forEach(([key,label])=>{
      const opt=document.createElement('div');opt.dataset.sort=key;
      opt.style.cssText='padding:5px 14px;cursor:pointer;color:'+(key===this._sortMode?'#cc1a1a':'#ccc')+';';
      opt.textContent=(key===this._sortMode?'✕ ':'')+label;
      opt.addEventListener('mouseover',()=>opt.style.color='#cc1a1a');
      opt.addEventListener('mouseout',()=>opt.style.color=this._sortMode===key?'#cc1a1a':'#ccc');
      opt.addEventListener('click',()=>{
        this._sortMode=key;
        if(typeof PREFS!=='undefined'){PREFS.gallerySort=key;PREFS.save();}
        popup.style.display='none';
        sortContainer.querySelectorAll('div[data-sort]').forEach((o)=>{
          const sk=o.dataset.sort;o.textContent=(sk===key?'✕ ':'')+sorts.find(s=>s[0]===sk)[1];o.style.color=sk===key?'#cc1a1a':'#ccc';
        });
        this.renderGrid();
      });
      sortContainer.appendChild(opt);
    });

    if(!btn._wired){
      btn._wired=true;
      btn.addEventListener('click',e=>{e.stopPropagation();popup.style.display=popup.style.display==='none'?'block':'none';});
      document.addEventListener('click',()=>{ if(popup) popup.style.display='none'; });
    }

    if(container) container.style.position='relative';
  },

  render: function(){this.renderAwarded();this.renderGrid();},

  _buildStarNodes: function(rk, interactive, isAwarded) {
    const userRating=this.getUserRating(rk), avg=this.getAverage(rk), cnt=this.getCount(rk);
    const sz=isAwarded?26:14;
    const row=document.createElement('div');row.className='gi-stars-row';row.dataset.ratingId=rk;
    if(interactive) row.classList.add('gi-stars-interactive');
    for(let s=1;s<=5;s++){
      const img=document.createElement('img');
      img.src=STAR_IMG; img.width=sz; img.height=sz; img.draggable=false;
      img.dataset.rk=rk; img.dataset.stars=s; img.className='gi-star';
      img.style.opacity=userRating>=s?'1':'0.25';
      if(userRating>=s) img.classList.add('gi-star-on');
      if(interactive){
        img.classList.add('gi-star-interactive');
        img.style.pointerEvents='auto';img.style.cursor='pointer';
        img.style.touchAction='manipulation';img.style.userSelect='none';
        img.style.webkitUserSelect='none';
      } else {
        img.style.pointerEvents='none';img.style.cursor='default';
      }
      row.appendChild(img);
    }
    const avgSpan=document.createElement('span');avgSpan.className='gi-avg';avgSpan.textContent=avg>0?avg.toFixed(1):'N/A';row.appendChild(avgSpan);
    const cntSpan=document.createElement('span');cntSpan.className='gi-cnt';cntSpan.textContent='('+cnt+')';row.appendChild(cntSpan);
    return row;
  },

  _getSortedItems: function() {
    const indexed=this.items.map((item,i)=>({item,i,rk:item._ratingKey}));
    switch(this._sortMode){
      case 'oldest':  return [...indexed].reverse();
      case 'highest': return [...indexed].sort((a,b)=>this.getAverage(b.rk)-this.getAverage(a.rk));
      case 'lowest':  return [...indexed].sort((a,b)=>this.getAverage(a.rk)-this.getAverage(b.rk));
      case 'rated':   return indexed.filter(({rk})=>this.getCount(rk)>0).sort((a,b)=>this.getAverage(b.rk)-this.getAverage(a.rk));
      case 'awarded': return indexed.filter(({rk})=>this.isAwarded(rk));
      default:        return indexed;
    }
  },

  renderAwarded: function () {
    const wrap=document.getElementById('galleryAwarded');if(!wrap) return;
    const aRk=this.getAwardedIdx();
    const aItem=aRk!==null ? this.items.find(it=>it._ratingKey===aRk) : null;
    if(!aItem){wrap.innerHTML='<div class="gi-awarded-empty">Rate artworks to set a winner!</div>';return;}
    wrap.innerHTML='';
    const layout=document.createElement('div');layout.className='gi-awarded-layout';
    const titleTop=document.createElement('div');titleTop.className='gi-awarded-title-top';
    titleTop.textContent=aItem.title;titleTop.style.color='#ffffff';
    const imgbox=document.createElement('div');imgbox.className='gi-awarded-imgbox';
    const aimg=document.createElement('img');aimg.src=aItem.src;aimg.className='gi-awarded-img';aimg.alt=aItem.title;
    const idx=this.items.findIndex(it=>it._ratingKey===aRk);
    aimg.onclick=()=>GallerySystem.openLightbox(idx);aimg.style.cssText='pointer-events:auto;cursor:zoom-in;';
    imgbox.appendChild(aimg);
    const desc=document.createElement('div');desc.className='gi-awarded-desc';desc.style.color='#ffffff';desc.innerHTML=aItem.description||'';
    const starsWrap=document.createElement('div');starsWrap.className='gi-awarded-stars-wrap';
    starsWrap.appendChild(this._buildStarNodes(aRk,false,true));
    layout.appendChild(titleTop);layout.appendChild(imgbox);layout.appendChild(desc);layout.appendChild(starsWrap);
    wrap.appendChild(layout);
  },

  _bindStarsDirect: function(container) {
    const handler=(e)=>{
      let el=e.target;
      while(el&&el!==container){
        if(el.classList&&el.classList.contains('gi-star-interactive')){
          e.preventDefault();e.stopPropagation();
          const rk=el.dataset.rk, stars=parseInt(el.dataset.stars);
          if(rk!==undefined&&!isNaN(stars)) GallerySystem.rate(isNaN(Number(rk))?rk:Number(rk),stars);
          return;
        }
        el=el.parentElement;
      }
    };
    container.addEventListener('click',handler,true);
    container.addEventListener('touchend',handler,{passive:false,capture:true});
  },

  renderGrid: function() {
    const grid=document.getElementById('galleryGrid');if(!grid) return;
    grid.innerHTML='';
    if(!this.items.length){grid.innerHTML='<div class="gi-empty">No artworks yet.</div>';return;}
    if(!grid._starBound){
      grid._starBound=true;
      const gh=(e)=>{
        let el=e.target;
        while(el&&el!==grid){
          if(el.classList&&el.classList.contains('gi-star-interactive')){
            e.preventDefault();e.stopPropagation();
            const rk=el.dataset.rk, s=parseInt(el.dataset.stars);
            if(rk!==undefined&&!isNaN(s)) GallerySystem.rate(isNaN(Number(rk))?rk:Number(rk),s);
            return;
          }
          el=el.parentElement;
        }
      };
      grid.addEventListener('click',gh,true);
      grid.addEventListener('touchend',gh,{passive:false,capture:true});
    }
    this._getSortedItems().forEach(({item,i,rk})=>{grid.appendChild(this._buildCard(item,i,rk));});
  },

  _buildCard: function(item, i, rk) {
    const awd=this.isAwarded(rk);
    const card=document.createElement('div');card.className='gi-card'+(awd?' gi-card-awarded':'');card.dataset.listIdx=i;
    card.dataset.rk=rk;

    /* Delete button for dynamic items (host only) */
    if(isHostMode()&&item._dynamic&&item._fbKey){
      const delBtn=document.createElement('div');
      delBtn.title='Delete';delBtn.textContent='✕';
      delBtn.style.cssText='position:absolute;top:3px;right:3px;background:rgba(0,0,0,.75);color:#f88;font-size:10px;width:16px;height:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid rgba(200,0,0,.3);z-index:5;';
      delBtn.addEventListener('click',e=>{
        e.stopPropagation();
        if(confirm('Delete this artwork?')) FirebaseManager.removeItem(item._fbKey);
      });
      card.style.position='relative';
      card.appendChild(delBtn);
    }

    const imgWrap=document.createElement('div');imgWrap.className='gi-card-imgwrap';imgWrap.style.cssText='pointer-events:auto;cursor:zoom-in;';
    imgWrap.addEventListener('click',()=>GallerySystem.openLightbox(i));
    const img=document.createElement('img');img.src=item.src;img.alt=item.title;img.className='gi-card-img';img.loading='lazy';img.style.pointerEvents='none';
    imgWrap.appendChild(img);card.appendChild(imgWrap);

    const body=document.createElement('div');body.className='gi-card-body';
    const titleEl=document.createElement('div');titleEl.className='gi-card-title';titleEl.textContent=item.title;body.appendChild(titleEl);
    if(item.author){const authEl=document.createElement('div');authEl.className='gi-card-author';authEl.style.cssText='font-size:10px;color:#888;margin-bottom:2px;';authEl.textContent='by '+item.author;body.appendChild(authEl);}
    const descEl=document.createElement('div');descEl.className='gi-card-desc';descEl.innerHTML=item.description||'';body.appendChild(descEl);
    const ratingLabel=document.createElement('div');ratingLabel.className='gi-rating-label';ratingLabel.textContent='RATING';body.appendChild(ratingLabel);
    body.appendChild(this._buildStarNodes(rk,true,false));
    card.appendChild(body);
    this._bindStarsDirect(body);
    return card;
  },

  updateRatingUI: function(rk) {
    const userRating=this.getUserRating(rk),avg=this.getAverage(rk),cnt=this.getCount(rk);
    document.querySelectorAll('[data-rating-id="'+rk+'"]').forEach(row=>{
      row.querySelectorAll('.gi-star').forEach((star,si)=>{
        const on=userRating>=si+1;star.classList.toggle('gi-star-on',on);
        star.style.opacity=on?'1':(star.classList.contains('gi-star-interactive')?'0.3':'0.25');
      });
      const avgEl=row.querySelector('.gi-avg');if(avgEl) avgEl.textContent=avg>0?avg.toFixed(1):'N/A';
      const cntEl=row.querySelector('.gi-cnt');if(cntEl) cntEl.textContent='('+cnt+')';
    });
  },

  updateAwardedSection: function() {
    this.renderAwarded();
    document.querySelectorAll('.gi-card').forEach(card=>{
      const rk=card.dataset.rk,awd=this.isAwarded(rk);
      card.classList.toggle('gi-card-awarded',awd);
    });
  },

  openLightbox: function(idx) {
    this._lbIdx=idx;this._lbScale=1;this._lbImgPos={x:0,y:0};this._lbDragging=false;
    let box=document.getElementById('giLightbox');
    if(!box){
      box=document.createElement('div');box.id='giLightbox';box.className='gi-lb-overlay';
      box.innerHTML=`<div class="gi-lb-box"><div class="gi-lb-titlebar"><span id="giLbTitle"></span><div class="gi-lb-title-btns"><button class="gi-lb-close" onclick="GallerySystem.closeLightbox()">X close</button></div></div><div class="gi-lb-imgarea" id="giLbImgArea"><button class="gi-lb-arrow gi-lb-prev" onclick="GallerySystem.lbNav(-1)">&#9664;</button><div class="gi-lb-imgwrap" id="giLbImgWrap"><img id="giLbImg" src="" alt="" draggable="false"></div><button class="gi-lb-arrow gi-lb-next" onclick="GallerySystem.lbNav(1)">&#9654;</button></div><div class="gi-lb-bottom"><div class="gi-lb-desc" id="giLbDesc"></div><div class="gi-lb-meta"><span id="giLbCounter"></span><div id="giLbStars"></div></div></div></div>`;
      document.body.appendChild(box);
      box.addEventListener('click',e=>{if(e.target===box)this.closeLightbox();});
      document.addEventListener('keydown',e=>{const lb=document.getElementById('giLightbox');if(!lb||!lb.classList.contains('gi-lb-active'))return;if(e.key==='ArrowLeft')this.lbNav(-1);if(e.key==='ArrowRight')this.lbNav(1);if(e.key==='Escape')this.closeLightbox();});
      this._initLbInteraction();
    }
    this._lbUpdate();box.classList.add('gi-lb-active');
  },

  _snapTimer:null,_holdTimer:null,

  _initLbInteraction: function() {
    const wrap=document.getElementById('giLbImgWrap');if(!wrap) return;
    const snap=()=>{clearTimeout(this._snapTimer);this._snapTimer=setTimeout(()=>{const d=Math.hypot(this._lbImgPos.x,this._lbImgPos.y);if(d>150||this._lbScale<0.9||this._lbScale>6){this._lbScale=1;this._lbImgPos={x:0,y:0};const img=document.getElementById('giLbImg');if(img)img.style.transition='none';this._applyLbTransform();}},5000);};
    wrap.addEventListener('wheel',e=>{e.preventDefault();this._lbScale=Math.max(0.5,Math.min(8,this._lbScale+(e.deltaY<0?0.18:-0.18)));this._applyLbTransform();snap();},{passive:false});
    let mdx=0,mdy=0;
    wrap.addEventListener('mousedown',e=>{if(e.button===2||e.button!==0)return;e.preventDefault();mdx=e.clientX;mdy=e.clientY;this._lbDragging=false;this._lbDragStart={x:e.clientX-this._lbImgPos.x,y:e.clientY-this._lbImgPos.y};this._holdTimer=setTimeout(()=>{this._lbDragging=true;wrap.style.cursor='grabbing';},150);});
    window.addEventListener('mousemove',e=>{if(!this._lbDragStart)return;if(Math.hypot(e.clientX-mdx,e.clientY-mdy)>5&&!this._lbDragging&&e.buttons===1){clearTimeout(this._holdTimer);this._lbDragging=true;wrap.style.cursor='grabbing';}if(this._lbDragging&&e.buttons===1){this._lbImgPos.x=e.clientX-this._lbDragStart.x;this._lbImgPos.y=e.clientY-this._lbDragStart.y;this._applyLbTransform();}});
    window.addEventListener('mouseup',e=>{clearTimeout(this._holdTimer);const moved=Math.hypot(e.clientX-mdx,e.clientY-mdy);if(e.button===2){this._lbScale=Math.max(0.5,this._lbScale-0.35);this._applyLbTransform();snap();}else if(e.button===0){if(!this._lbDragging&&moved<6){this._lbScale=Math.min(8,this._lbScale+0.35);this._applyLbTransform();snap();}else if(this._lbDragging)snap();}this._lbDragging=false;this._lbDragStart=null;const w2=document.getElementById('giLbImgWrap');if(w2)w2.style.cursor=this._lbScale>1?'grab':'default';});
    wrap.addEventListener('contextmenu',e=>e.preventDefault());
    let ltd=null;
    wrap.addEventListener('touchstart',e=>{if(e.touches.length===1){this._lbDragging=true;this._lbDragStart={x:e.touches[0].clientX-this._lbImgPos.x,y:e.touches[0].clientY-this._lbImgPos.y};}else if(e.touches.length===2){ltd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}e.preventDefault();},{passive:false});
    wrap.addEventListener('touchmove',e=>{if(e.touches.length===1&&this._lbDragging){this._lbImgPos.x=e.touches[0].clientX-this._lbDragStart.x;this._lbImgPos.y=e.touches[0].clientY-this._lbDragStart.y;this._applyLbTransform();}else if(e.touches.length===2&&ltd!==null){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);this._lbScale=Math.max(0.5,Math.min(8,this._lbScale*(d/ltd)));ltd=d;this._applyLbTransform();}e.preventDefault();},{passive:false});
    wrap.addEventListener('touchend',e=>{if(e.touches.length===0){this._lbDragging=false;ltd=null;snap();}});
    wrap.addEventListener('dblclick',()=>this.lbResetZoom());
  },

  _applyLbTransform: function() {
    const img=document.getElementById('giLbImg'),wrap=document.getElementById('giLbImgWrap');
    if(!img) return;
    img.style.transition='none';img.style.transform=`translate(${this._lbImgPos.x}px,${this._lbImgPos.y}px) scale(${this._lbScale})`;img.style.transformOrigin='center center';
    if(wrap) wrap.style.cursor=this._lbScale>1?'grab':'default';
  },

  lbZoomIn:    function(){this._lbScale=Math.min(8,this._lbScale+0.25);this._applyLbTransform();},
  lbZoomOut:   function(){this._lbScale=Math.max(0.5,this._lbScale-0.25);this._applyLbTransform();},
  lbResetZoom: function(){clearTimeout(this._snapTimer);this._lbScale=1;this._lbImgPos={x:0,y:0};const img=document.getElementById('giLbImg');if(img)img.style.transition='none';this._applyLbTransform();},

  _lbUpdate: function() {
    const item=this.items[this._lbIdx];if(!item) return;
    const rk=item._ratingKey;
    this._lbScale=1;this._lbImgPos={x:0,y:0};
    const img=document.getElementById('giLbImg');img.src=item.src;img.style.transform='';
    const wrap=document.getElementById('giLbImgWrap');if(wrap) wrap.style.cursor='zoom-in';
    document.getElementById('giLbTitle').textContent=item.title;
    document.getElementById('giLbDesc').innerHTML=item.description||'';
    document.getElementById('giLbCounter').textContent=(this._lbIdx+1)+' / '+this.items.length;
    const starsEl=document.getElementById('giLbStars');starsEl.innerHTML='';
    starsEl.appendChild(this._buildStarNodes(rk,true));
    this._bindStarsDirect(starsEl);
  },

  lbNav: function(dir){this._lbIdx=(this._lbIdx+dir+this.items.length)%this.items.length;this._lbUpdate();},
  closeLightbox: function(){const box=document.getElementById('giLightbox');if(box)box.classList.remove('gi-lb-active');this._lbDragging=false;},
};

window.GallerySystem = GallerySystem;

document.addEventListener('DOMContentLoaded',()=>{
  const page=document.getElementById('pg-sketchbook');if(!page) return;
  const observer=new MutationObserver(()=>{if(page.classList.contains('active'))GallerySystem.init();});
  observer.observe(page,{attributes:true,attributeFilter:['class']});
  if(page.classList.contains('active')) GallerySystem.init();
});