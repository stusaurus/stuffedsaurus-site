const {test,expect,devices}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const poses=['hooray','shy_giggle','happy_run','sitting_laugh','wave_both'];
for(const width of [320,360,390,430,768,1024,1440]){
test('V5.31 instant pose, one dialogue and stable size at '+width+'px',async({browser})=>{
 const page=await browser.newPage({viewport:{width,height:844}});
 const exceptions=[];page.on('pageerror',e=>exceptions.push(e.message));
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v531-director'),image=card.locator('.character-art img');
 const art=card.locator('.v527-art-touch'),bubble=card.locator('.v527-speech');
 await expect(card).toHaveClass(/v531-ready/);
 await expect(image).toHaveAttribute('src',/wave_both\.webp$/);
 const size=await image.boundingBox();
 const original=await bubble.innerText();
 await art.scrollIntoViewIfNeeded();
 await art.click();
 await expect(image).toHaveAttribute('src',/hooray\.webp$/);
 await expect(card).toHaveAttribute('data-v531-stage','react');
 await expect(bubble).not.toHaveText(original);
 await expect(bubble).toContainText('やったー');
 await expect(card).not.toHaveClass(/v529-speaking/);
 await expect(page.locator('.v531-director .character-art img')).toHaveCount(1);
 if(width===390)await page.screenshot({path:'test-results/v531-iphone-reaction-390.png',fullPage:true});
 await page.waitForTimeout(530);
 await expect(image).toHaveAttribute('src',/hooray\.webp$/);
 await expect.poll(()=>card.getAttribute('data-v531-stage'),{timeout:2000}).toBe('idle');
 await expect(image).toHaveAttribute('src',/wave_both\.webp$/);
 const after=await image.boundingBox();
 expect(Math.abs(size.width-after.width)).toBeLessThanOrEqual(1);
 expect(Math.abs(size.height-after.height)).toBeLessThanOrEqual(1);
 if(width<=430){
   const bubbleBounds=await bubble.boundingBox();
   const pictureBounds=await card.locator('.character-art').boundingBox();
   expect(size.width).toBeGreaterThanOrEqual(190);
   expect(bubbleBounds.y).toBeGreaterThanOrEqual(pictureBounds.y+pictureBounds.height-2);
   // The action button is before the bio so mobile viewers see it sooner.
   const order=await card.evaluate(x=>{
     const copy=x.querySelector('.character-copy');
     const block=copy.querySelector('.friend-discovery-v526');
     const speech=copy.querySelector('.v527-speech');
     return speech.compareDocumentPosition(block)&Node.DOCUMENT_POSITION_FOLLOWING;
   });
   expect(order).toBeTruthy();
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
 expect(exceptions).toEqual([]);
 await page.close();
});
}
test('V5.31 rapid tap burst: never cancel the first readable pose, coalesce to one queued beat',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const c=page.locator('.v531-director'),img=c.locator('img'),touch=c.locator('.v527-art-touch');
 await expect(c).toHaveClass(/v531-ready/);
 await touch.click();
 await expect(img).toHaveAttribute('src',/hooray\.webp$/);
 for(let i=0;i<8;i++)await touch.click({force:true});
 await expect(c).toHaveClass(/v531-pending/);
 await page.waitForTimeout(300);
 await expect(img).toHaveAttribute('src',/hooray\.webp$/);
 await expect.poll(()=>img.getAttribute('src'),{timeout:2200}).toMatch(/shy_giggle\.webp$/);
 await expect(c.locator('.v527-speech')).toContainText('てれちゃう');
 await expect.poll(()=>c.getAttribute('data-v531-stage'),{timeout:2500}).toBe('idle');
 await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
 await page.waitForTimeout(250);
 await expect(c).not.toHaveClass(/v531-active|v531-pending/);
 await page.close();
});
test('V5.31 reduces motion, but still swaps an approved still for the full hold',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const c=page.locator('.v531-director'),img=c.locator('img');
 await expect(c).toHaveClass(/v531-ready/);
 await c.locator('.v527-art-touch').focus();await page.keyboard.press('Enter');
 await expect(img).toHaveAttribute('src',/hooray\.webp$/);
 await expect(img).toHaveCSS('animation-name','none');
 await expect(c).toHaveAttribute('data-v531-stage','react');
 await expect(c.locator('.v527-speech')).toHaveAttribute('aria-live','polite');
 await page.waitForTimeout(530);
 await expect(img).toHaveAttribute('src',/hooray\.webp$/);
 await expect.poll(()=>c.getAttribute('data-v531-stage'),{timeout:2000}).toBe('idle');
 await page.close();
});
test('V5.31 iPhone-like touch emulation: no grey native tap highlight and visible pose',async({browser})=>{
 const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'no-preference'});
 const page=await context.newPage();
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const c=page.locator('.v531-director'),tap=c.locator('.v527-art-touch'),img=c.locator('img');
 await expect(c).toHaveClass(/v531-ready/);
 const highlight=await tap.evaluate(el=>getComputedStyle(el).getPropertyValue('-webkit-tap-highlight-color'));
 expect(['transparent','rgba(0, 0, 0, 0)','rgb(0 0 0 / 0)']).toContain(highlight);
 await tap.tap();
 await expect(img).toHaveAttribute('src',/hooray\.webp$/);
 await expect(c.locator('.v527-speech')).toContainText('やったー');
 await page.waitForTimeout(330);
 await expect(img).toHaveAttribute('src',/hooray\.webp$/);
 await page.screenshot({path:'test-results/v531-ios-emulated-'+browser.browserType().name()+'.png',fullPage:true});
 await context.close();
});
test('V5.31 if action file unavailable, still talk and remain unbroken',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/reactions/tiranon/hooray.webp',route=>route.abort());
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const c=page.locator('.v531-director');
 await expect(c).toHaveClass(/v531-ready/);
 await c.locator('.v527-art-touch').click();
 await expect(c.locator('.v527-speech')).toContainText('やったー');
 await expect(c.locator('img')).toHaveAttribute('src',/wave_both\.webp$/);
 await expect(c).toHaveAttribute('data-v531-stage','idle');
 await page.close();
});
test('V5.31 preserves Stegon, Pteran, home, reels and catalog',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 await expect(page.locator('.v527-chat')).toHaveCount(3);
 await expect(page.locator('.v531-director')).toHaveCount(1);
 for(const id of ['stegon','puteran']){
   const c=page.locator('.v528-'+id);
   await expect(c).not.toHaveClass(/v531-director/);
   const before=await c.locator('.character-art img').getAttribute('src');
   await c.locator('.v527-art-touch').click();
   await expect(c.locator('.character-art img')).toHaveAttribute('src',before);
 }
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-welcome-title')).toBeVisible();
 await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
 await page.goto(base+'#/catalog/tiranon',{waitUntil:'networkidle'});
 await expect(page.locator('#catalog-name')).toHaveText('ティラノン');
 await page.close();
});