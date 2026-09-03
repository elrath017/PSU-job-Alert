const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'jobs.db');
let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return dbInstance;
}

async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_hash TEXT UNIQUE NOT NULL,
      organization TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      qualification TEXT NOT NULL,
      experience_level TEXT DEFAULT 'Fresher Eligible',
      gate_required INTEGER DEFAULT 0,
      selection_mode TEXT DEFAULT 'CBT (Computer Based Test)',
      salary TEXT NOT NULL,
      last_date TEXT NOT NULL,
      apply_url TEXT NOT NULL,
      source_url TEXT,
      raw_description TEXT,
      ai_verified INTEGER DEFAULT 1,
      ai_reasoning TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scrape_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      jobs_found INTEGER DEFAULT 0,
      message TEXT
    );
  `);

  // Migration columns check for existing database
  try {
    await db.exec(`ALTER TABLE jobs ADD COLUMN experience_level TEXT DEFAULT 'Fresher Eligible';`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE jobs ADD COLUMN selection_mode TEXT DEFAULT 'CBT (Computer Based Test)';`);
  } catch (e) {}

  console.log('[DB] SQLite Database initialized at:', dbPath);

  // Re-seed jobs table to ensure exact accurate data
  const row = await db.get('SELECT COUNT(*) as count FROM jobs');
  if (row && row.count === 0) {
    console.log('[DB] Seeding initial 5+ major tech PSU job alerts with selection modes...');
    await seedInitialJobs(db);
  }
}

function generateHash(organization, title) {
  return crypto
    .createHash('md5')
    .update(`${organization.trim().toLowerCase()}_${title.trim().toLowerCase()}`)
    .digest('hex');
}

async function seedInitialJobs(db) {
  const initialJobs = [
    {
      organization: 'NIC (National Informatics Centre)',
      title: 'Scientist B (Computer Science / IT)',
      category: 'Central Govt',
      qualification: 'B.Tech CSE / IT / MCA / M.Tech',
      experience_level: 'Fresher Eligible',
      gate_required: 0,
      selection_mode: 'CBT (Computer Based Test)',
      salary: '₹56,100 - ₹1,77,500 (Level 10)',
      last_date: '2026-09-25',
      apply_url: 'https://recruitment.nic.in/',
      source_url: 'https://recruitment.nic.in/scientist-b-2026',
      raw_description: 'National Informatics Centre invites applications for Scientist B (Group A) for Computer Science and IT. Selection via direct online Computer Based Test (CBT) conducted by NIELIT followed by interview. No GATE score required.',
      ai_verified: 1,
      ai_reasoning: 'Direct recruitment through NIELIT CBT online exam. Open for B.Tech CS/IT freshers without GATE.'
    },
    {
      organization: 'C-DAC (Centre for Dev of Advanced Computing)',
      title: 'Project Engineer (Software & AI Solutions)',
      category: 'Research',
      qualification: 'B.Tech CSE / IT / M.Sc CS',
      experience_level: 'Experienced (1-3 Yrs)',
      gate_required: 0,
      selection_mode: 'Direct Interview',
      salary: '₹48,000 - ₹85,000 / Month',
      last_date: '2026-09-18',
      apply_url: 'https://cdac.in/index.aspx?id=careers',
      source_url: 'https://cdac.in/careers/project-engineer-2026',
      raw_description: 'C-DAC Pune calls applications for Project Engineers in HPC & AI. Selection via shortlisting based on qualification & direct technical video interview. No GATE required.',
      ai_verified: 1,
      ai_reasoning: 'Direct technical interview selection. No written exam or GATE score needed.'
    },
    {
      organization: 'BEL (Bharat Electronics Limited)',
      title: 'Trainee Engineer I (Computer Science)',
      category: 'PSU',
      qualification: 'B.Tech CSE / IT',
      experience_level: 'Fresher Eligible',
      gate_required: 1,
      selection_mode: 'GATE Score + Interview',
      salary: '₹40,000 - ₹1,20,000 / Month',
      last_date: '2026-09-12',
      apply_url: 'https://bel-india.in/Careers.aspx',
      source_url: 'https://bel-india.in/Careers-detail/trainee-eng-cs',
      raw_description: 'Bharat Electronics Limited Bangalore complex requires Trainee Engineers in Computer Science. Shortlisting strictly based on valid GATE 2025/2026 CS paper score followed by personal interview.',
      ai_verified: 1,
      ai_reasoning: 'Selection based on valid GATE scorecard in CS paper followed by interview.'
    },
    {
      organization: 'ISRO (Indian Space Research Organisation)',
      title: 'Scientist / Engineer SC (Computer Science)',
      category: 'Research',
      qualification: 'B.Tech CSE (Min 65% marks)',
      experience_level: 'Fresher Eligible',
      gate_required: 1,
      selection_mode: 'GATE Score + Written Test',
      salary: '₹56,100 + DA/HRA (Level 10)',
      last_date: '2026-09-30',
      apply_url: 'https://www.isro.gov.in/Careers.html',
      source_url: 'https://www.isro.gov.in/careers/scientist-sc-cs-2026',
      raw_description: 'ISRO ICRB recruitment for Scientist SC Computer Science. Shortlisting through GATE CS score followed by offline written test & technical interview.',
      ai_verified: 1,
      ai_reasoning: 'Requires valid GATE CS scorecard + ICRB written examination.'
    },
    {
      organization: 'BIS (Bureau of Indian Standards)',
      title: 'Assistant Director (IT & Cyber Security)',
      category: 'Central Govt',
      qualification: 'B.Tech CSE / IT / MCA',
      experience_level: 'Experienced (2+ Yrs)',
      gate_required: 0,
      selection_mode: 'OMR Based Written Exam',
      salary: '₹67,700 - ₹2,08,700 (Level 11)',
      last_date: '2026-09-20',
      apply_url: 'https://bis.gov.in/index.php/direct-recruitment/',
      source_url: 'https://bis.gov.in/recruitment/ad-it-2026',
      raw_description: 'Bureau of Indian Standards recruitment for Assistant Director (IT). Selection through offline OMR-based written competitive examination across major cities.',
      ai_verified: 1,
      ai_reasoning: 'Direct offline OMR written exam + interview. No GATE required.'
    },
    {
      organization: 'DRDO (Defence Research & Dev Organisation)',
      title: 'Scientist B (Cyber Security & Systems)',
      category: 'Research',
      qualification: 'B.Tech CSE / IT / M.Tech CS',
      experience_level: 'Fresher Eligible',
      gate_required: 1,
      selection_mode: 'GATE Score + Personal Interview',
      salary: '₹56,100 + Special Allowances',
      last_date: '2026-10-05',
      apply_url: 'https://rac.gov.in/',
      source_url: 'https://rac.gov.in/drdo-scientist-b-cs-2026',
      raw_description: 'RAC DRDO Scientist B recruitment for Computer Science. Shortlisting based 80% weightage on valid GATE CS score and 20% on personal interview.',
      ai_verified: 1,
      ai_reasoning: 'Requires valid GATE CS paper score for shortlisting.'
    },
    {
      organization: 'NIELIT (National Inst of Electronics & IT)',
      title: 'Senior Technical Assistant (IT Infrastructure)',
      category: 'State Govt',
      qualification: 'B.Tech CSE / BCA / B.Sc IT / MCA',
      experience_level: 'Fresher Eligible',
      gate_required: 0,
      selection_mode: 'CBT (Computer Based Test)',
      salary: '₹35,400 - ₹1,12,400 (Level 6)',
      last_date: '2026-09-15',
      apply_url: 'https://nielit.gov.in/recruitments',
      source_url: 'https://nielit.gov.in/recruitments/sta-it-2026',
      raw_description: 'NIELIT Senior Technical Assistant recruitment. Selection based solely on merit in online Computer Based Test (CBT) objective exam. No interview & No GATE.',
      ai_verified: 1,
      ai_reasoning: 'Direct online CBT exam. GATE score not required.'
    }
  ];

  for (const job of initialJobs) {
    const hash = generateHash(job.organization, job.title);
    await db.run(
      `INSERT INTO jobs (job_hash, organization, title, category, qualification, experience_level, gate_required, selection_mode, salary, last_date, apply_url, source_url, raw_description, ai_verified, ai_reasoning)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        hash,
        job.organization,
        job.title,
        job.category,
        job.qualification,
        job.experience_level,
        job.gate_required,
        job.selection_mode,
        job.salary,
        job.last_date,
        job.apply_url,
        job.source_url,
        job.raw_description,
        job.ai_reasoning
      ]
    );
  }

  console.log(`[DB] Successfully seeded ${initialJobs.length} PSU job postings!`);
}

module.exports = {
  getDb,
  initDb,
  generateHash
};
