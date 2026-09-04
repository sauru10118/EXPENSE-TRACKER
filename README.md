<div align="center">

<img src="./assets/hero_banner.jpg" alt="Expense Tracker AI Banner" width="100%" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />

# ✨ Expense Tracker AI
### *Smart Spending, Merchant Intelligence & Gemini AI Financial Insights*

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini 3.7 Flash](https://img.shields.io/badge/Gemini_AI-3.7_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Theme](https://img.shields.io/badge/Theme-Claymorphism_%26_Colorful-FF69B4?style=for-the-badge)](https://github.com)

<p align="center">
  <b>A next-generation personal finance suite designed with a playful claymorphism aesthetic, deep location/merchant tracking, real-time charts, formatted Excel exports, and built-in Gemini 3.7 Flash AI financial advisor.</b>
</p>

[✨ Live Preview](#-key-features) • [🚀 Quick Start](#-quick-start) • [🤖 AI Features](#-gemini-ai-intelligence) • [📊 Excel Export](#-excel-export-engine) • [🛠️ Tech Stack](#-technology-stack)

</div>

---

## 🌟 Why Expense Tracker AI?

Traditional budgeting apps are boring and rigid. **Expense Tracker AI** turns everyday personal budgeting into a delightful, intelligent experience with:

- 🎨 **Claymorphism & Colorful UI:** Puffy 3D-styled cards, soft candy gradients, glassmorphism highlights, and lively micro-animations.
- 🏪 **"Where I Spend" Merchant Tracking:** Automatically track and rank exact stores, landlords, airlines, and vendors (Costco, Trader Joe's, Delta, Netflix).
- 🧠 **Gemini 3.7 Flash AI Intelligence:** Instant spending audits, personalized Financial Health Score (1–100), and interactive financial chat advisor.
- ⚡ **Natural Language AI Quick-Fill:** Just type *"Spent $65 at Trader Joe's for weekly groceries with debit card"* and watch the form populate automatically.
- 📑 **One-Click Excel (.xlsx) Reports:** Export beautifully formatted multi-column spreadsheets with totals, categories, and payment metadata.

---

## 📸 Visual Showcase

### 📊 1. Interactive Clay Financial Dashboard
> Dynamic spending timeline (Area/Bar charts), category donut distribution, monthly budget progress gauges, and top merchant leaderboards.

<div align="center">
  <img src="./assets/dashboard_preview.jpg" alt="Dashboard Preview" width="90%" style="border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);" />
</div>

---

### 🤖 2. Gemini AI Financial Intelligence & Live Advisor
> Receive automated spending audits, estimated monthly savings breakdown, category target advice, and chat live with Gemini about your finances.

<div align="center">
  <img src="./assets/ai_analytics_preview.jpg" alt="AI Analytics Preview" width="90%" style="border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);" />
</div>

---

## 🚀 Key Features

| Feature | Description | Highlight |
| :--- | :--- | :--- |
| 🔮 **Gemini AI Spending Audit** | Evaluates total expenses, discretionary ratios, and generates actionable saving tips. | Real-time AI analysis with fallback support |
| 💬 **Interactive AI Chat Advisor** | Ask natural questions like *"How much did I spend at Trader Joe's and Costco combined?"* | Direct context-aware prompt engine |
| 🪄 **AI Smart Receipt Parse** | Paste unstructured text or receipt sentences into form fields seamlessly. | Zero-click auto-categorization |
| 🏬 **Merchant & Store Analytics** | Tracks location frequency, highest-spend places, and recurring subscription vendors. | Top 6 merchant visual leaderboard |
| 📈 **Recharts Interactive Graphs** | Toggle between smooth Gradient Area charts and Bar graphs with custom tooltips. | Responsive & animated data points |
| 🏷️ **16 Rich Spending Categories** | Groceries, Rent, Travel, Subscriptions, Housing, Food & Dining, Utilities, and more. | Color-coded badges & icons |
| 💳 **Multi-Payment Methods** | Track Credit Cards, Debit Cards, Cash, Bank Transfer / UPI, and Digital Wallets. | Granular filtering & sorting |
| 📥 **Excel (.xlsx) Export Engine** | Generates full transaction ledger with styled headers, timestamps, and metadata. | Powered by `xlsx` engine |
| 💾 **Persistent Local Storage** | All records, custom monthly budgets, and selected currencies persist automatically. | Zero database setup needed |

---

## 🛠️ Technology Stack

```mermaid
graph TD
    A[React 19 + TypeScript] --> B[Vite 6 Frontend]
    B --> C[Tailwind CSS v4 + Claymorphism Theme]
    B --> D[Recharts Data Visualization]
    B --> E[Lucide React Icons]
    A --> F[Node.js + Express Backend]
    F --> G[@google/genai SDK]
    G --> H[Gemini 3.7 Flash Model]
    F --> I[Excel XLSX Exporter]
```

- **Frontend Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with customized clay `@theme` design tokens and `Nunito` typography
- **Data Visualizations:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend Server:** [Express 4](https://expressjs.com/) with TypeScript runner (`tsx`)
- **Artificial Intelligence:** [@google/genai](https://www.npmjs.com/package/@google/genai) calling `gemini-3.7-flash`
- **Spreadsheet Generation:** [SheetJS (xlsx)](https://docs.sheetjs.com/)

---

## ⚡ Quick Start

### 1️⃣ Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- npm or bun package manager

### 2️⃣ Installation

Clone or extract the repository and install all dependencies:

```bash
# Navigate to the project folder
cd expense-tracker

# Install required packages
npm install
```

### 3️⃣ Set Up Gemini API Key

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and insert your Gemini API Key from [Google AI Studio](https://aistudio.google.com/):

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

> **Note:** Even without an API key, the application provides structured mock AI analysis so you can explore all features right away!

### 4️⃣ Start Development Server

Run the development server with live reload:

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser. 🎉

---

## 🔐 Login System & Credentials

The application is protected by a login screen at startup to secure your spending and transaction history:

- **Username:** `shree`
- **Password:** `sweri`

> You can also click the **"Auto Fill"** button directly on the login card to instantly populate credentials. You can customize these credentials by setting `APP_USERNAME` and `APP_PASSWORD` in your `.env` or Render environment settings.

---

## 🚀 Deploying to Render.com

This repository is pre-configured for instant 1-click deployment on **[Render.com](https://render.com)**!

### Method 1: Automatic Blueprint (Recommended)
1. Push this repository to your GitHub account.
2. In your Render Dashboard, click **New +** &rarr; **Blueprint**.
3. Connect your repository. Render will automatically read [`render.yaml`](file:///c:/Users/hp/Downloads/expense-tracker/render.yaml) and configure the build and start commands.
4. Click **Apply**.

### Method 2: Manual Web Service Setup
1. On Render, click **New +** &rarr; **Web Service**.
2. Connect your Git repository.
3. Configure the following service settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `APP_USERNAME` = `shree`
   - `APP_PASSWORD` = `sweri`
   - `GEMINI_API_KEY` = *(Your Gemini API key, optional)*
5. Click **Deploy Web Service**. Render will build the Vite frontend, bundle the Node server, and start it automatically on `0.0.0.0:$PORT`.

---

## ☁️ Aiven Cloud PostgreSQL Database Integration

Expense Tracker AI features full cloud database persistence with **[Aiven for PostgreSQL](https://aiven.io)**. 

When connected, transactions and budget configs are stored in your secure cloud database and synchronized in real time across any device or browser session.

### 1. Get Free PostgreSQL on Aiven
1. Sign up or log into **[aiven.io](https://aiven.io)**.
2. Click **Create Service** &rarr; select **PostgreSQL**.
3. Choose the **Free Plan** or your preferred cloud region.
4. Once the service is running, go to **Overview** and copy the **Service URI**. It looks like:
   ```text
   postgres://avnadmin:YOUR_PASSWORD@YOUR_AIVEN_HOST.aivencloud.com:PORT/defaultdb?sslmode=require
   ```

### 2. Configure Your Database URL
- **For Local Development:** Add it to your `.env` file:
  ```env
  DATABASE_URL="postgres://avnadmin:YOUR_PASSWORD@YOUR_AIVEN_HOST.aivencloud.com:PORT/defaultdb?sslmode=require"
  ```
- **For Render.com Deployment:** Go to your Render Web Service &rarr; **Environment** &rarr; Add Environment Variable:
  - Key: `DATABASE_URL`
  - Value: *(Your Aiven Service URI from above)*

### 3. Automatic Schema & Data Seeding
- On boot, the server **automatically creates the database tables** (`transactions` and `budget_config`) and sets up indexes.
- If the Aiven database is empty, the application will automatically sync your existing transactions into Aiven so you never lose your records!
- The header displays a live **Aiven DB status badge** (Connected / Setup Required).

---


The integrated Express backend offers specialized endpoints powered by Gemini 3.7 Flash:

### `POST /api/ai/analyze`
Generates a comprehensive personal finance health assessment, scoring, and saving tips.
- **Payload:** `{ transactions: Transaction[], budgetConfig: BudgetConfig, timeRange: string }`
- **Response:** Structured JSON containing `healthScore`, `summary`, `insights`, `topSpendingDrivers`, and `actionableBudgetAdjustments`.

### `POST /api/ai/ask`
Answers user questions in real-time about their transaction history and spending trends.
- **Payload:** `{ question: string, transactions: Transaction[], budgetConfig: BudgetConfig }`
- **Response:** `{ answer: string }` (Markdown-formatted advice & totals).

### `POST /api/ai/smart-parse`
Extracts structured transaction fields from natural language sentences or receipt text.
- **Payload:** `{ text: string }`
- **Response:** `{ title, amount, location, category, type, date, paymentMethod, notes }`

---

## 📑 Excel Export Engine

Export your full financial transaction history into formatted Excel workbooks with a single click:

- **Filename:** `Expense_Tracker_Export_YYYY-MM-DD.xlsx`
- **Formatted Columns:**
  - `Transaction ID`
  - `Date` (YYYY-MM-DD)
  - `Description`
  - `Where Spent / Merchant`
  - `Type` (Expense / Income)
  - `Category`
  - `Payment Method`
  - `Amount`
  - `Recurring` (Yes / No)
  - `Notes`
- **Total Summary Row:** Automatic computation of total expenditure and income at the bottom.

---

## 📂 Project Architecture

```
expense-tracker/
├── assets/                  # High-resolution README graphics & visual assets
│   ├── hero_banner.jpg
│   ├── dashboard_preview.jpg
│   └── ai_analytics_preview.jpg
├── src/
│   ├── components/          # Modular React components
│   │   ├── AIAnalyticsView.tsx    # Gemini AI audit & chat advisor
│   │   ├── AddTransactionView.tsx # Smart manual & AI quick-fill entry
│   │   ├── BudgetModal.tsx        # Monthly & category target settings
│   │   ├── CategoryIcon.tsx       # Dynamic SVG category icons
│   │   ├── DashboardView.tsx      # Main KPI metrics & Recharts graphs
│   │   ├── Navbar.tsx             # Sticky glassmorphism header navigation
│   │   └── TransactionsView.tsx   # Filterable ledger & bulk actions table
│   ├── utils/
│   │   ├── categories.ts    # 16 spending categories metadata & suggestions
│   │   ├── excelExport.ts   # SheetJS (.xlsx) export utility
│   │   ├── mockData.ts      # Sample realistic transactions
│   │   └── storage.ts       # LocalStorage data persistence helpers
│   ├── App.tsx              # Root application router & state manager
│   ├── index.css            # Claymorphism design system & gradient palettes
│   ├── main.tsx             # React DOM root mounting
│   └── types.ts             # TypeScript interfaces & types
├── .env.example             # Environment variables sample template
├── index.html               # Entry HTML template with Nunito font
├── package.json             # NPM dependencies & build scripts
├── server.ts                # Express server + Vite middleware + Gemini AI backend
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite bundler configuration
```

---

## 🛡️ License

This project is licensed under the **Apache-2.0 License**.

---

<div align="center">
  <sub>Built with ❤️ using React 19, Tailwind CSS v4, and Gemini 3.7 Flash.</sub>
</div>
