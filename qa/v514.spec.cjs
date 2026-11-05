const {test,expect}=require('@playwright/test');
const widths=[320,360,375,390,430,768,1024,1440];
for(const width of widths){
  test('V5.14 responsive width '+width,async({browser})=>{
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:8765/preview-v514/',{waitUntil:'networkidle'});
    await expect(page.locator('body')).toBeVisible();
    const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    expect(geometry.scroll,'horizontal overflow at '+width).toBeLessThanOrEqual(geometry.viewport+2);
    expect(errors,'JS errors').toEqual([]);
    if(width===390){
      await page.screenshot({path:'test-results/v514-390-home.png',fullPage:true});
      await page.goto('http://127.0.0.1:8765/preview-v513/',{waitUntil:'networkidle'});
      await page.screenshot({path:'test-results/v513-390-home.png',fullPage:true});
    }
    await page.close();
  });
}
