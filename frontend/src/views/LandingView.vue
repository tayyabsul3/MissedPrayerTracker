<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Moon,
  Sparkles,
  ShieldCheck,
  BookOpen,
  CalendarDays,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Clock,
  Heart,
  ChevronRight
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// Interactive mini-calculator on landing page
const missedYears = ref(2)
const totalMissedPrayers = computed(() => missedYears.value * 365 * 6) // 5 Fard + 1 Witr

function startWithCalculated() {
  router.push('/onboarding')
}
</script>

<template>
  <div class="min-h-screen text-slate-100 bg-[#022c22] selection:bg-[#d4af37]/30 flex flex-col items-center">
    
    <!-- Top Floating Header -->
    <header class="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-[#022c22]/90 border-b border-emerald-800/40">
      <div class="flex items-center gap-2.5 cursor-pointer min-w-0" @click="router.push('/')">
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#d4af37]/30 to-emerald-950 border border-[#d4af37]/40 flex items-center justify-center shadow-md shrink-0">
          <span class="text-base sm:text-lg font-bold text-[#d4af37] font-arabic">ق</span>
        </div>
        <div class="truncate">
          <h1 class="text-sm sm:text-base font-extrabold text-white tracking-wide leading-none truncate">Qaza Tracker</h1>
          <p class="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#d4af37] font-semibold mt-0.5 truncate">Missed Prayer Tracker</p>
        </div>
      </div>

      <!-- Header Action Buttons -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          v-if="authStore.isLoggedIn"
          @click="router.push('/dashboard')"
          class="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
        >
          <span>Dashboard</span>
          <ChevronRight class="w-3 h-3" />
        </button>
        <template v-else>
          <button
            @click="router.push('/login')"
            class="px-2.5 py-1 text-xs font-semibold text-emerald-200 hover:text-white transition cursor-pointer"
          >
            Log In
          </button>
          <button
            @click="router.push('/onboarding')"
            class="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-400 hover:from-amber-400 hover:to-[#d4af37] text-[#022c22] text-xs font-extrabold transition shadow-sm cursor-pointer active:scale-98"
          >
            Sign Up
          </button>
        </template>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 text-center space-y-8">
      
      <!-- Bismillah Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-[#d4af37]/40 shadow-inner">
        <Sparkles class="w-3.5 h-3.5 text-[#d4af37]" />
        <span class="text-xs font-semibold text-[#d4af37] tracking-wider font-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
      </div>

      <!-- Main Headline -->
      <div class="space-y-4">
        <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Turn Your Missed Prayers Into <span class="bg-gradient-to-r from-[#d4af37] via-amber-300 to-yellow-500 bg-clip-text text-transparent">Fulfilled Worship</span>
        </h2>
        <p class="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
          The purposeful, AI-assisted Islamic accountability companion designed to help you calculate, track, and systematically complete every single missed (Qaza) Salah with peace of mind.
        </p>
      </div>

      <!-- Dual Call to Action -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          @click="router.push('/onboarding')"
          class="w-full sm:w-auto btn-primary py-4 px-8 text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer group"
        >
          <span>Begin Free Journey</span>
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          @click="router.push('/login')"
          class="w-full sm:w-auto btn-secondary py-4 px-7 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Already Tracking? Sign In</span>
        </button>
      </div>

      <!-- Quick Trust Indicators -->
      <div class="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-300/80 font-medium">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-[#d4af37]" />
          <span>100% Free & Ad-Free</span>
        </div>
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-[#d4af37]" />
          <span>Cloud Saved via Neon DB</span>
        </div>
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-[#d4af37]" />
          <span>All 4 Islamic Schools Supported</span>
        </div>
      </div>
    </section>

    <!-- INTERACTIVE MINI-CALCULATOR PREVIEW WIDGET -->
    <section class="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div class="bg-[#0a3d2e]/80 backdrop-blur-2xl border border-emerald-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div class="flex items-center gap-3 border-b border-emerald-800/60 pb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Calculator class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Instant Qaza Estimation</h3>
            <p class="text-xs text-emerald-200/70">Estimate your missed prayer obligation in seconds</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-emerald-200">Approximate missed duration:</label>
            <span class="text-base font-extrabold text-[#d4af37]">{{ missedYears }} {{ missedYears === 1 ? 'Year' : 'Years' }}</span>
          </div>

          <input
            v-model.number="missedYears"
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            class="w-full accent-[#d4af37] cursor-pointer h-2 bg-emerald-950 rounded-lg"
          />
          <div class="flex justify-between text-[10px] text-emerald-400/60">
            <span>6 Months</span>
            <span>5 Years</span>
            <span>10 Years</span>
            <span>20 Years</span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div class="p-3.5 bg-emerald-950/80 border border-emerald-800/50 rounded-2xl text-center">
            <p class="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Total Prayers</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ totalMissedPrayers.toLocaleString() }}</p>
          </div>
          <div class="p-3.5 bg-emerald-950/80 border border-emerald-800/50 rounded-2xl text-center">
            <p class="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Per Daily Prayer</p>
            <p class="text-xl sm:text-2xl font-black text-[#d4af37] mt-1">{{ Math.round(totalMissedPrayers / 6).toLocaleString() }}</p>
          </div>
          <div class="col-span-2 sm:col-span-1 p-3.5 bg-emerald-950/80 border border-emerald-800/50 rounded-2xl text-center">
            <p class="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">At 5 Qaza / Day</p>
            <p class="text-xl sm:text-2xl font-black text-emerald-300 mt-1">{{ Math.round(totalMissedPrayers / 5 / 30) }} Months</p>
          </div>
        </div>

        <button
          @click="startWithCalculated"
          class="w-full btn-primary py-3 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Save & Start Fulfilling Today</span>
          <ArrowRight class="w-4 h-4" />
        </button>

      </div>
    </section>

    <!-- CORE FEATURES SHOWCASE -->
    <section class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      
      <div class="text-center space-y-2">
        <h3 class="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Daily Consistency</h3>
        <p class="text-xs sm:text-sm text-emerald-200/70 max-w-lg mx-auto">Every feature is designed to reduce overwhelm and give you structured, achievable daily progress.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <!-- Feature 1: Real-time Qaza Counters -->
        <div class="p-6 bg-[#0a3d2e]/70 border border-emerald-800/50 rounded-3xl space-y-3 hover:border-[#d4af37]/50 transition-colors">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Clock class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">Live One-Tap Counters</h4>
          <p class="text-xs text-emerald-100/70 leading-relaxed">
            Increment and decrement Fajr, Dhuhr, Asr, Maghrib, Isha, and Witr with quick buttons and instant cloud syncing.
          </p>
        </div>

        <!-- Feature 2: AI Islamic Scholar -->
        <div class="p-6 bg-[#0a3d2e]/70 border border-emerald-800/50 rounded-3xl space-y-3 hover:border-[#d4af37]/50 transition-colors">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Sparkles class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">AI Islamic Scholar & Voice</h4>
          <p class="text-xs text-emerald-100/70 leading-relaxed">
            Get compassionate Fiqh advice, personalized schedules, and speak your questions via voice transcription.
          </p>
        </div>

        <!-- Feature 3: Quran Reader & Audio -->
        <div class="p-6 bg-[#0a3d2e]/70 border border-emerald-800/50 rounded-3xl space-y-3 hover:border-[#d4af37]/50 transition-colors">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <BookOpen class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">Quran Reader & Audio</h4>
          <p class="text-xs text-emerald-100/70 leading-relaxed">
            Read all 114 Surahs in Arabic with multi-language translations (English, Urdu, Turkish, French) and Mishary Alafasy recitations.
          </p>
        </div>

        <!-- Feature 4: Daily Log & Habit Streak -->
        <div class="p-6 bg-[#0a3d2e]/70 border border-emerald-800/50 rounded-3xl space-y-3 hover:border-[#d4af37]/50 transition-colors">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <CalendarDays class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">Daily Prayer Log</h4>
          <p class="text-xs text-emerald-100/70 leading-relaxed">
            Track today's 5 daily prayers (Prayed / Missed / Pending) with automated rollover into your Qaza balance if missed.
          </p>
        </div>

        <!-- Feature 5: City-Based Prayer Times -->
        <div class="p-6 bg-[#0a3d2e]/70 border border-emerald-800/50 rounded-3xl space-y-3 hover:border-[#d4af37]/50 transition-colors">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Volume2 class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">Accurate City Times</h4>
          <p class="text-xs text-emerald-100/70 leading-relaxed">
            Accurate live calculation for your exact city and country with custom calculation method options.
          </p>
        </div>

        <!-- Feature 6: Privacy & Neon Cloud Sync -->
        <div class="p-6 bg-[#0a3d2e]/70 border border-emerald-800/50 rounded-3xl space-y-3 hover:border-[#d4af37]/50 transition-colors">
          <div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <h4 class="text-base font-bold text-white">Encrypted & Private</h4>
          <p class="text-xs text-emerald-100/70 leading-relaxed">
            Your worship records belong exclusively to you, secured with industry-standard JWT sessions and Neon PostgreSQL.
          </p>
        </div>

      </div>
    </section>

    <!-- HADITH / MOTIVATION BANNER -->
    <section class="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-[#0a3d2e] to-emerald-950 border border-[#d4af37]/40 rounded-3xl text-center space-y-4 shadow-xl">
        <span class="text-2xl font-bold text-[#d4af37] font-arabic">إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا</span>
        <p class="text-sm font-semibold text-white">
          "The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound."
        </p>
        <p class="text-xs text-emerald-300/80 font-medium">— Sunan al-Tirmidhi</p>
      </div>
    </section>

    <!-- FINAL CALL TO ACTION -->
    <section class="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
      <h3 class="text-2xl sm:text-4xl font-extrabold text-white">Start With Bismillah Today</h3>
      <p class="text-xs sm:text-sm text-emerald-100/80 max-w-md mx-auto">
        Take the first step towards complete peace of heart and spiritual accountability.
      </p>
      <button
        @click="router.push('/onboarding')"
        class="btn-primary py-4 px-10 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer shadow-xl shadow-amber-500/25"
      >
        <span>Get Started Now</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </section>

    <!-- FOOTER -->
    <footer class="w-full border-t border-emerald-900/60 py-8 px-4 text-center text-xs text-emerald-400/60 space-y-2">
      <p class="flex items-center justify-center gap-1 font-medium">
        Qaza Tracker • Built with <Heart class="w-3.5 h-3.5 text-red-500" /> for the Global Ummah
      </p>
      <p class="text-[10px] text-emerald-500/50">Free & Open Spiritual Accountability Platform</p>
    </footer>

  </div>
</template>
