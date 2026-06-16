const fs = require('fs');

const CSV_PATH = require('path').join(__dirname, '..', 'data', 'vegetables.csv');
const HEADER = ['id', 'name', 'price', 'active'];

function escapeField(value) {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function readVegetables() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
  const [headerLine, ...rows] = lines;
  const header = parseLine(headerLine);
  return rows.map((line) => {
    const fields = parseLine(line);
    const record = {};
    header.forEach((key, idx) => {
      record[key] = fields[idx];
    });
    return {
      id: record.id,
      name: record.name,
      price: parseFloat(record.price),
      active: record.active === 'true',
    };
  });
}

function writeVegetables(vegetables) {
  const lines = [HEADER.join(',')];
  for (const veg of vegetables) {
    lines.push(
      [veg.id, escapeField(veg.name), veg.price.toFixed(2), veg.active ? 'true' : 'false'].join(',')
    );
  }
  fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8');
}

function nextId(vegetables) {
  const max = vegetables.reduce((acc, v) => Math.max(acc, parseInt(v.id, 10) || 0), 0);
  return String(max + 1);
}

module.exports = { readVegetables, writeVegetables, nextId };
