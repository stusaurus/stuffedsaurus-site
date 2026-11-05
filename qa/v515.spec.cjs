const {test,expect}=require('@playwright/test');
for(const width of [320,360,390,430,768,1024,1440]){
 test('V5.15 editorial layout '+width,async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/preview-v515/',{waitUntil:'networkidle'});
  const result=await page.evaluate(()=>{
   const ids=['home-manga','home-friends','home-updates'];
   const nodes=ids.map(id=>document.getElementById(id));
   return {overflow:document.documentElement.scrollWidth-innerWidth,
    rects:nodes.map(n=>{if(!n)return null;const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}),
    broken:[...document.images].filter(i=>i.getClientRects().length&&i.complete&&!i.naturalWidth).map(i=>i.src)};
  });
  expect(result.overflow).toBeLessThanOrEqual(2);
  expect(result.rects.every(Boolean)).toBe(true);
  expect(result.broken).toEqual([]);
  expect(errors).toEqual([]);
  const [manga,friends,updates]=result.rects;
  if(width>=770){
   expect(manga.x).toBeLessThan(friends.x);
   expect(friends.y).toBeLessThan(updates.y);
  }else{
   expect(manga.y).toBeLessThan(friends.y);
   expect(friends.y).toBeLessThan(updates.y);
  }
  if([390,1440].includes(width))await page.screenshot({path:'test-results/v515-'+width+'.png',fullPage:true});
  await page.close();
 });
}

test('V5.15 mobile story navigation and menu',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/preview-v515/',{waitUntil:'networkidle'});
 for(const route of ['manga','friends','catalog']){
  const link=page.locator('a[href="#/'+route+'"],a[href^="#/'+route+'/"]').filter({visible:true}).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect.poll(()=>new URL(page.url()).hash).toMatch(new RegExp('^#/'+route+'(?:/|$)'));
  await page.goto('http://127.0.0.1:8765/preview-v515/',{waitUntil:'networkidle'});
 }
 const toggle=page.locator('#menu-toggle');
 await expect(toggle).toBeVisible();
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await page.locator('.site-nav a[href="#/catalog"]').click();
 await expect.poll(()=>new URL(page.url()).hash).toBe('#/catalog');
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 expect(errors).toEqual([]);
 await page.close();
});
