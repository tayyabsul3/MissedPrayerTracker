import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { getHistoryLog } from '../db/storage';
import type { HistoryEntry, UserProfile } from '../db/storage';


interface HistoryProps {
  profile: UserProfile;
  refreshTrigger: number;
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  witr: 'Witr',
};

export const History: React.FC<HistoryProps> = ({ profile, refreshTrigger }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filterPrayer, setFilterPrayer] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const loadHistory = () => {
    setHistory(getHistoryLog());
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger, profile]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your change history? This will not affect your current missed prayer totals.')) {
      localStorage.setItem('qaza_tracker_history', JSON.stringify([]));
      loadHistory();
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesPrayer = filterPrayer === 'all' || entry.prayer === filterPrayer;
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'completed' && entry.type === 'completed') ||
      (filterType === 'added' && entry.type === 'added') ||
      (filterType === 'reset' && entry.type === 'reset');
    return matchesPrayer && matchesType;
  });

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header and Clear action */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center">
          <HistoryIcon className="h-4.5 w-4.5 mr-2 text-[#D4AF37]" />
          Adjustment Log
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer bg-red-950/20 px-2.5 py-1.5 rounded-lg border border-red-900/30 active:scale-95 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-900/40 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase text-[#94A3B8] font-bold mb-1.5">Filter Prayer</label>
          <select
            value={filterPrayer}
            onChange={(e) => setFilterPrayer(e.target.value)}
            className="w-full bg-emerald-950/80 border border-emerald-900/50 rounded-xl px-3 py-2 text-xs font-semibold text-[#E2E8F0] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Prayers</option>
            <option value="fajr">Fajr</option>
            <option value="dhuhr">Dhuhr</option>
            <option value="asr">Asr</option>
            <option value="maghrib">Maghrib</option>
            <option value="isha">Isha</option>
            {profile.trackWitr && <option value="witr">Witr</option>}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[#94A3B8] font-bold mb-1.5">Filter Action</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-emerald-950/80 border border-emerald-900/50 rounded-xl px-3 py-2 text-xs font-semibold text-[#E2E8F0] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Actions</option>
            <option value="completed">Make-up (Prayed)</option>
            <option value="added">Added (Missed)</option>
            <option value="reset">Reset</option>
          </select>
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-emerald-950/20 text-[#94A3B8]">
            <Calendar className="h-8 w-8 mx-auto text-emerald-900/40 mb-2" />
            <p className="text-sm">No adjustments logged yet.</p>
            <p className="text-xs mt-1">Changes you make on the dashboard or checklist will appear here.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {filteredHistory.map((entry) => {
              const isDecremented = entry.type === 'completed';
              const isReset = entry.type === 'reset';

              return (
                <div
                  key={entry.id}
                  className="glass-panel rounded-xl p-3 flex justify-between items-center border border-emerald-900/20 hover:border-emerald-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Status Badge Icon */}
                    <div
                      className={`p-2 rounded-lg ${
                        isReset
                          ? 'bg-amber-500/10 text-amber-400'
                          : isDecremented
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {isReset ? (
                        <Trash2 className="h-4.5 w-4.5" />
                      ) : isDecremented ? (
                        <ArrowDownLeft className="h-4.5 w-4.5" />
                      ) : (
                        <ArrowUpRight className="h-4.5 w-4.5" />
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div>
                      <div className="text-xs font-bold text-[#E2E8F0]">
                        {isReset ? (
                          <span>Reset {PRAYER_LABELS[entry.prayer]} counts</span>
                        ) : isDecremented ? (
                          <span>Made up {entry.amount} {PRAYER_LABELS[entry.prayer]}</span>
                        ) : (
                          <span>Added {entry.amount} missed {PRAYER_LABELS[entry.prayer]}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-semibold mt-0.5">
                        {formatDate(entry.dateStr)}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-[10px] font-bold text-[#D4AF37] font-outfit uppercase">
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
