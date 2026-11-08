const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const names=['ティラノン','ステゴン','プテラン'];
const ids=['tiranon','stegon','puteran'];

for(const width of [320,390,768,1440]){
  test('V5.26 character discovery is usable at '+width+'px',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'#/friends',{waitUntil:'networkidle'});
    await expect(page.locator('#view-friends')).toBeVisible();
    const cards=page.locator('#view-friends .friend-feature-list .character-story');
    await expect(cards).toHaveCount(3);
    await expect(page.locator('#view-friends .friend-discovery-button')).toHaveCount(3);
    for(let i=0;i<3;i++){
      const card=cards.nth(i);
      await expect(card.locator('.character-copy h2')).toHaveText(names[i]);
      const btn=card.locator('.friend-discovery-button');
      const answer=card.locator('.friend-discovery-response');
      await expect(answer).toBeHidden();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await expect(answer).toBeVisible();
      await expect(answer).not.toBeEmpty();
      await expect(btn).toHaveAttribute('aria-expanded','true');
      const first=await answer.textContent();
      await btn.click();
      const second=await answer.textContent();
      expect(first).not.toBe(second);
      await expect(card.locator('.character-copy a.text-action')).toHaveAttribute('href','#/catalog/'+ids[i]);
      const image=card.locator('img');
      expect(await image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    }
    // The page cannot imply the website has not been published.
    await expect(page.locator('.site-footer .footer-disclaimer')).toHaveText('© StuffedSaurus');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
    if(width===390||width===1440){
      await page.screenshot({path:'test-results/v526-friends-'+width+'.png',fullPage:true});
    }
    await page.close();
  });
  test('V5.26 catalog keeps real facts and avoids editorial placeholders at '+width+'px',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    for(let i=0;i<ids.length;i++){
      await page.goto(base+'#/catalog/'+ids[i],{waitUntil:'networkidle'});
      await expect(page.locator('#catalog-name')).toHaveText(names[i]);
      const facts=page.locator('.character-extra-v526 .character-extra-fact');
      await expect(facts).toHaveCount(3);
      await expect(page.locator('.character-extra-v526')).toBeVisible();
      const img=page.locator('#catalog-character-img');
      expect(await img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
      const catalogText=await page.locator('#catalog-spread').innerText();
      expect(catalogText).not.toContain('未確認');
      if(ids[i]==='tiranon'){
        expect(catalogText).toContain('10がつ4にち');
        expect(catalogText).toContain('マモトン');
      }
      if(ids[i]==='stegon')expect(catalogText).toContain('6にんきょうだい');
      if(ids[i]==='puteran'){
        await expect(page.locator('#catalog-likes')).toHaveText('ちょっとキザで、ともだち思い');
        const label=await page.locator('#catalog-likes').evaluate(el=>el.previousElementSibling.textContent);
        expect(label).toBe('どんな子？');
      }
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      expect(overflow).toBeLessThanOrEqual(2);
      if(width===390&&ids[i]==='puteran'){
        await page.screenshot({path:'test-results/v526-catalog-390.png',fullPage:true});
      }
    }
    expect(errors).toEqual([]);
    await page.close();
  });
}
test('V5.26 retains V5.25 homepage and V5.24 actual Reel covers',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+'#/home',{waitUntil:'networkidle'});
  await expect(page.locator('#home-welcome-title')).toBeVisible();
  await expect(page.locator('#home-friends .friend-chat-button')).toBeVisible();
  await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
  await page.locator('.home-welcome-secondary').click();
  await expect(page.locator('#view-sns .instagram-recent-v524 .instagram-recent-card')).toHaveCount(3);
  await page.close();
});
test('V5.26 keyboard activation works; no automatic art motion',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  const button=page.locator('.friend-discovery-button').first();
  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.friend-discovery-response').first()).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(button).toHaveText('もうひとこと きく');
  await page.close();
});