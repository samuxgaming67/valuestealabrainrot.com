
(function(){
  // Mobile responsive patches. Loaded from header.js so every public page gets the same mobile fixes.
  var files=[
    '/css/mobile-global.css?v=1',
    '/css/mobile-header.css?v=1',
    '/css/mobile-calculator.css?v=1',
    '/css/mobile-brainrot.css?v=1'
  ];
  files.forEach(function(href){
    if(document.querySelector('link[href="'+href+'"]')) return;
    var l=document.createElement('link');
    l.rel='stylesheet';
    l.href=href;
    document.head.appendChild(l);
  });
})();

(function(){
  // GA4 is useful, but loading it after the first paint keeps the site snappier.
  function loadGA(){
    if(window.gtagLoaded)return;
    window.gtagLoaded=true;
    var ga=document.createElement('script');
    ga.async=true;
    ga.src='https://www.googletagmanager.com/gtag/js?id=G-60CW68CBSN';
    document.head.appendChild(ga);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments);};
    gtag('js',new Date());
    gtag('config','G-60CW68CBSN');
  }
  if('requestIdleCallback' in window){
    requestIdleCallback(loadGA,{timeout:2500});
  }else{
    setTimeout(loadGA,1800);
  }
})();

(function(){
  const rawPath=location.pathname.replace(/\.html$/,'').replace(/\/$/,'') || '/index';
  const path=rawPath==='/index' ? '/' : rawPath;

  function isActive(file){
    const fp=file.replace(/\.html$/,'').replace(/\/$/,'') || '/index';
    if(path==='/' && (fp==='/index'||fp==='/'))return true;
    if(fp==='/brainrots' && (path==='/brainrots' || path.startsWith('/brainrot/') || path.startsWith('/rarity/')))return true;
    return path===fp || path===fp.replace('/index','');
  }

  const mainPages=[
    {label:'Brainrots', file:'/brainrots.html'},
    {label:'Values', file:'/trade-values.html'},
    {label:'Exist', file:'/exist-counts.html'},
    {label:'Codes', file:'/codes.html'},
    {label:'Guides', file:'/guides.html'},
  ];

  const morePages=[
    {label:'Lucky Blocks', file:'/lucky-blocks.html'},
    {label:'Fuse', file:'/craft-machine.html'},
    {label:'Traits', file:'/traits.html'},
    {label:'Events', file:'/events.html'},
    {label:'AA Timer', file:'/admin-abuse-timer.html'},
    {label:'Shop', file:'/shop.html'},
  ];

  const pages=[
    {label:'Brainrots', file:'/brainrots.html'},
    {label:'Trade Calculator', file:'/calculator.html'},
    {label:'Value History', file:'/value-history.php'},
    {label:'Values', file:'/trade-values.html'},
    {label:'Exist', file:'/exist-counts.html'},
    {label:'Codes', file:'/codes.html'},
    {label:'Guides', file:'/guides.html'},
  ].concat(morePages);

  const brainrotsActive=isActive('/brainrots.html');
  const brainrotsNav='<a href="/brainrots.html"'+(brainrotsActive?' class="active" aria-current="page"':'')+'>Brainrots</a>';

  const calcActive=isActive('/calculator.html') || isActive('/value-history.php');
  const calcDropdown=
    '<div class="nav-calc">'+
      '<a class="nav-calc-link'+(calcActive?' active':'')+'" href="/calculator.html"'+(isActive('/calculator.html')?' aria-current="page"':'')+'>Trade Calculator</a>'+
      '<button class="nav-calc-btn'+(calcActive?' active':'')+'" type="button" aria-label="Open Trade Calculator submenu" aria-haspopup="true" aria-expanded="false">▾</button>'+
      '<div class="nav-calc-menu">'+
        '<a href="/value-history.php"'+(isActive('/value-history.php')?' class="active" aria-current="page"':'')+'>Value History</a>'+
      '</div>'+
    '</div>';

  const mainNav=brainrotsNav+calcDropdown+mainPages.slice(1).map(p=>{
    const active=isActive(p.file);
    return '<a href="'+p.file+'"'+(active?' class="active" aria-current="page"':'')+'>'+p.label+'</a>';
  }).join('');

  const moreActive=morePages.some(p=>isActive(p.file));
  const moreNav=morePages.map(p=>{
    const active=isActive(p.file);
    return '<a href="'+p.file+'"'+(active?' class="active" aria-current="page"':'')+'>'+p.label+'</a>';
  }).join('');

  const nav=mainNav+
    '<div class="nav-more">'+
      '<button class="nav-more-btn'+(moreActive?' active':'')+'" type="button" aria-haspopup="true" aria-expanded="false">More ▾</button>'+
      '<div class="nav-more-menu">'+moreNav+'</div>'+
    '</div>';

  const drawerNav=pages.map(p=>{
    const active=isActive(p.file);
    return '<a href="'+p.file+'"'+(active?' class="active" aria-current="page"':'')+'>'+p.label+'</a>';
  }).join('');

  if(!document.getElementById('compact-nav-style')){
    const st=document.createElement('style');
    st.id='compact-nav-style';
    st.textContent=`
      #site-header{overflow:visible!important}
      #site-header nav{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;overflow:visible!important}
      #site-header nav>a,#site-header .nav-more-btn{white-space:nowrap}
      #site-header .nav-more,
      #site-header .nav-calc{position:relative;display:inline-flex;align-items:center}
      #site-header .nav-calc{
        gap:0;border-radius:12px;overflow:visible
      }
      #site-header .nav-calc-link{
        white-space:nowrap;text-decoration:none;color:inherit;
        border:1px solid transparent;border-right:0;
        border-radius:12px 0 0 12px;
        padding:9px 10px 9px 12px;
        font-weight:700
      }
      #site-header .nav-more-btn,
      #site-header .nav-calc-btn{
        font:inherit;font-weight:700;cursor:pointer;
        background:transparent;color:inherit;border:1px solid transparent;
        border-radius:12px;padding:9px 12px
      }
      #site-header .nav-calc-btn{
        border-left:0;border-radius:0 12px 12px 0;
        padding:9px 9px;
      }
      #site-header .nav-more-btn:hover,
      #site-header .nav-more-btn.active,
      #site-header .nav-calc:hover .nav-calc-link,
      #site-header .nav-calc:hover .nav-calc-btn,
      #site-header .nav-calc-link.active,
      #site-header .nav-calc-btn.active{
        border-color:rgba(255,77,109,.75);
        background:rgba(255,77,109,.08);
        color:var(--text)
      }
      #site-header .nav-calc-menu{
        position:absolute;top:calc(100% + 8px);left:0;z-index:2147483647;
        min-width:190px;padding:8px;border-radius:14px;
        background:rgba(13,16,28,.98);border:1px solid rgba(148,163,184,.22);
        box-shadow:0 18px 45px rgba(0,0,0,.52);
        display:none;grid-template-columns:1fr;gap:4px
      }
      #site-header .nav-calc:hover .nav-calc-menu,
      #site-header .nav-calc:focus-within .nav-calc-menu,
      #site-header .nav-calc.open .nav-calc-menu{display:grid}
      #site-header .nav-calc-menu a{display:block;border-radius:10px;padding:9px 10px;text-decoration:none;color:inherit}
      #site-header .nav-more-menu{
        position:fixed;top:72px;right:18px;z-index:2147483647;
        min-width:210px;padding:8px;border-radius:14px;
        background:rgba(13,16,28,.98);border:1px solid rgba(148,163,184,.22);
        box-shadow:0 18px 45px rgba(0,0,0,.52);
        display:none;grid-template-columns:1fr;gap:4px
      }
      #site-header .nav-more:hover .nav-more-menu,
      #site-header .nav-more:focus-within .nav-more-menu,
      #site-header .nav-more.open .nav-more-menu{display:grid}
      #site-header .nav-more-menu a{display:block;border-radius:10px;padding:9px 10px}
      @media(max-width:1100px){
        #site-header nav>a:nth-of-type(n+5){display:none}
      }
      @media(max-width:760px){
        #site-header .nav-more,
        #site-header .nav-calc{display:none}
      }
      .nav-drawer .nav-more,
      .nav-drawer .nav-calc{display:none!important}
    `;
    document.head.appendChild(st);
  }

  const h=document.getElementById('site-header');
  if(h){
    h.innerHTML=
      '<a class="logo" href="/index.html" aria-label="Steal a Brainrot Helper home"><img src="/images/logo-sabhelper.png" width="827" height="302" alt="Steal a Brainrot Helper" decoding="async" onerror="this.style.display=\'none\'"></a>'+
      '<nav aria-label="Main navigation">'+nav+'</nav>'+
      '<button class="nav-burger" aria-label="Open menu" aria-expanded="false" type="button"><span></span><span></span><span></span></button>';

    const drawer=document.createElement('div');
    drawer.className='nav-drawer';
    drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML='<div class="nav-drawer-head"><span>Menu</span><button class="nav-drawer-close" aria-label="Close menu" type="button">✕</button></div>'+drawerNav;
    document.body.appendChild(drawer);

    const overlay=document.createElement('div');
    overlay.className='nav-overlay';
    document.body.appendChild(overlay);


    function setupSimpleHeaderDropdown(btnSelector, wrapSelector, menuSelector){
      const btn=h.querySelector(btnSelector);
      const wrap=h.querySelector(wrapSelector);
      if(!btn||!wrap)return;
      const menu=wrap.querySelector(menuSelector);
      let closeTimer=null;

      function openMenu(){
        clearTimeout(closeTimer);
        wrap.classList.add('open');
        if(menu)menu.style.display='grid';
        btn.setAttribute('aria-expanded','true');
      }
      function closeMenuSoon(){
        clearTimeout(closeTimer);
        closeTimer=setTimeout(function(){
          wrap.classList.remove('open');
          if(menu)menu.style.display='';
          btn.setAttribute('aria-expanded','false');
        },160);
      }
      function closeMenuNow(){
        clearTimeout(closeTimer);
        wrap.classList.remove('open');
        if(menu)menu.style.display='';
        btn.setAttribute('aria-expanded','false');
      }

      wrap.addEventListener('mouseenter',openMenu);
      wrap.addEventListener('mouseleave',closeMenuSoon);
      if(menu){
        menu.addEventListener('mouseenter',openMenu);
        menu.addEventListener('mouseleave',closeMenuSoon);
      }
      btn.addEventListener('focus',openMenu);
      btn.addEventListener('click',function(e){
        e.preventDefault();
        if(wrap.classList.contains('open')) closeMenuNow();
        else openMenu();
      });
      document.addEventListener('click',function(e){
        if(!wrap.contains(e.target)) closeMenuNow();
      });
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape') closeMenuNow();
      });
    }

    setupSimpleHeaderDropdown('.nav-calc-btn','.nav-calc','.nav-calc-menu');

    const moreBtn=h.querySelector('.nav-more-btn');
    const moreWrap=h.querySelector('.nav-more');
    if(moreBtn&&moreWrap){
      const menu=moreWrap.querySelector('.nav-more-menu');
      let moreCloseTimer=null;

      function placeMoreMenu(){
        if(!menu)return;
        const r=moreBtn.getBoundingClientRect();
        const right=Math.max(12, window.innerWidth - r.right);
        menu.style.top=(r.bottom+10)+'px';
        menu.style.right=right+'px';
      }
      function openMore(){
        if(!menu)return;
        clearTimeout(moreCloseTimer);
        placeMoreMenu();
        moreWrap.classList.add('open');
        menu.style.display='grid';
        moreBtn.setAttribute('aria-expanded','true');
      }
      function closeMoreSoon(){
        clearTimeout(moreCloseTimer);
        moreCloseTimer=setTimeout(function(){
          moreWrap.classList.remove('open');
          if(menu)menu.style.display='';
          moreBtn.setAttribute('aria-expanded','false');
        },160);
      }
      function closeMoreNow(){
        clearTimeout(moreCloseTimer);
        moreWrap.classList.remove('open');
        if(menu)menu.style.display='';
        moreBtn.setAttribute('aria-expanded','false');
      }

      moreWrap.addEventListener('mouseenter',openMore);
      moreWrap.addEventListener('mouseleave',closeMoreSoon);
      if(menu){
        menu.addEventListener('mouseenter',openMore);
        menu.addEventListener('mouseleave',closeMoreSoon);
      }
      moreBtn.addEventListener('focus',openMore);
      moreBtn.addEventListener('click',function(e){
        e.preventDefault();
        if(moreWrap.classList.contains('open')) closeMoreNow();
        else openMore();
      });
      window.addEventListener('resize',placeMoreMenu);
      window.addEventListener('scroll',function(){ if(moreWrap.classList.contains('open')) placeMoreMenu(); }, {passive:true});
      document.addEventListener('click',function(e){
        if(!moreWrap.contains(e.target)) closeMoreNow();
      });
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape') closeMoreNow();
      });
    }

    const burger=h.querySelector('.nav-burger');
    const closeBtn=drawer.querySelector('.nav-drawer-close');
    function openMenu(){drawer.classList.add('open');overlay.classList.add('open');drawer.setAttribute('aria-hidden','false');burger.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';closeBtn.focus();}
    function closeMenu(){drawer.classList.remove('open');overlay.classList.remove('open');drawer.setAttribute('aria-hidden','true');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';burger.focus();}
    burger.addEventListener('click',openMenu);
    overlay.addEventListener('click',closeMenu);
    closeBtn.addEventListener('click',closeMenu);
    drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))closeMenu();});
  }

  const f=document.querySelector('footer');
  if(f&&!f.querySelector('.privacy-link')){
    const wrap=document.createElement('div');
    wrap.style.cssText='margin-top:4px';
    const footerLinks=[
      ['About','/about.html'],
      ['Contact','/contact.html'],
      ['Terms','/terms.html'],
      ['Disclaimer','/disclaimer.html'],
      ['Editorial Policy','/editorial-policy.html'],
      ['Privacy Policy','/privacy-policy.html']
    ];
    footerLinks.forEach(function(item,idx){
      if(idx){
        const sep=document.createElement('span');
        sep.textContent=' · ';
        sep.style.color='var(--muted)';
        wrap.appendChild(sep);
      }
      const a=document.createElement('a');
      a.href=item[1];
      a.textContent=item[0];
      if(item[0]==='Privacy Policy') a.className='privacy-link';
      a.style.cssText='color:var(--muted);text-decoration:none';
      wrap.appendChild(a);
    });
    f.appendChild(wrap);
  }
})();


(function(){
  // Load live DB exist-count overrides globally.
  // This lets admin changes appear on calculator, exist-counts and brainrot pages without editing data.js.
  if(document.querySelector('script[src*="/js/exist-overrides.js"]')) return;
  var s=document.createElement('script');
  s.src='/js/exist-overrides.js?v=7';
  s.defer=true;
  document.head.appendChild(s);
})();

(function(){
  // Live market value updater for brainrot pages.
  // Converts Dragon/Garama community values into approximate USD market values.
  if(document.querySelector('script[src*="/js/market-value.js"]')) return;
  var s=document.createElement('script');
  s.src='/js/market-value.js?v=4';
  s.defer=true;
  document.head.appendChild(s);
})();

(function(){
  // Static /brainrot/<slug> pages are pre-generated and do not load brainrot.html.
  // This injects a cleaner Wiki Source box on those static pages.
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function norm(s){
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }

  function cleanObtain(s){
    s = String(s || '').trim();
    s = s.replace(/^the following ways:\s*/i,'');
    s = s.replace(/\s+Stealing\s*,?\s*a Core Feature\.?$/i,'');
    s = s.replace(/\s+/g,' ').trim();
    return s;
  }

  function cleanSummary(name, meta){
    var income = meta.income ? 'Income: '+meta.income+'.' : '';
    var cost = meta.cost ? 'Cost: '+meta.cost+'.' : '';
    var obtain = cleanObtain(meta.obtainMethod);
    var method = obtain ? 'Method: '+obtain+'.' : '';
    return [income, cost, method].filter(Boolean).join(' ') || (name + ' has synced wiki facts available.');
  }

  function findMeta(name){
    var db = window.WIKI_BRAINROT_META || {};
    if(db[name]) return db[name];
    var n = norm(name);
    var keys = Object.keys(db);
    for(var i=0;i<keys.length;i++){
      if(norm(keys[i]) === n) return db[keys[i]];
    }
    return null;
  }

  function loadWikiMeta(cb){
    if(window.WIKI_BRAINROT_META && Object.keys(window.WIKI_BRAINROT_META).length){
      cb();
      return;
    }

    var existing = document.querySelector('script[src*="wiki-brainrot-meta"]');
    if(existing){
      existing.addEventListener('load', cb, {once:true});
      setTimeout(cb, 1200);
      return;
    }

    var s = document.createElement('script');
    s.src = '/js/wiki-brainrot-meta.js?v=static-3';
    s.defer = true;
    s.onload = cb;
    s.onerror = function(){ console.warn('Wiki meta failed to load'); };
    document.head.appendChild(s);
  }

  function fact(label, val){
    if(!val) return '';
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 11px;border-radius:12px;background:rgba(15,23,42,.42);border:1px solid rgba(148,163,184,.16)">'+
      '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted2);font-family:JetBrains Mono,monospace">'+esc(label)+'</span>'+
      '<strong style="font-family:Fredoka,sans-serif;font-size:13px;color:var(--text);text-align:right">'+esc(val)+'</strong>'+
    '</div>';
  }

  function renderStaticWikiBox(name, meta){
    if(!meta) return;

    if(document.getElementById('wiki-info') && typeof window.renderWikiInfo === 'function'){
      window.renderWikiInfo(name, meta);
      return;
    }
    if(document.getElementById('wiki-info-static')) return;

    // If the page already has an "About <name>" section (hand-written or
    // auto-generated), it already covers the same facts — skip the
    // duplicate Wiki Source box instead of showing both.
    var h2sForAbout = Array.from(document.querySelectorAll('h2'));
    var hasAbout = h2sForAbout.some(function(h){ return /^about\s/i.test((h.textContent || '').trim()); });
    if(hasAbout) return;

    var obtain = cleanObtain(meta.obtainMethod);
    var facts = [
      fact('Wiki income', meta.income),
      fact('Wiki cost', meta.cost),
      fact('Status', meta.status),
      fact('Released', meta.released),
      fact('Creator', meta.creator)
    ].join('');

    var signifiers = meta.signifiers && meta.signifiers.length
      ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">'+meta.signifiers.map(function(x){
          return '<span style="font-size:11px;font-weight:700;border:1px solid rgba(34,211,238,.25);background:rgba(34,211,238,.08);color:var(--cyan);border-radius:999px;padding:4px 8px">'+esc(x)+'</span>';
        }).join('')+'</div>'
      : '';

    var source = meta.sourceUrl
      ? '<a href="'+esc(meta.sourceUrl)+'" target="_blank" rel="nofollow noopener" style="color:var(--cyan);font-weight:700;text-decoration:none">Steal a Brainrot Wiki</a>'
      : 'Steal a Brainrot Wiki';

    var box = document.createElement('div');
    box.id = 'wiki-info-static';
    box.style.cssText = 'background:linear-gradient(135deg,rgba(30,33,53,.92),rgba(21,24,39,.96));border:1.5px solid var(--border2);border-radius:14px;padding:16px;margin-bottom:16px';

    box.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px">'+
        '<div>'+
          '<h2 style="font-family:Fredoka,sans-serif;font-weight:800;font-size:18px;margin:0 0 4px">Wiki Source</h2>'+
          '<p style="font-size:12px;color:var(--muted);line-height:1.6;margin:0">Synced facts from the community wiki. Your main page stats remain the primary site values.</p>'+
        '</div>'+
        (meta.lastChecked ? '<span style="font-size:10px;color:var(--muted2);font-family:JetBrains Mono,monospace;white-space:nowrap">Checked '+esc(meta.lastChecked)+'</span>' : '')+
      '</div>'+
      '<p style="font-size:13px;color:var(--muted);line-height:1.75;margin:0 0 12px">'+esc(cleanSummary(name, meta))+'</p>'+
      (facts ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:10px">'+facts+'</div>' : '')+
      (obtain ? '<div style="padding:10px 12px;border-radius:12px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.16);font-size:12px;color:var(--muted);line-height:1.65"><strong style="color:var(--text)">How to obtain:</strong> '+esc(obtain)+'</div>' : '')+
      signifiers+
      '<p style="font-size:11px;color:var(--muted2);line-height:1.6;margin:10px 0 0"><strong style="color:var(--text)">Source:</strong> '+source+'</p>';

    var h2s = Array.from(document.querySelectorAll('h2'));
    var incomeH2 = h2s.find(function(h){ return /income per mutation/i.test(h.textContent || ''); });
    var target = incomeH2 ? incomeH2.closest('div') : null;
    if(target && target.parentNode){
      target.parentNode.insertBefore(box, target);
    }else{
      var main = document.querySelector('main');
      if(main) main.appendChild(box);
    }
  }

  ready(function(){
    if(!/^\/brainrot\//.test(location.pathname)) return;
    var h1 = document.querySelector('h1');
    var name = h1 ? h1.textContent.trim().replace(/\s+/g,' ') : '';
    if(!name) return;

    loadWikiMeta(function(){
      var meta = findMeta(name);
      renderStaticWikiBox(name, meta);
    });
  });
})();