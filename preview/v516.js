/* V5.16 — a child-friendly map of Tyrannon's town.
   Routes and page titles remain unchanged; only navigation presentation changes. */
(() => {
  const entries = {
    home:    {label:'おうち',         hint:'まちの入り口',         glyph:'⌂',  description:'トップページ'},
    manga:   {label:'4コマのへや',     hint:'ちいさなおはなし',     glyph:'▤',  description:'4コマまんが'},
    friends: {label:'なかまの広場',    hint:'ともだちに会おう',     glyph:'✿',  description:'キャラクター紹介'},
    catalog: {label:'ずかん',         hint:'みんなをもっと知ろう', glyph:'▣',  description:'キャラクター図鑑'},
    sns:     {label:'まちのアルバム',  hint:'イラストを見にいこう', glyph:'◎',  description:'SNS・最新の投稿'},
    games:   {label:'あそびば',       hint:'ゲームであそぼう',     glyph:'✧',  description:'ゲーム'},
    books:   {label:'えほんの森',     hint:'ページをめくろう',     glyph:'▥',  description:'絵本'},
    goods:   {label:'たからばこ',     hint:'グッズをのぞこう',     glyph:'❀',  description:'グッズ紹介'},
    news:    {label:'おたより',       hint:'まちからのおしらせ', glyph:'✉',  description:'お知らせ'}
  };
  const make = (tag, className, value) => {
    const el=document.createElement(tag);
    el.className=className;
    el.textContent=value;
    return el;
  };
  const routeOf = (a) => {
    const href=a.getAttribute('href')||'';
    const match=href.match(/^#\/([a-z]+)(?:\/|$)/);
    return match?.[1]||null;
  };
  const nav=document.querySelector('.site-nav');
  if (!nav) return;
  nav.setAttribute('aria-label','ティラノンのまち あんない');
  const apply = (a,short=false) => {
    const route=routeOf(a);
    const entry=entries[route];
    if (!entry || a.dataset.worldNav==='v516') return;
    a.dataset.worldNav='v516';
    const label=short && route==='manga'?'4コマ':entry.label;
    a.replaceChildren(
      make('span','world-nav-glyph',entry.glyph),
      make('span','world-nav-text',label)
    );
    if (!short) a.append(make('span','world-nav-hint',entry.hint));
    a.setAttribute('aria-label',entry.label+'・'+entry.description);
  };
  nav.querySelectorAll('a[href^="#/"]').forEach(a=>apply(a));
  document.querySelectorAll('.mobile-nav-row a[href^="#/"]').forEach(a=>apply(a,true));
  const toggle=document.getElementById('menu-toggle');
  if(toggle) toggle.setAttribute('aria-label','まちのあんないメニューを開く・閉じる');
  const highlight=()=>{
    const page=location.hash.replace(/^#\/?/,'').split('/')[0]||'home';
    nav.querySelectorAll('a[data-world-nav="v516"]').forEach(a=>{
      if(routeOf(a)===page) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('.mobile-nav-row a[data-world-nav="v516"]').forEach(a=>{
      if(routeOf(a)===page) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
  };
  if(toggle){
    const closeMenu=()=>{
      if(!nav.classList.contains('open')) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    };
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape' && nav.classList.contains('open')){
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener('pointerdown',event=>{
      if(nav.classList.contains('open') && !nav.contains(event.target) && !toggle.contains(event.target)){
        closeMenu();
      }
    });
  }
  window.addEventListener('hashchange',highlight);
  highlight();
})();