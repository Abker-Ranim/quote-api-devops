const request = require('supertest');
const app = require('../src/index');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/quotes.json');

// Sauvegarde du fichier original + nettoyage après chaque test
let originalData;
beforeAll(() => {
  if (fs.existsSync(DATA_FILE)) {
    originalData = fs.readFileSync(DATA_FILE, 'utf-8');
  }
});

afterAll(() => {
  if (originalData) {
    fs.writeFileSync(DATA_FILE, originalData);
  }
});

describe('Quote API – Tests d’intégration', () => {
  it('GET /health → doit retourner OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });

  it('GET /api/quote → doit retourner une citation aléatoire', async () => {
    const res = await request(app).get('/api/quote');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('text');
    expect(res.body).toHaveProperty('author');
  });

  it('GET /api/quote/1 → doit retourner la citation avec id 1', async () => {
    const res = await request(app).get('/api/quote/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.text).toContain('La vie est ce qui arrive');
  });

  it('GET /api/quote/999 → doit retourner 404', async () => {
    const res = await request(app).get('/api/quote/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/quote → doit créer une nouvelle citation', async () => {
    const newQuote = {
      text: "Test automatique passé avec succès !",
      author: "Jest"
    };

    const res = await request(app)
      .post('/api/quote')
      .send(newQuote)
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.text).toBe(newQuote.text);
    expect(res.body.author).toBe(newQuote.author);
    expect(res.body.id).toBeGreaterThanOrEqual(5);
  });

  it('POST /api/quote sans text → doit retourner 400', async () => {
    const res = await request(app)
      .post('/api/quote')
      .send({ author: "Seul" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('text is required');
  });
});