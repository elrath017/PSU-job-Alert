# ⚡ PSU & Government Job Alert Radar (CS & IT Vacancies)

A full-stack, real-time job intelligence dashboard specifically tailored for **Computer Science (CSE), Information Technology (IT), MCA, and M.Tech** graduates targeting Indian Public Sector Undertakings (PSUs) and Government organizations such as **BEL, NIC, C-DAC, BIS, ISRO, DRDO, and NIELIT**.

---

## 🌟 Key Features

### 1. 🎯 Specialized CS/IT Job Cards
- **Dynamic Deadline Countdown**: Real-time calculation of remaining days until the application closing date (e.g. `3 Days Left`, `Closing Today!`, `Expired`).
- **Fresher vs. Experienced Classification**: Prominent badges distinguishing **`🎓 Fresher Eligible (0 Yrs Exp)`** roles from **`💼 Experienced (1-3 Yrs / 2+ Yrs)`** positions.
- **Accurate GATE Status**: Displays **`⚡ GATE Score Required`** vs **`Direct Exam / GATE Exempt`**.
- **Selection / Exam Mode Breakdown**: Displays exact selection process:
  - `💻 Direct Exam: CBT (Computer Based Test)`
  - `📝 Direct Exam: OMR Offline Written Test`
  - `🗣️ Direct Selection: Technical Interview`
  - `⚡ GATE Score Required (GATE + Interview)`
- **Official Application Portal Link**: Direct link to official career pages.

### 2. 🔍 Multi-Filter & Live Search Engine
- **Category Filter**: `PSU`, `Central Govt`, `State Govt`, `Research`.
- **Experience Level Filter**: `All`, `Fresher Eligible 🎓`, `Experienced 💼`.
- **GATE Requirement Filter**: `All`, `GATE Required ⚡`, `Direct Exam / Non-GATE ✅`.
- **Exam Mode Filter**: `All`, `CBT (Online Test) 💻`, `OMR (Offline Exam) 📝`, `Direct Interview 🗣️`.
- **Qualification Filter**: `B.Tech CSE`, `MCA`, `M.Tech`.
- **Live Search**: Instant filter by organization acronym or role title.
- **Sorting Options**: Sort by *Newest Added*, *Closing Soonest*, or *Highest Salary*.

### 3. 🤖 Web Scraper & AI Ingestion Layer
- Targeted web scrapers for 7 official career portals (BEL, NIC, C-DAC, BIS, ISRO, DRDO, NIELIT) combining live Cheerio HTTP scrapers with fallback ingestion feeds.
- **Google Gemini AI Integration (`@google/genai` SDK)**: Evaluates raw job advertisement text, verifies strict CS/IT eligibility, and extracts structured metadata (Organization, Title, Qualification, Experience Level, GATE Status, Exam Mode, Pay Scale, Deadline, Apply URL).
- **Rule-Based Fallback Classifier**: Built-in offline parser ensuring zero downtime if API keys are missing or offline.

### 4. 📲 Instant Telegram Alert System
- Integration with the **Telegram Bot API** to dispatch formatted HTML notifications to Telegram channels or private chats.
- Interactive UI modal to test alert payloads with live mock previews and instant dispatch.

### 5. 🗄️ Database & Deduplication
- **SQLite Database** (`sqlite` + `sqlite3` async driver).
- **MD5 Unique Hash Index** (`MD5(organization + title)`) to prevent duplicate job postings.
- Auto-seeds initial major PSU vacancies on first startup.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Canvas Confetti.
- **Backend**: Node.js, Express, `dotenv`, `cors`.
- **Database**: SQLite (`sqlite` & `sqlite3` async drivers).
- **AI & NLP**: Google Gemini API (`@google/genai` SDK).
- **Scraping**: Axios, Cheerio.
- **Notifications**: Telegram Bot API (`axios`).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### 1. Clone & Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 2. Configure Environment Variables
Create or edit the `.env` file in the root directory:
```env
PORT=5000

# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY="your-google-gemini-api-key"

# Telegram Bot API Details (Optional - get from @BotFather on Telegram)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id-or-channel"
```

### 3. Run Development Server
```bash
npm run dev
```
- **React Frontend**: `http://localhost:5173` (or `http://localhost:5174`)
- **Express Backend API**: `http://localhost:5000`

---

## 🌐 Free Cloud Deployment Guide

You can deploy this full-stack application **100% free** on **[Render.com](https://render.com/)**:

1. Push your repository to GitHub.
2. Sign up on **Render.com** → Click **New + Web Service**.
3. Connect your GitHub repository.
4. Set Build Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add Environment Variables (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PORT=10000`).
6. Click **Create Web Service**.
7. Set up a free 30-minute cron trigger at **[cron-job.org](https://cron-job.org/)** targeting `https://your-app.onrender.com/api/jobs/scrape` to keep the app active and automatically run background scraping!

---

## 📄 License
Distributed under the MIT License.
