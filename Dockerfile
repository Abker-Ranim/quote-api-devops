# Dockerfile – version finale qui marche à 100%
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# On crée le dossier logs avec les bons droits au démarrage
RUN mkdir -p /app/logs && chown node:node /app/logs

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]