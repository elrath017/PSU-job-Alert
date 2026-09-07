const axios = require('axios');
const https = require('https');
const dns = require('dns');

// Custom HTTPS Agent to ensure IPv4 DNS resolution for api.telegram.org
const telegramHttpsAgent = new https.Agent({
  lookup: (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        if (options.all) {
          return callback(null, addresses.map(a => ({ address: a, family: 4 })));
        }
        return callback(null, addresses[0], 4);
      }
      dns.lookup(hostname, options, callback);
    });
  }
});

/**
 * Dispatches Telegram Notification via Telegram Bot API
 */
async function sendTelegramMessage(botToken, chatId, textMessage, parseMode = 'HTML') {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return {
      success: false,
      mock: true,
      message: 'Telegram Token or Chat ID not configured in .env. Test payload generated as mock preview.',
      payload: textMessage
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(
      url,
      {
        chat_id: chat,
        text: textMessage,
        parse_mode: parseMode,
        disable_web_page_preview: false
      },
      {
        httpsAgent: telegramHttpsAgent,
        timeout: 10000
      }
    );

    return {
      success: true,
      mock: false,
      telegramResponse: response.data
    };
  } catch (error) {
    console.error('❌ Telegram API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.description || error.message,
      payload: textMessage
    };
  }
}

/**
 * Sends a structured test Telegram Alert payload
 */
async function sendTestTelegramAlert(botToken, chatId) {
  const testMessage = `
🚨 <b>PSU JOB ALERT TEST DISPATCH</b> 🚨
━━━━━━━━━━━━━━━━━━━━━━
🏢 <b>BEL (Bharat Electronics Limited)</b>
💼 <b>Role:</b> Trainee Engineer I (Computer Science)
🎓 <b>Eligibility:</b> B.Tech CSE / IT
⚡ <b>GATE Status:</b> GATE 2025/2026 Required
💰 <b>Salary:</b> ₹40,000 - ₹1,20,000 / Month
⏳ <b>Deadline:</b> 12th Sept 2026

🔗 <a href="https://bel-india.in/Careers.aspx">Click Here to Apply Official Portal</a>
━━━━━━━━━━━━━━━━━━━━━━
🤖 <i>Powered by PSU CS/IT AI Job Intelligence Bot</i>
`;

  return await sendTelegramMessage(botToken, chatId, testMessage);
}

/**
 * Sends specific Job alert to Telegram
 */
async function sendJobTelegramNotification(job, botToken, chatId) {
  const gateBadge = job.gate_required ? '<b>GATE Required</b> ⚠️' : '<b>Direct Exam / No GATE</b> ✅';
  const expBadge = job.experience_level || 'Fresher Eligible';
  const modeBadge = job.selection_mode || 'CBT (Computer Based Test)';
  
  const message = `
🚨 <b>NEW CS/IT PSU JOB ALERT</b> 🚨
━━━━━━━━━━━━━━━━━━━━━━
🏢 <b>${job.organization}</b>
💼 <b>Role:</b> ${job.title}
🏛️ <b>Category:</b> ${job.category}
🎓 <b>Eligibility:</b> ${job.qualification}
🎯 <b>Experience:</b> ${expBadge}
⚡ <b>Selection Mode:</b> ${modeBadge}
📋 <b>GATE Status:</b> ${gateBadge}
💰 <b>Pay Scale:</b> ${job.salary}
⏳ <b>Last Date:</b> ${job.last_date}

📝 <b>AI Summary:</b> ${job.ai_reasoning || 'Verified CS/IT Vacancy'}

🔗 <a href="${job.apply_url}">Apply Now on Official Portal</a>
━━━━━━━━━━━━━━━━━━━━━━
🤖 <i>PSU CS/IT Job Alert Engine</i>
`;

  return await sendTelegramMessage(botToken, chatId, message);
}

/**
 * Sends top N latest scraped jobs to Telegram
 */
async function sendLatestJobsTelegramAlert(limit = 5, botToken, chatId) {
  const { getDb } = require('../db');
  const db = await getDb();
  const latestJobs = await db.all('SELECT * FROM jobs ORDER BY id DESC LIMIT ?', [limit]);

  if (!latestJobs || latestJobs.length === 0) {
    return {
      success: false,
      message: 'No jobs found in database to send.'
    };
  }

  const results = [];
  for (const job of latestJobs) {
    const res = await sendJobTelegramNotification(job, botToken, chatId);
    results.push({ jobId: job.id, title: job.title, organization: job.organization, result: res });
  }

  const isMock = results.some(r => r.result.mock);
  const successCount = results.filter(r => r.result.success || r.result.mock).length;

  return {
    success: true,
    mock: isMock,
    count: successCount,
    totalJobs: latestJobs.length,
    results
  };
}

module.exports = {
  sendTelegramMessage,
  sendTestTelegramAlert,
  sendJobTelegramNotification,
  sendLatestJobsTelegramAlert
};
