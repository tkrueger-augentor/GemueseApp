const STORAGE_KEY = 'gemuesekiste.vegetables';
const ADMIN_PASSWORD_KEY = 'gemuesekiste.adminPassword';
const DEFAULT_ADMIN_PASSWORD = 'gemuese123';

const DEFAULT_VEGETABLES = [
  { id: '1', name: 'Tomaten', price: 2.5, active: true },
  { id: '2', name: 'Gurken', price: 1.8, active: true },
  { id: '3', name: 'Zucchini', price: 1.5, active: true },
  { id: '4', name: 'Kartoffeln', price: 1.2, active: true },
  { id: '5', name: 'Zwiebeln', price: 1.0, active: true },
  { id: '6', name: 'Karotten', price: 1.3, active: true },
  { id: '7', name: 'Paprika', price: 2.2, active: false },
  { id: '8', name: 'Salat', price: 1.6, active: true },
];

function loadVegetables() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveVegetables(DEFAULT_VEGETABLES);
    return DEFAULT_VEGETABLES.slice();
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_VEGETABLES.slice();
  }
}

function saveVegetables(vegetables) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vegetables));
}

function nextId(vegetables) {
  const max = vegetables.reduce((acc, v) => Math.max(acc, parseInt(v.id, 10) || 0), 0);
  return String(max + 1);
}

function getAdminPassword() {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

function setAdminPassword(password) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}
