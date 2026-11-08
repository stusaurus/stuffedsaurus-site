/* V5.26 — gently interactive character discovery, based only on approved facts.
 * Never changes the existing character images or adds unapproved canon.
 * All dialogue is text (no audio, no automatic movement).
 */
(() => {
  const characters=[
    {
      id:'tiranon',name:'ティラノン',
      lines:[
        'ぼく、しょうらいは うちゅうひこうしに なりたいノン！',
        'マモトンは、ぼくの たいせつな ぬいぐるみノン！'
      ],
      details:[
        ['たんじょうび','10がつ4にち'],
        ['しょうらいの ゆめ','うちゅうひこうし'],
        ['たからもの','マモトンの ぬいぐるみ']
      ]
    },
    {
      id:'stegon',name:'ステゴン',
      lines:[
        'ぼく、6にんきょうだいの いちばん上なんだ。',
        'あわてなくて だいじょうぶ。いっしょに あそぼう！'
      ],
      details:[
        ['かぞく','6にんきょうだいの ちょうなん'],
        ['どんな子？','とっても やさしい、のんびりやさん'],
        ['すきな あそび','つみき・ドミノたおし']
      ]
    },
    {
      id:'puteran',name:'プテラン',
      lines:[
        'おれの かっこいいところ、しっかり みててよ！',
        'ともだちが こまってるなら、おれに まかせて！'
      ],
      details:[
        ['どんな子？','ちょっとキザで、かっこつけ'],
        ['ともだちと いると','こまっていたら さりげなく たすける'],
        ['じぶんの よびかた','おれ']
      ]
    }
  ];
  const byId=Object.fromEntries(characters.map(c=>[c.id,c]));
  const make=(tag,cls,text)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined)node.textContent=text;
    return node;
  };

  const friends=document.getElementById('view-friends');
  const cards=[...friends?.querySelectorAll('.friend-feature-list > .character-story')||[]];
  if(cards.length===characters.length&&!friends.querySelector('.friend-discovery-v526')){
    cards.forEach((article,index)=>{
      const character=characters[index];
      const copy=article.querySelector('.character-copy');
      const next=copy?.querySelector('a.text-action');
      if(!copy||!next)return;
      article.id='meet-'+character.id;
      const block=make('div','friend-discovery-v526');
      const prompt=make('p','friend-discovery-label','この子に きいてみよう');
      const button=make('button','friend-discovery-button','はなしかける');
      button.type='button';
      button.setAttribute('aria-expanded','false');
      const response=make('p','friend-discovery-response');
      response.id='friend-discovery-response-'+character.id;
      response.hidden=true;
      response.setAttribute('role','status');
      response.setAttribute('aria-live','polite');
      button.setAttribute('aria-controls',response.id);
      let shown=-1;
      button.addEventListener('click',()=>{
        shown=(shown+1)%character.lines.length;
        response.textContent='「'+character.lines[shown]+'」';
        response.hidden=false;
        button.setAttribute('aria-expanded','true');
        button.textContent='もうひとこと きく';
      });
      block.append(prompt,button,response);
      next.before(block);
    });
  }

  const catalog=document.getElementById('view-catalog');
  const writing=catalog?.querySelector('#catalog-spread .catalog-writing');
  if(writing && !writing.querySelector('.character-extra-v526')){
    const facts=make('section','character-extra-v526');
    facts.setAttribute('aria-labelledby','character-extra-title');
    const heading=make('h3',null,'この子を もっと しろう');
    heading.id='character-extra-title';
    const list=make('dl','character-extra-facts');
    facts.append(heading,list);
    const tip=writing.querySelector('.catalog-tip');
    if(tip)tip.textContent='ほかの なかまの ずかんも ひらいてみよう！';
    writing.append(facts);
    const update=()=>{
      const parts=location.hash.match(/^#\/catalog(?:\/([a-z]+))?\/?$/);
      if(!parts)return;
      const character=byId[parts[1]]||byId.tiranon;
      list.replaceChildren();
      for(const [label,value] of character.details){
        const row=make('div','character-extra-fact');
        row.append(make('dt',null,label),make('dd',null,value));
        list.append(row);
      }
      const likes=document.getElementById('catalog-likes');
      const likesLabel=likes?.previousElementSibling;
      if(likes && likesLabel?.tagName==='DT'){
        if(character.id==='puteran'){
          likesLabel.textContent='どんな子？';
          likes.textContent='ちょっとキザで、ともだち思い';
        }else{
          likesLabel.textContent='すきなもの';
        }
      }
    };
    window.addEventListener('hashchange',update);
    update();
  }

  const disclaimer=document.querySelector('.site-footer .footer-disclaimer');
  if(disclaimer){
    disclaimer.textContent='© StuffedSaurus';
  }
})();