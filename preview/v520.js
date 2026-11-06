/* V5.23 — Instagram updates as portrait, link-first storybook cards.
 * The iPhone screen recording showed that Instagram's cross-origin embed
 * renders a letterboxed square preview, independently of the site's CSS.
 * We therefore never insert an iframe or embed.js: the approved character
 * art is explicitly labeled as an illustration, not a frame from the reel.
 * Every card links to the real published Instagram post.
 */
(() => {
  const root=document.getElementById('view-sns');
  const intro=root?.querySelector('.social-spread');
  if(!root||!intro)return;

  let attempted=false;
  const el=(tag,cls,text)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  const permitted=url=>{
    try{
      const u=new URL(url);
      return u.protocol==='https:'&&u.hostname==='www.instagram.com'&&
        /^\/(?:reel|p)\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
    }catch{return false;}
  };
  const artAssets=[
    {art:'assets/tiranon.webp',palette:'autumn'},
    {art:'assets/profile-tiranon-v56.webp',palette:'workshop'},
    {art:'assets/stegon.webp',palette:'forest'}
  ];
  const render=async()=>{
    if(attempted||!/^#\/sns(?:\/|$)/.test(location.hash))return;
    attempted=true;
    const section=el('section','instagram-recent instagram-recent-v523');
    section.setAttribute('aria-labelledby','instagram-recent-title');
    const header=el('div','instagram-recent-heading');
    const heading=el('h2',null,'Instagramの さいきんのおはなし');
    heading.id='instagram-recent-title';
    header.append(heading,el('p','instagram-recent-intro','ティラノンたちの新しいおはなしを、のぞいてみよう。'));
    const meta=el('p','instagram-recent-meta','投稿を読み込んでいます…');
    const grid=el('div','instagram-recent-grid');
    section.append(header,meta,grid);
    intro.after(section);
    try{
      const response=await fetch(new URL('instagram-recent.json',document.baseURI),{cache:'no-store'});
      if(!response.ok)throw Error('unavailable');
      const data=await response.json();
      if(data.account!=='stuffed_saurus'||!Array.isArray(data.items))throw Error('invalid feed');
      const posts=data.items.filter(post=>post&&permitted(post.url)&&
        /^\d{4}-\d{2}-\d{2}$/.test(post.published_on)).slice(0,3);
      if(!posts.length)throw Error('no posts');
      const checked=/^\d{4}-\d{2}-\d{2}$/.test(data.checked_at||'')
        ? data.checked_at.replaceAll('-','/'):'日付不明';
      meta.textContent=data.auto_updated
        ? checked+'にInstagram連携で更新した投稿です。'
        : checked+'に確認した投稿です。新しい投稿への自動更新は準備中です。';
      posts.forEach((post,i)=>{
        const src=artAssets[i%artAssets.length];
        const card=el('article','instagram-recent-card');
        const info=el('div','instagram-recent-caption');
        const date=el('time','instagram-recent-date',post.published_on.replaceAll('-','.'));
        date.dateTime=post.published_on;
        const kind=el('span','instagram-reel-tag',post.type==='reel'?'リール':'投稿');
        const name=el('h3',null,String(post.title||'Instagramの投稿').slice(0,90));
        const summary=el('p',null,String(post.summary||'').slice(0,160));
        info.append(date,kind,name,summary);

        const link=el('a','instagram-cover-link');
        link.href=post.url;
        link.target='_blank';
        link.rel='noopener noreferrer';
        link.setAttribute('aria-label',name.textContent+'をInstagramで見る');
        const artwork=el('div','instagram-cover-art theme-'+src.palette);
        const category=el('span','instagram-cover-tag','ティラノンの おはなし');
        const frame=el('div','instagram-cover-picture');
        const img=document.createElement('img');
        img.className='instagram-cover-character';
        img.src=new URL(src.art,document.baseURI).href;
        img.alt='';
        img.loading='lazy';
        img.decoding='async';
        frame.append(img);
        const caption=el('span','instagram-cover-title',name.textContent);
        const note=el('span','instagram-cover-note','紹介イラスト');
        const play=el('span','instagram-cover-play');
        play.setAttribute('aria-hidden','true');
        play.textContent='▶';
        artwork.append(category,frame,caption,note,play);
        link.append(artwork);
        card.append(info,link);
        grid.append(card);
      });
      const footnote=root.querySelector('.content-footnote');
      if(footnote)footnote.textContent=
        '投稿の紹介にはサイトのイラストを使用しています。画像をタップするとInstagramで実際のリールを見られます。';
    }catch{
      meta.textContent='投稿の一覧を取得できませんでした。Instagramの公式アカウントからご覧ください。';
      grid.replaceChildren();
      const link=el('a','instagram-recent-open','@stuffed_saurus のInstagramを見る ↗');
      link.href='https://www.instagram.com/stuffed_saurus/';
      link.target='_blank';
      link.rel='noopener noreferrer';
      grid.append(link);
    }
  };
  window.addEventListener('hashchange',render);
  render();
})();