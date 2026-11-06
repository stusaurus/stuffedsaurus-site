const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const reels=[
 'https://www.instagram.com/reel/DfW-NHczYrd/',
 'https://www.instagram.com/reel/DfRophNT2vG/',
 'https://www.instagram.com/reel/DfO_J1oTPDm/'
];
for(const width of [320,360,390,430,768,770,1024,1440]){
 test('real recent Instagram reels '+width+'px',async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://www.instagram.com/embed.js',route=>route.fulfill({
   status:200,contentType:'application/javascript',
   body:'window.instgrm={Embeds:{process(){window._instagramEmbedCalled=true;}}};'
  }));
  await page.goto(base+'#/sns',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#view-sns .instagram-recent-card')).toHaveCount(3);
  const section=page.locator('#view-sns .instagram-recent');
  await expect(section).toBeVisible();
  await expect(section.locator('h2')).toContainText('Instagram');
  await expect(section.locator('.instagram-recent-meta')).toContainText('2026/11/06');
  for(let i=0;i<3;i++){
   const card=section.locator('.instagram-recent-card').nth(i);
   await expect(card.locator('a.instagram-recent-open')).toHaveAttribute('href',reels[i]);
   await expect(card.locator('blockquote.instagram-media')).toHaveAttribute('data-instgrm-permalink',reels[i]);
   await expect(card.locator('a.instagram-recent-open')).toHaveAttribute('rel','noopener noreferrer');
  }
  const layout=await page.evaluate(()=>{
    const gallery=document.querySelector('#view-sns .instagram-recent-grid');
    const card=gallery.querySelector('.instagram-recent-card');
    const embed=gallery.querySelector('.instagram-reel-embed');
    return {
      columns:getComputedStyle(gallery).gridTemplateColumns.trim().split(/\s+/).length,
      cardWidth:card.getBoundingClientRect().width,
      embedWidth:embed.getBoundingClientRect().width,
      narrow:gallery.closest('.instagram-recent').classList.contains('instagram-embed-small')
    };
  });
  expect(layout.columns).toBe(width>900?2:1);
  if(width>900)expect(layout.cardWidth).toBeGreaterThanOrEqual(400);
  expect(layout.narrow).toBe(layout.embedWidth<326);
  if(layout.narrow)await expect(section.locator('.instagram-embed-fallback').first()).toBeVisible();
  // Reels are 9:16 portrait. A landscape placeholder was the visible
  // "squashed" state in browsers where Instagram's embed cannot load.
  const poster=await section.locator('.instagram-embed-fallback').first().evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {width:r.width,height:r.height};
  });
  expect(poster.width/poster.height,'portrait 9:16 reel placeholder at '+width).toBeCloseTo(9/16,1);
  await expect(page.locator('#view-sns .content-footnote')).not.toContainText('表示していません');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
  if(width===390||width===1440)
   await page.screenshot({path:'test-results/v520-instagram-'+width+'.png',fullPage:true});
  await page.close();
 });
}
test('V5.20 does not contact Instagram on the home page',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 let requests=0;
 page.on('request',req=>{if(req.url().includes('www.instagram.com/embed.js'))requests++;});
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-friends')).toBeVisible();
 await expect(page.locator('#view-sns .instagram-recent-card')).toHaveCount(0);
 expect(requests).toBe(0);
 await page.close();
});
test('V5.20 keeps earlier home layout and navigation unchanged',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 const sections=await page.locator('.home-sections').evaluate(el=>
  [...el.children].filter(node=>['home-manga','home-updates','home-friends'].includes(node.id)).map(node=>node.id));
 expect(sections).toEqual(['home-manga','home-updates','home-friends']);
 const nav=await page.locator('.site-nav a.illustrated-nav').evaluateAll(items=>items.map(x=>x.dataset.worldIcon));
 expect(nav).toEqual(['home','manga','friends','catalog','sns','games','books','goods','news']);
 await page.close();
});
test('V5.20 gracefully handles feed fetch failure',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/instagram-recent.json',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.goto(base+'#/sns',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.instagram-recent-meta')).toContainText('取得できませんでした');
 await expect(page.locator('.instagram-recent-grid a')).toHaveAttribute('href','https://www.instagram.com/stuffed_saurus/');
 await page.close();
});

test('V5.22 CSS does not overwrite native Instagram iframe width or height',async({browser})=>{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}});
  await page.route('https://www.instagram.com/embed.js',route=>route.fulfill({
   status:200,contentType:'application/javascript',
   body:'window.instgrm={Embeds:{process(){}}};'
  }));
  await page.goto(base+'#/sns',{waitUntil:'domcontentloaded'});
  const embed=page.locator('#view-sns .instagram-reel-embed').first();
  await expect(embed).toBeVisible();
  const measurement=await embed.evaluate(el=>{
    const iframe=document.createElement('iframe');
    iframe.className='instagram-media';
    iframe.title='Instagram-native-geometry-probe';
    const frameWidth=Math.min(326,Math.floor(el.getBoundingClientRect().width));
    const frameHeight=Math.round(frameWidth*16/9);
    iframe.style.width=frameWidth+'px';
    iframe.style.height=frameHeight+'px';
    el.append(iframe);
    const rect=iframe.getBoundingClientRect();
    return {expectedWidth:frameWidth,expectedHeight:frameHeight,width:rect.width,height:rect.height};
  });
  expect(Math.abs(measurement.width-measurement.expectedWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(measurement.height-measurement.expectedHeight)).toBeLessThanOrEqual(1);
  await page.close();
 }
});
