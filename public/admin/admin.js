const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('passwordInput');
const logoutBtn = document.getElementById('logoutBtn');
const addForm = document.getElementById('addForm');
const adminTableBody = document.getElementById('adminTableBody');

function formatPrice(value) {
  return value.toFixed(2);
}

async function checkSession() {
  const res = await fetch('/api/session');
  const { authenticated } = await res.json();
  if (authenticated) {
    showAdmin();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = 'block';
  adminView.style.display = 'none';
}

function showAdmin() {
  loginView.style.display = 'none';
  adminView.style.display = 'block';
  loadVegetables();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: passwordInput.value }),
  });
  if (res.ok) {
    passwordInput.value = '';
    showAdmin();
  } else {
    const { error } = await res.json();
    loginError.textContent = error || 'Anmeldung fehlgeschlagen';
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  showLogin();
});

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const price = parseFloat(document.getElementById('newPrice').value);
  const active = document.getElementById('newActive').checked;
  if (!name || isNaN(price)) return;

  await fetch('/api/vegetables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, active }),
  });
  addForm.reset();
  document.getElementById('newActive').checked = true;
  loadVegetables();
});

async function loadVegetables() {
  const res = await fetch('/api/vegetables');
  const vegetables = await res.json();
  renderTable(vegetables);
}

function renderTable(vegetables) {
  adminTableBody.innerHTML = '';
  for (const veg of vegetables) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${veg.name}" data-field="name" /></td>
      <td><input type="number" step="0.01" min="0" value="${formatPrice(veg.price)}" data-field="price" /></td>
      <td style="text-align:center"><input type="checkbox" ${veg.active ? 'checked' : ''} data-field="active" /></td>
      <td class="row-actions">
        <button class="save-btn">Speichern</button>
        <button class="delete-btn">Löschen</button>
      </td>
    `;
    row.querySelector('.save-btn').addEventListener('click', () => saveRow(veg.id, row));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteRow(veg.id));
    adminTableBody.appendChild(row);
  }
}

async function saveRow(id, row) {
  const name = row.querySelector('[data-field="name"]').value.trim();
  const price = parseFloat(row.querySelector('[data-field="price"]').value);
  const active = row.querySelector('[data-field="active"]').checked;
  await fetch(`/api/vegetables/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, active }),
  });
  loadVegetables();
}

async function deleteRow(id) {
  if (!confirm('Dieses Gemüse wirklich löschen?')) return;
  await fetch(`/api/vegetables/${id}`, { method: 'DELETE' });
  loadVegetables();
}

checkSession();
