const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const poses=[
  {id:'hooray', animation:'v530-hooray'},
  {id:'shy_giggle', animation:'v530-shy'},
  {id:'happy_run', animation:'v530-run'},
  {id:'sitting_laugh', animation:'v530-laugh'},
  {id:'wave_both', animation:'v530-wave'}
];
for(const width of [320,360,390,430,768,1024,1440]){
 test('V5.30 storyboard reaction is single, readable and stable at '+width+'px',async({browser})=>{
  const page=await browser.newPage({viewport:{width,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'#/friends',{waitUntil:'networkidle'});
  const card=page.locator('.v530-director'),art=card.locator('.character-art');
  const img=art.locator('img'),speech=card.locator('.v527-speech');
  await expect(card).toHaveClass(/v530-ready/);
  await expect(card).toHaveAttribute('data-v530-stage','idle');
  await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
  const atRest=await img.boundingBox();
  const beforeText=await speech.innerText();
  expect(atRest.width).toBeGreaterThan(100);
  if(width<=430){
    expect(atRest.width).toBeGreaterThanOrEqual(190);
    const bubble=await speech.boundingBox(),picture=await art.boundingBox();
    expect(bubble.y).toBeGreaterThanOrEqual(picture.y+picture.height-2);
  }
  for(const [i,pose] of poses.entries()){
    const artTap=card.locator('.v527-art-touch'),textTap=card.locator('.friend-discovery-button');
    await artTap.scrollIntoViewIfNeeded();
    if(i%2)await textTap.click();else await artTap.click();
    await expect(speech).not.toHaveText(i===0?beforeText:'');
    await expect(speech).toContainText('ノン');
    await expect(textTap).toHaveAttribute('aria-expanded','true');
    // The old V5.27–29 click listeners must not compete with the new director.
    await expect(card).not.toHaveClass(/v529-speaking/);
    const classes=await img.getAttribute('class')||'';
    expect(classes).not.toMatch(/v527-react|v528-react|v529-react/);
    await expect.poll(()=>card.getAttribute('data-v530-stage'),{timeout:1800}).toBe('perform');
    await expect(img).toHaveAttribute('src',new RegExp(pose.id+'\\.webp$'));
    await expect(img).toHaveCSS('animation-name',pose.animation);
    await expect(page.locator('#view-friends .v530-director img')).toHaveCount(1);
    if(width===390&&i===0){
      await page.screenshot({path:'test-results/v530-react-390.png',fullPage:true});
    }
    await expect.poll(()=>card.getAttribute('data-v530-stage'),{timeout:2600}).toBe('idle');
    await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
    await expect(card).not.toHaveClass(/v530-active/);
    const after=await img.boundingBox();
    expect(Math.abs(after.width-atRest.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.height-atRest.height)).toBeLessThanOrEqual(1);
    expect(await img.evaluate(el=>el.complete&&el.naturalWidth===224)).toBe(true);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
  if(width===390||width===1440)
    await page.screenshot({path:'test-results/v530-idle-'+width+'.png',fullPage:true,animations:'disabled'});
  await page.close();
 });
}
test('V5.30: rapid taps cancel old timers, leaving one still picture',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v530-director'),img=card.locator('img');
 await expect(card).toHaveClass(/v530-ready/);
 for(let i=0;i<11;i++)await card.locator('.v527-art-touch').click({force:true});
 await expect.poll(()=>card.getAttribute('data-v530-stage'),{timeout:3000}).toBe('idle');
 await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
 await expect(img).toHaveCSS('animation-name','none');
 await page.waitForTimeout(900);
 await expect(card).toHaveAttribute('data-v530-stage','idle');
 await expect(img).toHaveCSS('animation-name','none');
 await page.close();
});
test('V5.30: reduced motion & keyboard change speech without any pose motion',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v530-director'),img=card.locator('img'),speech=card.locator('.v527-speech');
 await expect(card).toHaveClass(/v530-ready/);
 const original=await speech.innerText();
 await card.locator('.v527-art-touch').focus();
 await page.keyboard.press('Enter');
 await expect(speech).not.toHaveText(original);
 await expect(speech).toHaveAttribute('aria-live','polite');
 await expect(card).toHaveAttribute('data-v530-stage','idle');
 await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
 await expect(img).toHaveCSS('animation-name','none');
 await page.close();
});
test('V5.30: unavailable action frame falls back to idle, never to a broken image',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('**/reactions/tiranon/hooray.webp',route=>route.abort('failed'));
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v530-director');
 await expect(card).toHaveClass(/v530-ready/);
 await card.locator('.v527-art-touch').click();
 await expect(card).toHaveAttribute('data-v530-stage','idle');
 await expect(card.locator('img')).toHaveAttribute('src',/wave_both\.webp$/);
 await expect(card.locator('.v527-speech')).toContainText('やったー');
 await page.close();
});
test('V5.30: reduced motion changed during a reaction cancels immediately',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 const card=page.locator('.v530-director'),img=card.locator('img');
 await expect(card).toHaveClass(/v530-ready/);
 await card.locator('.v527-art-touch').click();
 await expect.poll(()=>card.getAttribute('data-v530-stage')).toBe('perform');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(card).toHaveAttribute('data-v530-stage','idle');
 await expect(img).toHaveCSS('animation-name','none');
 await expect(img).toHaveAttribute('src',/wave_both\.webp$/);
 await page.close();
});
test('V5.30: Stegon and Pteran are unchanged; home, reels and catalog work',async({browser})=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'#/friends',{waitUntil:'networkidle'});
 await expect(page.locator('.v527-chat')).toHaveCount(3);
 await expect(page.locator('.v530-director')).toHaveCount(1);
 for(const id of ['stegon','puteran']){
   const card=page.locator('.v528-'+id);
   await expect(card).not.toHaveClass(/v530-director/);
   const src=await card.locator('.character-art img').getAttribute('src');
   await card.locator('.v527-art-touch').click();
   await expect(card.locator('.v527-speech')).toBeVisible();
   await expect(card.locator('.character-art img')).toHaveAttribute('src',src);
 }
 await page.goto(base+'#/home',{waitUntil:'networkidle'});
 await expect(page.locator('#home-welcome-title')).toBeVisible();
 await expect(page.locator('#home-reels .home-reels-card')).toHaveCount(3);
 await page.goto(base+'#/catalog/tiranon',{waitUntil:'networkidle'});
 await expect(page.locator('#catalog-name')).toHaveText('ティラノン');
 expect(errors).toEqual([]);
 await page.close();
});