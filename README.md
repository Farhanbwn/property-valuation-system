# Property Score & Valuation Calculator

A full-stack, configuration-driven web application to calculate property valuations based on the official Score & Valuation worksheet rules.

## Features

- **Configuration-Driven Rules:** All formula constants, land slabs, and scores are stored in a MongoDB configuration document (`valuation_rules`), ensuring calculations can be updated by an administrator in the future without rewriting core code.
- **Excel Strict Mode Compatibility:** Safely handles the known inconsistencies in the source workbook (e.g., `H3` omission from commercial surcharge, different land valuation formulas for the standalone Land Valuation vs Valuation sheets).
- **Two Distinct Calculators:**
  1. Main Property Valuation
  2. Standalone Land Valuation (including Pond logic)
- **Live Calculation Breakdown:** See exact scores, depreciations, area conversions, and slab logic live before saving.
- **History & Print Views:** Complete history of valuations with a print-friendly detailed report page.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Hook Form, Zod, React Router
- **Backend:** Node.js, Express, TypeScript, Mongoose, Zod
- **Database:** MongoDB

## Project Structure

```text
property-valuation-system/
├── client/ (Vite React frontend)
├── server/ (Node/Express backend)
├── seed/ (MongoDB valuation rules configuration)
├── shared/ (Placeholder for shared schemas/types)
└── .env.example
```

## Setup & Running

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017`

### 2. Environment Variables
Copy `.env.example` to `.env` in the root folder.
```bash
cp .env.example .env
```

### 3. Backend Setup

```bash
cd server
npm install
# Seed the initial rules configuration into MongoDB
npm run seed
# Start the backend server
npm run dev
```

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 5. Access
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Calculation Logic & Excel Inconsistencies

1. **Commercial Surcharge:** The Excel workbook formula checks for `M, I, C1, C2, C3, H1, H2, H4, H5, H6, H7, H8, H9`. It omits `H3`. The application replicates this behavior in `excel-strict` mode.
2. **Main Valuation vs Standalone Land:** The Valuation sheet uses a different set of land-addition slabs (starts at `0` for `<= 7200`) and a `0.24` factor, whereas the Standalone Land sheet uses Market Value conversions (Z1, Z2, Z3 values) and an `actual cost (0.1%)` factor. These are properly kept separate in the app.
3. **Pond Valuation:** Pond logic strictly applies a 50% discount to normal land valuation and is only available in the standalone Land Valuation calculator per the Excel structure.

## Testing
The `ValuationService` backend module has been designed as a pure calculation engine (no direct DB calls inside calculation routines) allowing for straightforward unit testing of boundary conditions.

## Deployment
For production, the server should be compiled using `npm run build` and run using `npm run start`. The client can be built using `npm run build` inside the client folder and served using Nginx or deployed to Vercel/Netlify.
