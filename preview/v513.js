// V5.13: truthful preview state and readable character links.
(() => {
  const footer=document.querySelector('.footer-disclaimer');
  if (footer) footer.textContent='サイトのデザインを公開中｜漫画・絵本などの作品は制作準備中';
  document.querySelectorAll(".character-copy .text-action").forEach(a=>{
    const name=a.closest(".character-story")?.querySelector("h2")?.textContent?.trim();
    if(name){a.textContent="ずかんを見る →";a.setAttribute("aria-label",name+"の図鑑を見る");}
  });
  const routeLabels={home:'ホーム',manga:'4コマまんが',friends:'なかまたち',catalog:'ずかん',sns:'SNS',games:'ゲーム',books:'絵本',goods:'グッズ',news:'おしらせ'};
  const update=()=>{
    const page=location.hash.replace(/^#\/?/,'').split('/')[0]||'home';
    const normalized=Object.hasOwn(routeLabels,page)?page:'home';
    document.querySelectorAll('.mobile-nav-row a').forEach(a=>{
      const href=a.getAttribute('href');
      const current=href==='#/'+normalized;
      if(current)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    const nav=document.querySelector('.site-nav');
    const menu=document.getElementById('menu-toggle');
    if(nav?.classList.contains('open') && document.activeElement !== menu){
      nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');
    }
  };
  window.addEventListener('hashchange',update); update();
})();
