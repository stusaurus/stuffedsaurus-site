/* V5.18 — the user's requested おうち card order.
   Align DOM/keyboard order with visual order for accessibility. */
(() => {
  const home=document.querySelector('.home-sections');
  const news=document.getElementById('home-updates');
  const friends=document.getElementById('home-friends');
  if(!home || !news || !friends)return;
  if(news.parentElement!==home || friends.parentElement!==home)return;
  // Leave the global menu and all href routes unchanged.
  friends.before(news);
})();
