frontend/
│
├─ src/
│  ├─ api/
│  │  └─ client.ts (where back and front connect)
│  │
│  ├─ components/
│  │  ├─ Header.tsx
│  │  ├─ UploadPanel.tsx
│  │  ├─ StyleDNASection.tsx
│  │  ├─ RecommendationsSection.tsx
│  │  └─ SessionHistory.tsx
│  │
│  ├─ pages/
│  │  └─ FitCheckPage.tsx
│  │
│  ├─ types/
│  │  └─ index.ts
│  │
│  ├─ App.tsx
│  ├─ App.css
│  ├─ main.tsx
│  └─ index.css
└─ 

How to Run Frontend:
cd frontend
npm install
npm run dev

Open:
http://localhost:5173

Frontend works even if backend is not running (mock mode).