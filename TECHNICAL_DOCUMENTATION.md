# 📖 PSU CS/IT Job Intelligence Dashboard - Technical Architecture & File Reference

This document provides a comprehensive file-by-file and function-by-function technical breakdown of the entire full-stack codebase.

---

## 📂 Project Directory Structure

```
psu-job-alert-dashboard/
├── .env                      # Environment variables configuration
├── package.json              # Root package metadata & npm scripts
├── README.md                 # Project user overview & deployment guide
├── TECHNICAL_DOCUMENTATION.md# Exhaustive codebase file & function reference
├── server/                   # Backend Node.js / Express Server
│   ├── server.js             # Entry point: Express app setup & server launch
│   ├── db.js                 # SQLite database connection, migrations & seeders
│   ├── jobs.db               # SQLite database file
│   ├── scrapers/
│   │   └── psuScraper.js     # Background portal scraper & ingestion engine
│   ├── services/
│   │   ├── aiFilter.js       # Google Gemini AI (@google/genai) & fallback parser
│   │   └── notifier.js       # Telegram Bot API notification dispatcher
│   └── routes/
│       ├── jobs.js           # REST API endpoints for job listings, stats, & manual scrape
│       └── alerts.js         # REST API endpoints for Telegram test payloads
└── client/                   # Frontend React + Vite + Tailwind Application
    ├── package.json          # Client dependencies & Vite build scripts
    ├── vite.config.js        # Vite configuration & dev server API proxy
    ├── index.html            # HTML entry point with Google Fonts
    ├── tailwind.config.js    # Tailwind CSS design system tokens
    ├── postcss.config.js     # PostCSS Tailwind plugin configuration
    └── src/
        ├── main.jsx          # React DOM root render
        ├── index.css         # Global CSS styles & glassmorphic utilities
        ├── App.jsx           # Main container component & global filter state
        └── components/
            ├── Header.jsx          # Sticky navbar, status pills & trigger actions
            ├── StatsOverview.jsx   # Metric overview cards
            ├── FilterBar.jsx       # Multi-select search & dropdown filter bar
            ├── JobCard.jsx         # Card renderer with countdowns, badges, & actions
            ├── JobDetailModal.jsx  # AI audit modal showing reasoning & raw notices
            ├── TelegramModal.jsx   # Interactive Telegram bot configuration & payload tester
            └── ScraperDrawer.jsx   # Real-time scraper ingestion console drawer
```

---

## 🛠️ Backend File & Function Details

### 1. `server/server.js` (Express Server Entry Point)
- **Role**: Initializes Express HTTP server, configures CORS and JSON body parser middleware, mounts REST API routers, handles static serving for production, and manages DB initialization.
- **Key Functions / Code Blocks**:
  - `app.use('/api/jobs', jobsRouter)`: Mounts job management routes.
  - `app.use('/api/alerts', alertsRouter)`: Mounts Telegram notification routes.
  - `app.get('/api/health')`: Health check endpoint returning server status, system timestamp, and API key readiness.
  - `startServer()`: Asynchronous bootstrap function that initializes the SQLite database (`await initDb()`) and starts listening on process port (default `5000`).

---

### 2. `server/db.js` (Database Management & Migrations)
- **Role**: Manages SQLite connection pooling via `sqlite` and `sqlite3` async drivers, defines database tables, handles column migrations, and seeds initial data.
- **Database Schema**:
  - **`jobs` Table**:
    - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
    - `job_hash` (`TEXT UNIQUE NOT NULL`): Hash generated from `MD5(organization + title)` for deduplication.
    - `organization` (`TEXT`): Short acronym + full organization name.
    - `title` (`TEXT`): Official vacancy role title.
    - `category` (`TEXT`): Category (`PSU`, `Central Govt`, `State Govt`, `Research`).
    - `qualification` (`TEXT`): Degrees required (e.g., `B.Tech CSE / IT / MCA`).
    - `experience_level` (`TEXT`): `Fresher Eligible` or `Experienced (1-3 Yrs / 2+ Yrs)`.
    - `gate_required` (`INTEGER`): `1` if GATE score is required; `0` if GATE exempt.
    - `selection_mode` (`TEXT`): Exam mode (e.g., `CBT (Computer Based Test)`, `OMR Based Written Exam`, `Direct Interview`, `GATE Score + Interview`).
    - `salary` (`TEXT`): Pay scale / Monthly stipend.
    - `last_date` (`TEXT`): Closing deadline date (`YYYY-MM-DD`).
    - `apply_url` (`TEXT`): Official apply portal URL.
    - `source_url` (`TEXT`): Source notification link.
    - `raw_description` (`TEXT`): Excerpt of official notice.
    - `ai_verified` (`INTEGER`): `1` if verified by AI / classifier.
    - `ai_reasoning` (`TEXT`): Brief explanation of eligibility verification.
    - `created_at` (`DATETIME DEFAULT CURRENT_TIMESTAMP`)
  - **`scrape_logs` Table**:
    - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`), `timestamp`, `source`, `status`, `jobs_found`, `message`.

- **Functions**:
  - `getDb()`: Returns singleton async database instance using `open({ filename, driver: sqlite3.Database })`.
  - `initDb()`: Creates tables if missing, executes migration queries for new columns (`experience_level`, `selection_mode`), and triggers seeding if table is empty.
  - `generateHash(organization, title)`: Computes MD5 hash string from normalized organization acronym and title to enforce deduplication.
  - `seedInitialJobs(db)`: Seeds 7 initial major tech PSU postings (NIC, C-DAC, BEL, ISRO, BIS, DRDO, NIELIT) with verified CS/IT eligibility and selection modes.

---

### 3. `server/services/aiFilter.js` (Google Gemini AI & Rule Classifier)
- **Role**: Analyzes raw job advertisement text to determine strict Computer Science / IT eligibility, classify experience level, verify GATE requirement, and extract selection modes.
- **Functions**:
  - `filterAndExtractJobWithAI(rawText, sourceUrl)`:
    - Checks if `GEMINI_API_KEY` is present.
    - Instantiates `GoogleGenAI({ apiKey })` using `@google/genai` SDK.
    - Prompts `gemini-2.5-flash` model with structured JSON output schema requirements.
    - If API key is missing or call fails, seamlessly falls back to `fallbackRuleBasedParser`.
  - `fallbackRuleBasedParser(rawText, sourceUrl)`:
    - Performs keyword evaluation for CS/IT discipline keywords (`computer science`, `it`, `mca`, `software`, etc.).
    - Filters out non-CS exclusions (`mechanical only`, `civil only`, `steno`, etc.).
    - Evaluates GATE status: inspects negative GATE phrases (`no gate`, `without gate`, `gate not required`, `gate exempt`) before setting `gateRequired`.
    - Detects selection mode (`CBT`, `OMR`, `Direct Interview`, `GATE Score + Interview`).
    - Detects experience level (`Fresher Eligible` vs `Experienced`).

---

### 4. `server/services/notifier.js` (Telegram Bot Notifier)
- **Role**: Formats and dispatches instant Telegram alert notifications via the Telegram Bot API.
- **Functions**:
  - `sendTelegramMessage(botToken, chatId, textMessage, parseMode)`: Sends POST request to `https://api.telegram.org/bot<token>/sendMessage`. Returns mock preview object if credentials are unset.
  - `sendTestTelegramAlert(botToken, chatId)`: Formats and dispatches a structured sample PSU job alert payload for testing.
  - `sendJobTelegramNotification(job, botToken, chatId)`: Formats a specific job post into a rich HTML Telegram message containing Organization, Role, Category, Qualification, Experience Level, Selection Mode, GATE Status, Salary, Deadline, and Official Apply Link.

---

### 5. `server/scrapers/psuScraper.js` (Web Scraper & Ingestion Layer)
- **Role**: Crawls target PSU career portals and processes raw notices through the AI Filter and Database Ingestor.
- **Target Portals**: BEL, NIC, C-DAC, BIS, ISRO, DRDO, NIELIT.
- **Functions**:
  - `runScraperIngestion()`:
    - Loops over `TARGET_SOURCES`.
    - Attempts live HTTP fetch using `axios` (with fast timeout and Cheerio HTML parser).
    - If portal blocks or times out, falls back to `MOCK_SCRAPE_FEED`.
    - Calls `filterAndExtractJobWithAI()`.
    - Deduplicates via `job_hash`. If new, inserts into `jobs` table and triggers `sendJobTelegramNotification()`.
    - Logs status to `scrape_logs` table.
  - `extractTextFromHtml(html, sourceName)`: Strips scripts/styles using Cheerio and extracts clean body text.

---

### 6. `server/routes/jobs.js` (Job API Routes)
- **Role**: REST API endpoints for fetching jobs, filtering, stats, and manual ingestion triggers.
- **Endpoints**:
  - `GET /api/jobs`: Supports query params `category`, `gate_required`, `qualification`, `experience`, `mode`, `search`, and `sort`.
  - `GET /api/stats`: Returns dashboard summary counters (`totalJobs`, `psuJobs`, `fresherJobs`, `gateExemptJobs`, `closingSoon`).
  - `GET /api/jobs/:id`: Fetches a single job post by ID.
  - `POST /api/jobs/scrape`: Triggers manual execution of `runScraperIngestion()`.

---

### 7. `server/routes/alerts.js` (Alert API Routes)
- **Endpoints**:
  - `POST /api/alerts/telegram/test`: Triggers `sendTestTelegramAlert()`.
  - `POST /api/alerts/telegram/send-job/:id`: Triggers `sendJobTelegramNotification()` for a specific job ID.

---

## 🎨 Frontend File & Component Details

### 1. `client/src/App.jsx` (Root Component)
- **Role**: Main application container managing global filter state (`search`, `category`, `gateFilter`, `qualificationFilter`, `experienceFilter`, `modeFilter`, `sortBy`) and modal dialog visibility.
- **Functions & Hooks**:
  - `useEffect()`: Fetches initial stats and re-queries `/api/jobs` whenever filter states change.
  - `fetchStats()`: Calls `/api/jobs/stats`.
  - `fetchJobs()`: Builds URLSearchParams and fetches `/api/jobs`.
  - `handleTriggerScrape()`: Calls `/api/jobs/scrape` POST endpoint and opens `ScraperDrawer`.

---

### 2. `client/src/components/Header.jsx` (Navigation Header)
- **Role**: Sticky header displaying brand title, AI status indicator pill (`@google/genai` active), Telegram configuration shortcut button, and manual "Scrape & AI Ingest" action button.

---

### 3. `client/src/components/StatsOverview.jsx` (Metric Cards)
- **Role**: Displays 4 stat cards with gradient icons:
  1. *Total Active CS/IT Roles*
  2. *Fresher Eligible Roles*
  3. *GATE Exempt / Direct Exam*
  4. *Closing Within 7 Days*

---

### 4. `client/src/components/FilterBar.jsx` (Filter & Search Controls)
- **Role**: Provides multi-select search and dropdown filtering:
  - Search input box (organization / title search with clear button)
  - Category tabs (`All`, `PSU`, `Central Govt`, `State Govt`, `Research`)
  - Experience Level dropdown (`Fresher Eligible 🎓`, `Experienced 💼`)
  - GATE requirement dropdown (`GATE Required ⚡`, `Direct Exam / Non-GATE ✅`)
  - Exam Mode dropdown (`CBT 💻`, `OMR 📝`, `Direct Interview 🗣️`)
  - Qualification dropdown (`B.Tech CSE`, `MCA`, `M.Tech`)
  - Sorting dropdown (`Newest Added`, `Closing Soonest`, `Highest Salary`)

---

### 5. `client/src/components/JobCard.jsx` (Job Notification Card Renderer)
- **Role**: Displays individual PSU job notification cards with custom organization colors, badges, and action triggers.
- **Key Logic & Functions**:
  - `calculateDaysLeft(lastDateStr)`: Computes calendar day difference between current local time and application deadline to produce dynamic countdown badges (`3 Days Left`, `Closing Today!`, `Expired`).
  - `renderSelectionMode()`: Evaluates `job.gate_required` and `job.selection_mode` to render exact exam mode badges (`Direct Exam: CBT`, `Direct Exam: OMR`, `Direct Selection: Technical Interview`, or `GATE Score Required`).
  - Experience level badge: Renders green `Fresher Eligible (0 Yrs Exp)` or purple `Experienced` badge.
  - Action buttons: "AI Audit" modal trigger, "Alert" Telegram share trigger, and "Apply Official" link.

---

### 6. `client/src/components/JobDetailModal.jsx` (AI Audit Detail Modal)
- **Role**: Displays detailed AI verification report for a selected job, including Gemini AI confidence, reasoning, experience level, exam mode, pay scale, and raw official advertisement text snippet.

---

### 7. `client/src/components/TelegramModal.jsx` (Telegram Bot Configuration & Payload Tester)
- **Role**: Modal dialog for inputting Telegram Bot Token and Chat ID credentials, executing test payload dispatches, rendering live JSON/HTML payload previews, and triggering confetti animations on successful dispatches.

---

### 8. `client/src/components/ScraperDrawer.jsx` (Ingestion Console Log Drawer)
- **Role**: Real-time console log drawer showing portal crawl progress, Cheerio HTML extraction status, AI classification results, and newly discovered job counts.
