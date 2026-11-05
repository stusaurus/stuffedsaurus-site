const {test,expect}=require('@playwright/test');
const widths=[320,360,375,390,430,768,1024,1440];
for(const width of widths){
  test('V5.14 responsive width '+width,async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8765/preview-v514/',{waitUntil:'networkidle'});
    await expect(page.locator('body')).toBeVisible();
    const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    expect(geometry.scroll,'horizontal overflow at '+width).toBeLessThanOrEqual(geometry.viewport+2);
    expect(errors,'JS errors').toEqual([]);
    if(width===390){
      await page.screenshot({path:'test-results/v514-390-home.png',fullPage:true});
      await page.goto('http://127.0.0.1:8765/preview-v513/',{waitUntil:'networkidle'});
      await page.screenshot({path:'test-results/v513-390-home.png',fullPage:true});
    }
    await page.close();
  });
}


test('V5.14 mobile routes and images',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['home','manga','friends','catalog','news']){
    await page.goto('http://127.0.0.1:8765/preview-v514/#/'+route,{waitUntil:'networkidle'});
    await expect(page.locator('body')).toBeVisible();
    const result=await page.evaluate(()=>({
      scroll:document.documentElement.scrollWidth,
      viewport:innerWidth,
      broken:[...document.images].filter(img=>img.getClientRects().length && img.complete && img.naturalWidth===0).map(img=>img.src)
    }));
    expect(result.scroll,'horizontal overflow: '+route).toBeLessThanOrEqual(result.viewport+2);
    expect(result.broken,'broken images: '+route).toEqual([]);
    await page.screenshot({path:'test-results/v514-390-'+route+'.png',fullPage:true});
  }
  expect(errors).toEqual([]);
  await page.close();
});


test('V5.14 home links reach storybook sections',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:8765/preview-v514/',{waitUntil:'networkidle'});
 const targets=['manga','friends','catalog'];
 for(const route of targets){
   const links=page.locator('a[href="#/'+route+'"],a[href^="#/'+route+'/"]');
   const count=await links.count();
   expect(count,'missing navigation link for '+route).toBeGreaterThan(0);
   const link=links.filter({visible:true}).first();
   await expect(link).toBeVisible();
   await link.click();
   await expect.poll(()=>new URL(page.url()).hash).toMatch(new RegExp('^#/'+route+'(?:/|$)'));
   await expect(page.locator('body')).toBeVisible();
   await page.goto('http://127.0.0.1:8765/preview-v514/',{waitUntil:'networkidle'});
 }
 await page.close();
});


test('V5.14 mobile menu is operable and closes after navigation',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:8765/preview-v514/',{waitUntil:'networkidle'});
 const toggle=page.locator('#menu-toggle');
 await expect(toggle).toBeVisible();
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 const menu=page.locator('.site-nav');
 await expect(menu).toBeVisible();
 const target=menu.locator('a[href="#/catalog"]');
 await expect(target).toBeVisible();
 await target.click();
 await expect.poll(()=>new URL(page.url()).hash).toBe('#/catalog');
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 await page.close();
});
