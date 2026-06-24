import React, { useState, useEffect } from 'react';
import { Plus, Minus, RefreshCw, Award, BookOpen, Sparkles, Check, X } from 'lucide-react';
import { 
  getPrayerCounts, 
  savePrayerCounts, 
  addHistoryEntry 
} from '../db/storage';
import type { PrayerCounts, UserProfile } from '../db/storage';
import { getRandomHadith } from '../data/hadiths';
import type { Hadith } from '../data/hadiths';


interface DashboardProps {
  profile: UserProfile;
  onDataChange: () => void;
}

const PRAYER_NAMES = {
  fajr: { en: 'Fajr', ar: 'الفجر', color: 'from-emerald-600/30 to-emerald-950/40' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر', color: 'from-amber-600/30 to-amber-950/40' },
  asr: { en: 'Asr', ar: 'العصر', color: 'from-orange-600/30 to-orange-950/40' },
  maghrib: { en: 'Maghrib', ar: 'المغرب', color: 'from-red-600/30 to-red-950/40' },
  isha: { en: 'Isha', ar: 'العشاء', color: 'from-indigo-600/30 to-indigo-950/40' },
  witr: { en: 'Witr', ar: 'الوتر', color: 'from-purple-600/30 to-purple-950/40' },
};

export const Dashboard: React.FC<DashboardProps> = ({ profile, onDataChange }) => {
  const [counts, setCounts] = useState<PrayerCounts>(getPrayerCounts());
  const [hadith, setHadith] = useState<Hadith>(getRandomHadith());
  const [editingPrayer, setEditingPrayer] = useState<keyof PrayerCounts | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    setCounts(getPrayerCounts());
  }, [profile]);

  const handleDecrement = (prayer: keyof PrayerCounts) => {
    if (counts[prayer] <= 0) return;
    
    const newCounts = { ...counts, [prayer]: counts[prayer] - 1 };
    setCounts(newCounts);
    savePrayerCounts(newCounts);
    addHistoryEntry(prayer, 'completed', 1);
    onDataChange();

    // Show quick motivation
    setCelebrationMessage(`Alhamdulillah! Prayed 1 missed ${PRAYER_NAMES[prayer].en}.`);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleIncrement = (prayer: keyof PrayerCounts) => {
    const newCounts = { ...counts, [prayer]: counts[prayer] + 1 };
    setCounts(newCounts);
    savePrayerCounts(newCounts);
    addHistoryEntry(prayer, 'added', 1);
    onDataChange();
  };

  const startEditing = (prayer: keyof PrayerCounts) => {
    setEditingPrayer(prayer);
    setEditValue(counts[prayer].toString());
  };

  const saveEdit = () => {
    if (editingPrayer === null) return;
    const parsed = parseInt(editValue, 10);
    if (isNaN(parsed) || parsed < 0) {
      setEditingPrayer(null);
      return;
    }
    
    const diff = parsed - counts[editingPrayer];
    if (diff === 0) {
      setEditingPrayer(null);
      return;
    }

    const newCounts = { ...counts, [editingPrayer]: parsed };
    setCounts(newCounts);
    savePrayerCounts(newCounts);
    
    if (diff > 0) {
      addHistoryEntry(editingPrayer, 'added', diff);
    } else {
      addHistoryEntry(editingPrayer, 'completed', Math.abs(diff));
    }

    setEditingPrayer(null);
    onDataChange();
  };

  const changeHadith = () => {
    setHadith(getRandomHadith());
  };

  // Filter prayers based on whether Witr is enabled
  const activePrayers = (Object.keys(PRAYER_NAMES) as Array<keyof PrayerCounts>).filter(
    (p) => p !== 'witr' || profile.trackWitr
  );

  const totalMissed = activePrayers.reduce((acc, p) => acc + counts[p], 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification for make-up */}
      {showCelebration && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glass-panel-active rounded-full px-6 py-3 border border-[#D4AF37] flex items-center space-x-2 animate-bounce">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-sm font-semibold text-[#E2E8F0]">{celebrationMessage}</span>
        </div>
      )}

      {/* Header Welcome banner */}
      <div className="relative glass-panel rounded-2xl p-6 overflow-hidden border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between md:flex-row md:items-center">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Assalamu Alaikum</h2>
            <h1 className="text-2xl font-extrabold text-[#E2E8F0] font-outfit mt-1">
              {profile.name ? profile.name : 'Brother / Sister'}
            </h1>
            <p className="text-xs text-[#94A3B8] mt-2">
              "Establish prayer, for indeed prayer prevents immorality and wrongdoing."
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-emerald-950/50 border border-emerald-800/30 rounded-xl px-4 py-3">
            <Award className="h-8 w-8 text-[#D4AF37]" />
            <div>
              <div className="text-2xl font-bold font-outfit text-[#D4AF37]">{totalMissed}</div>
              <div className="text-[10px] uppercase text-[#94A3B8]">Total Missed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Qaza Tracker Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">Missed Prayers (Qaza)</h3>
          <span className="text-xs text-[#94A3B8]">Tap count to edit directly</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {activePrayers.map((prayer) => {
            const currentCount = counts[prayer];
            const isEditing = editingPrayer === prayer;
            const names = PRAYER_NAMES[prayer];

            return (
              <div
                key={prayer}
                className={`relative glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
                  currentCount > 0 
                    ? 'border-emerald-800/40' 
                    : 'border-emerald-950/20 opacity-70'
                }`}
              >
                {/* Background Tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${names.color} opacity-40`}></div>
                
                <div className="relative z-10 p-4 flex flex-col h-full justify-between">
                  {/* Name and Arabic Name */}
                  <div className="flex justify-between items-start">
                    <span className="text-base font-bold font-outfit text-[#E2E8F0]">
                      {names.en}
                    </span>
                    <span className="text-xs font-amiri font-semibold text-[#D4AF37]/80">
                      {names.ar}
                    </span>
                  </div>

                  {/* Count Display or Edit Form */}
                  <div className="my-3 flex justify-center items-center h-14">
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          className="w-16 text-center text-xl font-bold font-outfit bg-emerald-950/80 border border-[#D4AF37] rounded-lg p-1 text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') setEditingPrayer(null);
                          }}
                        />
                        <button 
                          onClick={saveEdit} 
                          className="p-1 bg-[#10B981] rounded-md text-emerald-950 hover:bg-[#10B981]/80 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setEditingPrayer(null)} 
                          className="p-1 bg-red-500/20 rounded-md text-red-400 hover:bg-red-500/30 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => startEditing(prayer)}
                        className="text-4xl font-extrabold font-outfit text-white cursor-pointer hover:text-[#D4AF37] transition-colors duration-150 relative group"
                        title="Click to edit"
                      >
                        {currentCount}
                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-[9px] text-[#D4AF37] uppercase tracking-wide font-normal transition-all">
                          Edit
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center space-x-2">
                    <button
                      onClick={() => handleDecrement(prayer)}
                      disabled={currentCount <= 0 || isEditing}
                      className={`flex-1 flex justify-center items-center py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                        currentCount > 0 
                          ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30 active:scale-95' 
                          : 'bg-emerald-950/20 border border-emerald-900/10 text-emerald-900/40 cursor-not-allowed'
                      }`}
                      title="Made up (Decrements count)"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="ml-1 text-xs font-semibold">Make Up</span>
                    </button>
                    
                    <button
                      onClick={() => handleIncrement(prayer)}
                      disabled={isEditing}
                      className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 active:scale-95 transition-all cursor-pointer"
                      title="Add missed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hadith of the Day Card */}
      <div className="relative glass-panel rounded-2xl p-6 border border-emerald-900/40">
        <div className="absolute top-2 right-2">
          <button
            onClick={changeHadith}
            className="p-2 rounded-full text-[#94A3B8] hover:text-[#D4AF37] hover:bg-emerald-950/40 transition-all duration-200 cursor-pointer"
            title="Next Hadith"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#D4AF37] mb-4">
          <BookOpen className="h-4 w-4" />
          <span>Authentic Reminder</span>
        </div>

        <div className="space-y-4">
          {hadith.arabic && (
            <p className="text-xl font-amiri text-[#D4AF37] leading-relaxed text-right font-medium pr-2">
              {hadith.arabic}
            </p>
          )}
          
          <p className="text-sm text-[#E2E8F0] italic leading-relaxed pl-3 border-l-2 border-[#D4AF37]/40">
            "{hadith.text}"
          </p>
          
          <p className="text-[10px] text-right uppercase text-[#94A3B8] font-bold">
            — {hadith.source}
          </p>
        </div>

        {/* Dynamic Warning Indicator based on Hadith category */}
        {hadith.category === 'warning' && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-900/30 rounded-xl text-center">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
              ⚠️ Warning regarding abandoning prayer
            </p>
          </div>
        )}
        {hadith.category === 'reminder' && (
          <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-xl text-center">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              ✨ Expiation & Mercy reminder
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
