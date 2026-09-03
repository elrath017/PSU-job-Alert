import React from 'react';
import { Briefcase, Building2, Clock, GraduationCap, Zap } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const cards = [
    {
      title: 'Total Active CS/IT Roles',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/20',
      badge: 'Verified'
    },
    {
      title: 'Fresher Eligible Roles',
      value: stats?.fresherJobs || 0,
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/20',
      badge: '0 Yrs Experience'
    },
    {
      title: 'GATE Exempt / Direct Exam',
      value: stats?.gateExemptJobs || 0,
      icon: Zap,
      color: 'from-purple-500 to-indigo-500',
      borderColor: 'border-purple-500/20',
      badge: 'No GATE Required'
    },
    {
      title: 'Closing Within 7 Days',
      value: stats?.closingSoon || 0,
      icon: Clock,
      color: 'from-rose-500 to-amber-500',
      borderColor: 'border-rose-500/20',
      badge: 'Urgent'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel p-4 rounded-xl border ${card.borderColor} relative overflow-hidden group hover:border-slate-700 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1 font-outfit tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} p-2.5 text-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{card.badge}</span>
              <span className="text-slate-500 group-hover:text-blue-400 transition-colors">CS/IT Stream</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
