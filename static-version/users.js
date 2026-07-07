const USERS_KEY = 'gemuesekiste.users';
const USER_SESSION_KEY = 'gemuesekiste.userSession';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function nextUserId(users) {
  return String(users.reduce((max, u) => Math.max(max, parseInt(u.id) || 0), 0) + 1);
}

async function registerUser(username, password, role) {
  role = role || 'user';
  const users = loadUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { error: 'Benutzername bereits vergeben' };
  }
  const passwordHash = await sha256(password);
  const user = { id: nextUserId(users), username, passwordHash, role };
  users.push(user);
  saveUsers(users);
  return { user };
}

async function authenticateUser(username, password) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;
  const hash = await sha256(password);
  return hash === user.passwordHash ? user : null;
}

function getUserSession() {
  try { return JSON.parse(sessionStorage.getItem(USER_SESSION_KEY)); } catch { return null; }
}

function setUserSession(user) {
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ id: user.id, username: user.username, role: user.role }));
}

function clearUserSession() {
  sessionStorage.removeItem(USER_SESSION_KEY);
}
