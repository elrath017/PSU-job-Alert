const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendTestTelegramAlert, sendJobTelegramNotification } = require('../services/notifier');

// POST /api/alerts/telegram/test - Send test notification payload
router.post('/telegram/test', async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    const result = await sendTestTelegramAlert(botToken, chatId);
    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/alerts/telegram/send-job/:id - Send specific job alert
router.post('/telegram/send-job/:id', async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    const db = await getDb();
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const result = await sendJobTelegramNotification(job, botToken, chatId);
    res.json({
      success: true,
      jobTitle: job.title,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
