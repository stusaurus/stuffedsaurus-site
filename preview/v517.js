/* V5.17 — original transparent storybook vector artwork for nine menu items.
   Never animates at rest; interaction only, with reduced-motion support in CSS. */
(() => {
  const art = {"home":"<path d=\"M6 66Q35 57 74 66\" fill=\"none\" stroke=\"#8AAA7B\" stroke-width=\"4\"/><g class=\"icon-smoke\" fill=\"none\" stroke=\"#C3B7A4\" stroke-width=\"2.4\"><path d=\"M54 17q-5-5 0-11m7 8q-4-5 0-10\"/></g><path d=\"M51 22V9h11v27\" fill=\"#E7B87A\"/><path d=\"M20 34h42v31H20z\" fill=\"#F9D794\"/><g class=\"icon-roof\"><path d=\"M14 36 41 12 69 36Q65 41 60 36L41 22 22 39Q16 41 14 36\" fill=\"#D77C60\"/></g><path d=\"M32 65V49q0-10 9-10t9 10v16\" fill=\"#A37B56\"/><circle cx=\"45\" cy=\"53\" r=\"1.7\" fill=\"#FFE6A8\" stroke=\"none\"/><rect x=\"53\" y=\"41\" width=\"8\" height=\"9\" rx=\"2\" fill=\"#A6C8B7\"/><path d=\"M57 41v9m-4-4h8\" stroke=\"#FFF3D3\" stroke-width=\"1.7\"/><path d=\"M9 61q7-12 14-4m46 5q3-9 8-8\" fill=\"none\" stroke=\"#779C68\" stroke-width=\"3\"/>","manga":"<g class=\"icon-page\"><rect x=\"13\" y=\"14\" width=\"55\" height=\"53\" rx=\"5\" fill=\"#FFF1D8\"/><path d=\"M40 15v51M14 40h53\" stroke-width=\"2.1\"/><path d=\"M19 20h15v13H19z\" fill=\"#F1C8BA\" stroke-width=\"1.2\"/><path d=\"M46 20h16v13H46z\" fill=\"#C2D6B6\" stroke-width=\"1.2\"/><path d=\"M19 46h15v15H19z\" fill=\"#DCCBE9\" stroke-width=\"1.2\"/><path d=\"M46 46h16v15H46z\" fill=\"#B6D9EA\" stroke-width=\"1.2\"/></g><path d=\"M45 35q-3-14 6-16l3-6 5 5 4-2 2 9q5 11-5 17-11 4-15-7\" fill=\"#A1D8B1\"/><circle cx=\"59\" cy=\"27\" r=\"2\" fill=\"#49372C\" stroke=\"none\"/><path d=\"M58 33q5 4 8-1\" fill=\"none\" stroke-width=\"1.7\"/><ellipse cx=\"53\" cy=\"32\" rx=\"3.5\" ry=\"2.2\" fill=\"#EBAFA9\" stroke=\"none\"/><path d=\"m12 10-5-5m11 4V3\" fill=\"none\" stroke=\"#E4C16C\" stroke-width=\"2.2\"/>","friends":"<path d=\"M8 63q11-10 25-4 15-9 38 3\" fill=\"#DCE9C2\" stroke=\"#9EB78E\"/><g class=\"icon-friends\"><path d=\"M8 42q0-17 12-18l-1-7 5 4 5-5 4 8q10 7 7 21-5 13-18 11Q10 55 8 42Z\" fill=\"#A1D7B1\"/><path d=\"M31 48l-1-13 5-7 5 6 4-9 6 8 5-4 4 13q4 13-11 17-15 1-17-11\" fill=\"#C9ADE0\"/><path d=\"M51 42q6-12 15-12l7-6-1 9-5 1q8 8 4 14-8 10-20 2Z\" fill=\"#B1D6EC\"/><path d=\"M54 47q-7 5-10 10 13 0 17-6\" fill=\"#BBE1EE\"/><circle cx=\"27\" cy=\"38\" r=\"1.9\" fill=\"#44372E\" stroke=\"none\"/><circle cx=\"45\" cy=\"41\" r=\"1.9\" fill=\"#44372E\" stroke=\"none\"/><circle cx=\"64\" cy=\"40\" r=\"1.8\" fill=\"#44372E\" stroke=\"none\"/><path d=\"M26 44q4 4 8 0m8 4q4 4 8-1m14-3q4 3 7-2\" fill=\"none\" stroke-width=\"1.5\"/><ellipse cx=\"19\" cy=\"42\" rx=\"4\" ry=\"2.5\" fill=\"#EAB3AF\" stroke=\"none\"/></g>","catalog":"<path d=\"M8 27q20-7 32 2 12-10 32-3l1 36Q53 57 40 67 27 57 8 62Z\" fill=\"#D4A97A\"/><g class=\"icon-book\"><path d=\"M12 21q18-7 28 4v36q-12-9-27-5Z\" fill=\"#FFF2D9\"/><path d=\"M68 21q-18-7-28 4v36q12-9 27-5Z\" fill=\"#FFF5DE\"/><path d=\"M40 25v36M17 31q9-3 17 1M17 39q9-3 17 1M46 33q9-3 17-1\" stroke-width=\"1.6\" fill=\"none\" stroke=\"#C5A67C\"/></g><g class=\"icon-footprint\" fill=\"#9DB58E\" stroke=\"none\"><ellipse cx=\"54\" cy=\"47\" rx=\"7\" ry=\"5\" transform=\"rotate(-20 54 47)\"/><circle cx=\"48\" cy=\"40\" r=\"2\"/><circle cx=\"52\" cy=\"37\" r=\"2\"/><circle cx=\"57\" cy=\"37\" r=\"2\"/></g>","sns":"<g class=\"icon-photo\" transform=\"rotate(-5 40 43)\"><rect x=\"14\" y=\"13\" width=\"52\" height=\"53\" rx=\"4.5\" fill=\"#FFF9EF\"/><path d=\"M21 20h38v32H21z\" fill=\"#B7DCEA\"/><path d=\"M21 46l12-13 8 8 9-10 9 14v7H21z\" fill=\"#A6C397\"/><circle cx=\"48\" cy=\"29\" r=\"5\" fill=\"#F9CD7A\" stroke=\"none\"/><path d=\"M28 58h25\" fill=\"none\" stroke=\"#D2B78D\" stroke-width=\"2\"/></g><g class=\"icon-flower\" fill=\"#F1B9C1\"><ellipse cx=\"63\" cy=\"51\" rx=\"5\" ry=\"8\"/><ellipse cx=\"73\" cy=\"58\" rx=\"7\" ry=\"5\"/><ellipse cx=\"68\" cy=\"69\" rx=\"5\" ry=\"8\"/><ellipse cx=\"56\" cy=\"68\" rx=\"5\" ry=\"8\"/><ellipse cx=\"53\" cy=\"57\" rx=\"7\" ry=\"5\"/><circle cx=\"63\" cy=\"60\" r=\"5\" fill=\"#F2CF75\"/></g>","games":"<g class=\"icon-star\"><path d=\"M35 9 43 25 61 28 48 41 52 59 35 50 19 59 22 41 9 28 27 25Z\" fill=\"#F6D16C\"/><path d=\"m34 16 5 11m-14 8-4 5\" fill=\"none\" stroke=\"#FFF1B9\" stroke-width=\"2\"/></g><path d=\"M37 50h21v18H37z\" fill=\"#A2C8E3\"/><path d=\"M44 43h23v21H44z\" fill=\"#CDB4E4\"/><path d=\"M12 56h23v12H12z\" fill=\"#DBA37E\"/><path d=\"M23 47h19v17H23z\" fill=\"#AAD0A9\"/><path d=\"M23 47v17m-11-8h23\" fill=\"none\" stroke=\"#FFF0D3\" stroke-width=\"1.6\"/><path d=\"M64 8v13m-6-7h13\" fill=\"none\" stroke=\"#E4B968\" stroke-width=\"2.2\"/>","books":"<g class=\"icon-trees\"><path d=\"M15 58V23M63 58V22\" fill=\"none\" stroke=\"#A57A56\" stroke-width=\"6\"/><path d=\"M7 28q2-17 16-15 14 6 8 20-6 11-16 7Q4 38 7 28Z\" fill=\"#9BBC86\"/><path d=\"M50 26q-1-16 13-16 16 2 12 22-7 10-20 5Z\" fill=\"#8BAF78\"/></g><g class=\"icon-book\"><path d=\"M8 46q17-8 32 3 14-13 32-3l-2 20q-15-7-30 3-15-10-29-3Z\" fill=\"#D9AD81\"/><path d=\"M12 43q15-7 28 4v18q-13-10-27-6Z\" fill=\"#FFF1D8\"/><path d=\"M68 43q-15-7-28 4v18q13-10 27-6Z\" fill=\"#FFF3DD\"/><path d=\"M40 47v18M17 51q9-2 16 4M48 54q8-4 14-3\" fill=\"none\" stroke=\"#D6B88E\" stroke-width=\"1.8\"/></g><path class=\"icon-leaf\" d=\"M38 19q8-2 13-10-15 3-13 10\" fill=\"#7EAB75\"/>","goods":"<g class=\"icon-treasure\"><path d=\"M18 37h46v28q-23 8-46 0Z\" fill=\"#C78E55\"/><path d=\"M18 46q21 5 46 0v16q-23 9-46 0Z\" fill=\"#DFB266\"/><path d=\"M38 46h10v18H38z\" fill=\"#F7D27C\"/><rect x=\"40\" y=\"51\" width=\"7\" height=\"7\" rx=\"2\" fill=\"#D7A855\"/></g><g class=\"icon-lid\"><path d=\"M16 36Q17 19 41 18q23 1 25 18Z\" fill=\"#E7B867\"/><path d=\"M19 34Q24 22 41 22q18 0 21 12Z\" fill=\"#F6D083\"/></g><circle cx=\"30\" cy=\"29\" r=\"4.5\" fill=\"#A5DBE8\" stroke=\"#76ACBA\" stroke-width=\"1.4\"/><path d=\"m49 29 4-9 4 9-4 4Z\" fill=\"#FFE19A\"/><path d=\"m8 27 5-5m49-10 1-6m5 22 7-3\" fill=\"none\" stroke=\"#E6C16C\" stroke-width=\"2.4\"/>","news":"<g class=\"icon-letter\"><rect x=\"22\" y=\"11\" width=\"39\" height=\"45\" rx=\"4\" fill=\"#FFF4DC\"/><path d=\"M29 24h23M29 32h19M29 40h22\" fill=\"none\" stroke=\"#CEAE80\" stroke-width=\"2\"/></g><g class=\"icon-envelope\"><path d=\"M11 35q0-4 5-4h49q5 0 5 4v29q0 4-4 4H15q-4 0-4-4Z\" fill=\"#F0D5AD\"/><path d=\"m12 37 28 19 29-19M12 66l20-20m37 20L49 46\" fill=\"none\" stroke=\"#BD9874\" stroke-width=\"2\"/></g><g class=\"icon-leaf\"><path d=\"M42 52q-4-14 10-18Q53 47 42 52Z\" fill=\"#91B17F\"/><path d=\"m42 52 9-14\" fill=\"none\" stroke=\"#668B5F\" stroke-width=\"1.7\"/></g><path d=\"m12 20 6-3m47 4 5-5\" fill=\"none\" stroke=\"#E6BA73\" stroke-width=\"2\"/>"};
  const svgFor = route => '<svg class="nav-icon-svg" viewBox="0 0 80 80" width="52" height="52" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
    '<g stroke="#806047" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    art[route] + '</g></svg>';
  const routeOf = a => (a.getAttribute('href')||'').match(/^#\/([a-z]+)(?:\/|$)/)?.[1];
  for(const a of document.querySelectorAll('.site-nav a[data-world-nav="v516"],.mobile-nav-row a[data-world-nav="v516"]')){
    const route=routeOf(a), slot=a.querySelector('.world-nav-glyph');
    // The text identifies the destination; the picture is free to tell a story.
    const destinationNames={games:'ゲーム',goods:'グッズ'};
    if(Object.hasOwn(destinationNames,route)){
      const label=a.querySelector('.world-nav-text');
      if(label)label.textContent=destinationNames[route];
      a.setAttribute('aria-label',destinationNames[route]+'のページ');
    }
    if(!Object.hasOwn(art,route)||!slot)continue;
    slot.innerHTML=svgFor(route);
    slot.setAttribute('aria-hidden','true');
    a.classList.add('illustrated-nav');
    a.dataset.worldIcon=route;
    a.addEventListener('pointerdown',()=>{
      a.classList.remove('icon-pressed');
      void a.offsetWidth;
      a.classList.add('icon-pressed');
      window.setTimeout(()=>a.classList.remove('icon-pressed'),260);
    },{passive:true});
    a.addEventListener('blur',()=>a.classList.remove('icon-pressed'));
  }
  // Keep the navigation's visual order and keyboard focus order identical.
  // Give the latest letters an early spot; friends close the town guide.
  const nav=document.querySelector('.site-nav');
  const friends=nav?.querySelector('a[data-world-icon="friends"]');
  const news=nav?.querySelector('a[data-world-icon="news"]');
  if(friends && news && friends.parentElement===news.parentElement){
    const bookmark=document.createComment('friends position');
    friends.replaceWith(bookmark);
    news.replaceWith(friends);
    bookmark.replaceWith(news);
  }
  const toggle=document.getElementById('menu-toggle');
  if(toggle){
    const compass=document.createElementNS('http://www.w3.org/2000/svg','svg');
    compass.setAttribute('viewBox','0 0 40 40');
    compass.setAttribute('aria-hidden','true');
    compass.setAttribute('focusable','false');
    compass.classList.add('world-compass');
    compass.innerHTML='<circle cx="20" cy="20" r="15.5" fill="#FFF3D8" stroke="#8B674A" stroke-width="2.5"/>' +
      '<circle cx="20" cy="20" r="11.5" fill="none" stroke="#D5B48A" stroke-width="1.3" stroke-dasharray="1.5 3"/>' +
      '<g class="compass-needle"><path d="M20 8l5.5 13L20 32l-5.5-11Z" fill="#D5886F" stroke="#7D5A45" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M20 8l5.5 13L20 21Z" fill="#A9CBAA" stroke="none"/><circle cx="20" cy="21" r="2.4" fill="#FFF4D4" stroke="#7D5A45" stroke-width="1"/></g>' +
      '<path d="M20 2v3M20 35v3M2 20h3M35 20h3" stroke="#9AAF7E" stroke-width="2" stroke-linecap="round"/>';
    toggle.replaceChildren(compass);
    toggle.classList.add('illustrated-toggle');
  }
  document.documentElement.classList.add('has-illustrated-nav');
})();