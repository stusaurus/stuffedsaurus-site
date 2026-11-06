const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const urls=[
  'https://www.instagram.com/reel/DfW-NHczYrd/',
  'https://www.instagram.com/reel/DfRophNT2vG/',
  'https://www.instagram.com/reel/DfO_J1oTPDm/'
];
for(const width of [320,360,390,430,768,770,1024,1440]){
 test('V5.23 portrait Instagram gallery '+width+'px',async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];
  const external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(req.url().includes('instagram.com/embed.js'))external.push(req.url())});
  await page.goto(base+'#/sns',{waitUntil:'networkidle'});
  const sec=page.locator('#view-sns .instagram-recent-v523');
  await expect(sec).toBeVisible();
  await expect(sec.locator('.instagram-recent-card')).toHaveCount(3);
  await expect(sec.locator('.instagram-cover-link')).toHaveCount(3);
  await expect(sec.locator('.instagram-recent-meta')).toContainText('2026/11/06');
  await expect(page.locator('script[data-instagram-embed]')).toHaveCount(0);
  await expect(sec.locator('iframe')).toHaveCount(0);
  await expect(sec.locator('blockquote.instagram-media')).toHaveCount(0);
  expect(external).toEqual([]);
  for(let i=0;i<3;i++){
   const card=sec.locator('.instagram-recent-card').nth(i);
   const a=card.locator('a.instagram-cover-link');
   await expect(a).toHaveAttribute('href',urls[i]);
   await expect(a).toHaveAttribute('target','_blank');
   await expect(a).toHaveAttribute('rel','noopener noreferrer');
   await expect(card.locator('.instagram-cover-note')).toHaveText('紹介イラスト');
   const img=card.locator('img.instagram-cover-character');
   await expect(img).toBeVisible();
   const shape=await card.locator('.instagram-cover-art').evaluate(el=>{
     const box=el.getBoundingClientRect();
     const image=el.querySelector('img');
     return {w:box.width,h:box.height,
       imgLoaded:!!image.naturalWidth&&!!image.naturalHeight,
       fit:getComputedStyle(image).objectFit,
       text:el.querySelector('.instagram-cover-title')?.textContent
     };
   });
   expect(shape.imgLoaded).toBe(true);
   expect(shape.fit).toBe('contain');
   expect(shape.w/shape.h,'true portrait ratio at '+width).toBeCloseTo(9/16,1);
   expect(shape.text.length).toBeGreaterThan(3);
  }
  const meta=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-innerWidth,
    broken:[...document.images].filter(img=>img.getClientRects().length&&img.complete&&!img.naturalWidth).map(img=>img.src),
    columns:getComputedStyle(document.querySelector('.instagram-recent-grid')).gridTemplateColumns.trim().split(/\s+/).length
  }));
  expect(meta.columns).toBe(width>900?2:1);
  expect(meta.overflow).toBeLessThanOrEqual(2);
  expect(meta.broken).toEqual([]);
  expect(errors).toEqual([]);
  if(width===390||width===1440)await page.screenshot({path:'test-results/v523-gallery-'+width+'.png',fullPage:true});
  await page.close();
 });
}
test('V5.23 keeps current home and navigation unchanged',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-friends .friend-chat-button')).toBeVisible();
 const sections=await page.locator('.home-sections').evaluate(el=>
  [...el.children].filter(node=>['home-manga','home-updates','home-friends'].includes(node.id)).map(node=>node.id));
 expect(sections).toEqual(['home-manga','home-updates','home-friends']);
 const menu=await page.locator('.site-nav a.illustrated-nav').evaluateAll(links=>links.map(a=>a.dataset.worldIcon));
 expect(menu).toEqual(['home','manga','friends','catalog','sns','games','books','goods','news']);
 await page.close();
});
test('V5.23 fallback for inaccessible feed',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/instagram-recent.json',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.goto(base+'#/sns',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.instagram-recent-meta')).toContainText('取得できませんでした');
 await expect(page.locator('.instagram-recent-grid a')).toHaveAttribute('href','https://www.instagram.com/stuffed_saurus/');
 await page.close();
});
test('V5.23 supports keyboard and reduced motion',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(base+'#/sns',{waitUntil:'networkidle'});
 const link=page.locator('.instagram-cover-link').first();
 await link.focus();
 await expect(link).toBeFocused();
 const t=await link.locator('.instagram-cover-art').evaluate(el=>({transition:getComputedStyle(el).transitionDuration,ratio:getComputedStyle(el).aspectRatio}));
 expect(t.transition.split(',').every(x=>x.trim()==='0s')).toBe(true);
 expect(t.ratio).toBe('9 / 16');
 await page.close();
});
