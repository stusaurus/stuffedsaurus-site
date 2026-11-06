/* V5.19 — a tiny conversation with the three town friends.
 * Preserve the approved artwork and the existing deep links to each profile.
 * No automatic motion or sound; talking is triggered only by user activation. */
(() => {
  const section=document.getElementById('home-friends');
  const grid=section?.querySelector('.friend-grid');
  const cards=grid?.querySelectorAll('a.friend');
  if(!section || !grid || !cards || cards.length!==3 || section.querySelector('.friend-chat'))return;
  const turns=[
    {name:'ティラノン',line:'きょうは どんな おもしろいことが あるノン？'},
    {name:'ステゴン',line:'あわてなくても だいじょうぶ。いっしょに あそぼう！'},
    {name:'プテラン',line:'おれの かっこいいところ、しっかり みててよ！'}
  ];
  const wrap=document.createElement('div');
  wrap.className='friend-chat';
  const button=document.createElement('button');
  button.type='button';
  button.className='friend-chat-button';
  button.textContent='なかまに はなしかける';
  button.setAttribute('aria-controls','home-friend-voice');
  button.setAttribute('aria-expanded','false');
  const voice=document.createElement('p');
  voice.id='home-friend-voice';
  voice.className='friend-voice';
  voice.setAttribute('role','status');
  voice.setAttribute('aria-live','polite');
  voice.setAttribute('aria-atomic','true');
  voice.hidden=true;
  wrap.append(button,voice);
  const description=section.querySelector('.friend-note');
  if(description)description.before(wrap);else grid.after(wrap);
  let step=-1;
  const speak=()=>{
    step=(step+1)%turns.length;
    const {name,line}=turns[step];
    const speaker=document.createElement('strong');
    speaker.className='friend-voice-name';
    speaker.textContent=name;
    const words=document.createElement('span');
    words.className='friend-voice-words';
    words.textContent='「'+line+'」';
    voice.replaceChildren(speaker,words);
    voice.hidden=false;
    button.setAttribute('aria-expanded','true');
    button.textContent='つぎの なかまへ';
    cards.forEach((card,index)=>{
      if(index===step)card.classList.add('friend-speaking');
      else card.classList.remove('friend-speaking');
    });
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      voice.classList.remove('friend-voice-pop');
      void voice.offsetWidth;
      voice.classList.add('friend-voice-pop');
    }
  };
  button.addEventListener('click',speak);
})();
