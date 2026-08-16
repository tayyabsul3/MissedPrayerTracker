<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePrayerStore, type HistoryEntry } from '@/stores/prayers'
import { useAuthStore } from '@/stores/auth'
import { aiApi } from '@/services/api'
import {
  History as HistoryIcon,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Flame,
  TrendingUp,
  BarChart3,
  Loader2,
  RefreshCw
} from 'lucide-vue-next'

const authStore = useAuthStore()
const prayerStore = usePrayerStore()

const filterPrayer = ref<string>('all')
const aiSummary = ref<string | null>(null)
const isGeneratingAi = ref(false)

onMounted(async () => {
  await Promise.all([
    prayerStore.fetchHistory(100),
    prayerStore.fetchCounts()
  ])
})

const filteredHistory = computed(() => {
  if (filterPrayer.value === 'all') {
    return prayerStore.history
  }
  return prayerStore.history.filter(h => h.prayer_name.toLowerCase() === filterPrayer.value.toLowerCase())
})

const totalCompletedLifetime = computed(() => {
  return prayerStore.history
    .filter(h => h.event_type === 'completed')
    .reduce((acc, h) => acc + h.amount, 0)
})

// Calculate completions per prayer for visual distribution
const prayerCompletionStats = computed(() => {
  const map: Record<string, number> = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
  for (const h of prayerStore.history) {
    if (h.event_type === 'completed') {
      const key = h.prayer_name.toLowerCase()
      if (map[key] !== undefined) {
        map[key] += h.amount
      }
    }
  }
  return map
})

async function generateAiSummary() {
  isGeneratingAi.value = true
  aiSummary.value = ''
  try {
    const prompt = `Please provide a motivational Islamic progress summary and spiritual reflection for me.
My total completed Qaza prayers so far: ${totalCompletedLifetime.value}.
My remaining missed prayers: ${prayerStore.totalQaza}.
Breakdown completed: Fajr (${prayerCompletionStats.value.fajr}), Dhuhr (${prayerCompletionStats.value.dhuhr}), Asr (${prayerCompletionStats.value.asr}), Maghrib (${prayerCompletionStats.value.maghrib}), Isha (${prayerCompletionStats.value.isha}).
Include a short encouraging Hadith, praise my steadfastness, and give 1 practical recommendation for next week.`
    
    await aiApi.chatStream(prompt, (chunk: string) => {
      aiSummary.value = (aiSummary.value || '') + chunk
    })
  } catch (e) {
    aiSummary.value = "May Allah accept all your fulfilled prayers and grant you steadfastness! Every single prostration is counted and rewarded."
  } finally {
    isGeneratingAi.value = false
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Top Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <!-- Lifetime Fulfilled -->
      <div class="p-4 sm:p-5 bg-gradient-to-br from-emerald-950 via-[#0a3d2e] to-emerald-900/80 border border-emerald-800/50 rounded-3xl flex items-center justify-between shadow-xl">
        <div>
          <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Lifetime Fulfilled</span>
          <h3 class="text-3xl font-black text-white mt-0.5">
            {{ totalCompletedLifetime.toLocaleString() }}
          </h3>
          <p class="text-xs text-emerald-300/80">Qaza prayers offered</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-900/60 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow">
          <CheckCircle2 class="w-6 h-6" />
        </div>
      </div>

      <!-- Active Momentum -->
      <div class="p-4 sm:p-5 bg-gradient-to-br from-emerald-950 via-[#0a3d2e] to-emerald-900/80 border border-emerald-800/50 rounded-3xl flex items-center justify-between shadow-xl">
        <div>
          <span class="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest">Active Momentum</span>
          <h3 class="text-3xl font-black text-white mt-0.5">
            {{ prayerStore.totalQaza.toLocaleString() }}
          </h3>
          <p class="text-xs text-emerald-300/80">Remaining to fulfill</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-[#d4af37] shadow">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- ON-DEMAND AI SPIRITUAL SUMMARY & MOTIVATION BANNER (Issue #7 Fixed) -->
    <div class="p-4 sm:p-5 bg-[#0a3d2e]/90 border border-emerald-700/60 rounded-3xl shadow-xl space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#022c22] flex items-center justify-center font-bold">
            <Sparkles class="w-4 h-4" />
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-bold text-white">AI Spiritual Progress Reflection</h4>
            <p class="text-[10px] text-emerald-300/80">Personalized motivation based on your logged history</p>
          </div>
        </div>

        <button
          @click="generateAiSummary"
          :disabled="isGeneratingAi"
          class="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Loader2 v-if="isGeneratingAi" class="w-3.5 h-3.5 animate-spin" />
          <Sparkles v-else class="w-3.5 h-3.5" />
          <span>{{ aiSummary ? 'Regenerate' : 'Generate Summary' }}</span>
        </button>
      </div>

      <div v-if="aiSummary" class="p-3.5 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl text-xs sm:text-sm text-emerald-100 leading-relaxed animate-fade-in whitespace-pre-line">
        {{ aiSummary }}
      </div>
    </div>

    <!-- PRAYER DISTRIBUTION VISUAL BARS (5 Fard Prayers) -->
    <div class="p-4 sm:p-5 bg-emerald-950/70 border border-emerald-800/50 rounded-3xl space-y-3 shadow-lg">
      <div class="flex items-center gap-2 text-xs text-white font-bold">
        <BarChart3 class="w-4 h-4 text-[#d4af37]" />
        <span>Completed Prayers by Salah</span>
      </div>

      <div class="grid grid-cols-5 gap-2 text-center pt-1">
        <div
          v-for="p in ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']"
          :key="p"
          class="p-2.5 bg-emerald-900/40 border border-emerald-800/40 rounded-2xl"
        >
          <p class="text-[10px] text-emerald-300 font-semibold uppercase">{{ p }}</p>
          <p class="text-base font-extrabold text-[#d4af37] mt-0.5">{{ prayerCompletionStats[p] || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- HISTORY LOG & TIMELINE -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white tracking-wide">Activity Timeline</h3>
        
        <!-- Filter Pills -->
        <div class="flex items-center gap-1 overflow-x-auto">
          <button
            v-for="f in ['all', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha']"
            :key="f"
            @click="filterPrayer = f"
            :class="[
              'text-[9px] uppercase font-bold px-2.5 py-1 rounded-full border transition cursor-pointer shrink-0',
              filterPrayer === f
                ? 'bg-[#d4af37] text-emerald-950 border-[#d4af37]'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/50'
            ]"
          >
            {{ f }}
          </button>
        </div>
      </div>

      <!-- History List -->
      <div class="space-y-2">
        <div v-if="filteredHistory.length === 0" class="text-center py-10 text-emerald-400/60 text-xs bg-emerald-950/40 rounded-2xl border border-emerald-900/40">
          No prayer events recorded yet. Mark prayers as completed or missed to build your history!
        </div>

        <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="p-3.5 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl flex items-center justify-between shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0',
                item.event_type === 'completed'
                  ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-950/50 text-red-300 border border-red-800/40'
              ]"
            >
              <CheckCircle2 v-if="item.event_type === 'completed'" class="w-4 h-4 text-emerald-400" />
              <PlusCircle v-else class="w-4 h-4 text-red-400" />
            </div>

            <div>
              <p class="text-xs font-bold text-white capitalize">
                {{ item.prayer_name }} Qaza
              </p>
              <p class="text-[10px] text-emerald-400/70">
                {{ formatDate(item.created_at) }}
              </p>
            </div>
          </div>

          <div
            :class="[
              'px-2.5 py-1 rounded-xl text-xs font-bold',
              item.event_type === 'completed'
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'
                : 'bg-red-950/60 text-red-300 border border-red-800/40'
            ]"
          >
            {{ item.event_type === 'completed' ? `-${item.amount} Prayed` : `+${item.amount} Missed` }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
