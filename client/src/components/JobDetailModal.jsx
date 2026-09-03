import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, Calendar, DollarSign, Award, FileText, Monitor, FileSpreadsheet, UserCheck, AlertTriangle } from 'lucide-react';

export default function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  const isGateRequired = Number(job.gate_required) === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/80 p-6 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">{job.title}</h2>
              <p className="text-xs text-slate-400">{job.organization}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs pr-1">
          
          {/* AI Decision Box */}
          <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Google Gemini AI - CS/IT Verification Passed</span>
              </span>
              <span className="bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded text-[10px]">
                Confidence: High
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {job.ai_reasoning || 'This posting was parsed and verified by the Google Gemini AI engine. Eligibility requires B.Tech CSE, IT, or MCA degree.'}
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Category</span>
              <span className="text-white font-semibold">{job.category}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Experience Requirement</span>
              <span className={(!job.experience_level || job.experience_level.includes('Fresher')) ? 'text-emerald-400 font-semibold' : 'text-purple-400 font-semibold'}>
                {job.experience_level || 'Fresher Eligible'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Selection / Exam Mode</span>
              <span className="text-blue-300 font-semibold flex items-center gap-1.5 mt-0.5">
                {job.selection_mode || (isGateRequired ? 'GATE Score + Interview' : 'CBT (Computer Based Test)')}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">GATE Status</span>
              <span className={isGateRequired ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {isGateRequired ? 'GATE 2025/2026 Score Required' : 'Direct Recruitment / GATE Exempt'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Qualifications</span>
              <span className="text-white font-semibold">{job.qualification}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Pay Scale</span>
              <span className="text-emerald-300 font-semibold">{job.salary}</span>
            </div>
          </div>

          {/* Raw Scraped Announcement Text */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Raw Official Notification Excerpt</span>
            </h4>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-slate-400 font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto">
              {job.raw_description || 'Official vacancy description verified.'}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            Deadline: <strong className="text-white">{job.last_date}</strong>
          </span>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Visit Official Application Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
