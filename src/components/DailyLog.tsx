import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { 
  getDailyTracker, 
  saveDailyTracker, 
  getPrayerCounts, 
  savePrayerCounts, 
  addHistoryEntry 
} from '../db/storage';
import type { DailyTracker, UserProfile } from '../db/storage';


interface DailyLogProps {
  profile: UserProfile;
  onDataChange: () => void;
}

const PRAYER_KEYS: Array<keyof DailyTracker['prayers']> = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];

const PRAYER_LABELS = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
  witr: { en: 'Witr', ar: 'الوتر' },
};

export const DailyLog: React.FC<DailyLogProps> = ({ profile, onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tracker, setTracker] = useState<DailyTracker | null>(null);

  const getDateStr = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const loadTracker = (date: Date) => {
    const dateStr = getDateStr(date);
    setTracker(getDailyTracker(dateStr));
  };

  useEffect(() => {
    loadTracker(selectedDate);
  }, [selectedDate, profile]);

  const handleStatusChange = (prayer: keyof DailyTracker['prayers'], status: 'prayed' | 'missed' | 'pending') => {
    if (!tracker) return;

    const previousStatus = tracker.prayers[prayer];
    if (previousStatus === status) return;

    // Update daily tracker state
    const updatedTracker: DailyTracker = {
      ...tracker,
      prayers: {
        ...tracker.prayers,
        [prayer]: status,
      },
    };

    setTracker(updatedTracker);
    saveDailyTracker(updatedTracker);

    // Update Qaza counts based on transitions
    const counts = getPrayerCounts();
    let countChanged = false;
    let changeAmount = 0;
    let changeType: 'completed' | 'added' | null = null;

    if (previousStatus === 'missed' && status !== 'missed') {
      // Changed FROM missed TO something else -> decrement qaza
      if (counts[prayer] > 0) {
        counts[prayer] = counts[prayer] - 1;
        countChanged = true;
        changeAmount = 1;
        changeType = 'completed';
      }
    } else if (previousStatus !== 'missed' && status === 'missed') {
      // Changed TO missed FROM something else -> increment qaza
      counts[prayer] = counts[prayer] + 1;
      countChanged = true;
      changeAmount = 1;
      changeType = 'added';
    }

    if (countChanged && changeType) {
      savePrayerCounts(counts);
      addHistoryEntry(prayer, changeType, changeAmount);
      onDataChange();
    }
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    
    // Prevent selecting future dates
    if (newDate > new Date()) return;
    
    setSelectedDate(newDate);
  };

  const isToday = () => {
    const todayStr = getDateStr(new Date());
    const selectedStr = getDateStr(selectedDate);
    return todayStr === selectedStr;
  };

  const isYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDateStr(yesterday);
    const selectedStr = getDateStr(selectedDate);
    return yesterdayStr === selectedStr;
  };

  const setToToday = () => {
    setSelectedDate(new Date());
  };

  const setToYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedDate(yesterday);
  };

  // Filter prayers based on Witr setting
  const activePrayers = PRAYER_KEYS.filter((p) => p !== 'witr' || profile.trackWitr);

  return (
    <div className="space-y-6">
      {/* Date Selector Banner */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0 border border-emerald-900/40">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustDate(-1)}
            className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/30 text-[#D4AF37] hover:bg-emerald-950 hover:border-[#D4AF37]/50 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex flex-col items-center px-4">
            <span className="text-sm font-bold font-outfit text-white">
              {isToday() ? 'Today' : isYesterday() ? 'Yesterday' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-outfit mt-0.5">
              {getDateStr(selectedDate)}
            </span>
          </div>

          <button
            onClick={() => adjustDate(1)}
            disabled={isToday()}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isToday()
                ? 'bg-emerald-950/10 border-emerald-950/20 text-emerald-900/40 cursor-not-allowed'
                : 'bg-emerald-950/40 border-emerald-900/30 text-[#D4AF37] hover:bg-emerald-950 hover:border-[#D4AF37]/50 active:scale-95'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Date Tabs */}
        <div className="flex space-x-2 bg-emerald-950/60 p-1 rounded-xl border border-emerald-900/30">
          <button
            onClick={setToToday}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isToday()
                ? 'bg-[#D4AF37] text-[#022C22]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={setToYesterday}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isYesterday()
                ? 'bg-[#D4AF37] text-[#022C22]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Yesterday
          </button>
          
          {/* Custom Date Input Overlay */}
          <div className="relative flex items-center px-2 text-[#94A3B8] hover:text-white cursor-pointer">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              max={getDateStr(new Date())}
              value={getDateStr(selectedDate)}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">Prayers Checklist</h3>
        
        {tracker && (
          <div className="space-y-3">
            {activePrayers.map((prayer) => {
              const currentStatus = tracker.prayers[prayer];
              const labels = PRAYER_LABELS[prayer];

              return (
                <div
                  key={prayer}
                  className="glass-panel rounded-2xl p-4 flex flex-col justify-between sm:flex-row sm:items-center border border-emerald-900/30 space-y-3 sm:space-y-0"
                >
                  {/* Prayer label and info */}
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                    <span className="text-sm font-bold text-white font-outfit">{labels.en}</span>
                    <span className="text-xs font-amiri text-[#D4AF37]">{labels.ar}</span>
                  </div>

                  {/* 3-State Toggle button group */}
                  <div className="grid grid-cols-3 gap-2 bg-emerald-950/60 p-1 rounded-xl border border-emerald-900/40 w-full sm:w-auto">
                    {/* Prayed Button */}
                    <button
                      onClick={() => handleStatusChange(prayer, 'prayed')}
                      className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentStatus === 'prayed'
                          ? 'bg-[#10B981] text-emerald-950 shadow-md shadow-[#10B981]/25'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Prayed</span>
                    </button>

                    {/* Missed Button */}
                    <button
                      onClick={() => handleStatusChange(prayer, 'missed')}
                      className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentStatus === 'missed'
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/25'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Missed</span>
                    </button>

                    {/* Pending Button */}
                    <button
                      onClick={() => handleStatusChange(prayer, 'pending')}
                      className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentStatus === 'pending'
                          ? 'bg-slate-700 text-[#E2E8F0] shadow-md shadow-slate-900/30'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Pending</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-2xl">
        <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">How it works</h4>
        <ul className="text-xs text-[#94A3B8] list-disc list-inside space-y-1.5 leading-relaxed">
          <li>Marking a prayer as <strong className="text-red-400">Missed</strong> will automatically increase your total Qaza counter by 1.</li>
          <li>Changing a missed prayer to <strong className="text-[#10B981]">Prayed</strong> or <strong className="text-slate-300">Pending</strong> will decrease your Qaza counter by 1.</li>
          <li>Marking a prayer as <strong className="text-[#10B981]">Prayed</strong> represents your on-time prayer, which keeps your Qaza counters steady.</li>
        </ul>
      </div>
    </div>
  );
};
