import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import JobCard from './components/JobCard';
import JobDetailModal from './components/JobDetailModal';
import TelegramModal from './components/TelegramModal';
import ScraperDrawer from './components/ScraperDrawer';
import { Cpu, RefreshCw, Sparkles, Bell, ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [gateFilter, setGateFilter] = useState('All');
  const [qualificationFilter, setQualificationFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modal & Drawer states
  const [selectedJob, setSelectedJob] = useState(null);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [telegramTargetJob, setTelegramTargetJob] = useState(null);
  
  const [isScraping, setIsScraping] = useState(false);
  const [scraperLogs, setScraperLogs] = useState([]);
  const [scraperDrawerOpen, setScraperDrawerOpen] = useState(false);

  const [geminiActive, setGeminiActive] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    fetchStats();
    checkHealth();
  }, []);

  // Re-fetch jobs whenever filters change
  useEffect(() => {
    fetchJobs();
  }, [category, gateFilter, qualificationFilter, experienceFilter, modeFilter, search, sortBy]);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.geminiConfigured) setGeminiActive(true);
    } catch (e) {
      // API backend offline
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/jobs/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (gateFilter !== 'All') params.append('gate_required', gateFilter);
      if (qualificationFilter !== 'All') params.append('qualification', qualificationFilter);
      if (experienceFilter !== 'All') params.append('experience', experienceFilter);
      if (modeFilter !== 'All') params.append('mode', modeFilter);
      if (search.trim() !== '') params.append('search', search);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setJobs(data.jobs);
      } else {
        setError(data.error || 'Failed to load jobs');
      }
    } catch (err) {
      setError('Unable to connect to PSU Job Alert backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScrape = async () => {
    setIsScraping(true);
    setScraperDrawerOpen(true);
    try {
      const res = await fetch('/api/jobs/scrape', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScraperLogs(data.logs || []);
        fetchJobs();
        fetchStats();
      }
    } catch (err) {
      console.error('Scraper trigger error:', err);
    } finally {
      setIsScraping(false);
    }
  };

  const handleOpenTelegramJobAlert = (job) => {
    setTelegramTargetJob(job);
    setTelegramModalOpen(true);
  };

  const handleOpenTelegramGeneralModal = () => {
    setTelegramTargetJob(null);
    setTelegramModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Top Sticky Header */}
      <Header
        onTriggerScrape={handleTriggerScrape}
        isScraping={isScraping}
        onOpenTelegramModal={handleOpenTelegramGeneralModal}
        geminiActive={geminiActive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Banner / Intro */}
        <div className="mb-6 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900/60 border border-blue-800/30 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Real-Time CS & IT Vacancy Radar</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">
              PSU & Govt Job Dashboard for Engineers & Tech Professionals
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              Automated ingestion & AI eligibility verification for BEL, NIC, C-DAC, BIS, ISRO, DRDO & NIELIT. Filter by GATE, qualification, exam mode (CBT / OMR / Interview), and receive instant Telegram alerts.
            </p>
          </div>

          <button
            onClick={handleTriggerScrape}
            disabled={isScraping}
            className="z-10 shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
            <span>{isScraping ? 'In Progress...' : 'Run Web Scraper Now'}</span>
          </button>

          {/* Abstract Glow background */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Stats Counters */}
        <StatsOverview stats={stats} />

        {/* Filter Controls */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          gateFilter={gateFilter}
          setGateFilter={setGateFilter}
          qualificationFilter={qualificationFilter}
          setQualificationFilter={setQualificationFilter}
          experienceFilter={experienceFilter}
          setExperienceFilter={setExperienceFilter}
          modeFilter={modeFilter}
          setModeFilter={setModeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={jobs.length}
        />

        {/* Error State */}
        {error && (
          <div className="glass-panel p-6 rounded-2xl border border-rose-800/50 bg-rose-950/20 text-center space-y-3 my-8">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white font-outfit">{error}</h3>
            <button
              onClick={fetchJobs}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Retry Loading Jobs
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Loading active CS/IT vacancies...</p>
          </div>
        ) : jobs.length === 0 && !error ? (
          /* Empty Search State */
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3 my-8">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-outfit">No Matching Jobs Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search criteria, clearing exam mode or qualification filters, or triggering a manual web scrape run.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setGateFilter('All');
                setQualificationFilter('All');
                setExperienceFilter('All');
                setModeFilter('All');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Job Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onOpenDetail={setSelectedJob}
                onSendTelegram={handleOpenTelegramJobAlert}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PSU & Government Job Intelligence Dashboard &bull; Dedicated CS/IT Streams</span>
          </div>
          <p className="text-slate-400">
            Official Data from BEL, NIC, CDAC, BIS, ISRO, DRDO & NIELIT
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      <TelegramModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
        targetJob={telegramTargetJob}
      />

      <ScraperDrawer
        isOpen={scraperDrawerOpen}
        onClose={() => setScraperDrawerOpen(false)}
        scrapeLogs={scraperLogs}
        isScraping={isScraping}
      />

    </div>
  );
}
