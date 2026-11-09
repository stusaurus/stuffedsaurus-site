const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const characters=[
  {id:'tiranon',name:'ティラノン',motion:'v527-tiranon-hop'},
  {id:'stegon',name:'ステゴン',motion:'v527-stegon-sway'},
  {id:'puteran',name:'プテラン',motion:'v527-puteran-pose'}
];
for(const width of [320,360,390,430,768,1024,1440]){
  test('V5.27 responsive speech and one-shot character reaction '+width+'px',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'#/friends',{waitUntil:'networkidle'});
    const cards=page.locator('#view-friends .friend-feature-list > .v527-chat');
    await expect(cards).toHaveCount(3);
    for(let i=0;i<characters.length;i++){
      const who=characters[i],card=cards.nth(i);
      await expect(card.locator('h2')).toHaveText(who.name);
      const speech=card.locator('.v527-speech');
      const button=card.locator('.friend-discovery-button');
      const artButton=card.locator('button.v527-art-touch');
      const image=card.locator('.character-art img');
      await expect(speech).toBeVisible();
      await expect(speech).toContainText('「');
      await expect(button).toHaveAttribute('aria-expanded','true');
      await expect(artButton).toHaveAttribute('aria-controls','friend-discovery-response-'+who.id);
      await expect(artButton).toHaveAttribute('aria-label',who.name+'に はなしかける');
      await expect(card.locator('.v527-art-hint')).toContainText('タッチしてね');
      const initialText=await speech.innerText();
      await artButton.scrollIntoViewIfNeeded();
      await artButton.click();
      await expect(speech).not.toHaveText(initialText);
      await expect(button).toHaveText('もうひとこと！');
      const animation=await image.evaluate(el=>getComputedStyle(el).animationName);
      expect([who.motion,'none']).toContain(animation);
      await expect.poll(async()=>image.evaluate(el=>el.classList.contains('v527-react')),{timeout:2000}).toBe(false);
      const first=await speech.innerText();
      await button.click();
      await expect(speech).not.toHaveText(first);
      const second=await speech.innerText();
      await artButton.click();
      await expect(speech).not.toHaveText(second);
      await expect(card.locator('a.text-action')).toHaveAttribute('href','#/catalog/'+who.id);
      const visual=await image.evaluate(img=>({
        loaded:img.complete&&img.naturalWidth>0,
        fit:getComputedStyle(img).objectFit,
        transform:getComputedStyle(img).transform,
        width:img.getBoundingClientRect().width
      }));
      expect(visual.loaded).toBe(true);
      expect(visual.fit).toBe('contain');
      expect(visual.width).toBeGreaterThan(70);
    }
    const pageStats=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth-innerWidth,
      activeAnimations:document.getAnimations().filter(x=>x.playState==='running').length
    }));
    expect(pageStats.overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
    if(width===390||width===1440){
      await page.screenshot({path:'test-results/v527-dialogue-'+width+'.png',fullPage:true,animations:'disabled'});
    }
    await page.close();
  });
}
test('V5.27 motion is a short, physical movement of entire character image',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  for(const item of characters){
    const card=page.locator('.v527-'+item.id);
    const moved=await card.evaluate(async card=>{
      const img=card.querySelector('.character-art img');
      const touch=card.querySelector('.v527-art-touch');
      const before=getComputedStyle(img).transform;
      touch.click();
      await new Promise(resolve=>setTimeout(resolve,170));
      const during=getComputedStyle(img).transform;
      await new Promise(resolve=>setTimeout(resolve,620));
      const after=getComputedStyle(img).transform;
      return {before,during,after};
    });
    expect(moved.during).not.toBe(moved.before);
    expect(moved.after).toBe(moved.before);
  }
  await page.close();
});
test('V5.27 reduced motion still speaks and preserves static artwork',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  const card=page.locator('.v527-tiranon');
  const speech=card.locator('.v527-speech');
  const before=await speech.innerText();
  const art=card.locator('.v527-art-touch');
  await art.focus();
  await expect(art).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(speech).not.toHaveText(before);
  await expect(card.locator('.character-art img')).not.toHaveClass(/v527-react/);
  await expect(card.locator('img')).toHaveCSS('animation-name','none');
  await page.close();
});
test('V5.27 preserves homepage, catalog and true Instagram reel thumbnails',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'#/home',{waitUntil:'networkidle'});
  await expect(page.locator('#home-welcome-title')).toBeVisible();
  await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
  await page.goto(base+'#/catalog/stegon',{waitUntil:'networkidle'});
  await expect(page.locator('#catalog-name')).toHaveText('ステゴン');
  await expect(page.locator('.character-extra-v526 .character-extra-fact')).toHaveCount(3);
  await page.goto(base+'#/sns',{waitUntil:'networkidle'});
  await expect(page.locator('.instagram-recent-v524 .instagram-recent-card')).toHaveCount(3);
  await page.close();
});