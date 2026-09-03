const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { runScraperIngestion } = require('../scrapers/psuScraper');

// GET /api/jobs - List active CS/IT jobs with multi-filter & search
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { category, gate_required, qualification, experience, mode, search, sort } = req.query;

    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (gate_required !== undefined && gate_required !== 'All') {
      query += ' AND gate_required = ?';
      params.push(gate_required === '1' || gate_required === 'true' ? 1 : 0);
    }

    if (qualification && qualification !== 'All') {
      query += ' AND qualification LIKE ?';
      params.push(`%${qualification}%`);
    }

    if (experience && experience !== 'All') {
      if (experience === 'Fresher') {
        query += " AND (experience_level = 'Fresher Eligible' OR experience_level LIKE '%Fresher%')";
      } else if (experience === 'Experienced') {
        query += " AND experience_level LIKE 'Experienced%'";
      }
    }

    if (mode && mode !== 'All') {
      if (mode === 'CBT') {
        query += " AND selection_mode LIKE '%CBT%'";
      } else if (mode === 'OMR') {
        query += " AND selection_mode LIKE '%OMR%'";
      } else if (mode === 'Interview') {
        query += " AND selection_mode LIKE '%Interview%'";
      }
    }

    if (search && search.trim() !== '') {
      query += ' AND (organization LIKE ? OR title LIKE ? OR raw_description LIKE ? OR selection_mode LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    // Sorting
    if (sort === 'deadline') {
      query += ' ORDER BY last_date ASC';
    } else if (sort === 'salary') {
      query += ' ORDER BY salary DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const jobs = await db.all(query, params);
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stats - Dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb();
    const totalRow = await db.get('SELECT COUNT(*) as c FROM jobs');
    const psuRow = await db.get("SELECT COUNT(*) as c FROM jobs WHERE category = 'PSU'");
    const fresherRow = await db.get("SELECT COUNT(*) as c FROM jobs WHERE experience_level = 'Fresher Eligible' OR experience_level LIKE '%Fresher%'");
    const gateExemptRow = await db.get('SELECT COUNT(*) as c FROM jobs WHERE gate_required = 0');
    
    // Jobs closing within 7 days
    const today = new Date().toISOString().split('T')[0];
    const SevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const closingSoonRow = await db.get('SELECT COUNT(*) as c FROM jobs WHERE last_date >= ? AND last_date <= ?', [today, SevenDaysAhead]);

    res.json({
      success: true,
      stats: {
        totalJobs: totalRow ? totalRow.c : 0,
        psuJobs: psuRow ? psuRow.c : 0,
        fresherJobs: fresherRow ? fresherRow.c : 0,
        gateExemptJobs: gateExemptRow ? gateExemptRow.c : 0,
        closingSoon: closingSoonRow ? closingSoonRow.c : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/jobs/:id - Single job details
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/jobs/scrape - Trigger manual web scrape & AI ingestion
router.post('/scrape', async (req, res) => {
  try {
    const result = await runScraperIngestion();
    res.json({
      success: true,
      message: `Scraper cycle complete. Discovered ${result.totalNewJobs} new job updates.`,
      newJobsAdded: result.totalNewJobs,
      logs: result.logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
