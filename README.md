# GenericMed

GenericMed is organized as two independently runnable applications:

```
frontend/                 React 19 + Vite application
  src/                    screens, components, styles, API client, mock data
  public/                 static frontend assets
  .env                    browser-safe Vite configuration

backend/                  Dockerized Go, Python, and Node.js microservices
  src/db/                 PostgreSQL schema, RLS, and phase migrations
  src/gateway/            Nginx API gateway configuration
  src/services/           catalog, OCR, order, FDA sync services
  .env                    local backend service configuration
```

## Prerequisites

- Node.js 20+ and npm
- Docker Desktop with Docker Compose, for the full backend stack

## Install frontend dependencies

```powershell
cd frontend
npm install
```

## Install backend dependencies

The Node.js order service has its own dependency manifest. The Go catalog and Python OCR/FDA services install their dependencies inside their Docker images.

```powershell
cd backend/src/services/order
npm install
```

## Start the frontend

```powershell
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000`. Its API client reads `VITE_API_GATEWAY_URL` from `frontend/.env` and calls the backend gateway at `http://localhost:8000`. It retains mock-data fallbacks when the backend is offline.

## Start the backend

For the full API, database, Redis, and microservice stack:

```powershell
cd backend
npm run start
```

The Nginx API gateway is available at `http://localhost:8000`. Configuration is in `backend/.env`; do not place backend secrets in `frontend/.env`.

For only the Node.js order service during backend development:

```powershell
cd backend
npm run dev
```

It listens on `http://localhost:8003`.

## Run both together

Open two terminals:

```powershell
# Terminal 1
cd backend
npm run start

# Terminal 2
cd frontend
npm run dev
```

Then open `http://localhost:3000`. The browser reaches backend APIs exclusively through HTTP; the frontend has no imports from the backend source tree.

## Verification

```powershell
cd frontend
npm run build

cd ../backend
npm run build
```

With the backend running, verify the gateway through `http://localhost:8000/health` and then use the frontend’s medicine, prescription, order, payment, insurance, wholesale, and cold-chain flows.
