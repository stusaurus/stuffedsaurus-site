const {test,expect,devices}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const actions=[
 {id:'laugh',dialogue:'フフフ'},
 {id:'shy',dialogue:'てれるゴン'},
 {id:'sorry',dialogue:'ごめんなさい'},
 {id:'surprised',dialogue:'ヒャー'},
 {id:'sprout',dialogue:'そだつのを'},
 {id:'greeting',dialogue:'よろしくゴン'}
];
for(const width of [320,390,768,1440]){
test('V5.32 6 Stegon-approved poses and dialogue on '+width+'px',async({browser})=>{
 const page=await browser.newPage({viewport:{width,height:844}});
 const errors=[];page.on('pageerror',x=>errors.push(x.message));
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v532-stegon');
 const img=card.locator('.character-art img'),speech=card.locator('.v527-speech');
 const tap=card.locator('.v527-art-touch');
 await expect(card).toHaveClass(/v532-ready/);
 await expect(card).toHaveAttribute('data-v532-stage','idle');
 await expect(img).toHaveAttribute('src',/greeting\.webp$/);
 let baseline=await img.boundingBox();
 for(let i=0;i<actions.length;i++){
   await tap.scrollIntoViewIfNeeded();
   await tap.click();
   await expect(img).toHaveAttribute('src',new RegExp(actions[i].id+'\\.webp$'));
   await expect(speech).toContainText(actions[i].dialogue);
   await expect(speech).toHaveAttribute('aria-live','polite');
   await expect(card).toHaveAttribute('data-v532-stage','react');
   await expect(img).toHaveCSS('animation-name','none');
   await expect(card).not.toHaveClass(/v532-pending/);
   if(i===0&&width===390)await page.screenshot({path:'test-results/v532-stegon-react-390.png',fullPage:true});
   await expect.poll(()=>card.getAttribute('data-v532-stage'),{timeout:3000}).toBe('idle');
   await expect(img).toHaveAttribute('src',/greeting\.webp$/);
   const box=await img.boundingBox();
   expect(Math.abs(box.width-baseline.width)).toBeLessThanOrEqual(1);
   expect(Math.abs(box.height-baseline.height)).toBeLessThanOrEqual(1);
 }
 if(width<=390){
   const art=await card.locator('.character-art').boundingBox();
   const bubble=await speech.boundingBox();
   expect(art.width).toBeGreaterThanOrEqual(250);
   expect(bubble.y).toBeGreaterThanOrEqual(art.y+art.height-2);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
 expect(errors).toEqual([]);
 if(width===390||width===1440)await page.screenshot({path:'test-results/v532-stegon-idle-'+width+'.png',fullPage:true,animations:'disabled'});
 await page.close();
});
}
test('V5.32 rapid multi taps preserve the pose before one queued response',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v532-stegon'),img=card.locator('img'),tap=card.locator('.v527-art-touch');
 await expect(card).toHaveClass(/v532-ready/);
 await tap.click();
 await expect(img).toHaveAttribute('src',/laugh\.webp$/);
 for(let i=0;i<6;i++)await tap.click({force:true});
 await expect(card).toHaveClass(/v532-pending/);
 await page.waitForTimeout(420);
 await expect(img).toHaveAttribute('src',/laugh\.webp$/);
 await expect.poll(()=>img.getAttribute('src'),{timeout:2400}).toMatch(/shy\.webp$/);
 await expect(card.locator('.v527-speech')).toContainText('てれるゴン');
 await expect.poll(()=>card.getAttribute('data-v532-stage'),{timeout:2400}).toBe('idle');
 await expect(img).toHaveAttribute('src',/greeting\.webp$/);
 await page.close();
});
test('V5.32 reduced-motion still shows individual expressions and keyboard works',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v532-stegon'),img=card.locator('img');
 await expect(card).toHaveClass(/v532-ready/);
 await card.locator('.v527-art-touch').focus();
 await page.keyboard.press('Enter');
 await expect(img).toHaveAttribute('src',/laugh\.webp$/);
 await expect(img).toHaveCSS('animation-name','none');
 await expect(card.locator('.v527-speech')).toContainText('フフフ');
 await page.waitForTimeout(480);
 await expect(img).toHaveAttribute('src',/laugh\.webp$/);
 await page.close();
});
test('V5.32 iPhone touch emulation and stable transparent assets',async({browser})=>{
 const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'no-preference'});
 const page=await context.newPage();
 const paths=['greeting','laugh','shy','sorry','surprised','sprout'];
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v532-stegon'),img=card.locator('img');
 await expect(card).toHaveClass(/v532-ready/);
 const highlight=await card.locator('.v527-art-touch').evaluate(el=>getComputedStyle(el).getPropertyValue('-webkit-tap-highlight-color'));
 expect(['transparent','rgba(0, 0, 0, 0)','rgb(0 0 0 / 0)']).toContain(highlight);
 for(const id of paths){
   const data=await page.evaluate(async id=>{
     const response=await fetch('reactions/stegon/'+id+'.webp');
     const img=new Image();img.src='reactions/stegon/'+id+'.webp';await img.decode();
     return {ok:response.ok,width:img.naturalWidth,height:img.naturalHeight,type:response.headers.get('content-type')};
   },id);
   expect(data.ok).toBe(true);
   expect(data.width).toBe(400);expect(data.height).toBe(320);
 }
 await card.locator('.v527-art-touch').tap();
 await expect(img).toHaveAttribute('src',/laugh\.webp$/);
 await page.waitForTimeout(360);
 await expect(img).toHaveAttribute('src',/laugh\.webp$/);
 await page.screenshot({path:'test-results/v532-stegon-ios-'+browser.browserType().name()+'.png',fullPage:true});
 await context.close();
});
test('V5.32 missing art retains a safe original image and dialogue',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/reactions/stegon/laugh.webp',route=>route.abort('failed'));
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v532-stegon');
 await expect(card).toHaveClass(/v532-ready/);
 await card.locator('.v527-art-touch').click();
 await expect(card.locator('.v527-speech')).toContainText('フフフ');
 await expect(card.locator('img')).toHaveAttribute('src',/greeting\.webp$/);
 await page.close();
});
test('V5.32 Tiranon V5.31 and Pteran are not modified; homepage and catalog still work',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const t=page.locator('.v531-director'),p=page.locator('.v528-puteran');
 await expect(t).toHaveCount(1);await expect(p).toHaveCount(1);
 await t.locator('.v527-art-touch').click();
 await expect(t.locator('img')).toHaveAttribute('src',/hooray\.webp$/);
 const ps=await p.locator('img').getAttribute('src');
 await p.locator('.v527-art-touch').click();
 await expect(p.locator('img')).toHaveAttribute('src',ps);
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-welcome-title')).toBeVisible();
 await page.goto(base+'#/catalog/stegon',{waitUntil:'networkidle'});
 await expect(page.locator('#catalog-name')).toHaveText('ステゴン');
 await page.close();
});