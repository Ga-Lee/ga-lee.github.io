(() => {
  const intro = document.querySelector('.life-intro');
  if (!intro) return;
  const stage = document.createElement('aside');
  stage.className = 'cat-playground';
  stage.tabIndex = -1;
  stage.setAttribute('aria-label', 'Laifu and Qiuqiu’s little corner');
  stage.innerHTML = `<div class="cat-heading">A little company<span>Two cats, two little worlds.</span></div><div class="cat-ground"></div><div class="cat-toy" aria-hidden="true"></div><p class="cat-hint">Say hello with your cursor · Click a cat to meet them</p><div class="cat-help" id="cat-help" hidden>Move the yarn with your mouse or ← →.<br>Space: roll · P: playful hop · Esc: let them relax</div><div class="cat-controls"><button type="button" id="cat-play" aria-expanded="false" aria-controls="cat-help">Yarn time</button><button type="button" id="cat-hide" aria-label="Hide animated cats">−</button></div>`;
  intro.after(stage);
  const toy = stage.querySelector('.cat-toy');
  const play = stage.querySelector('#cat-play');
  const hide = stage.querySelector('#cat-hide');
  const help = stage.querySelector('.cat-help');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = stage.clientWidth, playing = false, collapsed = false, visible = true;
  let target = width / 2, last = 0, frame, openPet = null;
  let pointer = null;

  // Articulated SVG: independent head, shoulder, paws and tail, no external runtime.
  function drawing(pet) {
    const tabby = pet === 'laifu', id = pet;
    const fur = tabby ? ['#d4d3c9','#a2a69d','#838e87'] : ['#fffef4','#e1e6dc','#bac9c1'];
    const outline = tabby ? '#7b857e' : '#a7b9b0';
    return `<svg class="cat-drawing" viewBox="0 0 180 160" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <defs><radialGradient id="${id}-fur" cx="36%" cy="22%" r="85%"><stop stop-color="${fur[0]}"/><stop offset=".7" stop-color="${fur[1]}"/><stop offset="1" stop-color="${fur[2]}"/></radialGradient><radialGradient id="${id}-cream" cx="40%" cy="20%" r="85%"><stop stop-color="#fffdf2"/><stop offset="1" stop-color="${tabby ? '#d6d5c7' : '#e6ebe0'}"/></radialGradient><linearGradient id="${id}-ear" x2="0" y2="1"><stop stop-color="#e5bdb5"/><stop offset="1" stop-color="#f0d9cd"/></linearGradient></defs>
      <ellipse class="cat-shadow" cx="91" cy="147" rx="57" ry="5" fill="#677e6d" opacity=".12"/>
      <g class="cat-rig" stroke="${outline}" stroke-width=".85">
      <g class="cat-tail"><path d="M55 120C23 122 20 104 27 87C31 78 35 69 30 66C23 62 13 77 13 93C11 119 29 135 56 133" fill="url(#${id}-fur)"/>${tabby ? '<path d="M17 86Q22 89 28 88M16 100Q21 103 25 103M25 118L31 113M39 128L42 119" stroke="#737f76" stroke-width="4" opacity=".65"/>' : ''}</g>
      <g class="cat-legs-rear"><path class="cat-leg rear-a" d="M62 109Q50 119 51 139Q52 147 64 145Q71 144 70 138L76 117Z" fill="${fur[2]}"/><path class="cat-leg rear-b" d="M113 111Q113 128 119 139Q123 147 134 143Q139 140 133 134L132 113Z" fill="${fur[2]}"/></g>
      <g class="cat-torso"><path d="M48 119C41 97 51 76 73 73C86 68 111 70 127 85C143 98 143 125 130 134C113 144 63 142 51 131Z" fill="url(#${id}-fur)"/><ellipse cx="105" cy="110" rx="24" ry="27" fill="url(#${id}-cream)" stroke="none" opacity=".85"/>
      ${tabby ? '<g stroke="#748076" stroke-width="5" opacity=".7"><path d="M59 84Q57 92 65 97M74 77Q70 88 77 91M87 77Q83 85 91 91M47 108L61 113M47 121L60 123"/></g>' : '<path d="M59 89Q67 95 73 90" stroke="#c4cec4" stroke-width="3"/>'}</g>
      <g class="cat-legs-front"><g class="cat-leg front-a"><path d="M66 111Q61 123 63 138Q64 147 76 146Q86 146 82 137L84 112" fill="url(#${id}-fur)"/><path d="M69 141V144M75 141V145" opacity=".5"/></g><g class="cat-leg front-b"><path d="M115 110Q112 124 114 138Q114 147 127 146Q138 146 132 137L132 112" fill="url(#${id}-cream)"/><path d="M119 141V145M125 141V145" opacity=".5"/></g></g>
      <g class="cat-head">
      <path d="M61 52C52 44 49 20 54 18C58 16 76 29 81 36L115 35C121 26 136 ${tabby ? '14' : '7'} 141 ${tabby ? '18' : '12'}C147 23 143 46 138 54C151 68 148 90 133 100C117 113 80 113 62 100C46 91 46 67 61 52Z" fill="url(#${id}-fur)"/>
      <path d="M59 29Q61 43 66 49L77 40Q66 29 59 29Z" fill="url(#${id}-ear)" stroke="none"/><path d="M135 25Q126 29 120 40L135 48Q140 31 135 25Z" fill="url(#${id}-ear)" stroke="none"/>
      <path d="M58 80Q51 83 50 86L59 88M139 79Q147 81 150 85L141 88" fill="${fur[1]}" stroke="none"/>
      ${tabby ? '<g stroke="#707c73" stroke-width="4" opacity=".78"><path d="M82 44L86 53L93 45L100 53L106 43M61 65L70 69M56 76L66 79M136 65L127 69M141 76L132 79"/></g>' : '<g stroke="#b9c7bb" stroke-width="2.8"><path d="M86 43L89 49M98 41V48M111 43L107 49"/></g>'}
      <ellipse cx="98" cy="91" rx="29" ry="17" fill="url(#${id}-cream)" stroke="none"/>
      <g class="cat-eyes-open"><g class="cat-eye"><ellipse cx="77" cy="73" rx="10" ry="12" fill="#7f9579" stroke="#667766"/><ellipse cx="78" cy="73" rx="6.2" ry="10" fill="#253d32" stroke="none"/><ellipse cx="75" cy="68" rx="3.2" ry="4" fill="#fff" stroke="none"/><circle cx="81" cy="78" r="1.5" fill="#e6f1da" stroke="none"/></g><g class="cat-eye"><ellipse cx="121" cy="73" rx="10" ry="12" fill="#8a9d7c" stroke="#667766"/><ellipse cx="120" cy="73" rx="6.2" ry="10" fill="#253d32" stroke="none"/><ellipse cx="117" cy="68" rx="3.2" ry="4" fill="#fff" stroke="none"/><circle cx="123" cy="78" r="1.5" fill="#e6f1da" stroke="none"/></g></g>
      <g class="cat-eyes-closed" stroke="#6d7c70" stroke-width="2"><path d="M68 75Q77 81 85 74M112 74Q121 81 129 75"/></g>
      <ellipse cx="67" cy="86" rx="7" ry="3" fill="#d6aaa0" opacity=".25" stroke="none"/><ellipse cx="132" cy="86" rx="7" ry="3" fill="#d6aaa0" opacity=".25" stroke="none"/>
      <path d="M93 87Q99 84 104 87Q106 89 99 93Q92 90 93 87Z" fill="#c18f88" stroke="none"/><path d="M99 93V97M99 97Q94 102 89 97M99 97Q104 102 109 97" stroke="#7e8172" stroke-width="1.1"/>
      <path class="cat-tongue" d="M96 99Q95 109 100 109Q105 109 103 99" fill="#dfa6a3" stroke="none"/>
      <path d="M77 91L49 87M75 96L46 97M121 91L149 87M123 96L152 97" stroke="#829084" stroke-width=".85" opacity=".65"/>
      ${!tabby ? '<path d="M72 104Q99 119 126 104" stroke="#b4c5bd" stroke-width="4" stroke-dasharray="1 5"/><circle cx="101" cy="112" r="5" fill="#d9bd76" stroke="#bca365"/><path d="M99 110L102 113" stroke="#fff5ce"/>' : ''}
      </g><g class="cat-groom-paw"><path d="M74 125Q77 107 89 99Q98 95 101 102Q102 109 92 113L87 133" fill="url(#${id}-cream)"/><path d="M92 101L94 105M87 104L90 108" opacity=".5"/></g>
      </g><g class="cat-zzz" fill="#95aa9a" stroke="none" font-family="Georgia,serif"><text x="132" y="58" font-size="12">z</text><text x="144" y="42" font-size="17">z</text><text x="155" y="22" font-size="21">z</text></g>
    </svg>`;
  }
  const cats = ['laifu','qiuqiu'].map((pet, i) => {
    const name = i ? 'Qiuqiu' : 'Laifu';
    const shell = document.createElement('div');
    shell.className = 'cat-character'; shell.dataset.pet = pet; shell.dataset.state = i ? 'groom' : 'sit';
    shell.innerHTML = `<button class="cat-pet" type="button" aria-label="Say hello to ${name}" aria-expanded="false" aria-controls="${pet}-hello"><span class="cat-mirror">${drawing(pet)}</span></button><div class="cat-greeting" id="${pet}-hello" hidden><span class="cat-callout">${name}<span>${i ? '秋秋' : '来福'}</span></span><button class="cat-avatar" type="button" aria-label="View ${name}’s photos and introduction"><img src="assets/life/${i ? 'qiuqiu-desk' : 'laifu-closeup'}.jpg" alt="${name}" width="64" height="64"><span>Meet me ↗</span></button></div>`;
    stage.append(shell);
    const button = shell.querySelector('.cat-pet');
    const cat = {pet, shell, button, mirror:shell.querySelector('.cat-mirror'), popup:shell.querySelector('.cat-greeting'), x:0, goal:0, facing:i ? -1 : 1, index:i, state:i ? 'groom' : 'sit', until:performance.now() + (i ? 5000 : 3500), nextReact:0};
    button.addEventListener('click', () => {
      const opening = openPet !== cat; closeGreetings();
      if (opening) {openPet = cat; cat.popup.hidden = false; button.setAttribute('aria-expanded','true'); setState(cat,'hello',performance.now(),Infinity);}
    });
    shell.querySelector('.cat-avatar').addEventListener('click', event => document.dispatchEvent(new CustomEvent('cat-photo',{detail:{pet,opener:event.currentTarget}})));
    return cat;
  });
  function closeGreetings() {
    cats.forEach(cat => {cat.popup.hidden = true; cat.button.setAttribute('aria-expanded','false'); if (cat === openPet) setState(cat,'sit',performance.now(),2000);});
    openPet = null;
  }
  function bounds(cat) {
    // Independent home ranges, rather than a common idle destination.
    const size = cat.shell.offsetWidth;
    return cat.index === 0 ? [8,Math.max(8,width*.49-size)] : [width*.51,Math.max(width*.51,width-size-8)];
  }
  function render(cat) {
    cat.x = Math.max(4,Math.min(width-cat.shell.offsetWidth-4,cat.x));
    cat.shell.style.transform = `translateX(${cat.x}px)`; cat.mirror.style.transform = `scaleX(${cat.facing})`;
  }
  function setState(cat,state,now,duration) {cat.state = state; cat.shell.dataset.state = state; cat.until = now + duration;}
  function idle(cat,now) {
    const choice = Math.random();
    if (choice < .3) {const [min,max] = bounds(cat); cat.goal = min + Math.random()*(max-min); setState(cat,'walk',now,7000);}
    else if (choice < .53) setState(cat,'groom',now,4000+Math.random()*3000);
    else if (choice < .73) setState(cat,'sleep',now,9000+Math.random()*9000);
    else if (choice < .87) setState(cat,'sit',now,3500+Math.random()*4000);
    else setState(cat,'stand',now,2500+Math.random()*3500);
  }
  function syncControls() {play.textContent = playing ? 'Let them relax' : 'Yarn time'; play.setAttribute('aria-expanded',String(playing)); help.hidden = !playing; toy.classList.toggle('visible',playing);}
  play.addEventListener('click',() => {
    playing = !playing; closeGreetings();
    if (collapsed) {collapsed = false; stage.classList.remove('is-collapsed'); hide.textContent='−'; hide.setAttribute('aria-label','Hide animated cats');}
    cats.forEach(cat=>setState(cat,'stand',performance.now(),500));
    if (playing) stage.focus(); syncControls();
  });
  hide.addEventListener('click',() => {collapsed = !collapsed; playing = false; closeGreetings(); stage.classList.toggle('is-collapsed',collapsed); hide.textContent = collapsed ? '+' : '−'; hide.setAttribute('aria-label',collapsed ? 'Show animated cats' : 'Hide animated cats'); syncControls();});
  stage.addEventListener('pointermove',event => {
    if (event.pointerType === 'touch' || collapsed) return;
    const rect = stage.getBoundingClientRect(); pointer = {x:event.clientX-rect.left,y:event.clientY-rect.top};
    if (playing && !event.target.closest('button')) target = Math.max(20,Math.min(width-20,pointer.x));
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{pointer=null;});
  stage.addEventListener('pointerdown',event=>{
    if (event.pointerType==='touch' && playing && !event.target.closest('button')) target=event.clientX-stage.getBoundingClientRect().left;
    if (!event.target.closest('.cat-character') && !event.target.closest('.cat-controls')) closeGreetings();
  },{passive:true});
  stage.addEventListener('keydown',event=>{
    if (event.key==='Escape') {closeGreetings(); playing=false; syncControls(); play.focus(); return;}
    if (!playing || event.target.closest('button') || !['ArrowLeft','ArrowRight',' ','p','P'].includes(event.key)) return;
    event.preventDefault();
    if (event.key==='ArrowLeft') target=Math.max(20,target-45);
    if (event.key==='ArrowRight') target=Math.min(width-20,target+45);
    if (event.key===' ' || event.key.toLowerCase()==='p') cats.forEach((cat,i)=>setState(cat,event.key===' '?'roll':'pounce',performance.now(),event.key===' '?1400:1000+i*80));
  });
  function tick(now) {
    const dt=Math.min((now-last)/1000 || 0,.04); last=now;
    if (visible && !collapsed && !document.querySelector('dialog[open]') && !motion.matches) {
      toy.style.transform=`translateX(${target-10}px)`;
      cats.forEach(cat=>{
        if (cat===openPet) return;
        if (['roll','pounce','nuzzle','swat'].includes(cat.state) && now<cat.until) return;
        if (pointer && !playing && now>cat.nextReact) {
          const headX=cat.x+cat.shell.offsetWidth*(cat.facing===1 ? .56 : .44);
          const headY=stage.clientHeight-30-cat.shell.offsetHeight*.55;
          if (Math.hypot(pointer.x-headX,(pointer.y-headY)*1.15)<cat.shell.offsetWidth*.42) {setState(cat,Math.random()<.65?'nuzzle':'swat',now,2000); cat.nextReact=now+3400; return;}
        }
        if (playing) {
          const size=cat.shell.offsetWidth;
          cat.goal=Math.max(4,Math.min(width-size-4,target-size*.5+(cat.index ? 72:-72)));
          if (Math.abs(cat.goal-cat.x)>8) setState(cat,'walk',now,800);
          else if (cat.state==='walk'||now>cat.until) setState(cat,cat.index ? 'swat':'sit',now,1800+Math.random()*1500);
        } else if (now>cat.until) idle(cat,now);
        if (cat.state==='walk') {
          const delta=cat.goal-cat.x;
          if (Math.abs(delta)<3) setState(cat,'stand',now,1600+Math.random()*1300);
          else {cat.x+=Math.sign(delta)*Math.min(Math.abs(delta),dt*(playing?75:21)); cat.facing=delta>0?1:-1;}
        }
        render(cat);
      });
    }
    frame=requestAnimationFrame(tick);
  }
  new ResizeObserver(()=>{const previous=width; width=stage.clientWidth; target=Math.min(target,width-20); cats.forEach(cat=>{cat.x=previous?cat.x/previous*width:cat.x; const [min,max]=bounds(cat); cat.goal=Math.max(min,Math.min(max,cat.goal)); render(cat);});}).observe(stage);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(stage);
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame); if(!document.hidden){last=0; frame=requestAnimationFrame(tick);}});
  cats.forEach(cat=>{const [min,max]=bounds(cat);cat.x=min+(max-min)*.55;cat.goal=cat.x;render(cat);});
  frame=requestAnimationFrame(tick);
})();
