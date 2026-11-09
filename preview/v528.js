/* V5.28 — give the approved still artwork a readable emotional reaction.
 * Each image is a rigid drawing: never move or deform teeth, spikes, wings,
 * legs, eyes or body parts separately. No loop and no autonomous motion.
 * The short decorative cue is a separate, non-interactive UI element.
 */
(() => {
  const root=document.getElementById('view-friends');
  if(!root || root.dataset.v528Ready==='true')return;
  const voices={
    tiranon:{mark:'✧',hint:'ぽんっ！',lines:[
      'フー！ ぼく、ぴょこんって したノン！',
      'おにくの おはなしなら、ぼくに まかせてノン！',
      'いっしょに あそぼうノン！'
    ]},
    stegon:{mark:'♡',hint:'よんでね',lines:[
      'あ、よんだ？ えへへ、うれしいな。',
      'ゆっくりでも、いっしょなら たのしいよ。',
      'ティラノンは きょうも げんきだねえ。'
    ]},
    puteran:{mark:'✦',hint:'よんでみな',lines:[
      'みたか？ いまのポーズ、きまっただろ！',
      'ふふん。おれの でばんだな！',
      'こまったら、おれに まかせろ！'
    ]}
  };
  const cards=[...root.querySelectorAll('.friend-feature-list > .v527-chat')];
  if(cards.length!==3)return;
  const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const article of cards){
    const id=Object.keys(voices).find(k=>article.classList.contains('v527-'+k));
    if(!id)continue;
    const entry=voices[id];
    const art=article.querySelector('.character-art');
    const img=art?.querySelector('img');
    const button=article.querySelector('button.friend-discovery-button');
    const speech=article.querySelector('.v527-speech');
    const hint=art?.querySelector('.v527-art-hint');
    if(!img || !button || !speech || !hint)continue;
    article.classList.add('v528-expressive','v528-'+id);
    hint.textContent=entry.hint;
    const mark=document.createElement('span');
    mark.className='v528-emotion';
    mark.textContent=entry.mark;
    mark.setAttribute('aria-hidden','true');
    art.append(mark);
    let index=0;
    const clearMotion=()=>{
      img.classList.remove('v528-react','v527-react');
      mark.classList.remove('v528-emote');
      speech.classList.remove('v528-speech-appear','v527-bubble-enter');
    };
    img.addEventListener('animationend',event=>{
      if(event.target===img && event.animationName.startsWith('v528-')){
        img.classList.remove('v528-react','v527-react');
      }
    });
    mark.addEventListener('animationend',event=>{
      if(event.target===mark)mark.classList.remove('v528-emote');
    });
    speech.addEventListener('animationend',event=>{
      if(event.target===speech && event.animationName==='v528-speech-in'){
        speech.classList.remove('v528-speech-appear','v527-bubble-enter');
      }
    });
    // Run after V5.26 and V5.27's existing click listener so the two
    // interchangeable controls (artwork and text button) stay in sync.
    button.addEventListener('click',()=>{
      speech.textContent='「'+entry.lines[index%entry.lines.length]+'」';
      index++;
      speech.hidden=false;
      button.textContent='もうひとこと！';
      button.setAttribute('aria-expanded','true');
      clearMotion();
      if(reduceMotion())return;
      // Restart on every individual user tap, including consecutive taps.
      // Never animate the entire card or other page content.
      void img.offsetWidth;
      img.classList.add('v528-react');
      mark.classList.add('v528-emote');
      speech.classList.add('v528-speech-appear');
    });
  }
  root.dataset.v528Ready='true';
})();
