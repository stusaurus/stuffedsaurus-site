const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const widths=[320,360,390,430,768,770,1024,1440];
for(const width of widths){
  test('V5.25 first-visit journey and verified cover cards at '+width+'px',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'#/home',{waitUntil:'networkidle'});
    await expect(page.locator('#home-welcome-title')).toHaveText('きょうは、なにして あそぶノン？');
    const sections=await page.locator('#view-home .home-sections').evaluate(el=>
      [...el.children].map(child=>child.id));
    expect(sections).toEqual(['home-friends','home-reels','home-manga','home-updates']);
    await expect(page.locator('#home-friends .friend-grid .friend')).toHaveCount(3);
    await expect(page.locator('#home-friends .friend-chat-button')).toBeVisible();
    await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
    const feed=await page.evaluate(async()=>await (await fetch('instagram-recent.json')).json());
    for(let i=0;i<3;i++){
      const post=feed.items[i];
      const card=page.locator('#home-reels .home-reels-card').nth(i);
      await expect(card).toHaveAttribute('href',post.url);
      await expect(card).toHaveAttribute('target','_blank');
      await expect(card).toHaveAttribute('rel','noopener noreferrer');
      const cover=card.locator('img.home-reels-image');
      await cover.scrollIntoViewIfNeeded();
      await expect.poll(async()=>await cover.evaluate(img=>
        img.complete&&img.naturalWidth===1080&&img.naturalHeight===1920)).toBe(true);
      const info=await card.locator('.home-reels-picture').evaluate(el=>{
        const b=el.getBoundingClientRect(),img=el.querySelector('img');
        return {ratio:b.width/b.height,src:new URL(img.currentSrc).pathname,fit:getComputedStyle(img).objectFit};
      });
      expect(info.ratio).toBeCloseTo(9/16,2);
      expect(info.src.endsWith('/'+post.cover_path)).toBe(true);
      expect(info.fit).toBe('cover');
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
    await page.locator('#home-friends .friend-chat-button').click();
    await expect(page.locator('#home-friend-voice')).toContainText('ティラノン');
    await page.locator('#view-home .home-welcome-secondary').click();
    await expect(page.locator('#view-sns .instagram-recent-v524')).toBeVisible();
    if(width===390||width===1440){
      await page.goto(base+'#/home',{waitUntil:'networkidle'});
      await page.screenshot({path:'test-results/v525-home-'+width+'.png',fullPage:true});
    }
    await page.close();
  });
}
test('V5.25 missing feed points to verified Instagram account and keeps other content',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('**/instagram-recent.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto(base+'#/home',{waitUntil:'networkidle'});
  await expect(page.locator('#home-reels .home-reels-unavailable')).toHaveAttribute('href','https://www.instagram.com/stuffed_saurus/');
  await expect(page.locator('#home-friends .friend')).toHaveCount(3);
  await page.close();
});
test('V5.25 missing thumbnail is never replaced with unrelated artwork',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('**/instagram-covers/*.webp',route=>route.fulfill({status:404,body:'Unavailable'}));
  await page.goto(base+'#/home',{waitUntil:'networkidle'});
  await expect.poll(async()=>page.locator('#home-reels .home-reels-cover-missing').count()).toBe(3);
  await expect(page.locator('#home-reels .home-reels-image')).toHaveCount(0);
  await page.close();
});