const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const quotes = require('./quotes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.get('/api/quote', (req, res) => {
  const quote = quotes.getRandom();
  res.json(quote || { text: "Aucune citation disponible", author: "Système" });
});

app.get('/api/quote/:id', (req, res) => {
  const quote = quotes.getById(parseInt(req.params.id));
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  res.json(quote);
});

app.post('/api/quote', (req, res) => {
  const { text, author } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'text is required' });
  }
  const newQuote = quotes.add(text.trim(), author?.trim());
  res.status(201).json(newQuote);
});

app.listen(PORT, () => {
  console.log(`Quote API running on http://localhost:${PORT}`);
  console.log(`Total quotes loaded: ${quotes.getAll().length}`);
});