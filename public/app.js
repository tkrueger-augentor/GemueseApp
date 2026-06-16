const tilesEl = document.getElementById('tiles');
const totalPriceEl = document.getElementById('totalPrice');
const emptyStateEl = document.getElementById('emptyState');
const resetBtn = document.getElementById('resetBtn');

const LONG_PRESS_MS = 500;

let vegetables = [];
const counts = {};

function formatPrice(value) {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function updateTotal() {
  const total = vegetables.reduce((sum, veg) => sum + (counts[veg.id] || 0) * veg.price, 0);
  totalPriceEl.textContent = formatPrice(total);
}

function renderTile(veg) {
  const count = counts[veg.id] || 0;
  const tile = document.createElement('div');
  tile.className = 'tile' + (count > 0 ? ' has-count' : ' zero');
  tile.dataset.id = veg.id;
  tile.innerHTML = `
    <div class="veg-name">${veg.name}</div>
    <div class="veg-price">${formatPrice(veg.price)} / Stk.</div>
    <div class="veg-count">${count}</div>
  `;
  return tile;
}

function renderTiles() {
  tilesEl.innerHTML = '';
  if (vegetables.length === 0) {
    emptyStateEl.style.display = 'block';
    return;
  }
  emptyStateEl.style.display = 'none';
  for (const veg of vegetables) {
    tilesEl.appendChild(renderTile(veg));
  }
}

function updateTileDom(id) {
  const tile = tilesEl.querySelector(`.tile[data-id="${id}"]`);
  if (!tile) return;
  const count = counts[id] || 0;
  tile.classList.toggle('has-count', count > 0);
  tile.classList.toggle('zero', count === 0);
  tile.querySelector('.veg-count').textContent = count;
}

function changeCount(id, delta) {
  const current = counts[id] || 0;
  counts[id] = Math.max(0, current + delta);
  updateTileDom(id);
  updateTotal();
}

function attachTileEvents() {
  let pressTimer = null;
  let longPressTriggered = false;

  const start = (id) => {
    longPressTriggered = false;
    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      changeCount(id, -1);
    }, LONG_PRESS_MS);
  };

  const cancel = () => {
    clearTimeout(pressTimer);
  };

  const end = (id) => {
    clearTimeout(pressTimer);
    if (!longPressTriggered) {
      changeCount(id, 1);
    }
  };

  tilesEl.addEventListener('mousedown', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    start(tile.dataset.id);
  });
  tilesEl.addEventListener('mouseup', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    end(tile.dataset.id);
  });
  tilesEl.addEventListener('mouseleave', cancel, true);

  tilesEl.addEventListener('touchstart', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    start(tile.dataset.id);
  }, { passive: true });
  tilesEl.addEventListener('touchend', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    e.preventDefault();
    end(tile.dataset.id);
  });
  tilesEl.addEventListener('touchcancel', cancel);

  tilesEl.addEventListener('contextmenu', (e) => e.preventDefault());
}

async function loadVegetables() {
  const res = await fetch('/api/vegetables');
  vegetables = await res.json();
  for (const veg of vegetables) {
    if (!(veg.id in counts)) counts[veg.id] = 0;
  }
  renderTiles();
  updateTotal();
}

resetBtn.addEventListener('click', () => {
  for (const veg of vegetables) {
    counts[veg.id] = 0;
    updateTileDom(veg.id);
  }
  updateTotal();
});

attachTileEvents();
loadVegetables();
