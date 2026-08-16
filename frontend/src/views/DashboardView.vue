<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePrayerStore, type PrayerCounts } from '@/stores/prayers'
import { quranApi } from '@/services/api'
import {
  Plus,
  Minus,
  Clock,
  Sparkles,
  BookOpen,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Loader2,
  Moon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const prayerStore = usePrayerStore()

// 5 Obligatory Fard Prayers (Witr removed, Tahajjud optional)
const prayerList: Array<{ key: keyof PrayerCounts; name: string; arabic: string }> = [
  { key: 'fajr', name: 'Fajr', arabic: 'الفجر' },
  { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر' },
  { key: 'asr', name: 'Asr', arabic: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب' },
  { key: 'isha', name: 'Isha', arabic: 'العشاء' },
]

const visiblePrayers = computed(() => prayerList)

// Button loading state per prayer key
const loadingPrayerAction = ref<Record<string, 'complete' | 'add' | null>>({})

// Daily Ayah state
const dailyAyah = ref<{ text: string; translation: string; surahName: string; numberInSurah: number } | null>(null)
const isLoadingAyah = ref(false)

function formatTime12(timeStr?: string): string {
  if (!timeStr) return '--:--'
  const clean = timeStr.split(' ')[0]
  const parts = clean.split(':')
  if (parts.length < 2) return timeStr
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  if (isNaN(hours)) return timeStr
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  return `${hours}:${minutes} ${ampm}`
}

// Prayer times state
const prayerTimes = ref<Record<string, string> | null>(null)
const isLoadingTimes = ref(false)

// Custom bulk dialog
const isBulkModalOpen = ref(false)
const selectedPrayerForBulk = ref<keyof PrayerCounts>('fajr')
const bulkAmount = ref(5)
const bulkAction = ref<'complete' | 'add'>('complete')
const isBulkSubmitting = ref(false)

onMounted(async () => {
  await Promise.all([
    prayerStore.fetchCounts(),
    loadDailyAyah(),
    loadPrayerTimes()
  ])
})

async function loadDailyAyah() {
  isLoadingAyah.value = true
  try {
    const lang = authStore.profile?.quran_language || 'en.sahih'
    const res = await quranApi.getRandomAyah(lang)
    if (res.data && Array.isArray(res.data) && res.data.length >= 2) {
      dailyAyah.value = {
        text: res.data[0].text,
        translation: res.data[1].text,
        surahName: res.data[0].surah?.englishName || 'The Holy Quran',
        numberInSurah: res.data[0].numberInSurah || 1,
      }
    }
  } catch (e) {
    console.error('Failed to load random ayah', e)
  } finally {
    isLoadingAyah.value = false
  }
}

async function loadPrayerTimes() {
  if (!authStore.profile?.city) return
  isLoadingTimes.value = true
  try {
    const city = authStore.profile.city
    const country = authStore.profile.country || 'PK'
    const res = await quranApi.getPrayerTimes(city, country)
    if (res.data?.timings) {
      prayerTimes.value = res.data.timings
    }
  } catch (e) {
    console.error('Failed to load prayer times', e)
  } finally {
    isLoadingTimes.value = false
  }
}

async function handleComplete(prayer: keyof PrayerCounts) {
  loadingPrayerAction.value[prayer] = 'complete'
  try {
    await prayerStore.completeQaza(prayer, 1)
  } finally {
    loadingPrayerAction.value[prayer] = null
  }
}

async function handleAdd(prayer: keyof PrayerCounts) {
  loadingPrayerAction.value[prayer] = 'add'
  try {
    await prayerStore.addQaza(prayer, 1)
  } finally {
    loadingPrayerAction.value[prayer] = null
  }
}

function openBulkModal(prayer: keyof PrayerCounts) {
  selectedPrayerForBulk.value = prayer
  isBulkModalOpen.value = true
}

async function executeBulk() {
  if (bulkAmount.value <= 0) return
  isBulkSubmitting.value = true
  try {
    if (bulkAction.value === 'complete') {
      await prayerStore.completeQaza(selectedPrayerForBulk.value, bulkAmount.value)
    } else {
      await prayerStore.addQaza(selectedPrayerForBulk.value, bulkAmount.value)
    }
    isBulkModalOpen.value = false
  } finally {
    isBulkSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Compact Hero Total Balance Card (Issue #3 Fixed) -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/90 via-[#0a3d2e] to-emerald-950/95 border border-[#d4af37]/35 p-4 sm:p-5 shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#d4af37] flex items-center gap-1.5">
            <span>Historical Qaza Debt</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {{ prayerStore.totalQaza.toLocaleString() }}
            </h2>
            <span class="text-xs text-emerald-300/90 font-medium">prayers remaining</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="router.push('/ai')"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 rounded-xl text-xs text-[#d4af37] font-bold transition cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
          <button
            @click="prayerStore.fetchCounts()"
            class="p-1.5 bg-emerald-950/70 border border-emerald-800/50 rounded-xl text-emerald-400 hover:text-white transition cursor-pointer"
            title="Refresh balance"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="prayerStore.loading ? 'animate-spin' : ''" />
          </button>
        </div>
      </div>

      <div class="mt-3 pt-2.5 border-t border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300/80">
        <div class="flex items-center gap-1.5 truncate">
          <TrendingDown class="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          <span class="truncate">Every prayer offered brings you closer to completion</span>
        </div>
      </div>
    </div>

    <!-- Live Prayer Times for City (12-Hour AM/PM Format) -->
    <div v-if="prayerTimes" class="p-3.5 sm:p-4 bg-emerald-950/70 border border-emerald-800/50 rounded-2xl">
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center gap-1.5 text-xs text-[#d4af37] font-bold">
          <Clock class="w-3.5 h-3.5" />
          <span>Today's Salah Times — {{ authStore.profile?.city || 'Local' }}</span>
        </div>
        <span class="text-[10px] text-emerald-400/80 font-medium">12-Hour Format</span>
      </div>

      <div class="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
        <div class="p-1.5 sm:p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/30">
          <p class="text-[8px] sm:text-[9px] text-emerald-300 font-semibold uppercase">Fajr</p>
          <p class="text-[11px] sm:text-xs font-bold text-white mt-0.5">{{ formatTime12(prayerTimes.Fajr) }}</p>
        </div>
        <div class="p-1.5 sm:p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/30">
          <p class="text-[8px] sm:text-[9px] text-emerald-300 font-semibold uppercase">Dhuhr</p>
          <p class="text-[11px] sm:text-xs font-bold text-white mt-0.5">{{ formatTime12(prayerTimes.Dhuhr) }}</p>
        </div>
        <div class="p-1.5 sm:p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/30">
          <p class="text-[8px] sm:text-[9px] text-emerald-300 font-semibold uppercase">Asr</p>
          <p class="text-[11px] sm:text-xs font-bold text-white mt-0.5">{{ formatTime12(prayerTimes.Asr) }}</p>
        </div>
        <div class="p-1.5 sm:p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/30">
          <p class="text-[8px] sm:text-[9px] text-emerald-300 font-semibold uppercase">Maghrib</p>
          <p class="text-[11px] sm:text-xs font-bold text-white mt-0.5">{{ formatTime12(prayerTimes.Maghrib) }}</p>
        </div>
        <div class="p-1.5 sm:p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/30">
          <p class="text-[8px] sm:text-[9px] text-emerald-300 font-semibold uppercase">Isha</p>
          <p class="text-[11px] sm:text-xs font-bold text-white mt-0.5">{{ formatTime12(prayerTimes.Isha) }}</p>
        </div>
      </div>
    </div>

    <!-- 5 FARD PRAYER COUNTERS WITH INDIVIDUAL LOADERS -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white tracking-wide">Fard Prayer Breakdown</h3>
        <span class="text-[10px] text-emerald-400/70">Tap count for bulk entry</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div
          v-for="prayer in visiblePrayers"
          :key="prayer.key"
          class="p-4 bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-800/40 hover:border-[#d4af37]/40 rounded-2xl transition duration-200 shadow-sm flex flex-col justify-between"
        >
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-xs font-bold text-white">{{ prayer.name }}</p>
              <p class="text-[10px] text-emerald-400/80 font-arabic">{{ prayer.arabic }}</p>
            </div>
            <button
              @click="openBulkModal(prayer.key)"
              class="px-2.5 py-1 rounded-lg bg-emerald-900/40 border border-emerald-800/60 text-sm font-extrabold text-[#d4af37] hover:border-[#d4af37] transition cursor-pointer"
              title="Click to bulk edit"
            >
              {{ (prayerStore.counts[prayer.key] || 0).toLocaleString() }}
            </button>
          </div>

          <!-- Increment/Decrement Action Buttons with Active Loaders -->
          <div class="flex items-center gap-2">
            <button
              @click="handleComplete(prayer.key)"
              :disabled="loadingPrayerAction[prayer.key] !== null && loadingPrayerAction[prayer.key] !== undefined"
              class="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-[#10b981] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="loadingPrayerAction[prayer.key] === 'complete'" class="w-3.5 h-3.5 animate-spin" />
              <template v-else>
                <Minus class="w-3.5 h-3.5" />
                <span>Prayed</span>
              </template>
            </button>

            <button
              @click="handleAdd(prayer.key)"
              :disabled="loadingPrayerAction[prayer.key] !== null && loadingPrayerAction[prayer.key] !== undefined"
              class="flex-1 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="loadingPrayerAction[prayer.key] === 'add'" class="w-3.5 h-3.5 animate-spin" />
              <template v-else>
                <Plus class="w-3.5 h-3.5" />
                <span>Missed</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Ayah of the Day Widget -->
    <div
      v-if="dailyAyah"
      class="p-5 bg-gradient-to-br from-emerald-950/80 to-[#022c22] border border-[#d4af37]/30 rounded-3xl space-y-3 shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs text-[#d4af37] font-bold">
          <BookOpen class="w-4 h-4" />
          <span>Ayah of the Day</span>
        </div>
        <span class="text-[10px] text-emerald-400/80">
          {{ dailyAyah.surahName }} ({{ dailyAyah.numberInSurah }})
        </span>
      </div>

      <p class="text-right font-arabic text-lg text-amber-100 leading-loose">
        {{ dailyAyah.text }}
      </p>

      <p class="text-xs text-emerald-200/80 leading-relaxed italic border-t border-emerald-800/30 pt-2.5">
        "{{ dailyAyah.translation }}"
      </p>

      <button
        @click="router.push('/quran')"
        class="w-full py-2 bg-emerald-900/30 hover:bg-emerald-900/60 text-[11px] text-[#d4af37] font-bold rounded-xl border border-emerald-800/40 flex items-center justify-center gap-1 transition cursor-pointer"
      >
        <span>Open Quran Reader</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Custom Bulk Adjustment Dialog -->
    <div
      v-if="isBulkModalOpen"
      class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="w-full max-w-sm bg-[#0a3d2e] border border-emerald-700/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
        <h3 class="text-base font-bold text-white">
          Bulk Adjust — {{ selectedPrayerForBulk.toUpperCase() }}
        </h3>
        <p class="text-xs text-emerald-200/80">
          Current balance: <strong class="text-[#d4af37]">{{ prayerStore.counts[selectedPrayerForBulk] || 0 }}</strong>
        </p>

        <div class="flex items-center justify-center gap-2">
          <button
            @click="bulkAction = 'complete'"
            :class="[
              'flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer',
              bulkAction === 'complete' ? 'bg-[#10b981] text-[#022c22]' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            ]"
          >
            I Prayed
          </button>
          <button
            @click="bulkAction = 'add'"
            :class="[
              'flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer',
              bulkAction === 'add' ? 'bg-red-600 text-white' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            ]"
          >
            I Missed
          </button>
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-emerald-200 font-medium">Number of Prayers</label>
          <input
            v-model.number="bulkAmount"
            type="number"
            min="1"
            max="10000"
            class="input text-center text-lg font-bold"
          />
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="isBulkModalOpen = false"
            class="flex-1 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-xs font-bold text-emerald-300 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="executeBulk"
            :disabled="isBulkSubmitting"
            class="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Loader2 v-if="isBulkSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span v-else>Confirm</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
