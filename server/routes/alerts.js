const express = require('express');
const router = express.Router();
const { getDb, getSetting, setSetting } = require('../db');
const { sendTestTelegramAlert, sendJobTelegramNotification, sendLatestJobsTelegramAlert } = require('../services/notifier');

// GET /api/alerts/telegram/status - Fetch current Telegram enable/disable state & env status
router.get('/telegram/status', async (req, res) => {
  try {
    const enabledStr = await getSetting('telegram_enabled', 'true');
    res.json({
      success: true,
      telegramEnabled: enabledStr === 'true',
      botTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
      chatIdConfigured: !!process.env.TELEGRAM_CHAT_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/alerts/telegram/toggle - Enable or disable automated Telegram job alerts
router.post('/telegram/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    const isEnabled = Boolean(enabled);
    await setSetting('telegram_enabled', isEnabled ? 'true' : 'false');
    res.json({
      success: true,
      telegramEnabled: isEnabled,
      message: `Telegram automatic alerts ${isEnabled ? 'enabled' : 'disabled'}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/alerts/telegram/send-latest - Broadcast latest scraped jobs to Telegram
router.post('/telegram/send-latest', async (req, res) => {
  try {
    const { limit = 5, botToken, chatId } = req.body;
    const result = await sendLatestJobsTelegramAlert(limit, botToken, chatId);
    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
