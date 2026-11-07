const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';

for(const width of [320,360,390,430,768,770,1024,1440]){
  test('V5.24 verified, real Reel cover images at '+width+'px',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    const embedRequests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().includes('instagram.com/embed.js'))embedRequests.push(r.url())});
    await page.goto(base+'#/sns',{waitUntil:'networkidle'});
    const gallery=page.locator('#view-sns .instagram-recent-v524');
    await expect(gallery).toBeVisible();
    const feed=await page.evaluate(async()=>await (await fetch('instagram-recent.json')).json());
    expect(feed.account).toBe('stuffed_saurus');
    const posts=feed.items.slice(0,3);
    const cards=gallery.locator('.instagram-recent-card');
    await expect(cards).toHaveCount(posts.length);
    await expect(gallery.locator('iframe')).toHaveCount(0);
    await expect(gallery.locator('blockquote.instagram-media')).toHaveCount(0);
    expect(embedRequests).toEqual([]);

    for(let i=0;i<posts.length;i++){
      const card=cards.nth(i),post=posts[i],link=card.locator('.instagram-cover-link');
      await expect(link).toHaveAttribute('href',post.url);
      await expect(link).toHaveAttribute('rel','noopener noreferrer');
      await expect(link).toHaveAttribute('target','_blank');
      await expect(card.locator('.instagram-recent-date')).toHaveAttribute('datetime',post.published_on);
      expect(post.cover_path).toMatch(/^instagram-covers\/[A-Za-z0-9_-]+\.webp$/);
      await expect(card.locator('img.instagram-reel-cover-image')).toHaveCount(1);
      const cover=card.locator('img.instagram-reel-cover-image');
      await cover.scrollIntoViewIfNeeded();
      await expect.poll(async()=>await cover.evaluate(img=>img.complete&&img.naturalWidth===1080&&img.naturalHeight===1920))
        .toBe(true);
      const result=await card.locator('.instagram-cover-art').evaluate(el=>{
        const b=el.getBoundingClientRect(),img=el.querySelector('img');
        return {
          ratio:b.width/b.height,
          width:b.width,height:b.height,
          source:new URL(img.currentSrc).pathname,
          imageNaturalRatio:img.naturalWidth/img.naturalHeight,
          objectFit:getComputedStyle(img).objectFit
        };
      });
      expect(result.ratio).toBeCloseTo(9/16,2);
      expect(result.imageNaturalRatio).toBeCloseTo(9/16,2);
      expect(result.objectFit).toBe('cover');
      expect(result.source.endsWith('/'+post.cover_path)).toBe(true);
      expect(result.source).not.toContain('/assets/');
      await expect(card.locator('.instagram-cover-missing')).toHaveCount(0);
      await expect(card.locator('.instagram-cover-open-label')).toHaveText('Instagramで見る');
    }
    const pageState=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-innerWidth,
      broken:[...document.images].filter(img=>img.getClientRects().length&&img.complete&&!img.naturalWidth).map(img=>img.src),
      cols:getComputedStyle(document.querySelector('.instagram-recent-grid')).gridTemplateColumns.trim().split(/\s+/).length
    }));
    expect(pageState.cols).toBe(width>900?2:1);
    expect(pageState.overflow).toBeLessThanOrEqual(2);
    expect(pageState.broken).toEqual([]);
    expect(errors).toEqual([]);
    if(width===390||width===1440)await page.screenshot({path:'test-results/v524-real-reel-'+width+'.png',fullPage:true});
    await page.close();
  });
}
test('V5.24 home arrangement, interactive friends, and menu remain unchanged',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-friends .friend-chat-button')).toBeVisible();
 const sections=await page.locator('.home-sections').evaluate(el=>
  [...el.children].filter(n=>['home-manga','home-updates','home-friends'].includes(n.id)).map(n=>n.id));
 expect(sections).toEqual(['home-manga','home-updates','home-friends']);
 const menu=await page.locator('.site-nav a.illustrated-nav').evaluateAll(items=>items.map(a=>a.dataset.worldIcon));
 expect(menu).toEqual(['home','manga','friends','catalog','sns','games','books','goods','news']);
 await page.close();
});
test('V5.24 safely links to account if feed is unavailable',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/instagram-recent.json',route=>route.fulfill({status:503,body:'Unavailable'}));
 await page.goto(base+'#/sns',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.instagram-recent-meta')).toContainText('取得できませんでした');
 await expect(page.locator('.instagram-recent-grid a')).toHaveAttribute('href','https://www.instagram.com/stuffed_saurus/');
 await page.close();
});
test('V5.24 missing verified thumbnail never substitutes unrelated site artwork',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/instagram-covers/*.webp',route=>route.fulfill({status:404,body:'Not found'}));
 await page.goto(base+'#/sns',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.instagram-recent-card')).toHaveCount(3);
 await expect.poll(async()=>await page.locator('.instagram-cover-missing').count()).toBe(3);
 await expect(page.locator('.instagram-recent-card img.instagram-reel-cover-image')).toHaveCount(0);
 await expect(page.locator('.instagram-cover-missing-text')).toHaveCount(3);
 await page.close();
});
test('V5.24 keyboard links and reduced motion work',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(base+'#/sns',{waitUntil:'networkidle'});
 const link=page.locator('.instagram-cover-link').first();
 await link.focus();
 await expect(link).toBeFocused();
 const style=await link.locator('.instagram-cover-art').evaluate(el=>({
    transition:getComputedStyle(el).transitionDuration,
    aspectRatio:getComputedStyle(el).aspectRatio
 }));
 expect(style.transition.split(',').every(x=>x.trim()==='0s')).toBe(true);
 expect(style.aspectRatio).toBe('9 / 16');
 await page.close();
});
