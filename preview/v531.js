/* V5.31 — tap-visible, iPhone-friendly character pose director.
 * Deploy instead of (not after) v530.js to avoid duplicate capture listeners.
 * The approved five still-image frames are unchanged. No face/body morphing.
 */
(() => {
  const root = document.getElementById('view-friends');
  const card = root?.querySelector('.v529-tiranon');
  if (!card || card.dataset.v531Installed === 'true') return;
  const art = card.querySelector('.character-art');
  const img = art?.querySelector('img');
  const button = card.querySelector('button.friend-discovery-button');
  const speech = card.querySelector('.v527-speech');
  if (!art || !img || !button || !speech) return;

  const idle = 'wave_both';
  const actions = [
    {id:'hooray',line:'フー！ やったー！ うれしいノン！',hold:1300},
    {id:'shy_giggle',line:'えへへ。ほめられると、てれちゃうノン！',hold:1350},
    {id:'happy_run',line:'いっしょに あそびに いくノン！',hold:1300},
    {id:'sitting_laugh',line:'あはは！ なんだか たのしいノン！',hold:1400},
    {id:'wave_both',line:'やっほー！ ぼく、ティラノン！',hold:1250}
  ];
  const base=new URL('reactions/tiranon/',document.baseURI);
  const paths=Object.fromEntries(actions.map(a=>[a.id,new URL(a.id+'.webp',base).href]));
  const cached=new Set();
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const original=img.getAttribute('src');
  let index=0;
  let active=false;
  let queued=false;
  let timer=null;
  let nextTimer=null;
  let pulseId=0;
  const clearTimers=()=>{
    if(timer!==null)window.clearTimeout(timer);
    if(nextTimer!==null)window.clearTimeout(nextTimer);
    timer=null;
    nextTimer=null;
  };
  const show=id=>{
    if(!cached.has(id))return false;
    if(img.getAttribute('src')!==paths[id])img.src=paths[id];
    img.dataset.v529Pose=id;
    card.dataset.v529Pose=id;
    card.dataset.v531Pose=id;
    return true;
  };
  const stopMotion=()=>{
    img.classList.remove('v527-react','v528-react','v529-react','v530-react',
      'v530-prepare','v530-perform','v530-land','v531-motion');
  };
  const still=()=>{
    clearTimers();
    active=false;
    queued=false;
    stopMotion();
    card.classList.remove('v531-active','v531-pending','v529-speaking');
    card.dataset.v531Stage='idle';
    show(idle);
  };
  const ready=()=>{
    if(!cached.has(idle) || !card.classList.contains('v529-ready'))return;
    if(!card.classList.contains('v531-ready'))card.classList.add('v531-ready');
    if(!active)show(idle);
  };
  const load=id=>new Promise(resolve=>{
    const image=new Image();
    let settled=false;
    const done=good=>{
      if(settled)return;
      settled=true;
      if(good)cached.add(id);
      resolve(good);
    };
    image.onload=()=>{
      if(typeof image.decode==='function'){
        image.decode().then(()=>done(true)).catch(()=>done(true));
      }else done(true);
    };
    image.onerror=()=>done(false);
    image.src=paths[id];
    if(image.complete && image.naturalWidth>0)image.onload();
  });

  card.classList.add('v531-director');
  card.dataset.v531Installed='true';
  card.dataset.v531Stage='idle';
  speech.setAttribute('aria-live','polite');
  speech.setAttribute('aria-atomic','true');
  const hint=art.querySelector('.v527-art-hint');
  if(hint)hint.textContent='タップすると へんしん！';
  const mark=document.createElement('span');
  mark.className='v531-sparkle';
  mark.setAttribute('aria-hidden','true');
  mark.textContent='✧';
  art.append(mark);
  // Put the actual talk control above the long bio on narrow phones.
  const block=card.querySelector('.friend-discovery-v526');
  if(block&&speech.nextElementSibling!==block)speech.after(block);
  // V5.29 controls the initial image source; wait for its ready signal.
  const observer=new MutationObserver(ready);
  observer.observe(card,{attributes:true,attributeFilter:['class']});
  Promise.all(actions.map(a=>load(a.id))).then(ready);

  const react=()=>{
    queued=false;
    card.classList.remove('v531-pending');
    const a=actions[index%actions.length];
    index++;
    pulseId++;
    const token=pulseId;
    clearTimers();
    stopMotion();
    speech.hidden=false;
    speech.textContent='「'+a.line+'」';
    button.textContent='もうひとこと！';
    button.setAttribute('aria-expanded','true');
    card.classList.add('v527-spoken');

    if(!card.classList.contains('v531-ready')||!cached.has(a.id)){
      active=false;
      card.dataset.v531Stage='idle';
      show(idle);
      return;
    }

    // IMPORTANT: the new full-body drawing is visible synchronously on tap.
    // No 110ms delay that can be repeatedly cancelled by quick iPhone taps.
    active=true;
    show(a.id);
    card.classList.add('v531-active');
    card.dataset.v531Stage='react';
    if(!reduce.matches){
      void img.offsetWidth;
      img.classList.add('v531-motion');
      // Only a secondary visual cue, never a distorted body part.
      mark.classList.remove('v531-pop');
      void mark.offsetWidth;
      mark.classList.add('v531-pop');
    }
    timer=window.setTimeout(()=>{
      if(token!==pulseId)return;
      timer=null;
      stopMotion();
      show(idle);
      card.classList.remove('v531-active');
      card.dataset.v531Stage='idle';
      active=false;
      if(queued){
        card.classList.remove('v531-pending');
        queued=false;
        // Coalesced repeated taps become at most one more intentional beat.
        nextTimer=window.setTimeout(()=>{
          nextTimer=null;
          react();
        },120);
      }
    },a.hold);
  };

  // Only v531.js is loaded on the live site, so this capture listener is
  // before older v527-v529 bubble listeners. One tap = one dialogue update.
  button.addEventListener('click',event=>{
    event.stopImmediatePropagation();
    if(active){
      // Do not reset the visible pose on every tap; otherwise repeated touches
      // can prevent any alternate drawing from appearing on a real phone.
      queued=true;
      card.classList.add('v531-pending');
      button.textContent='つぎも みるノン！';
      return;
    }
    react();
  },{capture:true});

  // Reduced motion disables movement, not changing one still picture for
  // another; the selected pose remains on screen for the full reading time.
  const onReducedChange=()=>{
    if(reduce.matches){
      stopMotion();
      mark.classList.remove('v531-pop');
    }
  };
  if(reduce.addEventListener)reduce.addEventListener('change',onReducedChange);
  else if(reduce.addListener)reduce.addListener(onReducedChange);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)still();});
})();