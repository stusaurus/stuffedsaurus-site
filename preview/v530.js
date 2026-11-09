/* V5.30 — single director for the approved five-frame Tiranon reactions.
 * Keeps each illustration rigid: no morph, scale, isolated body-part motion
 * or layered crossfade. Tap once = anticipation, expressive hold, landing.
 * Legacy V5.26–29 click handlers remain as fallback for other characters,
 * but are skipped for this character with a capture-phase handler.
 */
(() => {
  const root = document.getElementById('view-friends');
  const card = root?.querySelector('.v529-tiranon');
  if (!card || card.dataset.v530Installed === 'true') return;
  const art = card.querySelector('.character-art');
  const img = art?.querySelector('img');
  const button = card.querySelector('button.friend-discovery-button');
  const speech = card.querySelector('.v527-speech');
  if (!img || !button || !speech) return;

  const idle = 'wave_both';
  const actions = [
    { id: 'hooray', line: 'フー！ やったー！ うれしいノン！', hold: 850 },
    { id: 'shy_giggle', line: 'えへへ。ほめられると、てれちゃうノン！', hold: 980 },
    { id: 'happy_run', line: 'いっしょに あそびに いくノン！', hold: 830 },
    { id: 'sitting_laugh', line: 'あはは！ なんだか たのしいノン！', hold: 990 },
    { id: 'wave_both', line: 'やっほー！ ぼく、ティラノン！', hold: 880 }
  ];
  const base = new URL('reactions/tiranon/', document.baseURI);
  const src = Object.fromEntries(actions.map(action => [
    action.id, new URL(action.id + '.webp', base).href
  ]));
  const loaded = new Set();
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => reduceQuery.matches;
  const animationClasses = [
    'v527-react', 'v528-react', 'v529-react',
    'v530-prepare', 'v530-perform', 'v530-land'
  ];
  const timers = new Set();
  let sequence = 0;
  let index = 0;
  let active = false;
  const schedule = (fn, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      fn();
    }, delay);
    timers.add(timer);
  };
  const cancel = () => {
    sequence++;
    for (const timer of timers) window.clearTimeout(timer);
    timers.clear();
    active = false;
    img.classList.remove(...animationClasses);
    card.classList.remove('v529-speaking', 'v530-active');
    card.dataset.v530Stage = 'idle';
  };
  const setPose = id => {
    if (!loaded.has(id)) return false;
    // The actual artwork is swapped as one image. Never blend two faces.
    img.src = src[id];
    img.dataset.v529Pose = id;
    card.dataset.v529Pose = id;
    card.dataset.v530Pose = id;
    return true;
  };
  const rest = () => {
    cancel();
    setPose(idle);
  };
  const ready = () => {
    if (!loaded.has(idle) || !card.classList.contains('v529-ready')) return;
    card.classList.add('v530-ready');
    if (!active) setPose(idle);
  };
  // Decode before using a frame so tapping never briefly blanks the portrait.
  const preload = id => new Promise(resolve => {
    const preview = new Image();
    let settled = false;
    const done = result => {
      if (settled) return;
      settled = true;
      if (result) loaded.add(id);
      resolve(result);
    };
    preview.onload = () => {
      if (typeof preview.decode === 'function') {
        preview.decode().then(() => done(true)).catch(() => done(true));
      } else done(true);
    };
    preview.onerror = () => done(false);
    preview.src = src[id];
    if (preview.complete && preview.naturalWidth) preview.onload();
  });

  card.classList.add('v530-director');
  card.dataset.v530Stage = 'idle';
  card.dataset.v530Installed = 'true';
  speech.setAttribute('aria-live', 'polite');
  speech.setAttribute('aria-atomic', 'true');

  // The V5.29 loader may finish after the new script. Observe its ready
  // flag so neither version races the other at startup.
  const observer = new MutationObserver(ready);
  observer.observe(card, { attributes: true, attributeFilter: ['class'] });
  Promise.all(actions.map(action => preload(action.id))).then(ready);

  // Capture at the target button, before old bubble-phase listeners run.
  // The transparent artwork button calls button.click(), and keyboard Enter
  // on either real button follows exactly this same path.
  button.addEventListener('click', event => {
    event.stopImmediatePropagation();
    const action = actions[index % actions.length];
    index++;
    cancel();
    const token = sequence;

    speech.textContent = '「' + action.line + '」';
    speech.hidden = false;
    button.textContent = 'もうひとこと！';
    button.setAttribute('aria-expanded', 'true');
    card.classList.add('v527-spoken');
    if (reduceMotion() || !card.classList.contains('v530-ready') ||
        !loaded.has(action.id)) {
      setPose(idle);
      return;
    }

    active = true;
    setPose(idle);
    card.classList.add('v530-active');
    card.dataset.v530Stage = 'prepare';
    img.classList.add('v530-prepare');
    // Establish anticipation while the idle drawing is still on screen.
    schedule(() => {
      if (token !== sequence || reduceMotion()) return;
      img.classList.remove('v530-prepare');
      if (!setPose(action.id)) { rest(); return; }
      card.dataset.v530Stage = 'perform';
      img.classList.add('v530-perform');

      schedule(() => {
        if (token !== sequence) return;
        img.classList.remove('v530-perform');
        setPose(idle);
        card.dataset.v530Stage = 'land';
        img.classList.add('v530-land');

        schedule(() => {
          if (token === sequence) rest();
        }, 185);
      }, action.hold);
    }, 110);
  }, { capture: true });

  // Changing the system motion preference immediately stops active motion.
  const onMotionChange = () => { if (reduceMotion()) rest(); };
  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', onMotionChange);
  } else if (typeof reduceQuery.addListener === 'function') {
    reduceQuery.addListener(onMotionChange);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) rest();
  });
})();