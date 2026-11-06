const {test,expect}=require('@playwright/test');
const url='http://127.0.0.1:8765/preview-v517/';
const routes=['home','manga','friends','catalog','sns','games','books','goods','news'];
for(const width of [320,360,390,430,768,770,1024,1440]){
 test('V5.17 illustrated navigation '+width+'px',async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'networkidle'});
  await expect(page.locator('.site-nav a.illustrated-nav')).toHaveCount(9);
  await expect(page.locator('.site-nav svg.nav-icon-svg')).toHaveCount(9);
  for(const route of routes){
    const link=page.locator('.site-nav a[data-world-icon="'+route+'"]');
    await expect(link).toHaveCount(1);
    await expect(link.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    await expect(link).toHaveAttribute('href','#/'+route);
  }
  if(width<=769){
    const toggle=page.locator('#menu-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle.locator('svg.world-compass')).toHaveCount(1);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    const nav=page.locator('.site-nav');
    await expect(nav).toBeVisible();
    expect(await nav.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(3);
    const items=await nav.locator('a.illustrated-nav').evaluateAll(list=>list.map(a=>{
      const box=a.getBoundingClientRect();
      return {width:box.width,height:box.height,x:box.x,y:box.y};
    }));
    expect(items.every(x=>x.width>=65&&x.height>=85)).toBe(true);
    const first=items[0], fourth=items[3];
    expect(Math.abs(first.x-fourth.x)).toBeLessThan(3);
    const heroBefore=await page.locator('.hero-shell').boundingBox();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    const heroAfter=await page.locator('.hero-shell').boundingBox();
    expect(Math.abs(heroBefore.y-heroAfter.y)).toBeLessThanOrEqual(2);
    await toggle.click();
    await page.locator('.site-nav a[href="#/books"]').click();
    await expect.poll(()=>new URL(page.url()).hash).toBe('#/books');
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    if(width===390){
      await page.goto(url,{waitUntil:'networkidle'});
      await page.locator('#menu-toggle').click();
      await page.screenshot({path:'test-results/v517-390-illustrated-menu.png',fullPage:true});
    }
  }else{
    const navlink=page.locator('.site-nav a[data-world-icon="goods"]');
    await expect(navlink).toBeVisible();
    if(width===1440){
      await navlink.hover();
      const transform=await navlink.locator('.nav-icon-svg').evaluate(el=>getComputedStyle(el).transform);
      expect(transform).not.toBe('none');
      await page.screenshot({path:'test-results/v517-1440-icon-hover.png',fullPage:true});
    }
  }
  const stats=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-innerWidth,
    broken:[...document.images].filter(img=>img.getClientRects().length&&img.complete&&!img.naturalWidth).map(img=>img.src)
  }));
  expect(stats.overflow,'horizontal overflow at '+width).toBeLessThanOrEqual(2);
  expect(stats.broken).toEqual([]);
  expect(errors).toEqual([]);
  await page.close();
 });
}
test('V5.17 pressed icon responds and settles',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(url,{waitUntil:'networkidle'});
 await page.locator('#menu-toggle').click();
 const link=page.locator('.site-nav a[data-world-icon="games"]');
 await link.dispatchEvent('pointerdown');
 await expect(link).toHaveClass(/icon-pressed/);
 await expect.poll(()=>link.evaluate(el=>el.classList.contains('icon-pressed')),{timeout:3000}).toBe(false);
 await page.close();
});
test('V5.17 respects reduced motion',async({browser})=>{
 const page=await browser.newPage({viewport:{width:1440,height:844},reducedMotion:'reduce'});
 await page.goto(url,{waitUntil:'networkidle'});
 const icon=page.locator('.site-nav a[data-world-icon="goods"] .nav-icon-svg');
 await page.locator('.site-nav a[data-world-icon="goods"]').hover();
 const style=await icon.evaluate(el=>({transform:getComputedStyle(el).transform,transition:getComputedStyle(el).transitionDuration}));
 expect(style.transform).toBe('none');
 expect(style.transition.split(',').every(s=>s.trim()==='0s')).toBe(true);
 await page.close();
});
