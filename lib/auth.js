const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gemuese123';
const sessions = new Set();

function login(password) {
  if (password !== ADMIN_PASSWORD) return null;
  const token = crypto.randomBytes(32).toString('hex');
  sessions.add(token);
  return token;
}

function isValidToken(token) {
  return Boolean(token) && sessions.has(token);
}

function logout(token) {
  sessions.delete(token);
}

function getTokenFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith('session='));
  return match ? match.split('=')[1] : null;
}

module.exports = { login, isValidToken, logout, getTokenFromCookies };
