/* V5.25: meet the characters and real published stories before unfinished work. */
(() => {
  const home=document.getElementById('view-home');
  const sections=home?.querySelector('.home-sections');
  const friends=document.getElementById('home-friends');
  const manga=document.getElementById('home-manga');
  const news=document.getElementById('home-updates');
  if(!home||!sections||!friends||!manga||!news||home.classList.contains('home-v525'))return;
  home.classList.add('home-v525');
  const make=(tag,cls,value)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(value!==undefined)node.textContent=value;
    return node;
  };
  const link=(value,href,cls)=>{
    const a=make('a',cls,value);
    a.href=href;
    return a;
  };
  const welcome=make('section','home-welcome container');
  welcome.setAttribute('aria-labelledby','home-welcome-title');
  welcome.append(make('p','home-welcome-eyebrow','ようこそ、ティラノンの まちへ'));
  const title=make('h2',null,'きょうは、なにして あそぶノン？');
  title.id='home-welcome-title';
  welcome.append(title);
  welcome.append(make('p','home-welcome-description','好奇心いっぱいのティラノンと、やさしい仲間たち。ちょっとおかしくて、ほっとする毎日をのぞいてみてね。'));
  const actions=make('div','home-welcome-actions');
  actions.append(link('なかまたちに会う','#/friends','home-welcome-primary'));
  actions.append(link('リールを見にいく','#/sns','home-welcome-secondary'));
  welcome.append(actions);
  sections.before(welcome);
  sections.prepend(friends);

  const reels=make('section','home-reels');
  reels.id='home-reels';
  reels.setAttribute('aria-labelledby','home-reels-title');
  const heading=make('div','home-reels-heading');
  heading.append(make('p','home-reels-eyebrow','まちのアルバムから'));
  const reelTitle=make('h2',null,'リールで のぞく まいにち');
  reelTitle.id='home-reels-title';
  heading.append(reelTitle,make('p','home-reels-description','ほんとうに投稿したお話を、少しだけ。タップするとInstagramで見られるノン！'));
  const grid=make('div','home-reels-grid');
  grid.setAttribute('aria-live','polite');
  const footer=make('div','home-reels-footer');
  footer.append(link('ほかのお話も見る','#/sns','home-reels-more'));
  reels.append(heading,grid,footer);
  friends.after(reels);

  const mangaText=manga.querySelector('.text-lead');
  if(mangaText)mangaText.textContent='ティラノンたちの4コマは、ただいま準備中。公開されたら、ここから読めるようになるノン！';
  const discover=home.querySelector('.discover-subtitle');
  if(discover)discover.textContent='なかまたちと、もう少し いっしょにあそぼう。';

  const reelCode=url=>{
    try{
      const u=new URL(url);
      if(u.protocol!=='https:'||u.hostname!=='www.instagram.com')return null;
      return u.pathname.match(/^\/reel\/([A-Za-z0-9_-]+)\/?$/)?.[1]||null;
    }catch{return null;}
  };
  const render=async()=>{
    try{
      const response=await fetch(new URL('instagram-recent.json',document.baseURI),{cache:'no-store'});
      if(!response.ok)throw Error('feed unavailable');
      const data=await response.json();
      if(data.account!=='stuffed_saurus'||!Array.isArray(data.items))throw Error('invalid feed');
      const posts=data.items.filter(post=>{
        const code=reelCode(post?.url);
        return code&&post.cover_path==='instagram-covers/'+code+'.webp'&&
          /^\d{4}-\d{2}-\d{2}$/.test(post.published_on);
      }).slice(0,3);
      if(!posts.length)throw Error('no verified posts');
      for(const post of posts){
        const a=link('',post.url,'home-reels-card');
        a.target='_blank';
        a.rel='noopener noreferrer';
        const safeTitle=String(post.title||'ティラノンのリール').slice(0,70);
        a.setAttribute('aria-label',safeTitle+'をInstagramで見る');
        const frame=make('span','home-reels-picture');
        const img=make('img','home-reels-image');
        img.src=new URL(post.cover_path,document.baseURI).href;
        img.alt=safeTitle+'の実際のリール表紙';
        img.loading='lazy';img.decoding='async';img.width=1080;img.height=1920;
        img.addEventListener('error',()=>{
          img.remove();frame.classList.add('home-reels-cover-missing');
          frame.prepend(make('span','home-reels-fallback','Instagramで見る'));
        },{once:true});
        frame.append(img,make('span','home-reels-play','▶'));
        const copy=make('span','home-reels-copy');
        copy.append(make('strong',null,safeTitle),make('small',null,post.published_on.replaceAll('-','.')));
        a.append(frame,copy);
        grid.append(a);
      }
    }catch{
      grid.replaceChildren(link('Instagramでお話を見てみる','https://www.instagram.com/stuffed_saurus/','home-reels-unavailable'));
    }
  };
  render();
})();