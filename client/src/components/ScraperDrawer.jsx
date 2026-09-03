import React from 'react';
import { X, CheckCircle2, AlertTriangle, Terminal, RefreshCw } from 'lucide-react';

export default function ScraperDrawer({ isOpen, onClose, scrapeLogs, isScraping }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700/80 p-6 overflow-hidden flex flex-col shadow-2xl space-y-4 max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-outfit">Web Scraper & AI Ingestion Log</h2>
              <p className="text-xs text-slate-400">Targeting BEL, NIC, CDAC, BIS, ISRO, DRDO, NIELIT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Header */}
        <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isScraping ? 'animate-spin' : ''}`} />
            <span className="font-semibold text-white">
              {isScraping ? 'Active Portal Crawling & AI Classification in Progress...' : 'Ingestion Run Completed'}
            </span>
          </div>
        </div>

        {/* Logs Console Container */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2.5 overflow-y-auto max-h-72 font-mono text-[11px] text-slate-300">
          {scrapeLogs && scrapeLogs.length > 0 ? (
            scrapeLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                {log.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-blue-300">[{log.source || 'Scraper Engine'}]</span>{' '}
                  <span className="text-slate-300">{log.message}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic text-center py-4">No active ingestion logs recorded yet.</div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
}
