const filters = document.querySelectorAll('[data-filter]');
const papers = [...document.querySelectorAll('.paper')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  let count = 0;
  papers.forEach(paper => { paper.hidden = button.dataset.filter !== 'all' && paper.dataset.category !== button.dataset.filter; if (!paper.hidden) count++; });
  document.getElementById('filter-status').textContent = `Showing ${count} ${count === 1 ? 'work' : 'works'}.`;
}));
