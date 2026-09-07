import React, { useState } from 'react';
import { X, Send, Bot, Shield, CheckCircle2, AlertCircle, Sparkles, Bell, BellOff, Radio } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TelegramModal({ 
  isOpen, 
  onClose, 
  targetJob = null, 
  telegramEnabled = true, 
  onToggleTelegram 
}) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'mock', message, payload }
  const [loading, setLoading] = useState(false);
  const [sendingLatest, setSendingLatest] = useState(false);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    setLoading(true);
    setStatus(null);

    try {
      let endpoint = '/api/alerts/telegram/test';
      let body = { botToken, chatId };

      if (targetJob) {
        endpoint = `/api/alerts/telegram/send-job/${targetJob.id}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const result = data.result;
        if (result.mock) {
          setStatus({
            type: 'mock',
            message: 'Telegram API credentials not configured in backend .env, generated live mock preview!',
            payload: result.payload
          });
        } else {
          setStatus({
            type: 'success',
            message: '🎉 Telegram Notification successfully dispatched to your Telegram channel!',
            payload: result.telegramResponse
          });
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to dispatch Telegram message.',
        });
      }
    } catch (err) {
      setLoading(false);
      setStatus({
        type: 'error',
        message: err.message
      });
    }
  };

  const handleSendLatestJobs = async () => {
    setSendingLatest(true);
    setStatus(null);

    try {
      const res = await fetch('/api/alerts/telegram/send-latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5, botToken, chatId })
      });

      const data = await res.json();
      setSendingLatest(false);

      if (data.success) {
        const result = data.result;
        if (result.mock) {
          setStatus({
            type: 'mock',
            message: `⚡ Dispatched ${result.count || 5} latest scraped jobs! (Mock preview generated - add TELEGRAM_BOT_TOKEN to .env for live channel posts)`,
            payload: result.results
          });
        } else {
          setStatus({
            type: 'success',
            message: `🚀 Successfully broadcasted ${result.count || 5} latest scraped jobs to your Telegram Bot channel!`,
            payload: result.results
          });
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
        }
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to send latest jobs to Telegram.'
        });
      }
    } catch (err) {
      setSendingLatest(false);
      setStatus({
        type: 'error',
        message: err.message
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 overflow-hidden flex flex-col shadow-2xl space-y-4">
        
        {/* Modal Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-outfit">
                {targetJob ? `Dispatch Job Alert to Telegram` : `Telegram Bot Alert Manager`}
              </h2>
              <p className="text-xs text-slate-400">Configure bot integration & manual job broadcasts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Enable / Disable Toggle Switch Card */}
        <div className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
          telegramEnabled 
            ? 'bg-emerald-950/30 border-emerald-800/40' 
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              telegramEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
            }`}>
              {telegramEnabled ? <Bell className="w-5 h-5 animate-pulse" /> : <BellOff className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-outfit">
                Automatic Telegram Notifications
              </h4>
              <p className="text-[11px] text-slate-400">
                {telegramEnabled 
                  ? 'ENABLED: New jobs found during scraping will auto-post to Telegram' 
                  : 'DISABLED: Automated scraping alerts are currently paused'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={onToggleTelegram}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              telegramEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                telegramEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Selected Job Banner if applicable */}
        {targetJob && (
          <div className="bg-sky-950/40 border border-sky-800/40 rounded-xl p-3 text-xs space-y-1">
            <span className="text-sky-300 font-semibold block">Target Vacancy Payload:</span>
            <p className="text-white font-medium">{targetJob.organization} - {targetJob.title}</p>
          </div>
        )}

        {/* Send Latest Jobs Action Bar */}
        {!targetJob && (
          <div className="bg-gradient-to-r from-sky-950/50 via-blue-950/30 to-indigo-950/50 border border-sky-800/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 font-outfit">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>Broadcast Latest Scraped Jobs</span>
              </div>
              <p className="text-[11px] text-slate-400">Send top 5 newest jobs directly to Telegram bot</p>
            </div>
            <button
              onClick={handleSendLatestJobs}
              disabled={sendingLatest}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all duration-200"
            >
              <Send className={`w-3.5 h-3.5 ${sendingLatest ? 'animate-spin' : ''}`} />
              <span>{sendingLatest ? 'Sending...' : 'Send Latest Jobs'}</span>
            </button>
          </div>
        )}

        {/* Telegram Credentials Form (Optional Overrides) */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Telegram Bot Token (Optional Override)</label>
            <input
              type="password"
              placeholder="e.g. 7123456789:AAE-xxxx... (Default from .env if empty)"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Telegram Chat / Channel ID (Optional Override)</label>
            <input
              type="text"
              placeholder="e.g. @psu_tech_alerts or -100123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Response / Status Feedback */}
        {status && (
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-2 ${
            status.type === 'success' ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300' :
            status.type === 'mock' ? 'bg-amber-950/40 border-amber-700/50 text-amber-300' :
            'bg-rose-950/40 border-rose-700/50 text-rose-300'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> :
               status.type === 'mock' ? <Sparkles className="w-4 h-4 text-amber-400 shrink-0" /> :
               <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{status.message}</span>
            </div>

            {status.payload && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {typeof status.payload === 'string' ? status.payload : JSON.stringify(status.payload, null, 2)}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">
            Telegram Bot Webhook Engine
          </span>

          <button
            onClick={handleSendTest}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
          >
            <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Dispatching...' : targetJob ? 'Send Job Alert' : 'Send Test Payload'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
