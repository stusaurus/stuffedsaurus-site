const {test,expect}=require('@playwright/test');
const root='http://127.0.0.1:8765/';
const sizes=[320,360,390,430,768,770,1024,1440];
const navigation=['home','manga','friends','catalog','sns','games','books','goods','news'];
const profiles=['#/catalog/tiranon','#/catalog/stegon','#/catalog/puteran'];
const speakers=['ティラノン','ステゴン','プテラン'];
for(const width of sizes){
 test('V5.19 character voice and home layout at '+width,async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(root,{waitUntil:'networkidle'});
  await expect(page.locator('link[href="v519.css"]')).toHaveCount(1);
  await expect(page.locator('script[src="v519.js"]')).toHaveCount(1);
  const homeOrder=await page.locator('.home-sections').evaluate(el=>
   [...el.children].filter(node=>['home-manga','home-updates','home-friends'].includes(node.id)).map(node=>node.id));
  expect(homeOrder).toEqual(['home-manga','home-updates','home-friends']);
  const menuOrder=await page.locator('.site-nav a.illustrated-nav').evaluateAll(links=>links.map(a=>a.dataset.worldIcon));
  expect(menuOrder).toEqual(navigation);
  const links=page.locator('#home-friends .friend-grid a.friend');
  await expect(links).toHaveCount(3);
  for(let i=0;i<3;i++)await expect(links.nth(i)).toHaveAttribute('href',profiles[i]);
  const button=page.locator('#home-friends .friend-chat-button');
  const voice=page.locator('#home-friend-voice');
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded','false');
  await expect(voice).toBeHidden();
  for(let i=0;i<3;i++){
   await button.click();
   await expect(voice).toBeVisible();
   await expect(voice.locator('.friend-voice-name')).toHaveText(speakers[i]);
   await expect(links.nth(i)).toHaveClass(/friend-speaking/);
   await expect(button).toHaveAttribute('aria-expanded','true');
   const speaking=await links.evaluateAll(items=>items.filter(item=>item.classList.contains('friend-speaking')).length);
   expect(speaking).toBe(1);
  }
  if(width===390||width===1440){
   const skipState=await page.evaluate(()=>{
    const a=[...document.querySelectorAll('a')].find(el=>el.textContent?.includes('本文へスキップ'));
    if(!a)return null;
    const s=getComputedStyle(a),b=a.getBoundingClientRect(),p=document.activeElement;
    return {selector:a.className,position:s.position,display:s.display,visibility:s.visibility,opacity:s.opacity,top:s.top,left:s.left,rect:{x:b.x,y:b.y,width:b.width,height:b.height},focused:p===a,activeTag:p?.tagName,activeClass:p?.className,scrollY};
   });
   console.log('SKIP_LINK_DIAGNOSTIC',width,JSON.stringify(skipState));
   await page.screenshot({path:'test-results/v519-character-talk-'+width+'.png',fullPage:true});
  }
  const state=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   broken:[...document.images].filter(img=>img.getClientRects().length&&img.complete&&!img.naturalWidth).map(img=>img.src)
  }));
  expect(state.overflow).toBeLessThanOrEqual(2);
  expect(state.broken).toEqual([]);
  expect(errors).toEqual([]);
  await page.close();
 });
}
test('V5.19 keyboard access and truthful character routes',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(root,{waitUntil:'networkidle'});
 const button=page.locator('#home-friends .friend-chat-button');
 await button.focus();
 await expect(button).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#home-friend-voice .friend-voice-name')).toHaveText('ティラノン');
 await expect(button).toBeFocused();
 await page.locator('#home-friends .friend-grid a.friend').nth(1).click();
 await expect.poll(()=>new URL(page.url()).hash).toBe('#/catalog/stegon');
 await page.close();
});
test('V5.19 reduced-motion mode does not animate voice',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(root,{waitUntil:'networkidle'});
 await page.locator('#home-friends .friend-chat-button').click();
 const voice=page.locator('#home-friend-voice');
 await expect(voice).toBeVisible();
 await expect(voice).not.toHaveClass(/friend-voice-pop/);
 await page.close();
});
