/* V5.32 — user-approved Stegon drawings and personality-first dialogue.
 * Each pose is a separate, unwarped full-body image; the official character
 * stays quadrupedal. Only a tap triggers a temporary still-frame replacement.
 * V5.31 Tiranon and existing Pteran implementations are untouched.
 */
(() => {
  const root=document.getElementById('view-friends');
  const card=root?.querySelector('.v528-stegon');
  if(!card || card.dataset.v532Installed==='true')return;
  const art=card.querySelector('.character-art');
  const img=art?.querySelector('img');
  const button=card.querySelector('button.friend-discovery-button');
  const speech=card.querySelector('.v527-speech');
  if(!art || !img || !button || !speech)return;
  const idle='greeting';
  const actions=[
    {id:'laugh',line:'フフフ、ティラノンと あそぶと たのしいゴン！',hold:1550},
    {id:'shy',line:'フフフ……ほめられると、ちょっと てれるゴン。',hold:1550},
    {id:'sorry',line:'ごめんなさい。ぼく、きづかなかったゴン。',hold:1700},
    {id:'surprised',line:'ヒャー！ おおきな クモは にがてだゴン！',hold:1450},
    {id:'sprout',line:'この めが そだつのを、ゆっくり みまもるゴン。',hold:1850},
    {id:'greeting',line:'ぼくは ステゴン。よろしくゴン！',hold:1500}
  ];
  const base=new URL('reactions/stegon/',document.baseURI);
  const sources=Object.fromEntries(actions.map(a=>[a.id,new URL(a.id+'.webp',base).href]));
  const loaded=new Set();
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fallback=img.getAttribute('src');
  const hint=art.querySelector('.v527-art-hint');
  const oldMark=art.querySelector('.v528-emotion');
  let index=0,active=false,queued=false,pulse=0,timer=null,nextTimer=null;
  const clear=()=>{
    if(timer!==null)clearTimeout(timer);
    if(nextTimer!==null)clearTimeout(nextTimer);
    timer=nextTimer=null;
  };
  const removeLegacy=()=>{
    img.classList.remove('v527-react','v528-react');
    oldMark?.classList.remove('v528-emote');
    speech.classList.remove('v528-speech-appear','v527-bubble-enter');
  };
  const show=id=>{
    if(!loaded.has(id))return false;
    if(img.getAttribute('src')!==sources[id])img.src=sources[id];
    card.dataset.v532Pose=id;
    img.dataset.v532Pose=id;
    return true;
  };
  const reset=()=>{
    pulse++;
    clear();
    active=queued=false;
    card.classList.remove('v532-active','v532-pending');
    card.dataset.v532Stage='idle';
    removeLegacy();
    if(!show(idle) && fallback)img.src=fallback;
  };
  const ready=()=>{
    if(!loaded.has(idle))return;
    if(!active){
      show(idle);
      if(!card.classList.contains('v532-ready'))card.classList.add('v532-ready');
    }
  };
  const load=id=>new Promise(resolve=>{
    const pic=new Image();
    let settled=false;
    const finish=good=>{
      if(settled)return;
      settled=true;
      if(good)loaded.add(id);
      resolve(good);
    };
    pic.onload=()=>{
      if(typeof pic.decode==='function')pic.decode().then(()=>finish(true)).catch(()=>finish(true));
      else finish(true);
    };
    pic.onerror=()=>finish(false);
    pic.src=sources[id];
    if(pic.complete&&pic.naturalWidth>0)pic.onload();
  });
  card.dataset.v532Installed='true';
  card.dataset.v532Stage='idle';
  card.classList.add('v532-stegon');
  speech.setAttribute('aria-live','polite');
  speech.setAttribute('aria-atomic','true');
  if(hint)hint.textContent='さわってみてね ゴン';
  const group=card.querySelector('.friend-discovery-v526');
  if(group&&speech.nextElementSibling!==group)speech.after(group);
  // The original approved image remains visible until the new idle frame
  // is successfully decoded. A failed asset never becomes a broken portrait.
  Promise.all(actions.map(a=>load(a.id))).then(ready);

  const react=()=>{
    queued=false;
    card.classList.remove('v532-pending');
    const action=actions[index++%actions.length];
    pulse++;
    const token=pulse;
    clear();
    removeLegacy();
    speech.textContent='「'+action.line+'」';
    speech.hidden=false;
    button.textContent='もうひとこと！';
    button.setAttribute('aria-expanded','true');
    card.classList.add('v527-spoken');
    if(!loaded.has(action.id)||!loaded.has(idle)){
      active=false;
      card.dataset.v532Stage='idle';
      show(idle);
      return;
    }
    active=true;
    show(action.id); // synchronous: the expression is visible on first tap
    card.classList.add('v532-active');
    card.dataset.v532Stage='react';
    timer=setTimeout(()=>{
      if(pulse!==token)return;
      timer=null;
      active=false;
      card.classList.remove('v532-active');
      card.dataset.v532Stage='idle';
      show(idle);
      if(queued){
        queued=false;
        card.classList.remove('v532-pending');
        nextTimer=setTimeout(()=>{nextTimer=null;react();},110);
      }
    },action.hold);
  };
  // Runs before V5.26–28 bubble listeners; only Stegon's click is captured.
  button.addEventListener('click',event=>{
    event.stopImmediatePropagation();
    if(active){
      queued=true; // at most one future response, never hide current pose
      card.classList.add('v532-pending');
      button.textContent='つぎも みるゴン！';
      return;
    }
    if(nextTimer!==null){clearTimeout(nextTimer);nextTimer=null;}
    react();
  },{capture:true});
  // Reduced-motion users get all six distinct still drawings with no movement.
  // No keyframe animation is required to see the different expressions.
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)reset();
  });
})();
