(() => {
  const gallery = document.getElementById('life-gallery');
  if (!gallery) return;
  const cards = [...gallery.querySelectorAll('.life-card')];
  const buttons = [...document.querySelectorAll('[data-cat]')];
  const prev = document.getElementById('gallery-prev');
  const next = document.getElementById('gallery-next');
  const dialog = document.getElementById('photo-dialog');
  const full = document.getElementById('photo-full');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeCards = cards;
  let viewerCards = cards;
  let index = 0;
  let opener;

  function updateArrows() {
    prev.disabled = gallery.scrollLeft <= 2;
    next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
  }
  function scrollGallery(direction) {
    const step = activeCards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap);
    gallery.scrollBy({left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => scrollGallery(-1));
  next.addEventListener('click', () => scrollGallery(1));
  gallery.addEventListener('scroll', updateArrows, {passive: true});
  new ResizeObserver(updateArrows).observe(gallery);
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      scrollGallery(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = button.dataset.cat !== 'all' && card.dataset.pet !== button.dataset.cat; });
    activeCards = cards.filter(card => !card.hidden);
    gallery.scrollTo({left: 0, behavior: 'instant'});
    document.getElementById('gallery-status').textContent = `${activeCards.length} photos`;
    updateArrows();
  }));

  function showPhoto(position) {
    index = (position + viewerCards.length) % viewerCards.length;
    const card = viewerCards[index];
    full.src = card.href;
    full.alt = card.querySelector('img').alt;
    document.getElementById('photo-caption').textContent = `${card.querySelector('strong').textContent} — ${card.querySelector('.life-caption span').textContent}`;
    document.getElementById('photo-count').textContent = `${index + 1} / ${viewerCards.length}`;
  }
  cards.forEach(card => card.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = card;
    viewerCards = activeCards;
    showPhoto(activeCards.indexOf(card));
    dialog.showModal();
    document.documentElement.classList.add('photo-viewer-open');
  }));
  document.addEventListener('cat-photo', event => {
    viewerCards = cards.filter(card => card.dataset.pet === event.detail.pet);
    if (!viewerCards.length) return;
    opener = event.detail.opener;
    showPhoto(0);
    dialog.showModal();
    document.documentElement.classList.add('photo-viewer-open');
  });
  document.getElementById('photo-prev').addEventListener('click', () => showPhoto(index - 1));
  document.getElementById('photo-next').addEventListener('click', () => showPhoto(index + 1));
  document.getElementById('photo-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('photo-viewer-open');
    opener?.focus({preventScroll: true});
  });
  let touchStart;
  full.addEventListener('touchstart', event => { touchStart = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null; }, {passive: true});
  full.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showPhoto(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});
  updateArrows();
})();
