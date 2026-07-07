/* ===== Auth ===== */
const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('passwordInput');
const logoutBtn = document.getElementById('logoutBtn');
const SESSION_KEY = 'gemuesekiste.adminSession';

function isAuthenticated() { return sessionStorage.getItem(SESSION_KEY) === 'true'; }
function showLogin() { loginView.style.display = 'block'; adminView.style.display = 'none'; }
function showAdmin() { loginView.style.display = 'none'; adminView.style.display = 'block'; initAdmin(); }

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (passwordInput.value === getAdminPassword()) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    passwordInput.value = '';
    showAdmin();
  } else {
    loginError.textContent = 'Falsches Passwort';
  }
});

logoutBtn.addEventListener('click', () => { sessionStorage.removeItem(SESSION_KEY); showLogin(); });

/* ===== Tabs ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'ernte') renderHarvestTab();
    if (btn.dataset.tab === 'koerbe') renderBasketTab();
    if (btn.dataset.tab === 'benutzer') renderUserTab();
  });
});

/* ===== Init ===== */
function initAdmin() {
  renderVegTable();
  renderHarvestTab();
  renderBasketTab();
  renderUserTab();
}

/* ===== Helpers ===== */
function formatPrice(v) { return v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }

function buildWeekSelector(containerId, state, onSelect) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  const weeks = getNextThreeWeeks();
  for (let i = 0; i < weeks.length; i++) {
    const w = weeks[i];
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'week-pill' + (state.idx === i ? ' active' : '');
    pill.textContent = w.label;
    pill.addEventListener('click', () => { state.idx = i; onSelect(weeks[i]); buildWeekSelector(containerId, state, onSelect); });
    el.appendChild(pill);
  }
  return weeks;
}

/* ===== TAB: Gemüse & Preise ===== */
document.getElementById('addForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const price = parseFloat(document.getElementById('newPrice').value);
  const active = document.getElementById('newActive').checked;
  if (!name || isNaN(price)) return;
  const vegetables = loadVegetables();
  vegetables.push({ id: nextId(vegetables), name, price, active });
  saveVegetables(vegetables);
  document.getElementById('addForm').reset();
  document.getElementById('newActive').checked = true;
  renderVegTable();
});

document.getElementById('passwordForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const pw = document.getElementById('newPasswordInput').value.trim();
  if (!pw) return;
  setAdminPassword(pw);
  document.getElementById('newPasswordInput').value = '';
  alert('Passwort geändert.');
});

function renderVegTable() {
  const tbody = document.getElementById('adminTableBody');
  const vegetables = loadVegetables();
  tbody.innerHTML = '';
  for (const veg of vegetables) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${veg.name}" data-field="name" /></td>
      <td><input type="number" step="0.01" min="0" value="${veg.price.toFixed(2)}" data-field="price" /></td>
      <td style="text-align:center"><input type="checkbox" ${veg.active ? 'checked' : ''} data-field="active" /></td>
      <td class="row-actions">
        <button type="button" class="save-btn">Speichern</button>
        <button type="button" class="delete-btn">Löschen</button>
      </td>`;
    row.querySelector('.save-btn').addEventListener('click', () => saveVegRow(veg.id, row));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteVeg(veg.id));
    tbody.appendChild(row);
  }
}

function saveVegRow(id, row) {
  const vegetables = loadVegetables();
  const idx = vegetables.findIndex(v => v.id === id);
  if (idx === -1) return;
  vegetables[idx] = {
    ...vegetables[idx],
    name: row.querySelector('[data-field="name"]').value.trim(),
    price: parseFloat(row.querySelector('[data-field="price"]').value),
    active: row.querySelector('[data-field="active"]').checked,
  };
  saveVegetables(vegetables);
  renderVegTable();
}

function deleteVeg(id) {
  if (!confirm('Dieses Gemüse wirklich löschen?')) return;
  saveVegetables(loadVegetables().filter(v => v.id !== id));
  renderVegTable();
}

/* ===== TAB: Ernte ===== */
const harvestState = { idx: 0 };

function renderHarvestTab() {
  const weeks = buildWeekSelector('harvestWeekSelector', harvestState, (w) => renderHarvestContent(w));
  renderHarvestContent(weeks[harvestState.idx]);
}

function renderHarvestContent(week) {
  const content = document.getElementById('harvestContent');
  const vegetables = loadVegetables();
  const totals = getHarvestForWeek(week.key);

  const items = vegetables
    .map(v => ({ veg: v, qty: totals[v.id] || 0 }))
    .filter(x => x.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  if (items.length === 0) {
    content.innerHTML = '<p class="no-orders">Keine Bestellungen für diese Woche.</p>';
    return;
  }

  const totalValue = items.reduce((s, x) => s + x.qty * x.veg.price, 0);

  content.innerHTML = `
    <table class="harvest-table">
      <thead><tr><th>Gemüse</th><th>Menge</th><th style="text-align:right">Preis/Stk.</th><th style="text-align:right">Gesamt</th></tr></thead>
      <tbody>
        ${items.map(x => `
          <tr>
            <td><strong>${x.veg.name}</strong></td>
            <td><span class="qty-big">${x.qty}×</span></td>
            <td style="text-align:right">${formatPrice(x.veg.price)}</td>
            <td style="text-align:right">${formatPrice(x.qty * x.veg.price)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;padding-top:12px;font-weight:600">Gesamtwert Bestellungen</td>
          <td style="text-align:right;padding-top:12px;font-weight:700;color:var(--color-green-dark)">${formatPrice(totalValue)}</td>
        </tr>
      </tfoot>
    </table>`;
}

/* ===== TAB: Körbe ===== */
const basketState = { idx: 0 };

function renderBasketTab() {
  const weeks = buildWeekSelector('basketWeekSelector', basketState, (w) => renderBasketContent(w));
  renderBasketContent(weeks[basketState.idx]);
}

function renderBasketContent(week) {
  const content = document.getElementById('basketContent');
  const vegetables = loadVegetables();
  const users = loadUsers();
  const baskets = getBasketsForWeek(week.key, users);

  if (baskets.length === 0) {
    content.innerHTML = '<p class="no-orders">Keine Bestellungen für diese Woche.</p>';
    return;
  }

  content.innerHTML = '<div class="basket-list">' +
    baskets.map(basket => {
      const itemsHtml = basket.items
        .filter(i => i.quantity > 0)
        .map(i => {
          const veg = vegetables.find(v => v.id === i.vegId);
          if (!veg) return '';
          return `<div class="basket-item"><span class="item-qty">${i.quantity}×</span> ${veg.name}</div>`;
        }).join('');

      const total = basket.items.reduce((s, i) => {
        const veg = vegetables.find(v => v.id === i.vegId);
        return s + (veg ? i.quantity * veg.price : 0);
      }, 0);

      return `<div class="basket-card">
        <h3>👤 ${basket.username} <span style="font-weight:400;color:var(--color-text-light);font-size:0.85rem">— ${formatPrice(total)}</span></h3>
        <div class="basket-items">${itemsHtml || '<span style="color:var(--color-text-light)">Keine Auswahl</span>'}</div>
      </div>`;
    }).join('') +
  '</div>';
}

/* ===== TAB: Benutzer ===== */
function renderUserTab() {
  const tbody = document.getElementById('userTableBody');
  const users = loadUsers();
  tbody.innerHTML = '';
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="color:var(--color-text-light);padding:16px">Noch keine Benutzer registriert.</td></tr>';
    return;
  }
  for (const user of users) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td><button type="button" class="delete-btn" style="padding:5px 10px;font-size:0.8rem">Löschen</button></td>`;
    row.querySelector('.delete-btn').addEventListener('click', () => {
      if (!confirm(`Benutzer "${user.username}" wirklich löschen?`)) return;
      saveUsers(loadUsers().filter(u => u.id !== user.id));
      renderUserTab();
    });
    tbody.appendChild(row);
  }
}

/* ===== Startup ===== */
if (isAuthenticated()) showAdmin(); else showLogin();
