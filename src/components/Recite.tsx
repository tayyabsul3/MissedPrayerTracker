import React, { useState, useEffect, useRef } from 'react';
import { Check, Clock, Award } from 'lucide-react';
import { SURAHS } from '../data/surahs';
import { addHistoryEntry } from '../db/storage';

interface ReciteProps {
  onDataChange: () => void;
}

export const Recite: React.FC<ReciteProps> = ({ onDataChange }) => {
  const [activeSurahId, setActiveSurahId] = useState<string>('yaseen');
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine recommended Surah based on time of day
  useEffect(() => {
    const currentHour = new Date().getHours();
    
    // Yaseen (Morning: 5 AM - 11:59 AM)
    if (currentHour >= 5 && currentHour < 12) {
      setActiveSurahId('yaseen');
    }
    // Waqiah (Maghrib/Evening: 5 PM - 7:59 PM)
    else if (currentHour >= 17 && currentHour < 20) {
      setActiveSurahId('waqiah');
    }
    // Mulk (Night: 8 PM - 4:59 AM)
    else {
      setActiveSurahId('mulk');
    }

    // Load reading progress from localStorage
    const savedProgress = localStorage.getItem('qaza_tracker_reading_progress');
    if (savedProgress) {
      try {
        setReadingProgress(JSON.parse(savedProgress));
      } catch {
        // Ignore
      }
    }
  }, []);

  const activeSurah = SURAHS.find((s) => s.id === activeSurahId) || SURAHS[0];

  const handleSurahChange = (id: string) => {
    setActiveSurahId(id);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleVerseScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPercent = target.scrollTop / (target.scrollHeight - target.clientHeight);
    const progressVerse = Math.ceil(scrollPercent * activeSurah.verses.length);
    
    const updated = {
      ...readingProgress,
      [activeSurahId]: Math.min(progressVerse, activeSurah.verses.length),
    };
    
    setReadingProgress(updated);
    localStorage.setItem('qaza_tracker_reading_progress', JSON.stringify(updated));
  };

  const markCompleted = () => {
    // Record completion in progress
    const updated = {
      ...readingProgress,
      [activeSurahId]: activeSurah.verses.length,
    };
    setReadingProgress(updated);
    localStorage.setItem('qaza_tracker_reading_progress', JSON.stringify(updated));

    // Log history transaction
    addHistoryEntry(
      activeSurahId as any, // Cast as keyof PrayerCounts for history logging
      'completed' as any,   // Custom type for history log display
      1
    );
    onDataChange();

    // Trigger celebration toast
    setCelebrationMessage(`Alhamdulillah! Completed reciting ${activeSurah.nameEn}.`);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const resetProgress = () => {
    const updated = {
      ...readingProgress,
      [activeSurahId]: 0,
    };
    setReadingProgress(updated);
    localStorage.setItem('qaza_tracker_reading_progress', JSON.stringify(updated));
  };

  // Get current recommendation alert text
  const getRecommendationText = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Morning recommended recitation is Surah Yaseen.', target: 'yaseen' };
    } else if (hour >= 17 && hour < 20) {
      return { text: 'Evening recommended recitation is Surah Al-Waqiah.', target: 'waqiah' };
    } else {
      return { text: 'Night recommended recitation is Surah Al-Mulk.', target: 'mulk' };
    }
  };

  const recInfo = getRecommendationText();
  const currentProgress = readingProgress[activeSurahId] || 0;
  const progressPercent = activeSurah.verses.length > 0
    ? (currentProgress / activeSurah.verses.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showCelebration && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glass-panel-active rounded-full px-6 py-3 border border-[#D4AF37] flex items-center space-x-2 animate-bounce">
          <Award className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-sm font-semibold text-[#E2E8F0]">{celebrationMessage}</span>
        </div>
      )}

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Side: Sidebar Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recitations Navigation tabs */}
          <div className="glass-panel rounded-2xl p-1.5 border border-emerald-900/40 grid grid-cols-3 gap-1">
            {SURAHS.map((surah) => (
              <button
                key={surah.id}
                onClick={() => handleSurahChange(surah.id)}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  activeSurahId === surah.id
                    ? 'bg-[#D4AF37] text-emerald-950 font-bold shadow-md shadow-[#D4AF37]/20'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0] text-xs font-semibold'
                }`}
              >
                <div className="text-sm font-outfit">{surah.nameEn}</div>
                <div className={`text-[10px] uppercase font-bold mt-0.5 ${
                  activeSurahId === surah.id ? 'text-emerald-950/70' : 'text-emerald-700'
                }`}>
                  {surah.nameAr}
                </div>
              </button>
            ))}
          </div>

          {/* Smart Alert based on time */}
          <div className="glass-panel rounded-2xl p-4 border border-emerald-900/30 flex items-start space-x-3 bg-gradient-to-br from-emerald-950/30 to-transparent">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-[#D4AF37] mt-0.5 shrink-0">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center">
                Smart Recommendation
                {recInfo.target === activeSurahId && (
                  <span className="ml-2 text-[8px] bg-[#10B981]/25 text-[#10B981] font-extrabold uppercase px-1.5 py-0.5 rounded-full">
                    Active now
                  </span>
                )}
              </div>
              <p className="text-xs text-white mt-1 leading-normal">
                {recInfo.text}
              </p>
              <p className="text-[10px] text-[#94A3B8] mt-1 italic">
                Benefit: {activeSurah.benefit}
              </p>
            </div>
          </div>

          {/* Reading Progress Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-emerald-900/30">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-[#94A3B8] uppercase">Reading Progress</span>
              <span className="text-[#D4AF37] font-outfit">
                {currentProgress} / {activeSurah.verses.length} verses
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-900/40">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Scrollable Quran Reader Panel */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-2xl border border-emerald-900/40 overflow-hidden flex flex-col">
            {/* Header bismillah banner */}
            <div className="p-4 bg-emerald-950/40 border-b border-emerald-900/40 text-center relative">
              <div className="text-xl font-amiri text-[#D4AF37]">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
              <div className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold mt-1">
                In the name of Allah, the Entirely Merciful, the Especially Merciful
              </div>
            </div>

            {/* Scrollable verses */}
            <div
              ref={scrollContainerRef}
              onScroll={handleVerseScroll}
              className="p-4 h-[45vh] lg:h-[55vh] overflow-y-auto space-y-6 scroll-smooth select-none bg-emerald-950/10"
            >
              {activeSurah.verses.map((verse) => (
                <div
                  key={verse.number}
                  className="py-3 border-b border-emerald-950/10 last:border-0 flex flex-col items-center"
                >
                  {/* Verse Number Sign */}
                  <div className="w-6 h-6 rounded-full border border-[#D4AF37]/45 bg-emerald-950/80 flex items-center justify-center text-[10px] font-bold font-outfit text-[#D4AF37] mb-3 select-none">
                    {verse.number}
                  </div>
                  
                  {/* Arabic Script */}
                  <p className="text-2xl font-amiri text-[#E2E8F0] leading-loose text-center font-semibold w-full px-2">
                    {verse.arabic}
                  </p>
                  
                  {/* English Translation */}
                  <p className="text-[11px] text-[#94A3B8] font-outfit text-center mt-3 max-w-xs leading-normal">
                    {verse.english}
                  </p>

                  {/* Urdu Translation */}
                  <p className="text-[14px] text-[#D4AF37]/80 font-amiri text-center mt-2 max-w-xs leading-relaxed" dir="rtl">
                    {verse.urdu}
                  </p>
                </div>
              ))}
            </div>

            {/* Completion Panel */}
            <div className="p-4 bg-emerald-950/40 border-t border-emerald-900/40 flex justify-between items-center">
              <button
                onClick={resetProgress}
                className="text-xs font-bold text-[#94A3B8] hover:text-white cursor-pointer bg-emerald-950/60 border border-emerald-900/40 px-3 py-2 rounded-xl active:scale-95 transition-all"
              >
                Restart
              </button>
              
              <button
                onClick={markCompleted}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981] text-emerald-950 shadow-md shadow-[#10B981]/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[3px]" />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
