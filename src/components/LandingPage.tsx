import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Shield, 
  LayoutDashboard, 
  History, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Menu, 
  X, 
  Clock, 
  Award
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // Navigation hamburger menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Interactive Hero Preview state
  const [activeDevice, setActiveDevice] = useState<'mobile' | 'tablet' | 'laptop'>('mobile');
  
  // Interactive Daily Recitations Simulator state
  const [simTime, setSimTime] = useState<'morning' | 'evening' | 'night'>('morning');
  
  // Interactive Hadith tab state
  const [hadithTab, setHadithTab] = useState<'warnings' | 'mercy'>('warnings');

  // FAQ Accordion expanded states
  const [faqExpanded, setFaqExpanded] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false
  });

  const toggleFaq = (index: number) => {
    setFaqExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Recitation simulator data
  const recData = {
    morning: {
      surah: 'Surah Yaseen (Morning)',
      arabicName: 'يس',
      benefit: 'Forgiveness of sins in the morning and fulfilment of daily needs.',
      verseAr: 'يسٓ ۝ وَٱلْقُرْءَانِ ٱلْحَكِيمِ ۝ إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ',
      verseEn: 'Ya, Seen. By the wise Quran, indeed you are of the messengers.',
      verseUr: 'یاسین۔ حکمت والے قرآن کی قسم۔ بے شک آپ رسولوں میں سے ہیں۔'
    },
    evening: {
      surah: 'Surah Al-Waqiah (Evening)',
      arabicName: 'الواقعة',
      benefit: 'Protection from poverty and financial hardship.',
      verseAr: 'إِذَا وَقَعَتِ ٱلْوَاقِعَةُ ۝ لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ',
      verseEn: 'When the Occurrence occurs, there is, at its occurrence, no denial.',
      verseUr: 'جب ہونے والی (قیامت) ہو جائے گی۔ اس کے ہونے میں کوئی جھوٹ نہیں ہے۔'
    },
    night: {
      surah: 'Surah Al-Mulk (Night)',
      arabicName: 'الملك',
      benefit: 'Protection from the punishment of the grave when recited before sleep.',
      verseAr: 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ',
      verseEn: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
      verseUr: 'بہت بابرکت ہے وہ جس کے ہاتھ میں بادشاہی ہے اور وہ ہر چیز پر قادر ہے۔'
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#022c22] text-[#e2e8f0] font-sans selection:bg-[#d4af37]/30 flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Floating Responsive Navbar */}
      <nav aria-label="Main navigation" className="fixed top-4 left-4 right-4 max-w-6xl mx-auto rounded-3xl navbar-glass z-50 transition-all duration-300">
        <div className="px-6 py-4 flex justify-between items-center">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-emerald-900/40 border border-[#d4af37]/45 flex items-center justify-center">
              <span className="text-lg font-bold text-[#d4af37] font-outfit">ق</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-white font-outfit tracking-wide block">Qaza Tracker</span>
              <span className="text-[8px] uppercase tracking-widest text-[#d4af37] font-bold block">Missed Prayer Utility</span>
            </div>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            <a href="#features" className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer">Features</a>
            <a href="#simulator" className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer">recitations</a>
            <a href="#hadiths" className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer">Hadiths</a>
            <a href="#faq" className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer">FAQ</a>
          </div>

          {/* Action CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={onStart}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89020] text-emerald-950 font-extrabold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-900/20"
            >
              Launch App
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#94a3b8] hover:text-[#d4af37] transition-colors cursor-pointer"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 border-t border-emerald-950/40 flex flex-col space-y-4 text-sm font-bold uppercase tracking-wide text-[#94a3b8] bg-[#022c22]/95 backdrop-blur-xl rounded-b-2xl">
            <a 
              href="#features" 
              onClick={() => setMenuOpen(false)}
              className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer py-1"
            >
              Features
            </a>
            <a 
              href="#simulator" 
              onClick={() => setMenuOpen(false)}
              className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer py-1"
            >
              recitations
            </a>
            <a 
              href="#hadiths" 
              onClick={() => setMenuOpen(false)}
              className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer py-1"
            >
              Hadiths
            </a>
            <a 
              href="#faq" 
              onClick={() => setMenuOpen(false)}
              className="hover:text-white hover:text-[#d4af37] transition-colors cursor-pointer py-1"
            >
              FAQ
            </a>
            <button
              onClick={onStart}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b89020] text-emerald-950 font-extrabold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer text-center"
            >
              Launch App
            </button>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section aria-label="Hero — Qaza Tracker overview" className="relative overflow-hidden pt-36 pb-20 lg:pt-48 lg:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#d4af37]/8 to-transparent rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-950/60 border border-[#d4af37]/25 rounded-full px-3.5 py-1.5 text-[10px] text-[#d4af37] font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>Offline-First Secure Web Utility</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold font-outfit text-white leading-tight">
              Establish Your Prayers.<br />
              <span className="gold-text-gradient">Restore Missed Obligations.</span>
            </h1>
            
            <p className="text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Keep a dedicated, secure ledger of your missed prayers (Qaza) completely offline on your device. Log today's outcomes, decrement completed qaza counters, and view recommended Surahs with parallel Urdu & English translations—optimized for all your screens.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStart}
                className="px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#d4af37] text-emerald-950 font-extrabold rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-amber-950/20 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer duration-300"
              >
                <span>Enter Qaza Tracker</span>
                <ChevronRight className="h-4 w-4 stroke-[3px]" />
              </button>
              
              <a
                href="#features"
                className="px-8 py-4 bg-[#044e3d]/30 border border-[#d4af37]/20 rounded-2xl text-xs font-bold text-[#e2e8f0] hover:bg-[#d4af37]/10 flex items-center justify-center transition-all cursor-pointer"
              >
                Explore Features
              </a>
            </div>

            {/* Quick Metrics Badge */}
            <div className="pt-6 flex justify-center lg:justify-start items-center space-x-6 text-[#94a3b8] text-xs">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-[#10b981]" />
                <span>100% Local Device Storage</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-800"></div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#d4af37]" />
                <span>Zero Logins or Tracking</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Device Preview Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Device Switcher Controls */}
            <div className="flex bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-900/40 mb-6 space-x-1">
              <button
                onClick={() => setActiveDevice('mobile')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDevice === 'mobile'
                    ? 'bg-[#d4af37] text-emerald-950 shadow-md shadow-[#d4af37]/20'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
              <button
                onClick={() => setActiveDevice('tablet')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDevice === 'tablet'
                    ? 'bg-[#d4af37] text-emerald-950 shadow-md shadow-[#d4af37]/20'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setActiveDevice('laptop')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDevice === 'laptop'
                    ? 'bg-[#d4af37] text-emerald-950 shadow-md shadow-[#d4af37]/20'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Laptop</span>
              </button>
            </div>

            {/* Device Frame Renderer */}
            <div className="w-full flex justify-center items-center transition-all duration-300">
              
              {/* MOBILE PREVIEW */}
              {activeDevice === 'mobile' && (
                <div className="w-72 h-[480px] rounded-[36px] border-4 border-emerald-950 bg-[#022c22] shadow-2xl relative overflow-hidden flex flex-col p-3 transition-all duration-300 animate-fade-in">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-emerald-950 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 bg-zinc-800 rounded-full"></div>
                  </div>
                  
                  {/* Miniature Mobile App content */}
                  <div className="flex-1 flex flex-col justify-between pt-5 text-left text-[10px]">
                    <div className="flex justify-between items-center border-b border-emerald-900/20 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[10px] text-[#d4af37] font-bold">ق</div>
                        <span className="font-bold text-white text-[10px]">Qaza Tracker</span>
                      </div>
                      <span className="text-[7px] uppercase tracking-wider text-[#10b981] font-bold bg-[#10b981]/10 px-1 rounded-full">Offline</span>
                    </div>

                    <div className="my-3 p-3 glass-panel-active rounded-xl border border-[#d4af37]/30 flex items-center justify-between">
                      <div>
                        <span className="text-[7px] uppercase text-[#94a3b8] font-bold">Total Missed</span>
                        <h2 className="text-xl font-bold font-outfit text-[#d4af37] mt-0.5">143</h2>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-[#d4af37] font-bold text-[10px]">95%</div>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      <div className="glass-panel rounded-xl p-2.5 border border-emerald-800/40 relative">
                        <div className="relative flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Fajr</span>
                            <span className="text-[8px] text-[#94a3b8] block font-amiri">الفجر</span>
                          </div>
                          <span className="text-sm font-bold text-[#d4af37] font-outfit">12</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <div className="py-1 bg-[#10b981]/15 text-[#10b981] text-[8px] font-bold rounded-lg text-center cursor-pointer border border-[#10b981]/30">Make Up</div>
                          <div className="py-1 bg-emerald-950/40 text-[#d4af37] text-[8px] font-bold rounded-lg text-center cursor-pointer border border-[#d4af37]/20">+ Add</div>
                        </div>
                      </div>

                      <div className="glass-panel rounded-xl p-2.5 border border-emerald-800/40 opacity-70">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Dhuhr</span>
                          </div>
                          <span className="text-sm font-bold text-white font-outfit">24</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Nav Mock */}
                    <div className="border-t border-emerald-950/60 pt-2 flex justify-around text-emerald-800 mt-2">
                      <LayoutDashboard className="h-4 w-4 text-[#d4af37]" />
                      <Calendar className="h-4 w-4" />
                      <BookOpen className="h-4 w-4" />
                      <History className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* TABLET PREVIEW */}
              {activeDevice === 'tablet' && (
                <div className="w-[360px] sm:w-[420px] h-[310px] rounded-3xl border-[6px] border-emerald-950 bg-[#022c22] shadow-2xl relative overflow-hidden flex flex-col p-3 transition-all duration-300 animate-fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 absolute top-2 right-1/2 transform translate-x-1/2"></div>
                  
                  {/* Miniature Tablet Split App content */}
                  <div className="flex-1 flex flex-col justify-between pt-2 text-left text-[9px]">
                    <div className="flex justify-between items-center border-b border-emerald-900/20 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-5 h-5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[9px] text-[#d4af37] font-bold">ق</div>
                        <span className="font-bold text-white text-[9px]">Qaza Tracker</span>
                      </div>
                      <span className="text-[7px] uppercase tracking-wider text-[#10b981] font-bold bg-[#10b981]/15 px-1.5 py-0.5 rounded-full">Secure Local Mode</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1 mt-2 overflow-hidden">
                      {/* Left: Prayer Checklist inside Tablet */}
                      <div className="col-span-2 space-y-2 overflow-y-auto pr-0.5">
                        <div className="glass-panel p-2 rounded-xl flex items-center justify-between border border-emerald-800/40">
                          <span className="font-bold text-white">Daily Prayers Checklist</span>
                          <span className="text-[7px] text-[#d4af37] font-bold">TODAY</span>
                        </div>
                        <div className="glass-panel-active p-2 rounded-xl flex justify-between items-center border border-[#d4af37]/35">
                          <span className="font-semibold text-white">Fajr</span>
                          <div className="flex space-x-1">
                            <span className="bg-[#10b981] text-emerald-950 text-[6px] font-bold px-1.5 py-0.5 rounded-md">Prayed</span>
                            <span className="bg-emerald-950 text-[#94a3b8] text-[6px] font-bold px-1.5 py-0.5 rounded-md">Missed</span>
                          </div>
                        </div>
                        <div className="glass-panel p-2 rounded-xl flex justify-between items-center border border-emerald-800/20">
                          <span className="font-semibold text-white">Dhuhr</span>
                          <div className="flex space-x-1">
                            <span className="bg-emerald-950 text-[#94a3b8] text-[6px] font-bold px-1.5 py-0.5 rounded-md">Prayed</span>
                            <span className="bg-red-500 text-white text-[6px] font-bold px-1.5 py-0.5 rounded-md">Missed</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Hadith of the Day inside Tablet */}
                      <div className="col-span-1 glass-panel rounded-xl p-2 border border-emerald-800/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[6px] uppercase tracking-wider text-[#d4af37] font-bold block mb-1">Hadith Reminder</span>
                          <p className="text-[8px] text-[#e2e8f0] italic leading-tight">"Between a man and disbelief is the abandonment of prayer."</p>
                        </div>
                        <span className="text-[6px] text-[#94a3b8] font-bold text-right">— Muslim 82</span>
                      </div>
                    </div>

                    {/* Bottom Nav Mock */}
                    <div className="border-t border-emerald-950/60 pt-2 flex justify-around text-emerald-800 mt-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <Calendar className="h-4 w-4 text-[#d4af37]" />
                      <BookOpen className="h-4 w-4" />
                      <History className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* LAPTOP PREVIEW */}
              {activeDevice === 'laptop' && (
                <div className="flex flex-col items-center w-full max-w-[450px] transition-all duration-300 animate-fade-in">
                  {/* Monitor Frame */}
                  <div className="w-[360px] sm:w-[410px] h-[230px] rounded-t-2xl border-[6px] border-emerald-950 bg-[#022c22] shadow-2xl relative overflow-hidden flex flex-col p-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 absolute top-1 right-1/2 transform translate-x-1/2"></div>
                    
                    {/* Miniature Laptop App Layout */}
                    <div className="flex-1 flex flex-col justify-between pt-1.5 text-left text-[8px]">
                      {/* Top Header */}
                      <div className="flex justify-between items-center border-b border-emerald-900/20 pb-1.5">
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[8px] text-[#d4af37] font-bold">ق</div>
                          <span className="font-bold text-white text-[8px]">Qaza Tracker Dashboard</span>
                        </div>
                        <div className="flex space-x-3 text-[#94a3b8] text-[7px] font-bold">
                          <span className="text-[#d4af37] border-b border-[#d4af37] pb-0.5">TRACKER</span>
                          <span>DAILY LOG</span>
                          <span>RECITE</span>
                        </div>
                      </div>

                      {/* 3-Column Split View inside Laptop */}
                      <div className="grid grid-cols-12 gap-2 flex-1 mt-2 overflow-hidden">
                        {/* Welcome stats block (col-span-4) */}
                        <div className="col-span-4 glass-panel rounded-lg p-2 border border-emerald-800/40 flex flex-col justify-between">
                          <div>
                            <span className="text-[6px] uppercase text-[#94a3b8] font-bold block">Assalamu Alaikum</span>
                            <span className="text-[10px] font-extrabold text-white font-outfit block mt-0.5">Brother Tayyab</span>
                          </div>
                          <div className="p-1 bg-emerald-950/60 rounded-md border border-emerald-900/30">
                            <span className="text-[6px] text-[#94a3b8] block uppercase">Total Qaza</span>
                            <span className="text-sm font-bold text-[#d4af37]">143</span>
                          </div>
                        </div>

                        {/* Prayer grid (col-span-8) */}
                        <div className="col-span-8 grid grid-cols-3 gap-1.5 overflow-y-auto pr-0.5">
                          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Witr'].map((p) => (
                            <div key={p} className="glass-panel p-1.5 rounded-lg border border-emerald-900/20 text-center flex flex-col justify-between">
                              <div className="flex justify-between text-[7px] font-bold text-white">
                                <span>{p}</span>
                              </div>
                              <span className="text-xs font-bold text-[#d4af37] font-outfit my-0.5">24</span>
                              <span className="bg-[#10b981]/15 text-[#10b981] text-[6px] font-bold rounded cursor-pointer py-0.5">Make Up</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Laptop Keyboard Base */}
                  <div className="w-[400px] sm:w-[460px] h-3 bg-zinc-800 rounded-b-xl border-t border-zinc-700 shadow-md relative">
                    <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-zinc-950 rounded-b-md"></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Bento Grid Section */}
      <section id="features" aria-label="App features" className="py-20 border-t border-emerald-950/30 bg-emerald-950/10">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold">Features Grid</span>
            <h2 className="text-3xl font-bold text-white font-outfit">Specifically Tailored For Devotional Habits</h2>
            <p className="text-sm text-[#94a3b8] max-w-md mx-auto">A modern layout built without trackers, advertisements, or sign-up walls. Focus purely on your makeup targets.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            
            {/* Box 1: Dashboard (Col-span 3) */}
            <div className="md:col-span-3 glass-panel rounded-3xl p-6 border border-emerald-900/40 flex flex-col justify-between hover:border-[#d4af37]/35 transition-all group cursor-pointer duration-300">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/80 rounded-2xl w-fit text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Qaza Ledger Dashboard</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Log totals for all five obligatory prayers plus optional Witr. Quickly adjust counts directly with simple increment/decrement controls, or type exact numbers inside the card fields.
                </p>
              </div>
              <div className="mt-6 text-[10px] text-[#d4af37] font-extrabold uppercase tracking-wider flex items-center">
                <span>View Dashboard UI</span>
                <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Box 2: Daily Log (Col-span 3) */}
            <div className="md:col-span-3 glass-panel rounded-3xl p-6 border border-emerald-900/40 flex flex-col justify-between hover:border-[#d4af37]/35 transition-all group cursor-pointer duration-300">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/80 rounded-2xl w-fit text-[#10b981] group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">3-State Daily Log Checklist</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Check off today's or yesterday's prayers. Marking a prayer as "Missed" automatically increments your remaining Qaza tally, while checking it as "Prayed" keeps the tallies stable.
                </p>
              </div>
              <div className="mt-6 text-[10px] text-[#10b981] font-extrabold uppercase tracking-wider flex items-center">
                <span>Explore Checklist</span>
                <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Box 3: Recitations (Col-span 2) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-emerald-900/40 flex flex-col justify-between hover:border-[#d4af37]/35 transition-all group cursor-pointer duration-300">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-950/80 rounded-2xl w-fit text-amber-500 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white font-outfit">Daily Surah Reader</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Read Surah Yaseen (Morning), Al-Waqiah (Evening), and Al-Mulk (Night) with built-in translations side-by-side in Urdu and English.
                </p>
              </div>
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block mt-4">Bilingual Translation</span>
            </div>

            {/* Box 4: Privacy & Backups (Col-span 2) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-emerald-900/40 flex flex-col justify-between hover:border-[#d4af37]/35 transition-all group cursor-pointer duration-300">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-950/80 rounded-2xl w-fit text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white font-outfit">Secure Local Storage</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Your tracking parameters stay 100% inside your local browser. Export complete JSON database backups or restore them at any time in settings.
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block mt-4">Offline Data Security</span>
            </div>

            {/* Box 5: History Log (Col-span 2) */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-emerald-900/40 flex flex-col justify-between hover:border-[#d4af37]/35 transition-all group cursor-pointer duration-300">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-950/80 rounded-2xl w-fit text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white font-outfit">Audited Adjustment Log</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Review every adjustment you make. Filters allow you to check logs by prayer type or action category, ensuring your records stay clean.
                </p>
              </div>
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block mt-4">Historical Records</span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Interactive Recitation Simulator Section */}
      <section id="simulator" aria-label="Daily Surah recitation simulator" className="py-20 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold">Recitation Simulator</span>
          <h2 className="text-3xl font-bold text-white font-outfit">Smart Devotional Schedule</h2>
          <p className="text-sm text-[#94a3b8] max-w-md mx-auto">The app recommends specific Surahs depending on the current time of day. Toggle the periods below to preview the utility:</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Simulator Controls & Benefit Description (Col-span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs text-[#94a3b8] uppercase tracking-wider block font-bold">Select Period to Test:</span>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setSimTime('morning')}
                  className={`w-full p-4 rounded-2xl text-left border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                    simTime === 'morning'
                      ? 'glass-panel-active border-[#d4af37] text-white shadow-lg'
                      : 'glass-panel border-emerald-900/30 text-[#94a3b8] hover:border-emerald-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-950/80 rounded-xl text-[#d4af37]"><Clock className="h-4.5 w-4.5" /></div>
                    <div>
                      <span className="text-xs font-bold block">Morning (Fajr - Noon)</span>
                      <span className="text-[10px] text-[#94a3b8]">Surah Yaseen</span>
                    </div>
                  </div>
                  {simTime === 'morning' && <span className="text-[9px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>}
                </button>

                <button
                  onClick={() => setSimTime('evening')}
                  className={`w-full p-4 rounded-2xl text-left border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                    simTime === 'evening'
                      ? 'glass-panel-active border-[#d4af37] text-white shadow-lg'
                      : 'glass-panel border-emerald-900/30 text-[#94a3b8] hover:border-emerald-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-950/80 rounded-xl text-amber-500"><Clock className="h-4.5 w-4.5" /></div>
                    <div>
                      <span className="text-xs font-bold block">Evening (Asr - Maghrib)</span>
                      <span className="text-[10px] text-[#94a3b8]">Surah Al-Waqiah</span>
                    </div>
                  </div>
                  {simTime === 'evening' && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>}
                </button>

                <button
                  onClick={() => setSimTime('night')}
                  className={`w-full p-4 rounded-2xl text-left border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                    simTime === 'night'
                      ? 'glass-panel-active border-[#d4af37] text-white shadow-lg'
                      : 'glass-panel border-emerald-900/30 text-[#94a3b8] hover:border-emerald-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-950/80 rounded-xl text-purple-400"><Clock className="h-4.5 w-4.5" /></div>
                    <div>
                      <span className="text-xs font-bold block">Night (Isha - Sleep)</span>
                      <span className="text-[10px] text-[#94a3b8]">Surah Al-Mulk</span>
                    </div>
                  </div>
                  {simTime === 'night' && <span className="text-[9px] bg-purple-400/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>}
                </button>
              </div>
            </div>

            {/* Recitation Benefit Card */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40 relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-transparent">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">
                <Award className="h-4 w-4" />
                <span>Spiritual Reward Benefit</span>
              </div>
              <p className="text-xs text-[#e2e8f0] leading-relaxed">
                {recData[simTime].benefit}
              </p>
            </div>
          </div>

          {/* Simulator Display: Miniature Reader View (Col-span 7) */}
          <div className="lg:col-span-7 glass-panel rounded-3xl border border-emerald-900/40 overflow-hidden flex flex-col justify-between min-h-[360px]">
            {/* Header banner */}
            <div className="p-4 bg-emerald-950/50 border-b border-emerald-900/40 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#94a3b8] font-bold">Quran Reader Preview</span>
                <h4 className="text-sm font-bold text-white font-outfit mt-0.5">{recData[simTime].surah}</h4>
              </div>
              <span className="text-xl font-amiri font-bold text-[#d4af37]">{recData[simTime].arabicName}</span>
            </div>

            {/* Verse content container */}
            <div className="p-6 space-y-6 flex-1 flex flex-col justify-center bg-emerald-950/10 text-center">
              
              {/* Arabic Script */}
              <p className="text-2xl font-amiri text-[#e2e8f0] leading-loose font-semibold max-w-lg mx-auto">
                {recData[simTime].verseAr}
              </p>
              
              <div className="space-y-3 pt-3 border-t border-emerald-950/20 max-w-md mx-auto">
                {/* English meaning */}
                <p className="text-[10px] text-[#94a3b8] font-outfit uppercase tracking-wide">English Meaning</p>
                <p className="text-xs text-[#e2e8f0] italic leading-normal">
                  "{recData[simTime].verseEn}"
                </p>

                {/* Urdu meaning */}
                <p className="text-[10px] text-[#d4af37]/80 uppercase tracking-wide font-bold pt-1">Urdu Translation</p>
                <p className="text-[14px] text-[#d4af37]/80 font-amiri leading-relaxed" dir="rtl">
                  {recData[simTime].verseUr}
                </p>
              </div>
            </div>

            {/* Bottom complete button display mock */}
            <div className="p-3 bg-emerald-950/40 border-t border-emerald-900/40 text-center">
              <span className="text-[9px] text-[#94a3b8] uppercase tracking-wider font-bold">Parallel Urdu/English Translations are populated for every verse</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Tabbed Hadith Reminders Section */}
      <section id="hadiths" aria-label="Authentic Hadith reminders about Salah" className="py-20 bg-emerald-950/10 border-t border-b border-emerald-950/30">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold">Hadith warnings & mercy</span>
            <h2 className="text-3xl font-bold text-white font-outfit">Authentic Spiritual Reminders</h2>
            <p className="text-sm text-[#94a3b8] max-w-md mx-auto">Toggle between the Hadith categories below to read references regarding the importance and expiation of prayer:</p>
          </div>

          {/* Hadith Tab Switcher */}
          <div className="flex justify-center">
            <div className="flex bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-900/40 space-x-1.5">
              <button
                onClick={() => setHadithTab('warnings')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  hadithTab === 'warnings'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-md'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <span>⚠️ Severities & Warnings</span>
              </button>
              <button
                onClick={() => setHadithTab('mercy')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  hadithTab === 'mercy'
                    ? 'bg-emerald-500/20 text-[#10b981] border border-[#10b981]/30 shadow-md'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <span>✨ Expiation & Mercy</span>
              </button>
            </div>
          </div>

          {/* Hadiths Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {hadithTab === 'warnings' ? (
              <>
                {/* Warning Hadith 1 */}
                <div className="glass-panel rounded-3xl p-6 border border-red-950/30 bg-red-950/5 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-red-900/40 transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="space-y-4 text-left">
                    <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider font-extrabold rounded-lg w-fit">
                      Severe Warning
                    </div>
                    <p className="text-xl font-amiri text-[#d4af37] leading-loose text-right pr-2">
                      إِنَّ بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكَ الصَّلَاةِ
                    </p>
                    <p className="text-xs sm:text-sm text-[#e2e8f0] italic leading-relaxed pl-3 border-l border-red-900/40">
                      "Verily, between a man and shirk (polytheism) and kufr (disbelief) is the abandonment of prayer."
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-[#94a3b8] font-bold">
                    — Sahih Muslim 82
                  </div>
                </div>

                {/* Warning Hadith 2 */}
                <div className="glass-panel rounded-3xl p-6 border border-red-950/30 bg-red-950/5 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-red-900/40 transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="space-y-4 text-left">
                    <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider font-extrabold rounded-lg w-fit">
                      Covenant Warning
                    </div>
                    <p className="text-xl font-amiri text-[#d4af37] leading-loose text-right pr-2">
                      الْعَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ
                    </p>
                    <p className="text-xs sm:text-sm text-[#e2e8f0] italic leading-relaxed pl-3 border-l border-red-900/40">
                      "The covenant that stands between us and them is the prayer; whoever abandons it has disbelieved."
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-[#94a3b8] font-bold">
                    — Sunan an-Nasa'i 463
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Mercy Hadith 1 */}
                <div className="glass-panel rounded-3xl p-6 border border-emerald-950/30 bg-emerald-950/5 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-emerald-800/40 transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="space-y-4 text-left">
                    <div className="px-2.5 py-1 bg-[#10b981]/15 border border-[#10b981]/25 text-[#10b981] text-[9px] uppercase tracking-wider font-extrabold rounded-lg w-fit">
                      Ease & Expiation
                    </div>
                    <p className="text-xl font-amiri text-[#d4af37] leading-loose text-right pr-2">
                      مَنْ نَسِيَ صَلاَةً أَوْ نَامَ عَنْهَا فَكَفَّارَتُهَا أَنْ يُصَلِّيَهَا إِذَا ذَكَرَهَا
                    </p>
                    <p className="text-xs sm:text-sm text-[#e2e8f0] italic leading-relaxed pl-3 border-l border-emerald-850">
                      "Whoever forgets a prayer or sleeps through it, its expiation is that he prays it when he remembers it. There is no other expiation for it."
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-[#94a3b8] font-bold">
                    — Sahih al-Bukhari 597
                  </div>
                </div>

                {/* Mercy Hadith 2 */}
                <div className="glass-panel rounded-3xl p-6 border border-emerald-950/30 bg-emerald-950/5 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-emerald-800/40 transition-colors duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="space-y-4 text-left">
                    <div className="px-2.5 py-1 bg-[#10b981]/15 border border-[#10b981]/25 text-[#10b981] text-[9px] uppercase tracking-wider font-extrabold rounded-lg w-fit">
                      Mercy & Cleanse
                    </div>
                    <p className="text-xl font-amiri text-[#d4af37] leading-loose text-right pr-2">
                      أَرَأَيْتُمْ لَوْ أَنَّ نَهْرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ
                    </p>
                    <p className="text-xs sm:text-sm text-[#e2e8f0] italic leading-relaxed pl-3 border-l border-emerald-850">
                      "If there was a river at the door of one of you in which he bathes five times a day, would any dirt remain on him? That is the likeness of the five prayers; Allah wipes away sins by them."
                    </p>
                  </div>

                  <div className="text-right text-[10px] text-[#94a3b8] font-bold">
                    — Sahih al-Bukhari 528
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold">FAQ</span>
            <h2 className="text-3xl font-bold text-white font-outfit">Frequently Asked Questions</h2>
            <p className="text-sm text-[#94a3b8] max-w-sm mx-auto">Common operational and structural questions regarding the utility app:</p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ Item 1 */}
            <div className="glass-panel rounded-2xl border border-emerald-900/40 overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(0)}
                className="w-full flex justify-between items-center p-5 text-left text-sm font-bold text-white cursor-pointer hover:bg-emerald-950/30 transition-colors"
              >
                <span>Is my tracking data secure and private?</span>
                <span className={`text-[#d4af37] transform transition-transform duration-300 ${faqExpanded[0] ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {faqExpanded[0] && (
                <div className="px-5 pb-5 text-xs text-[#94a3b8] leading-relaxed border-t border-emerald-950/20 pt-3 animate-fade-in">
                  Yes, absolutely. The app uses browser-based Local Storage to save all logs and metrics. Your data never leaves your tablet, phone, or laptop. No signup is required, and there are no tracking servers.
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="glass-panel rounded-2xl border border-emerald-900/40 overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full flex justify-between items-center p-5 text-left text-sm font-bold text-white cursor-pointer hover:bg-emerald-950/30 transition-colors"
              >
                <span>Can I use this app on my home screen offline?</span>
                <span className={`text-[#d4af37] transform transition-transform duration-300 ${faqExpanded[1] ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {faqExpanded[1] && (
                <div className="px-5 pb-5 text-xs text-[#94a3b8] leading-relaxed border-t border-emerald-950/20 pt-3 animate-fade-in">
                  Yes, this application is designed to be fully installable. You can add it directly to the home screen of your iPad, Android tablet, iPhone, or laptop desktop. It caches code resources locally using browser utilities, allowing it to load and execute 100% offline.
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="glass-panel rounded-2xl border border-emerald-900/40 overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full flex justify-between items-center p-5 text-left text-sm font-bold text-white cursor-pointer hover:bg-emerald-950/30 transition-colors"
              >
                <span>How can I back up my missed prayers count?</span>
                <span className={`text-[#d4af37] transform transition-transform duration-300 ${faqExpanded[2] ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {faqExpanded[2] && (
                <div className="px-5 pb-5 text-xs text-[#94a3b8] leading-relaxed border-t border-emerald-950/20 pt-3 animate-fade-in">
                  Under the Settings screen, you can find the "Data Backup & Restore" module. Tapping "Export Backup" compiles your database into a single JSON file download. You can import this JSON file on other browsers or devices to restore your counts.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 7. Bottom CTA & Footer */}
      <footer className="border-t border-emerald-950/40 py-16 bg-emerald-950/20 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] to-transparent pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-6 space-y-6 relative z-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white">Ready to begin tracking?</h2>
            <p className="text-xs text-[#94a3b8]">Create a clear, simple plan to restore your missed prayers.</p>
          </div>
          
          <button
            onClick={onStart}
            className="mx-auto px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#b89020] text-emerald-950 font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Launch App Now</span>
            <ChevronRight className="h-4 w-4 stroke-[3px]" />
          </button>

          <p className="text-[10px] text-[#94a3b8] mt-12">
            Made for the Ummah. Qaza Tracker — Free Offline Missed Prayer (Qaza Namaz) Logger © 2026.
          </p>
          {/* Hidden structured address for SEO */}
          <address className="sr-only" itemScope itemType="https://schema.org/Organization">
            <span itemProp="name">Qaza Tracker</span>.
            <span itemProp="url">https://missed-prayer-tracker.vercel.app/</span>.
            Free Islamic prayer tracking utility. Track missed prayers (Qaza Namaz) offline.
          </address>
        </div>
      </footer>
    </div>
  );
};
