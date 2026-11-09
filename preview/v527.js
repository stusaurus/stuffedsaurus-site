/* V5.27 — an illustrated, tap-to-talk experience.
 * Treat each approved character image as a rigid, single piece of artwork:
 * only a short, user-triggered translate/rotate is permitted. No continuous
 * wobble, image morphing, expression edits or moving individual body parts.
 */
(() => {
  const root=document.getElementById('view-friends');
  const cards=[...root?.querySelectorAll('.friend-feature-list > .character-story')||[]];
  const entries=[
    {id:'tiranon',name:'ティラノン',
     hello:'やっほー！ ぼくに はなしかけてノン！',
     lines:[
       'フー！ ぼく、うちゅうひこうしに なるノン！',
       'マモトンは、ぼくの たからものノン！',
       'きょうは なにして あそぶノン？'
     ]},
    {id:'stegon',name:'ステゴン',
     hello:'やあ〜。いっしょに おはなししよう。',
     lines:[
       'ぼく、6にんきょうだいの ちょうなんなんだ。',
       'あわてない、あわてない。いっしょに あそぼう〜。',
       'ティラノンは、ぼくの だいじな ともだちだよ。'
     ]},
    {id:'puteran',name:'プテラン',
     hello:'おれと おしゃべりしたいのか？',
     lines:[
       'どうだ？ おれ、かっこいいだろ！',
       'こまったときは、おれに まかせろ！',
       'おれたち、いい なかまだろ？'
     ]}
  ];
  if(cards.length!==entries.length||root.querySelector('.v527-chat'))return;
  const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cards.forEach((article,i)=>{
    const entry=entries[i];
    const image=article.querySelector('.character-art img');
    const art=article.querySelector('.character-art');
    const copy=article.querySelector('.character-copy');
    const description=copy?.querySelector('p:not(.character-taxonomy)');
    const block=copy?.querySelector('.friend-discovery-v526');
    const button=block?.querySelector('button.friend-discovery-button');
    const response=block?.querySelector('.friend-discovery-response');
    if(!art||!image||!copy||!description||!block||!button||!response)return;
    article.classList.add('v527-chat','v527-'+entry.id);
    // The illustrated bubble is beside the character, before biography prose.
    response.classList.add('v527-speech');
    description.before(response);
    response.textContent='「'+entry.hello+'」';
    response.hidden=false;
    button.setAttribute('aria-expanded','true');
    button.textContent='おしゃべりしてみる';
    const prompt=block.querySelector('.friend-discovery-label');
    if(prompt)prompt.textContent='この子に はなしかける';
    // Make tapping the artwork itself useful, with an actual keyboard-ready
    // button rather than turning a decorative image into a pseudo-control.
    const touch=document.createElement('button');
    touch.type='button';
    touch.className='v527-art-touch';
    touch.setAttribute('aria-label',entry.name+'に はなしかける');
    touch.setAttribute('aria-controls',response.id);
    art.append(touch);
    const hint=document.createElement('span');
    hint.className='v527-art-hint';
    hint.textContent='タッチしてね ✿';
    hint.setAttribute('aria-hidden','true');
    art.append(hint);
    touch.addEventListener('click',()=>button.click());

    image.addEventListener('animationend',event=>{
      if(event.target===image&&event.animationName.startsWith('v527-')){
        image.classList.remove('v527-react');
      }
    });
    let count=0;
    button.addEventListener('click',()=>{
      // V5.26's listener runs first. Keep a shorter, in-character V5.27 line.
      response.textContent='「'+entry.lines[count%entry.lines.length]+'」';
      count++;
      response.hidden=false;
      button.textContent='もうひとこと！';
      button.setAttribute('aria-expanded','true');
      article.classList.add('v527-spoken');
      if(!reduceMotion()){
        image.classList.remove('v527-react');
        // Re-trigger only on a fresh tap. No permanent idle animation.
        void image.offsetWidth;
        image.classList.add('v527-react');
        response.classList.remove('v527-bubble-enter');
        void response.offsetWidth;
        response.classList.add('v527-bubble-enter');
      }
    });
  });
})();