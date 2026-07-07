const USERS_KEY = 'gemuesekiste.users';
const USER_SESSION_KEY = 'gemuesekiste.userSession';

/* Pure-JS SHA-256 – works on file://, http://, https:// without Web Crypto */
function sha256Pure(str) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words = [];
  const asciiBitLength = str.length * 8;

  let hash = sha256Pure._h = sha256Pure._h || [];
  let k = sha256Pure._k = sha256Pure._k || [];
  if (!sha256Pure._k.length) {
    let primeCounter = 0;
    for (let candidate = 2; primeCounter < 64; candidate++) {
      let isPrime = true;
      for (let i = 2; i <= candidate / 2; i++) { if (candidate % i === 0) { isPrime = false; break; } }
      if (isPrime) {
        if (primeCounter < 8) hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter++;
      }
    }
  }
  hash = hash.slice(0);
  const strLen = str.length;
  const W = [];
  str += '\x80';
  while (str.length % 64 - 56) str += '\x00';
  for (let i = 0; i < str.length; i++) {
    const j = str.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = W[i - 15], w2 = W[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + k[i]
        + (W[i] = i < 16 ? w[i]
          : ((rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + W[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) + W[i - 16]) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [temp1 + temp2 | 0, a, hash[1], hash[2], hash[3] + temp1 | 0, hash[4], hash[5], hash[6]];
    }
    for (let i = 0; i < 8; i++) hash[i] = hash[i] + oldHash[i] | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/* Encode Unicode to latin1-safe string for sha256Pure */
function hashPassword(password) {
  const encoded = unescape(encodeURIComponent(password));
  return sha256Pure(encoded);
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

function registerUser(username, password, role) {
  role = role || 'user';
  const users = loadUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { error: 'Benutzername bereits vergeben' };
  }
  const passwordHash = hashPassword(password);
  const user = { id: nextUserId(users), username, passwordHash, role };
  users.push(user);
  saveUsers(users);
  return { user };
}

function authenticateUser(username, password) {
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return null;
  const hash = hashPassword(password);
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
