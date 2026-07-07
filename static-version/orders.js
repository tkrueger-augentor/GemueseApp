const ORDERS_KEY = 'gemuesekiste.orders';

function loadOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Returns ISO week key like "2025-W23"
function getISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Monday of the week containing `date`
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateDE(date) {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function getNextThreeWeeks() {
  const today = new Date();
  const thisMonday = getMondayOf(today);
  return [0, 1, 2].map(offset => {
    const monday = new Date(thisMonday);
    monday.setDate(monday.getDate() + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const key = getISOWeekKey(monday);
    const label = `KW ${key.split('-W')[1]} (${formatDateDE(monday)}–${formatDateDE(sunday)}.${sunday.getFullYear()})`;
    return { key, label, monday, sunday };
  });
}

// Get all orders for a specific user & week
function getOrdersForUserWeek(userId, weekKey) {
  return loadOrders().filter(o => o.userId === userId && o.weekKey === weekKey);
}

// Save/update orders for a user+week (replaces existing)
function saveOrderForUserWeek(userId, weekKey, vegOrders) {
  // vegOrders: [{vegId, quantity}]
  let orders = loadOrders().filter(o => !(o.userId === userId && o.weekKey === weekKey));
  for (const { vegId, quantity } of vegOrders) {
    if (quantity > 0) {
      orders.push({ id: Date.now() + Math.random(), userId, weekKey, vegId, quantity });
    }
  }
  saveOrders(orders);
}

// Harvest totals: {[vegId]: total_quantity} for a given week, across all users
function getHarvestForWeek(weekKey) {
  const orders = loadOrders().filter(o => o.weekKey === weekKey);
  const totals = {};
  for (const o of orders) {
    totals[o.vegId] = (totals[o.vegId] || 0) + o.quantity;
  }
  return totals;
}

// Basket per user: [{userId, username, items:[{vegId, quantity}]}] for a week
function getBasketsForWeek(weekKey, users) {
  const orders = loadOrders().filter(o => o.weekKey === weekKey);
  const byUser = {};
  for (const o of orders) {
    if (!byUser[o.userId]) byUser[o.userId] = [];
    byUser[o.userId].push({ vegId: o.vegId, quantity: o.quantity });
  }
  return Object.entries(byUser).map(([userId, items]) => {
    const user = users.find(u => u.id === userId) || { username: 'Unbekannt' };
    return { userId, username: user.username, items };
  }).sort((a, b) => a.username.localeCompare(b.username));
}
