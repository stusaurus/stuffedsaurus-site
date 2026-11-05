(() => {
const masthead=document.querySelector('.masthead');
const brandbar=document.querySelector('.brandbar');
const toggle=document.querySelector('#menu-toggle');
if(!masthead||!brandbar||!toggle||masthead.querySelector('.mobile-nav-row'))return;
const row=document.createElement('div');
row.className='mobile-nav-row';
row.setAttribute('aria-label','スマホ用ショートカット');
for(const [href,icon,text] of [['#/home','⌂','ホーム'],['#/manga','▤','まんが']]){
  const a=document.createElement('a'); a.href=href;
  const glyph=document.createElement('span'); glyph.textContent=icon;glyph.setAttribute('aria-hidden','true');
  a.append(glyph,document.createTextNode(text)); row.append(a);
}
row.append(toggle);brandbar.insertAdjacentElement('afterend',row);
})();