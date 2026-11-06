const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const viewports=[320,360,390,430,768,770,1024,1440];
const expectedMenu=['home','manga','friends','catalog','sns','games','books','goods','news'];
for(const width of viewports){
 test('V5.18 homepage section order '+width,async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await expect(page.locator('link[href="v518.css"]')).toHaveCount(1);
  await expect(page.locator('script[src="v518.js"]')).toHaveCount(1);
  const result=await page.evaluate(()=>{
   const home=document.querySelector('.home-sections');
   const names=[...home.children].filter(el=>['home-manga','home-updates','home-friends'].includes(el.id)).map(el=>el.id);
   const boxes=Object.fromEntries(['home-manga','home-updates','home-friends'].map(id=>{
     const r=document.getElementById(id).getBoundingClientRect();
     return [id,{x:r.x,y:r.y,width:r.width,height:r.height}];
   }));
   const menu=[...document.querySelectorAll('.site-nav a.illustrated-nav')].map(a=>a.dataset.worldIcon);
   const broken=[...document.images].filter(i=>i.getClientRects().length&&i.complete&&!i.naturalWidth).map(i=>i.src);
   return {names,boxes,menu,broken,overflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(result.names).toEqual(['home-manga','home-updates','home-friends']);
  expect(result.menu).toEqual(expectedMenu);
  expect(result.overflow).toBeLessThanOrEqual(2);
  expect(result.broken).toEqual([]);
  expect(errors).toEqual([]);
  const {['home-manga']:manga,['home-updates']:news,['home-friends']:friends}=result.boxes;
  if(width>=770){
   expect(manga.x).toBeLessThan(news.x);
   expect(Math.abs(manga.y-news.y)).toBeLessThanOrEqual(3);
   expect(friends.y).toBeGreaterThan(news.y);
  } else {
   expect(manga.y).toBeLessThan(news.y);
   expect(news.y).toBeLessThan(friends.y);
  }
  if(width===390||width===1440)await page.screenshot({path:'test-results/v518-home-'+width+'.png',fullPage:true});
  if(width===390){
   const toggle=page.locator('#menu-toggle');
   await toggle.click();
   const navLabels=await page.locator('.site-nav a.illustrated-nav').evaluateAll(links=>links.map(a=>a.dataset.worldIcon));
   expect(navLabels).toEqual(expectedMenu);
   await page.locator('.site-nav a[href="#/friends"]').click();
   await expect.poll(()=>new URL(page.url()).hash).toBe('#/friends');
  }
  await page.close();
 });
}
