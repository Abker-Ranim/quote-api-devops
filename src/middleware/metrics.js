// src/middleware/metrics.js
const client = require('prom-client');

// Collecte des métriques par défaut (CPU, mémoire, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Compteurs personnalisés
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [5, 10, 25, 50, 100, 200, 500, 1000, 2500]
});

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

const endTimer = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    httpRequestCounter
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  next();
};

module.exports = {
  metricsMiddleware: endTimer,
  metricsEndpoint: async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  }
};