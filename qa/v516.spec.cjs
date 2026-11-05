const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/preview-v516/';
const labels={
 home:'おうち',manga:'4コマのへや',friends:'なかまの広場',
 catalog:'ずかん',sns:'まちのアルバム',games:'あそびば',
 books:'えほんの森',goods:'たからばこ',news:'おたより'
};
for(const width of [320,360,390,430,768,770,1024,1440]){
 test('V5.16 town navigation at '+width+'px',async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await expect(page.locator('.site-nav')).toHaveAttribute('aria-label','ティラノンのまち あんない');
  const links=page.locator('.site-nav a[data-world-nav="v516"]');
  await expect(links).toHaveCount(9);
  for(const [route,label] of Object.entries(labels)){
   await expect(page.locator('.site-nav a[href="#/'+route+'"] .world-nav-text')).toHaveText(label);
  }
  if(width<=769){
   const shortcuts=page.locator('.mobile-nav-row a[data-world-nav="v516"]');
   await expect(shortcuts).toHaveCount(2);
   await expect(shortcuts.nth(0).locator('.world-nav-text')).toHaveText('おうち');
   await expect(shortcuts.nth(1).locator('.world-nav-text')).toHaveText('4コマ');
   const toggle=page.locator('#menu-toggle');
   await expect(toggle).toBeVisible();
   const heroBefore=await page.locator('.hero-shell').boundingBox();
   await toggle.click();
   const heroAfter=await page.locator('.hero-shell').boundingBox();
   expect(Math.abs(heroAfter.y-heroBefore.y),'menu must not push hero down').toBeLessThanOrEqual(2);
   await expect(page.locator('.masthead')).toHaveClass(/world-menu-open/);
   const popup=await page.locator('.site-nav').boundingBox();
   const overlayFront=await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('.site-nav'),{x:Math.round(popup.x+popup.width/2),y:Math.round(Math.min(460,popup.y+popup.height-20))});
   expect(overlayFront,'the menu must stay in front of manga cards').toBe(true);
   await expect(toggle).toHaveAttribute('aria-expanded','true');
   await expect(page.locator('.site-nav a[href="#/friends"]')).toBeVisible();
   if(width===390)await page.screenshot({path:'test-results/v516-390-menu-open.png',fullPage:true});
   await page.locator('.site-nav a[href="#/friends"]').click();
   await expect.poll(()=>new URL(page.url()).hash).toBe('#/friends');
   await expect(toggle).toHaveAttribute('aria-expanded','false');
   await expect(page.locator('.masthead')).not.toHaveClass(/world-menu-open/);
  } else {
   await expect(page.locator('.site-nav a[href="#/manga"]')).toBeVisible();
   if(width===1440)await page.screenshot({path:'test-results/v516-1440-home.png',fullPage:true});
   await page.locator('.site-nav a[href="#/manga"]').click();
   await expect.poll(()=>new URL(page.url()).hash).toBe('#/manga');
  }
  const result=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   broken:[...document.images].filter(i=>i.getClientRects().length&&i.complete&&!i.naturalWidth).map(i=>i.src)
  }));
  expect(result.overflow).toBeLessThanOrEqual(2);
  expect(result.broken).toEqual([]);
  expect(errors).toEqual([]);
  await page.close();
 });
}
test('V5.16 keyboard navigation and active section update',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#menu-toggle').focus();
 await expect(page.locator('#menu-toggle')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','true');
 const target=page.locator('.site-nav a[href="#/books"]');
 await expect(target).toBeVisible();
 await target.focus();
 await expect(target).toBeFocused();
 await page.keyboard.press('Enter');
 await expect.poll(()=>new URL(page.url()).hash).toBe('#/books');
 await expect(target).toHaveAttribute('aria-current','page');
 await expect(page.locator('.site-nav a[href="#/home"]')).not.toHaveAttribute('aria-current','page');
 await page.close();
});

test('V5.16 Escape closes menu and returns focus to the toggle',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base,{waitUntil:'networkidle'});
 const toggle=page.locator('#menu-toggle');
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 await expect(toggle).toBeFocused();
 await page.close();
});

test('V5.16 release homepage has town navigation on mobile and desktop',async({browser})=>{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await expect(page.locator('link[href="v516.css"]')).toHaveCount(1);
  await expect(page.locator('script[src="v516.js"]')).toHaveCount(1);
  await expect(page.locator('.site-nav a[data-world-nav="v516"]')).toHaveCount(9);
  await expect(page.locator('.site-nav a[href="#/sns"] .world-nav-text')).toHaveText('まちのアルバム');
  if(width===390){
   const toggle=page.locator('#menu-toggle');
   await toggle.click();
   await expect(page.locator('.site-nav a[href="#/news"]')).toBeVisible();
   await page.screenshot({path:'test-results/v516-release-mobile.png',fullPage:true});
   await toggle.click();
  } else {
   await page.screenshot({path:'test-results/v516-release-desktop.png',fullPage:true});
  }
  const state=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   broken:[...document.images].filter(i=>i.getClientRects().length&&i.complete&&!i.naturalWidth).map(i=>i.src)
  }));
  expect(state.overflow).toBeLessThanOrEqual(2);
  expect(state.broken).toEqual([]);
  expect(errors).toEqual([]);
  await page.close();
 }
});
