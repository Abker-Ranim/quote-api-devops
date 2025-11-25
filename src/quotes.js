const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/quotes.json');

let quotes = [];
let nextId = 1;

// Charge les citations au démarrage
function loadQuotes() {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    quotes = JSON.parse(data);
    if (quotes.length > 0) {
      nextId = Math.max(...quotes.map(q => q.id)) + 1;
    }
  }
}

// Sauvegarde dans le fichier
function saveQuotes() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(quotes, null, 2));
}

loadQuotes(); // on charge au démarrage du module

module.exports = {
  getAll: () => quotes,
  getById: (id) => quotes.find(q => q.id === id),
  getRandom: () => quotes[Math.floor(Math.random() * quotes.length)],
  add: (text, author = 'Anonyme') => {
    const newQuote = { id: nextId++, text, author };
    quotes.push(newQuote);
    saveQuotes();
    return newQuote;
  }
};