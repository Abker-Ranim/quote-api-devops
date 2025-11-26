# Quote API – Projet DevOps 


## Fonctionnalités
- `GET /api/quote` → citation aléatoire  
- `GET /api/quote/:id` → citation par ID   
- `POST /api/quote` → ajout de citation (JSON)  
- `GET /health` → healthcheck  
- `GET /metrics` → métriques Prometheus  
- Logs structurés JSON avec `requestId` et timestamp

## Stack technique
| Couche               | Technologie                                           |
|----------------------|-------------------------------------------------------|
| Runtime              | Node.js 20 + Express                                  |
| Tests                | Jest + Supertest (couverture > 90 %)                  |
| Observabilité        | Winston (JSON logs) + prometheus-client               |
| Sécurité             | Helmet, CORS, rate-limit                              |
| Container            | Docker (multi-stage, user node, alpine)               |
| Registry             | GitHub Container Registry (GHCR)                      |
| CI/CD                | GitHub Actions (tests → build → push automatique)    |
| SAST                 | GitHub CodeQL (activé, 0 alertes)                     |
| DAST                 | OWASP ZAP Baseline (rapport → 0 High/Medium)          |
| Orchestration        | Kubernetes (Minikube) – 2 replicas + NodePort         |

## Preuves visibles sur le repo
- CI/CD → **Actions** (toujours vert)  
- Image publiée → https://ghcr.io/abker-ranim/quote-api-devops/quote-api:latest  
- CodeQL → **Security → Code scanning** (0 alertes)  
- Rapport ZAP → `security/zap-report.html` (0 High/Medium)  
- Kubernetes manifests → dossier `k8s/`  
- Peer review effectué sur PR #14  

## Lancement rapide

### 1. Avec Docker
```bash
docker run -p 3000:3000 ghcr.io/abker-ranim/quote-api-devops/quote-api:latest
```

### 2. 
```bash
minikube start --driver=docker
kubectl apply -f k8s/
minikube service quote-api --url
```

### 3. 
```bash
npm ci
npm run dev
```
## Endpoints d’exemple
- GET    http://localhost:3000/api/quote
- GET    http://localhost:3000/api/quote/1
- POST   http://localhost:3000/api/quote   
- GET    http://localhost:3000/metrics
