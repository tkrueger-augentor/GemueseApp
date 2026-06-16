const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('passwordInput');
const logoutBtn = document.getElementById('logoutBtn');
const addForm = document.getElementById('addForm');
const adminTableBody = document.getElementById('adminTableBody');
const passwordForm = document.getElementById('passwordForm');
const newPasswordInput = document.getElementById('newPasswordInput');

const SESSION_KEY = 'gemuesekiste.adminSession';

function formatPrice(value) {
  return value.toFixed(2);
}

function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function showLogin() {
  loginView.style.display = 'block';
  adminView.style.display = 'none';
}

function showAdmin() {
  loginView.style.display = 'none';
  adminView.style.display = 'block';
  renderTable();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = '';
  if (passwordInput.value === getAdminPassword()) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    passwordInput.value = '';
    showAdmin();
  } else {
    loginError.textContent = 'Falsches Passwort';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!newPasswordInput.value.trim()) return;
  setAdminPassword(newPasswordInput.value.trim());
  newPasswordInput.value = '';
  alert('Passwort geändert.');
});

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const price = parseFloat(document.getElementById('newPrice').value);
  const active = document.getElementById('newActive').checked;
  if (!name || isNaN(price)) return;

  const vegetables = loadVegetables();
  vegetables.push({ id: nextId(vegetables), name, price, active });
  saveVegetables(vegetables);
  addForm.reset();
  document.getElementById('newActive').checked = true;
  renderTable();
});

function renderTable() {
  const vegetables = loadVegetables();
  adminTableBody.innerHTML = '';
  for (const veg of vegetables) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${veg.name}" data-field="name" /></td>
      <td><input type="number" step="0.01" min="0" value="${formatPrice(veg.price)}" data-field="price" /></td>
      <td style="text-align:center"><input type="checkbox" ${veg.active ? 'checked' : ''} data-field="active" /></td>
      <td class="row-actions">
        <button type="button" class="save-btn">Speichern</button>
        <button type="button" class="delete-btn">Löschen</button>
      </td>
    `;
    row.querySelector('.save-btn').addEventListener('click', () => saveRow(veg.id, row));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteRow(veg.id));
    adminTableBody.appendChild(row);
  }
}

function saveRow(id, row) {
  const name = row.querySelector('[data-field="name"]').value.trim();
  const price = parseFloat(row.querySelector('[data-field="price"]').value);
  const active = row.querySelector('[data-field="active"]').checked;
  const vegetables = loadVegetables();
  const idx = vegetables.findIndex((v) => v.id === id);
  if (idx === -1) return;
  vegetables[idx] = { ...vegetables[idx], name, price, active };
  saveVegetables(vegetables);
  renderTable();
}

function deleteRow(id) {
  if (!confirm('Dieses Gemüse wirklich löschen?')) return;
  const vegetables = loadVegetables().filter((v) => v.id !== id);
  saveVegetables(vegetables);
  renderTable();
}

if (isAuthenticated()) {
  showAdmin();
} else {
  showLogin();
}
