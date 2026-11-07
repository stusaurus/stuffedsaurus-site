/* V5.24 — genuine published @stuffed_saurus Reel cover photographs.
 * Unlike previous versions, the site does NOT substitute unrelated character
 * illustrations for Instagram content. Each photo is a first-party, verified
 * 1080x1920 capture of that exact Instagram Reel's official cover.
 * Tapping opens that real Reel on Instagram. No iframe or tracking SDK.
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
  const codeOf=url=>{
    try{
      const u=new URL(url);
      if(u.protocol!=='https:'||u.hostname!=='www.instagram.com')return null;
      return u.pathname.match(/^\/(?:reel|p)\/([A-Za-z0-9_-]+)\/?$/)?.[1]||null;
    }catch{return null;}
  };
  const coverFor=(post,code)=>{
    const path=post.cover_path;
    if(typeof path!=='string'||!code)return null;
    if(path!=='instagram-covers/'+code+'.webp')return null;
    return new URL(path,document.baseURI).href;
  };
  const render=async()=>{
    if(attempted||!/^#\/sns(?:\/|$)/.test(location.hash))return;
    attempted=true;
    const section=el('section','instagram-recent instagram-recent-v523 instagram-recent-v524');
    section.setAttribute('aria-labelledby','instagram-recent-title');
    const header=el('div','instagram-recent-heading');
    const heading=el('h2',null,'Instagramの さいきんのおはなし');
    heading.id='instagram-recent-title';
    header.append(heading,el('p','instagram-recent-intro','新しいリールの本物の表紙を、ここからのぞけるノン！'));
    const meta=el('p','instagram-recent-meta','投稿を読み込んでいます…');
    const grid=el('div','instagram-recent-grid');
    section.append(header,meta,grid);
    intro.after(section);
    try{
      const response=await fetch(new URL('instagram-recent.json',document.baseURI),{cache:'no-store'});
      if(!response.ok)throw Error('feed not available');
      const data=await response.json();
      if(data.account!=='stuffed_saurus'||!Array.isArray(data.items))throw Error('invalid feed');
      const posts=data.items.filter(post=>post&&codeOf(post.url)&&/^\d{4}-\d{2}-\d{2}$/.test(post.published_on)).slice(0,3);
      if(!posts.length)throw Error('no verified posts');
      const checked=/^\d{4}-\d{2}-\d{2}$/.test(data.checked_at||'')
        ? data.checked_at.replaceAll('-','/'):'日付不明';
      meta.textContent=data.auto_updated
        ? checked+'にInstagram連携で更新した投稿です。'
        : checked+'に確認した投稿です。新しい投稿への自動更新は準備中です。';
      posts.forEach(post=>{
        const code=codeOf(post.url);
        const verifiedCover=coverFor(post,code);
        const card=el('article','instagram-recent-card');
        const info=el('div','instagram-recent-caption');
        const date=el('time','instagram-recent-date',post.published_on.replaceAll('-','.'));
        date.dateTime=post.published_on;
        const kind=el('span','instagram-reel-tag',post.type==='reel'?'リール':'投稿');
        const title=el('h3',null,String(post.title||'Instagramの投稿').slice(0,90));
        const summary=el('p',null,String(post.summary||'').slice(0,160));
        info.append(date,kind,title,summary);
        const link=el('a','instagram-cover-link');
        link.href=post.url;
        link.target='_blank';
        link.rel='noopener noreferrer';
        link.setAttribute('aria-label',title.textContent+'をInstagramで見る');
        const art=el('div','instagram-cover-art');
        if(verifiedCover){
          const img=document.createElement('img');
          img.src=verifiedCover;
          img.className='instagram-reel-cover-image';
          img.alt=title.textContent+'の実際のリール表紙';
          img.loading='lazy';
          img.decoding='async';
          img.width=1080;
          img.height=1920;
          img.addEventListener('error',()=>{
            img.remove();
            art.classList.add('instagram-cover-missing');
            const fallback=el('span','instagram-cover-missing-text','Instagramでリールを見る');
            art.prepend(fallback);
          },{once:true});
          art.append(img);
        }else{
          art.classList.add('instagram-cover-missing');
          art.append(el('span','instagram-cover-missing-text','Instagramでリールを見る'));
        }
        const play=el('span','instagram-cover-play','▶');
        play.setAttribute('aria-hidden','true');
        const caption=el('span','instagram-cover-open-label','Instagramで見る');
        art.append(play,caption);
        link.append(art);
        card.append(info,link);
        grid.append(card);
      });
      const footnote=root.querySelector('.content-footnote');
      if(footnote)footnote.textContent='実際のInstagramリールの表紙を表示しています。タップするとInstagramで本編を再生できます。';
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