import React from 'react';
import { Sparkles, Calendar, BookOpen, ChevronRight, Shield, LayoutDashboard } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#022c22] text-[#e2e8f0] font-sans flex flex-col justify-between pb-8">
      {/* Top Graphic Header */}
      <div className="relative pt-12 pb-6 px-4 text-center overflow-hidden">
        {/* Golden geometric pattern glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-full blur-3xl -z-10"></div>
        
        {/* Calligraphy logo avatar */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-emerald-900/50 border border-[#d4af37]/50 flex items-center justify-center relative shadow-lg shadow-emerald-950/50 animate-pulse">
          <span className="text-3xl font-extrabold text-[#d4af37] font-outfit">ق</span>
          <div className="absolute -inset-0.5 border border-[#d4af37]/20 rounded-2xl animate-ping opacity-25"></div>
        </div>

        <h1 className="text-3xl font-extrabold font-outfit mt-6 tracking-wide text-white leading-tight">
          Qaza <span className="gold-text-gradient">Tracker</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#d4af37]/80 font-bold mt-1.5">
          Restoring Your Obligation
        </p>
        <p className="text-sm text-[#94a3b8] mt-4 max-w-xs mx-auto leading-relaxed">
          A premium, offline-first mobile companion to track missed prayers, log daily consistency, and cultivate spiritual habits.
        </p>
      </div>

      {/* Primary Call-to-Action */}
      <div className="px-4">
        <button
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#d4af37] text-emerald-950 font-extrabold rounded-2xl text-sm tracking-wider uppercase shadow-xl shadow-amber-950/40 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer duration-300"
        >
          <span>Begin Your Journey</span>
          <ChevronRight className="h-4 w-4 stroke-[3px]" />
        </button>
      </div>

      {/* Hadith Banner (Spiritual anchor) */}
      <div className="px-4 mt-6">
        <div className="glass-panel rounded-2xl p-5 border border-[#d4af37]/25 bg-gradient-to-br from-emerald-950/40 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl"></div>
          
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] block">⚠️ Sacred Reminder</span>
            <p className="text-xs italic text-[#e2e8f0] leading-relaxed">
              "The first thing for which a person will be brought to account on the Day of Judgment from his deeds is his prayer. If it is good, then he will have succeeded..."
            </p>
            <span className="text-[9px] text-[#94a3b8] block text-right font-bold">— Sunan at-Tirmidhi 413</span>
          </div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="px-4 mt-6 space-y-4">
        <h2 className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">Key Capabilities</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1 */}
          <div className="glass-panel rounded-xl p-3 border border-emerald-900/40 space-y-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 w-fit text-[#d4af37]">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Qaza Dashboard</h3>
            <p className="text-[10px] text-[#94a3b8] leading-normal">
              Direct counter values with quick make-up decrement triggers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-xl p-3 border border-emerald-900/40 space-y-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 w-fit text-[#10b981]">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Daily Checklist</h3>
            <p className="text-[10px] text-[#94a3b8] leading-normal">
              Log today’s status. Missed counts automatically adjust your qaza ledger.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-xl p-3 border border-emerald-900/40 space-y-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 w-fit text-amber-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Daily Recitations</h3>
            <p className="text-[10px] text-[#94a3b8] leading-normal">
              Read Surah Yaseen, Waqiah, & Mulk at their recommended times.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel rounded-xl p-3 border border-emerald-900/40 space-y-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 w-fit text-blue-400">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Offline Privacy</h3>
            <p className="text-[10px] text-[#94a3b8] leading-normal">
              No servers. Your details reside securely inside local database memory.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Info Footer */}
      <div className="px-4 mt-6 text-center text-[10px] text-[#94a3b8]">
        <p className="flex items-center justify-center space-x-1 font-semibold">
          <Sparkles className="h-3 w-3 text-[#d4af37]" />
          <span>Tap "Begin Your Journey" to configure your tracker offline.</span>
        </p>
        <p className="mt-1 text-emerald-900/60 font-bold uppercase tracking-widest text-[8px]">
          Installable PWA Application
        </p>
      </div>
    </div>
  );
};
