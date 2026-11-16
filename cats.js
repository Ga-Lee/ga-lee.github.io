(() => {
  const stage = document.createElement('aside');
  stage.className = 'cat-playground';
  stage.tabIndex = -1;
  stage.setAttribute('aria-label', 'Play with Laifu and Qiuqiu');
  stage.innerHTML = `<span class="cat-heading">Laifu &amp; Qiuqiu</span><div class="cat-ground"></div><div class="cat-toy" aria-hidden="true"></div><div class="cat-help" id="cat-help" hidden>Move the mouse or tap the ground to move the yarn.<br>← → move · Space: roll · P: pounce<br>Click a cat for photos. Esc: stop playing.</div><div class="cat-controls"><button type="button" id="cat-play" aria-expanded="false" aria-controls="cat-help">Play with the cats</button><button type="button" id="cat-hide" aria-label="Hide animated cats" title="Hide animated cats">−</button></div>`;
  document.querySelector('.life-intro').after(stage);
  const toy = stage.querySelector('.cat-toy');
  const play = stage.querySelector('#cat-play');
  const hide = stage.querySelector('#cat-hide');
  const help = stage.querySelector('.cat-help');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = stage.clientWidth;
  let playing = false;
  let collapsed = false;
  let target = width / 2;
  let lureUntil = 0;
  let last = 0;
  let frame;
  let visible = true;

  function drawing(pet) {
    const tabby = pet === 'laifu';
    const fur = tabby ? '#b9bbb3' : '#e1e4de';
    const shade = tabby ? '#e0dfd4' : '#f1f1e8';
    const line = tabby ? '#4d5551' : '#7c8985';
    return `<svg class="cat-drawing" viewBox="0 0 120 108" aria-hidden="true" fill="none" stroke="${line}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="61" cy="100" rx="35" ry="3" fill="#3e5753" opacity=".09" stroke="none"/>
      <path class="cat-tail" d="M41 76C13 78 12 51 20 38C24 31 28 34 25 42C19 58 23 65 42 65" fill="${fur}"/>
      <path d="M41 57C27 65 32 87 48 88L82 86C99 80 93 63 78 58Z" fill="${fur}"/>
      <path class="cat-leg-back" d="M44 77L40 96Q43 101 52 97L57 78" fill="${fur}"/>
      <path class="cat-leg-front" d="M75 77L76 97Q83 101 89 96L88 75" fill="${shade}"/>
      <path d="M58 37L55 ${tabby ? '14' : '9'}L76 25L92 22L108 ${tabby ? '13' : '6'}L109 42C119 59 105 74 83 74C60 74 48 59 58 37Z" fill="${fur}"/>
      <path d="M61 30L60 20L70 28M97 28L104 17L104 33" stroke="#c59e9b" stroke-width="3"/>
      <ellipse cx="85" cy="58" rx="18" ry="13" fill="${shade}" stroke="none"/>
      <g class="cat-eye"><ellipse cx="72" cy="44" rx="6" ry="7" fill="${tabby ? '#9da98d' : '#a6b49a'}"/><ellipse cx="99" cy="43" rx="5.5" ry="7" fill="#a6b49a"/><path d="M73 40V47M99 39V46" stroke="#303c37" stroke-width="3"/><circle cx="74" cy="41" r="1.5" fill="white" stroke="none"/><circle cx="100" cy="40" r="1.5" fill="white" stroke="none"/></g>
      <path d="M82 54L89 54L85.5 58Z" fill="#b78b83" stroke-width="1.3"/><path d="M85.5 58V62M85.5 62Q81 66 78 62M85.5 62Q90 66 93 62" stroke-width="1.2"/>
      <path d="M68 57L48 53M67 62L47 63M101 56L119 51M102 61L120 62" stroke-width="1"/>
      ${tabby ? '<path d="M73 26L77 34L82 27L87 34L92 25M57 45L65 48M56 51L64 54M111 45L105 48M111 51L105 54M39 63L49 70M49 59L57 66M59 59L65 66M41 86L49 88M78 88L87 88M18 48L24 51M18 57L26 59" stroke="#5e655f" stroke-width="3"/>' : '<path d="M74 27L78 32M85 25L86 31M96 26L93 32" stroke="#b5bcb5" stroke-width="2"/><path d="M67 70Q87 81 105 67" stroke="#9faea7" stroke-width="4"/><circle cx="87" cy="77" r="4" fill="#d3b56a" stroke="#9c8552" stroke-width="1.2"/>'}
    </svg>`;
  }
  const cats = ['laifu', 'qiuqiu'].map((pet, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cat-pet';
    button.dataset.pet = pet;
    button.dataset.state = 'sit';
    const name = i ? 'Qiuqiu' : 'Laifu';
    button.setAttribute('aria-label', `Meet ${name}: view photos`);
    button.innerHTML = `<span class="cat-name">${name}</span><span class="cat-mirror">${drawing(pet)}</span>`;
    stage.prepend(button);
    button.addEventListener('click', () => {
      playing = false;
      lureUntil = 0;
      syncControls();
      document.dispatchEvent(new CustomEvent('cat-photo', {detail: {pet, opener: button}}));
    });
    return {pet, button, mirror: button.querySelector('.cat-mirror'), x: width * (.26 + i * .30), goal: width * (.35 + i * .25), speed: 0, facing: 1, until: 0, nextWander: performance.now() + 1700 + i * 1300};
  });
  const limit = cat => Math.max(0, width - cat.button.offsetWidth - 8);
  function render(cat) {cat.x = Math.max(6, Math.min(limit(cat), cat.x)); cat.button.style.transform = `translateX(${cat.x}px)`; cat.mirror.style.transform = `scaleX(${cat.facing})`;}
  function action(cat, state, now) {
    if (motion.matches) return;
    cat.until = now + (state === 'roll' ? 1100 : 750);
    cat.button.dataset.state = state;
    cat.speed = 0;
  }
  function syncControls() {
    play.textContent = playing ? 'Playing · Esc to stop' : 'Play with the cats';
    play.setAttribute('aria-expanded', String(playing));
    help.hidden = !playing;
    toy.classList.toggle('visible', playing || performance.now() < lureUntil);
  }
  play.addEventListener('click', () => {
    playing = !playing;
    if (collapsed) {collapsed = false; stage.classList.remove('is-collapsed'); hide.textContent = '−'; hide.setAttribute('aria-label', 'Hide animated cats');}
    if (playing) {target = width / 2; stage.focus();}
    else lureUntil = 0;
    syncControls();
  });
  hide.addEventListener('click', () => {
    collapsed = !collapsed;
    stage.classList.toggle('is-collapsed', collapsed);
    hide.textContent = collapsed ? '+' : '−';
    hide.setAttribute('aria-label', collapsed ? 'Show animated cats' : 'Hide animated cats');
    if (collapsed) {playing = false; lureUntil = 0;}
    syncControls();
  });
  stage.addEventListener('pointermove', event => {
    if (collapsed || event.pointerType === 'touch' || document.querySelector('dialog[open]')) return;
    if (event.target.closest('.cat-controls')) return;
    const rect = stage.getBoundingClientRect();
    target = Math.max(15, Math.min(width - 20, event.clientX - rect.left));
    lureUntil = performance.now() + 2600;
    toy.classList.add('visible');
  }, {passive: true});
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || collapsed || event.target.closest('button')) return;
    target = Math.max(15, Math.min(width - 20, event.clientX - stage.getBoundingClientRect().left));
    lureUntil = performance.now() + 3000;
    toy.classList.add('visible');
  }, {passive: true});
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight',' ','p','P','Escape'].includes(event.key)) return;
    if (event.key === 'Escape') {playing = false; lureUntil = 0; syncControls(); play.focus(); return;}
    // Space on a cat retains the native button action (open its photos).
    if (event.key === ' ' && event.target.closest('.cat-pet')) return;
    event.preventDefault();
    playing = true;
    if (event.key === 'ArrowLeft') target = Math.max(15, target - 45);
    if (event.key === 'ArrowRight') target = Math.min(width - 20, target + 45);
    if (event.key === ' ') cats.forEach(cat => action(cat, 'roll', performance.now()));
    if (event.key.toLowerCase() === 'p') cats.forEach(cat => action(cat, 'pounce', performance.now()));
    syncControls();
  });
  function tick(now) {
    const dt = Math.min((now - last) / 1000 || 0, .05); last = now;
    if (visible && !collapsed && !document.querySelector('dialog[open]')) {
      const luring = playing || now < lureUntil;
      toy.classList.toggle('visible', luring);
      toy.style.transform = `translateX(${target - 9}px)`;
      cats.forEach((cat, i) => {
        if (now < cat.until) return;
        if (luring) {
          const catWidth = cat.button.offsetWidth;
          const leftGoal = Math.max(6, Math.min(width - 2 * catWidth - 28, target - catWidth - 12));
          cat.goal = leftGoal + i * (catWidth + 12);
        }
        else if (now > cat.nextWander) {
          cat.goal = Math.max(6, Math.min(limit(cat), cat.x + (Math.random() - .5) * 420));
          cat.nextWander = now + 3500 + Math.random() * 4000;
          if (Math.random() < .18) {action(cat, 'roll', now); return;}
        }
        const delta = cat.goal - cat.x;
        if (Math.abs(delta) > 5 && !motion.matches) {
          const speed = luring ? 130 + i * 15 : 28 + i * 6;
          cat.speed = Math.sign(delta) * Math.min(speed, Math.abs(delta) * 3);
          cat.x += cat.speed * dt;
          cat.facing = delta > 0 ? 1 : -1;
          cat.button.dataset.state = luring ? 'run' : 'walk';
        } else {
          cat.button.dataset.state = 'sit';
          if (luring && !motion.matches && now > cat.nextWander) {action(cat, 'pounce', now); cat.nextWander = now + 2200 + i * 600;}
        }
        render(cat);
      });
    }
    frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(() => {width = stage.clientWidth; target = Math.min(target, width - 20); cats.forEach(render);}).observe(stage);
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;}).observe(stage);
  document.addEventListener('visibilitychange', () => {cancelAnimationFrame(frame); if (!document.hidden) {last = 0; frame = requestAnimationFrame(tick);}});
  cats.forEach(render);
  frame = requestAnimationFrame(tick);
})();
