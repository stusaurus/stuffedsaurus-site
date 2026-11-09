const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const characters=[
  {id:'tiranon',name:'ティラノン',motion:'v528-tiranon-hello',mark:'✧'},
  {id:'stegon',name:'ステゴン',motion:'v528-stegon-hello',mark:'♡'},
  {id:'puteran',name:'プテラン',motion:'v528-puteran-hello',mark:'✦'}
];
for(const width of [320,360,390,430,768,1024,1440]){
  test('V5.28: personality-specific motion at '+width+'px without layout shift',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'#/friends',{waitUntil:'networkidle'});
    await expect(page.locator('#view-friends .v528-expressive')).toHaveCount(3);
    for(const {id,name,motion,mark} of characters){
      const card=page.locator('.v528-'+id);
      const touch=card.locator('button.v527-art-touch');
      const image=card.locator('.character-art img');
      const speech=card.locator('.v527-speech');
      const emoji=card.locator('.v528-emotion');
      await expect(card.locator('h2')).toHaveText(name);
      await expect(emoji).toHaveText(mark);
      await expect(emoji).toHaveAttribute('aria-hidden','true');
      const originalText=await speech.innerText();
      await touch.scrollIntoViewIfNeeded();
      await expect(image).toHaveCSS('animation-name','none');
      await touch.click();
      await expect(speech).not.toHaveText(originalText);
      await expect(image).toHaveCSS('animation-name',motion);
      await expect(emoji).toHaveCSS('animation-name','v528-emotion-pop');
      await expect.poll(()=>image.evaluate(el=>el.classList.contains('v528-react')),{timeout:3000}).toBe(false);
      await expect(image).toHaveCSS('animation-name','none');
      const first=await speech.innerText();
      await card.locator('.friend-discovery-button').click();
      await expect(speech).not.toHaveText(first);
      // Keyboard input is still an accessible alternative to direct touch.
      await touch.focus();
      await page.keyboard.press('Enter');
      await expect(speech).not.toBeEmpty();
      await expect(card.locator('.character-art img')).toHaveJSProperty('complete',true);
      await expect(card.locator('.friend-discovery-button')).toHaveAttribute('aria-expanded','true');
      await expect(card.locator('a.text-action')).toHaveAttribute('href','#/catalog/'+id);
    }
    const stats=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-window.innerWidth}));
    expect(stats.overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
    if(width===390||width===1440)await page.screenshot({path:'test-results/v528-friends-'+width+'.png',fullPage:true,animations:'disabled'});
    await page.close();
  });
}
test('V5.28 movement is whole-image translation/rotation with anticipation and a stable ending',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  for(const {id} of characters){
    const animation=await page.locator('.v528-'+id).evaluate(async article=>{
      const img=article.querySelector('.character-art img');
      const before=getComputedStyle(img).transform;
      article.querySelector('.v527-art-touch').click();
      await new Promise(r=>setTimeout(r,320));
      const during=getComputedStyle(img).transform;
      await new Promise(r=>setTimeout(r,850));
      const after=getComputedStyle(img).transform;
      return {before,during,after,src:img.currentSrc,
        loaded:img.complete&&img.naturalWidth>0,fit:getComputedStyle(img).objectFit};
    });
    expect(animation.loaded).toBe(true);
    expect(animation.fit).toBe('contain');
    expect(animation.during).not.toBe(animation.before);
    expect(animation.after).toBe(animation.before);
  }
  await page.close();
});
test('V5.28: rapid repeat taps retrigger exactly one gesture and do not leave motion running',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  const card=page.locator('.v528-tiranon');
  for(let i=0;i<5;i++){
    await card.locator('.v527-art-touch').click({force:true});
  }
  await expect.poll(()=>card.locator('img.v528-react').count(),{timeout:3000}).toBe(0);
  await expect(card.locator('.v528-emotion')).toHaveCSS('opacity','0');
  await page.close();
});
test('V5.28: reduced motion and keyboard still allow the full dialogue',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  for(const {id} of characters){
    const card=page.locator('.v528-'+id);
    const touch=card.locator('.v527-art-touch');
    const before=await card.locator('.v527-speech').innerText();
    await touch.focus();
    await page.keyboard.press('Enter');
    await expect(card.locator('.v527-speech')).not.toHaveText(before);
    await expect(card.locator('img')).toHaveCSS('animation-name','none');
    await expect(card.locator('.v528-emotion')).toHaveCSS('animation-name','none');
  }
  await page.close();
});
test('V5.28: homepage and Instagram cards remain unchanged',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'#/home',{waitUntil:'networkidle'});
  await expect(page.locator('#home-welcome-title')).toBeVisible();
  await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
  await page.goto(base+'#/catalog/puteran',{waitUntil:'networkidle'});
  await expect(page.locator('#catalog-name')).toHaveText('プテラン');
  await page.goto(base+'#/sns',{waitUntil:'networkidle'});
  await expect(page.locator('.instagram-recent-v524 .instagram-recent-card')).toHaveCount(3);
  await page.close();
});
