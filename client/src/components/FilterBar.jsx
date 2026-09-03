import React from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  gateFilter,
  setGateFilter,
  qualificationFilter,
  setQualificationFilter,
  experienceFilter,
  setExperienceFilter,
  modeFilter,
  setModeFilter,
  sortBy,
  setSortBy,
  totalResults
}) {
  const categories = ['All', 'PSU', 'Central Govt', 'State Govt', 'Research'];
  const gateOptions = [
    { label: 'All Entry Modes', value: 'All' },
    { label: 'GATE Required ⚡', value: '1' },
    { label: 'Direct Exam / Non-GATE ✅', value: '0' }
  ];
  const experienceOptions = [
    { label: 'All Experience Levels', value: 'All' },
    { label: 'Fresher Eligible 🎓', value: 'Fresher' },
    { label: 'Experienced 💼', value: 'Experienced' }
  ];
  const examModeOptions = [
    { label: 'All Exam Modes', value: 'All' },
    { label: 'CBT (Online Test) 💻', value: 'CBT' },
    { label: 'OMR (Offline Exam) 📝', value: 'OMR' },
    { label: 'Direct Interview 🗣️', value: 'Interview' }
  ];
  const qualifications = ['All', 'B.Tech CSE', 'MCA', 'M.Tech'];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 mb-6 space-y-4">
      
      {/* Top Search & Primary Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by organization (BEL, NIC, ISRO) or role title..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Secondary Dropdown Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Experience Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden sm:inline">Experience:</span>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              {experienceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* GATE Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden sm:inline">GATE:</span>
            <select
              value={gateFilter}
              onChange={(e) => setGateFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {gateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Mode Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden sm:inline">Exam Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {examModeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Qualification Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium hidden sm:inline">Degree:</span>
            <select
              value={qualificationFilter}
              onChange={(e) => setQualificationFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {qualifications.map((q) => (
                <option key={q} value={q}>
                  {q === 'All' ? 'All Degrees' : q}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Sorting & Counter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-slate-400 text-xs">
            Showing <strong className="text-blue-400 font-semibold">{totalResults}</strong> CS/IT postings
          </span>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest Added</option>
              <option value="deadline">Closing Soonest</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
