const { randomUUID } = require('crypto');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// 1. Middleware : ajoute le requestId
const requestIdMiddleware = (req, res, next) => {
  const id = randomUUID();
  req.requestId = id;                    // utilisé par express-winston
  res.setHeader('X-Request-Id', id);
  next();
};

// 2. Transport fichier avec rotation quotidienne
const fileTransport = new transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.combine(
    format.timestamp(),
    format.json()
  )
});

// 3. Logger principal (remplace express-winston pour avoir 100 % contrôle)
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message, requestId, method, url, statusCode, responseTime }) => {
      return JSON.stringify({
        timestamp,
        level,
        requestId: requestId || 'unknown',
        method,
        url,
        statusCode,
        responseTime: responseTime ? `${responseTime}ms` : undefined,
        message
      }, null, 2);   // null, 2 → joli en fichier, tu peux virer en prod
    })
  ),
  transports: [
    new transports.Console(),   // toujours visible dans Docker/K8s
    fileTransport               // + persistance fichier
  ],
  exceptionHandlers: [
    new transports.Console(),
    fileTransport
  ]
});

// 4. Middleware compatible Express (on remplace expressWinston.logger)
const winstonMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl || req.url}`, {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: duration
    });
  });

  res.on('error', (err) => {
    logger.error('Request error', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
  });

  next();
};

module.exports = {
  logger,              // si tu veux logger manuellement ailleurs
  requestIdMiddleware,
  winstonMiddleware    // ← à utiliser dans index.js à la place de "logger"
};