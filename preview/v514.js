// V5.14: accessible reading links and page-change announcements.
(() => {
  const titleBase = document.title;
  const routeNames = {home:'ホーム',manga:'4コマまんが',friends:'なかまたち',catalog:'ずかん',sns:'SNS',games:'ゲーム',books:'絵本',goods:'グッズ',news:'おしらせ'};
  const announcer = document.createElement('span');
  announcer.setAttribute('role','status');
  announcer.setAttribute('aria-live','polite');
  announcer.style.cssText='position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  document.body.appendChild(announcer);
  const update = () => {
    const key = location.hash.replace(/^#\\/?/,'').split('/')[0] || 'home';
    const name = routeNames[key];
    if (!name) return;
    document.title = name + '｜' + titleBase;
    announcer.textContent = name + 'のページ';
  };
  window.addEventListener('hashchange',update);
  update();
})();
