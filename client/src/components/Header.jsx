import React from 'react';
import { Cpu, RefreshCw, Send, Sparkles, Bell, BellOff } from 'lucide-react';

export default function Header({ 
  onTriggerScrape, 
  isScraping, 
  onOpenTelegramModal, 
  geminiActive,
  telegramEnabled,
  onToggleTelegram 
}) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#0b0f19] rounded-full ${telegramEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-outfit">
                PSU Tech Alert <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                CS & IT SPECIALIZED
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time Govt Job Radar & Telegram Alerts</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          
          {/* Gemini AI Status Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            geminiActive 
              ? 'bg-purple-950/40 text-purple-300 border-purple-800/50 ai-badge-glow' 
              : 'bg-slate-800/50 text-slate-300 border-slate-700/50'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>{geminiActive ? 'Gemini 2.5 AI Filter Active' : 'AI Parser Online'}</span>
          </div>

          {/* Telegram Auto Alert Quick Toggle Pill */}
          <button
            onClick={onToggleTelegram}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
              telegramEnabled
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
            }`}
            title={telegramEnabled ? "Automatic Telegram Job Alerts are ENABLED (Click to pause)" : "Automatic Telegram Job Alerts are DISABLED (Click to enable)"}
          >
            {telegramEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="hidden xs:inline">Telegram:</span>
                <span className="text-emerald-400 font-bold">ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xs:inline">Telegram:</span>
                <span className="text-slate-400 font-bold">OFF</span>
              </>
            )}
          </button>

          {/* Telegram Config & Broadcast Button */}
          <button
            onClick={onOpenTelegramModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-all duration-200"
            title="Configure Telegram Bot & Dispatch Alerts"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Bot</span>
          </button>

          {/* Trigger Ingestion Button */}
          <button
            onClick={onTriggerScrape}
            disabled={isScraping}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ${
              isScraping ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'Scraping Portals...' : 'Scrape & AI Ingest'}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
