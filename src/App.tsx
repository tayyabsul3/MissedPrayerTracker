import { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarDays, BookOpen, History as HistoryIcon, Settings as SettingsIcon, Heart } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DailyLog } from './components/DailyLog';
import { Recite } from './components/Recite';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { getUserProfile } from './db/storage';
import type { UserProfile } from './db/storage';

function App() {
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    return !localStorage.getItem('qaza_landing_dismissed');
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily-log' | 'recite' | 'history' | 'settings'>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    document.body.classList.add('bg-[#022c22]');
    
    // Check if user is opening the app for the first time without landing page
    if (!profile.name && !showLanding) {
      setActiveTab('settings');
    }
  }, [profile.name, showLanding]);

  const handleProfileChange = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleShowLanding = () => {
    localStorage.removeItem('qaza_landing_dismissed');
    setShowLanding(true);
  };

  // If landing page needs to be shown, render it exclusively
  if (showLanding) {
    return (
      <LandingPage
        onStart={() => {
          localStorage.setItem('qaza_landing_dismissed', 'true');
          setShowLanding(false);
          if (!profile.name) {
            setActiveTab('settings');
          } else {
            setActiveTab('dashboard');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#022c22] text-[#e2e8f0] font-sans flex flex-col items-center justify-start pb-24 selection:bg-[#d4af37]/30">
      {/* App Container */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl px-4 flex flex-col min-h-screen relative">
        
        {/* Elegant Islamic Header */}
        <header className="py-5 flex items-center justify-between border-b border-emerald-900/30 mb-6 bg-[#022c22]/95 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            {/* Mosque dome silhouette avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-emerald-900/40 border border-[#d4af37]/30 flex items-center justify-center relative shadow-inner">
              <span className="text-xl font-bold text-[#d4af37] font-outfit">ق</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-outfit tracking-wide text-white leading-tight">Qaza Tracker</h1>
              <p className="text-[9px] uppercase tracking-widest text-[#d4af37]/80 font-bold">Missed Prayer Tracker</p>
            </div>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-900/30">
            <span className="text-[10px] text-[#10b981] font-extrabold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse mr-1"></span>
              Offline Ready
            </span>
          </div>
        </header>

        {/* First time user greeting */}
        {!profile.name && activeTab === 'settings' && (
          <div className="mb-4 p-4 bg-emerald-950/40 border border-[#d4af37]/30 rounded-2xl text-center animate-pulse">
            <h2 className="text-sm font-bold text-[#d4af37] mb-1">Welcome to Qaza Tracker</h2>
            <p className="text-xs text-[#94a3b8]">Please enter your name below to customize your tracking companion.</p>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 w-full animate-fade-in">
          {activeTab === 'dashboard' && (
            <Dashboard profile={profile} onDataChange={handleDataChange} />
          )}
          {activeTab === 'daily-log' && (
            <DailyLog profile={profile} onDataChange={handleDataChange} />
          )}
          {activeTab === 'recite' && (
            <Recite onDataChange={handleDataChange} />
          )}
          {activeTab === 'history' && (
            <History profile={profile} refreshTrigger={refreshTrigger} />
          )}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Settings onProfileChange={handleProfileChange} />
              
              {/* Optional Welcome screen trigger in Settings */}
              <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40">
                <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-2">Welcome Screen</h3>
                <p className="text-[10px] text-[#94A3B8] mb-4">View the splash landing page with benefits and Hadith warnings.</p>
                <button
                  onClick={handleShowLanding}
                  className="w-full py-2.5 bg-emerald-950/60 border border-emerald-900/40 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/50 active:scale-95 transition-all text-[#d4af37] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Show Welcome Screen
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-4 left-4 right-4 max-w-md md:max-w-lg mx-auto navbar-glass z-50 overflow-hidden">
          <div className="grid grid-cols-5 h-16">
            
            {/* Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'text-[#d4af37] bg-emerald-950/30' 
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <LayoutDashboard className={`h-4.5 w-4.5 ${activeTab === 'dashboard' ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : ''}`} />
              <span className="text-[8px] font-bold font-outfit mt-1 uppercase tracking-wider">Tracker</span>
            </button>

            {/* Daily Log Tab */}
            <button
              onClick={() => setActiveTab('daily-log')}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'daily-log' 
                  ? 'text-[#d4af37] bg-emerald-950/30' 
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <CalendarDays className={`h-4.5 w-4.5 ${activeTab === 'daily-log' ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : ''}`} />
              <span className="text-[8px] font-bold font-outfit mt-1 uppercase tracking-wider">Daily Log</span>
            </button>

            {/* Recite Tab */}
            <button
              onClick={() => setActiveTab('recite')}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'recite' 
                  ? 'text-[#d4af37] bg-emerald-950/30' 
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <BookOpen className={`h-4.5 w-4.5 ${activeTab === 'recite' ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : ''}`} />
              <span className="text-[8px] font-bold font-outfit mt-1 uppercase tracking-wider">Recite</span>
            </button>

            {/* History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'history' 
                  ? 'text-[#d4af37] bg-emerald-950/30' 
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <HistoryIcon className={`h-4.5 w-4.5 ${activeTab === 'history' ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : ''}`} />
              <span className="text-[8px] font-bold font-outfit mt-1 uppercase tracking-wider">History</span>
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'settings' 
                  ? 'text-[#d4af37] bg-emerald-950/30' 
                  : 'text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <SettingsIcon className={`h-4.5 w-4.5 ${activeTab === 'settings' ? 'scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : ''}`} />
              <span className="text-[8px] font-bold font-outfit mt-1 uppercase tracking-wider">Settings</span>
            </button>

          </div>
        </nav>

        {/* Footer info (only visible at bottom of scrollable views) */}
        <footer className="text-center text-[9px] text-emerald-900/60 mt-12 mb-6">
          <p className="flex items-center justify-center">
            Made with <Heart className="h-2 w-2 mx-1 text-red-800" /> for the Ummah
          </p>
          <p className="mt-1">Qaza Prayer Tracker © 2026</p>
        </footer>

      </div>
    </div>
  );
}

export default App;
