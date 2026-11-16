(() => {
  const photos = [
    {pet:'laifu', name:'Laifu', src:'assets/life/laifu-closeup.jpg', caption:'A little closer', alt:'Laifu, a striped tabby cat, looking closely at the camera'},
    {pet:'laifu', name:'Laifu', src:'assets/life/laifu-headpats.jpg', caption:'Head pats', alt:'Laifu being held and gently patted on the head'},
    {pet:'qiuqiu', name:'Qiuqiu', src:'assets/life/qiuqiu-sunset.jpg', caption:'Golden-hour walk', alt:'Qiuqiu standing in the grass with palm trees and a golden sunset behind'},
    {pet:'qiuqiu', name:'Qiuqiu', src:'assets/life/qiuqiu-desk.jpg', caption:'Desk companion', alt:'Qiuqiu in a yellow shirt standing beside a laptop'}
  ];
  const dialog = document.getElementById('photo-dialog');
  const full = document.getElementById('photo-full');
  if (!dialog) return;
  let viewerCards = photos;
  let index = 0;
  let opener;
  const introductions = {
    laifu: 'Meet Laifu (来福), my round-faced tabby with bold charcoal stripes and big, bright eyes. A few little moments from life together.',
    qiuqiu: 'Meet Qiuqiu (秋秋), my silver-coated cat with delicate ears and a little necklace. Here are a few moments, from golden-hour walks to keeping me company at my desk.'
  };
  const introduction = document.createElement('p');
  introduction.id = 'photo-introduction';
  dialog.querySelector('figure').after(introduction);

  function showPhoto(position) {
    index = (position + viewerCards.length) % viewerCards.length;
    const card = viewerCards[index];
    full.src = card.src;
    full.alt = card.alt;
    introduction.textContent = introductions[card.pet] || '';
    document.getElementById('photo-caption').textContent = `${card.name} — ${card.caption}`;
    document.getElementById('photo-count').textContent = `${index + 1} / ${viewerCards.length}`;
  }
  document.addEventListener('cat-photo', event => {
    viewerCards = photos.filter(photo => photo.pet === event.detail.pet);
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
})();
