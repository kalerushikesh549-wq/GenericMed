# GenericMed

GenericMed is organized as two independently runnable applications:

```
frontend/                 React 19 + Vite application
  src/                    screens, components, styles, API client, mock data
  public/                 static frontend assets
  .env                    browser-safe Vite configuration

backend/                  Node.js order service and supporting backend source
  src/db/                 PostgreSQL schema, RLS, and phase migrations
  src/gateway/            Nginx API gateway configuration
  src/services/           catalog, OCR, order, FDA sync services
  .env                    local backend service configuration
```

## Prerequisites

- Node.js 20+ and npm

## Install frontend dependencies

```powershell
cd frontend
npm install
```

## Install backend dependencies

The Node.js order service has its own dependency manifest.

```powershell
cd backend/src/services/order
npm install
```

## Start the frontend

```powershell
cd frontend
npm run dev
```

The frontend runs at `http://localhost:3000`. Its API client reads `VITE_API_GATEWAY_URL` from `frontend/.env`. It retains mock-data fallbacks when the backend is offline.

## Start the backend

To run the deployable Node.js order service:

```powershell
cd backend
npm run start
```

It listens on `http://localhost:8003`. Configuration is in `backend/.env`; do not place backend secrets in `frontend/.env`.

For development with automatic restarts:

```powershell
cd backend
npm run dev
```

It listens on `http://localhost:8003`.

## Run the frontend and order service together

Open two terminals:

```powershell
# Terminal 1
cd backend
npm run start

# Terminal 2
cd frontend
npm run dev
```

Set `VITE_API_GATEWAY_URL` to `http://localhost:8003` in `frontend/.env`, then open `http://localhost:3000`. The browser reaches backend APIs exclusively through HTTP; the frontend has no imports from the backend source tree.

## Verification

```powershell
cd frontend
npm run build

cd ../backend
npm run build
```

With the backend running, verify the order service through `http://localhost:8003/health` and then use the order, payment, insurance, wholesale, and cold-chain flows.
