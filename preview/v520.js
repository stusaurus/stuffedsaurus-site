/* V5.20 — real, verified Instagram reels on the SNS page.
   Never scrape Instagram or expose access tokens in the browser.
   Embed SDK loads only when the user opens #/sns; all posts have working fallback links.
   Data is a dated snapshot until server-side Instagram API authorization is configured. */
(() => {
  const root=document.getElementById('view-sns');
  if(!root)return;
  const panel=root.querySelector('.page-wrap');
  const intro=root.querySelector('.social-spread');
  if(!panel || !intro)return;
  let attempted=false;
  const isInstagramUrl=(raw)=>{
    try{
      const u=new URL(raw);
      return u.protocol==='https:'&&u.hostname==='www.instagram.com'&&/^\/(?:reel|p)\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
    }catch{return false;}
  };
  const elem=(tag,className,content)=>{
    const n=document.createElement(tag);
    if(className)n.className=className;
    if(content)n.textContent=content;
    return n;
  };
  const start=async()=>{
    if(attempted || !/^#\/sns(?:\/|$)/.test(location.hash))return;
    attempted=true;
    const section=elem('section','instagram-recent');
    section.setAttribute('aria-labelledby','instagram-recent-title');
    const head=elem('div','instagram-recent-heading');
    const title=elem('h2','','Instagramの さいきんのおはなし');
    title.id='instagram-recent-title';
    const sub=elem('p','instagram-recent-intro','新しいおはなしを、Instagramからおとどけ。');
    head.append(title,sub);
    const meta=elem('p','instagram-recent-meta','投稿を読み込んでいます…');
    const grid=elem('div','instagram-recent-grid');
    section.append(head,meta,grid);
    intro.after(section);
    try{
      const response=await fetch(new URL('instagram-recent.json',document.baseURI),{cache:'no-store'});
      if(!response.ok)throw new Error('feed unavailable');
      const data=await response.json();
      if(data.account!=='stuffed_saurus'||!Array.isArray(data.items))throw new Error('invalid feed');
      const posts=data.items.filter(p=>p&&isInstagramUrl(p.url)&&/^\d{4}-\d{2}-\d{2}$/.test(p.published_on)).slice(0,3);
      if(posts.length===0)throw new Error('empty feed');
      const checked=/^\d{4}-\d{2}-\d{2}$/.test(data.checked_at||'') ? data.checked_at.replaceAll('-','/') : '日付不明';
      meta.textContent=checked+'に確認した投稿です。新しい投稿への自動更新は準備中です。';
      for(const post of posts){
        const card=elem('article','instagram-recent-card');
        const info=elem('div','instagram-recent-caption');
        const date=elem('time','instagram-recent-date',post.published_on.replaceAll('-','.'));
        date.dateTime=post.published_on;
        const name=elem('h3','',String(post.title||'Instagramの投稿').slice(0,90));
        const summary=elem('p','',String(post.summary||'').slice(0,180));
        const kind=elem('span','instagram-reel-tag',post.type==='reel'?'リール':'投稿');
        info.append(date,kind,name,summary);
        const embed=elem('div','instagram-reel-embed');
        const quote=document.createElement('blockquote');
        quote.className='instagram-media';
        quote.dataset.instgrmPermalink=post.url;
        quote.dataset.instgrmVersion='14';
        const fallback=elem('a','instagram-embed-fallback','Instagramで投稿を見る');
        fallback.href=post.url;fallback.target='_blank';fallback.rel='noopener noreferrer';
        quote.append(fallback);
        embed.append(quote);
        const link=elem('a','instagram-recent-open','Instagramで見る ↗');
        link.href=post.url;link.target='_blank';link.rel='noopener noreferrer';
        link.setAttribute('aria-label',post.title+'をInstagramで開く');
        card.append(info,embed,link);
        grid.append(card);
      }
      // Existing copy incorrectly claims that no posts are displayed; replace it.
      const old=root.querySelector('.content-footnote');
      if(old)old.textContent='公開投稿をInstagramの公式埋め込みで表示しています。表示できない場合は「Instagramで見る」から開いてください。';
      // Instagram's own embed script is intentionally activated only inside the SNS route.
      if(window.matchMedia('(min-width:360px)').matches){
        if(window.instgrm?.Embeds?.process){
          window.instgrm.Embeds.process();
        }else{
          const script=document.createElement('script');
          script.src='https://www.instagram.com/embed.js';
          script.async=true;
          script.dataset.instagramEmbed='v520';
          script.onload=()=>{try{window.instgrm?.Embeds?.process?.();}catch{}};
          script.onerror=()=>{section.classList.add('instagram-embed-unavailable');};
          document.body.append(script);
        }
      }else{
        section.classList.add('instagram-embed-small');
      }
    }catch(error){
      meta.textContent='投稿の一覧を取得できませんでした。Instagramの公式アカウントからご覧ください。';
      grid.replaceChildren();
      const link=elem('a','instagram-recent-open','@stuffed_saurus のInstagramを見る ↗');
      link.href='https://www.instagram.com/stuffed_saurus/';
      link.target='_blank';link.rel='noopener noreferrer';
      grid.append(link);
    }
  };
  window.addEventListener('hashchange',start);
  start();
})();
