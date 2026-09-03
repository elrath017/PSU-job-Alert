import React from 'react';
import { ExternalLink, Send, Sparkles, Calendar, DollarSign, Award, CheckCircle, AlertTriangle, ShieldCheck, GraduationCap, Briefcase, Monitor, FileSpreadsheet, UserCheck } from 'lucide-react';

export default function JobCard({ job, onOpenDetail, onSendTelegram }) {
  // Helper to calculate days remaining
  const calculateDaysLeft = (lastDateStr) => {
    if (!lastDateStr) return { days: 0, label: 'Unknown', urgency: 'normal' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(lastDateStr);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: diffDays, label: 'Expired', urgency: 'expired' };
    if (diffDays === 0) return { days: 0, label: 'Closing Today!', urgency: 'critical' };
    if (diffDays <= 5) return { days: diffDays, label: `${diffDays} Days Left`, urgency: 'urgent' };
    return { days: diffDays, label: `${diffDays} Days Left`, urgency: 'normal' };
  };

  const countdown = calculateDaysLeft(job.last_date);

  // Styling maps based on organization
  const getOrgColor = (orgName) => {
    if (orgName.includes('BEL')) return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    if (orgName.includes('NIC')) return 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
    if (orgName.includes('CDAC')) return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
    if (orgName.includes('ISRO')) return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30';
    if (orgName.includes('BIS')) return 'bg-amber-600/20 text-amber-300 border-amber-500/30';
    if (orgName.includes('DRDO')) return 'bg-rose-600/20 text-rose-300 border-rose-500/30';
    return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
  };

  // Badge styling for urgency
  const getUrgencyBadge = (urgency, label) => {
    if (urgency === 'expired') return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">{label}</span>;
    if (urgency === 'critical') return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60 animate-pulse">{label}</span>;
    if (urgency === 'urgent') return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60">{label}</span>;
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">{label}</span>;
  };

  const isFresher = !job.experience_level || job.experience_level.includes('Fresher');
  const isGateRequired = Number(job.gate_required) === 1;

  // Render selection / exam mode badge
  const renderSelectionMode = () => {
    if (isGateRequired) {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-700/40">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>GATE Score Required ({job.selection_mode || 'GATE + Interview'})</span>
        </span>
      );
    }

    const mode = job.selection_mode || 'CBT (Computer Based Test)';
    if (mode.includes('CBT') || mode.includes('Computer')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-700/40">
          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
          <span>Direct Exam: CBT (Computer Based Test)</span>
        </span>
      );
    }
    if (mode.includes('OMR') || mode.includes('Written')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-700/40">
          <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Direct Exam: OMR Offline Written Test</span>
        </span>
      );
    }
    if (mode.includes('Interview')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-indigo-400 font-semibold bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-700/40">
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Direct Selection: Technical Interview (No Written Exam)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-700/40">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>Direct Selection ({mode})</span>
      </span>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative group overflow-hidden">
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getOrgColor(job.organization)}`}>
              {job.organization.split('(')[0].trim()}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {job.category}
            </span>
          </div>

          {/* Countdown Badge */}
          {getUrgencyBadge(countdown.urgency, countdown.label)}
        </div>

        {/* Experience Level Pill Banner */}
        <div className="mb-2.5 flex items-center">
          {isFresher ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fresher Eligible (0 Yrs Exp)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>{job.experience_level || 'Experienced Professional'}</span>
            </span>
          )}
        </div>

        {/* Role Title */}
        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 font-outfit mb-1.5">
          {job.title}
        </h3>

        {/* Full Organization Subtitle */}
        <p className="text-xs text-slate-400 mb-4 line-clamp-1">
          {job.organization}
        </p>

        {/* Requirements & Info Grid */}
        <div className="space-y-2 mb-4 text-xs">
          
          {/* Qualification Tags */}
          <div className="flex items-start gap-2 text-slate-300">
            <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {job.qualification.split('/').map((q, idx) => (
                <span key={idx} className="bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700/50">
                  {q.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Selection & Exam Mode Badge */}
          <div className="flex items-center gap-2 text-xs">
            {renderSelectionMode()}
          </div>

          {/* Salary / Pay Scale */}
          <div className="flex items-center gap-2 text-slate-300">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200">{job.salary}</span>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Apply Deadline: <strong className="text-slate-200 font-medium">{job.last_date}</strong></span>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* AI Reasoning Modal Trigger */}
          <button
            onClick={() => onOpenDetail(job)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/50 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60 transition-colors"
            title="View AI Verification & Criteria"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>AI Audit</span>
          </button>

          {/* Telegram Dispatch */}
          <button
            onClick={() => onSendTelegram(job)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-950/50 text-sky-300 border border-sky-800/40 hover:bg-sky-900/60 transition-colors"
            title="Send Job Notification to Telegram"
          >
            <Send className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Alert</span>
          </button>

        </div>

        {/* Direct Apply Button */}
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105"
        >
          <span>Apply Official</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

      </div>

    </div>
  );
}
