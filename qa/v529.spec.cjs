const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const ordered=['hooray','shy_giggle','happy_run','sitting_laugh','wave_both'];
const assets=['wave_both','shy_giggle','happy_run','sitting_laugh','hooray'];
for(const width of [320,360,390,430,768,1024,1440]){
  test('V5.29 adopted frames are stable and accessible at '+width+'px',async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'#/friends',{waitUntil:'networkidle'});
    const card=page.locator('.v529-tiranon');
    const img=card.locator('.character-art img');
    const button=card.locator('.friend-discovery-button');
    const art=card.locator('button.v527-art-touch');
    const response=card.locator('.v527-speech');
    await expect(card).toHaveClass(/v529-ready/);
    await expect(img).toHaveAttribute('src',/wave_both\.webp/);
    const dimensions=await img.evaluate(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height,complete:x.complete,naturalWidth:x.naturalWidth}));
    expect(dimensions.complete&&dimensions.naturalWidth===224).toBe(true);
    if(width<=430){
      const artBounds=await card.locator('.character-art').boundingBox();
      const bubbleBounds=await response.boundingBox();
      expect(dimensions.width).toBeGreaterThanOrEqual(190);
      expect(bubbleBounds.y).toBeGreaterThanOrEqual(artBounds.y+artBounds.height-2);
    }
    for(let i=0;i<ordered.length;i++){
      const oldText=await response.innerText();
      await art.scrollIntoViewIfNeeded();
      await art.click();
      await expect(img).toHaveAttribute('src',new RegExp(ordered[i]+'\\.webp$'));
      await expect(response).not.toHaveText(oldText);
      await expect(button).toHaveAttribute('aria-expanded','true');
      if(i===0 && width===390)await page.screenshot({path:'test-results/v529-first-reaction-390.png',fullPage:true});
      await expect.poll(()=>img.getAttribute('src'),{timeout:2400}).toMatch(/wave_both\.webp$/);
      await expect(card).not.toHaveClass(/v529-speaking/);
      const after=await img.evaluate(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}));
      expect(Math.abs(after.width-dimensions.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(after.height-dimensions.height)).toBeLessThanOrEqual(1);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
    if(width===390||width===1440)await page.screenshot({path:'test-results/v529-idle-'+width+'.png',fullPage:true,animations:'disabled'});
    await page.close();
  });
}
test('V5.29 all approved image URLs resolve and preload',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 for(const asset of assets){
   const result=await page.evaluate(async name=>{
     const path='reactions/tiranon/'+name+'.webp';
     const img=new Image();img.src=path;
     await img.decode();
     const response=await fetch(path);
     const data=await response.arrayBuffer();
     return {width:img.naturalWidth,height:img.naturalHeight,ok:response.ok,bytes:data.byteLength};
   },asset);
   expect(result.width).toBe(224);expect(result.height).toBe(280);
   expect(result.ok).toBe(true);expect(result.bytes).toBeGreaterThan(1000);
 }
 await page.close();
});
test('V5.29 rapid re-taps never leave the image stuck or create a loop',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 await expect(page.locator('.v529-tiranon')).toHaveClass(/v529-ready/);
 for(let i=0;i<9;i++)await page.locator('.v529-tiranon .v527-art-touch').click({force:true});
 await expect.poll(()=>page.locator('.v529-tiranon .character-art img').getAttribute('src'),{timeout:2400}).toMatch(/wave_both\.webp$/);
 await expect(page.locator('.v529-tiranon')).not.toHaveClass(/v529-speaking/);
 await page.close();
});
test('V5.29 reduced motion: speech works but portrait stays still',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 await expect(page.locator('.v529-tiranon')).toHaveClass(/v529-ready/);
 const card=page.locator('.v529-tiranon'),img=card.locator('img');
 const before=await card.locator('.v527-speech').innerText();
 await card.locator('.v527-art-touch').focus();await page.keyboard.press('Enter');
 await expect(card.locator('.v527-speech')).not.toHaveText(before);
 await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
 await expect(img).toHaveCSS('animation-name','none');
 await page.close();
});
test('V5.29 leaves Stegon, Pteran and homepage features intact',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 await expect(page.locator('.v527-chat')).toHaveCount(3);
 await expect(page.locator('.v529-tiranon')).toHaveCount(1);
 for(const id of ['stegon','puteran']){
   const card=page.locator('.v528-'+id);
   const original=await card.locator('.character-art img').getAttribute('src');
   await card.locator('.v527-art-touch').click();
   await expect(card.locator('.character-art img')).toHaveAttribute('src',original);
 }
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-welcome-title')).toBeVisible();
 await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
 await page.goto(base+'#/catalog/tiranon',{waitUntil:'networkidle'});
 await expect(page.locator('#catalog-name')).toHaveText('ティラノン');
 await page.close();
});