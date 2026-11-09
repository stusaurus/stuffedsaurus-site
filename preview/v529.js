/* V5.29 — approved Tiranon pose illustrations, displayed as whole, rigid frames.
 * Preserves V5.28 conversations and the original art as a safe fallback.
 * No morphing, no image warp and no autonomous idle animation.
 */
(() => {
  const root = document.getElementById('view-friends');
  const card = root?.querySelector('.v528-tiranon');
  if (!card || card.dataset.v529Installed === 'true') return;
  const art = card.querySelector('.character-art');
  const img = art?.querySelector('img');
  const button = card.querySelector('button.friend-discovery-button');
  const speech = card.querySelector('.v527-speech');
  if (!img || !button || !speech) return;
  card.dataset.v529Installed = 'true';
  card.classList.add('v529-tiranon');
  const hint = art.querySelector('.v527-art-hint');
  if (hint) hint.textContent = 'さわってみてね ✿';

  const base = new URL('reactions/tiranon/', document.baseURI);
  const ids = ['wave_both', 'shy_giggle', 'happy_run', 'sitting_laugh', 'hooray'];
  const paths = Object.fromEntries(ids.map(id => [id, new URL(id + '.webp', base).href]));
  const originalSrc = img.currentSrc || img.src;
  const poses = [
    { id: 'hooray', line: 'フー！ やったー！ うれしいノン！' },
    { id: 'shy_giggle', line: 'えへへ。ほめられると、てれちゃうノン！' },
    { id: 'happy_run', line: 'いっしょに あそびに いくノン！' },
    { id: 'sitting_laugh', line: 'あはは！ なんだか たのしいノン！' },
    { id: 'wave_both', line: 'やっほー！ ぼく、ティラノン！' }
  ];
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloaded = new Set();
  let current = 0;
  let currentTimer = null;
  let lastTick = 0;
  const idle = 'wave_both';
  const show = (pose) => {
    if (!preloaded.has(pose)) return false;
    img.src = paths[pose];
    img.dataset.v529Pose = pose;
    card.dataset.v529Pose = pose;
    return true;
  };
  const reset = () => {
    img.classList.remove('v529-react', 'v528-react', 'v527-react');
    card.classList.remove('v529-speaking');
    show(idle);
  };
  // Preload avoids a blank first-tap flash. Keep the original approved
  // website illustration unless the new idle frame loads successfully.
  const load = id => new Promise(resolve => {
    const preview = new Image();
    preview.onload = () => { preloaded.add(id); resolve(true); };
    preview.onerror = () => resolve(false);
    preview.decoding = 'async';
    preview.src = paths[id];
    if (preview.complete && preview.naturalWidth > 0) {
      preloaded.add(id);
      resolve(true);
    }
  });
  Promise.all(ids.map(load)).then(() => {
    if (preloaded.has(idle)) {
      img.classList.remove('v528-react', 'v527-react');
      show(idle);
      card.classList.add('v529-ready');
    } else {
      img.src = originalSrc;
      card.classList.add('v529-fallback');
    }
  });
  img.addEventListener('animationend', event => {
    if (event.target === img && event.animationName.startsWith('v529-')) {
      img.classList.remove('v529-react');
    }
  });
  button.addEventListener('click', () => {
    const choice = poses[current % poses.length];
    current += 1;
    speech.textContent = '「' + choice.line + '」';
    speech.hidden = false;
    button.textContent = 'もうひとこと！';
    button.setAttribute('aria-expanded', 'true');
    if (currentTimer !== null) clearTimeout(currentTimer);
    currentTimer = null;
    lastTick += 1;
    const thisTick = lastTick;
    img.classList.remove('v528-react', 'v527-react', 'v529-react');
    card.classList.remove('v529-speaking');
    if (reduced() || !preloaded.has(idle) || !preloaded.has(choice.id)) {
      if (preloaded.has(idle)) show(idle);
      return;
    }
    show(choice.id);
    card.classList.add('v529-speaking');
    void img.offsetWidth;
    img.classList.add('v529-react');
    currentTimer = setTimeout(() => {
      if (thisTick === lastTick) reset();
      currentTimer = null;
    }, 840);
  });
})();