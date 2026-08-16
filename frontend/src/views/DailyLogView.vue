<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePrayerStore, type PrayerCounts } from '@/stores/prayers'
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Moon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const prayerStore = usePrayerStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const updatingPrayerKey = ref<string | null>(null)

// 5 Obligatory Fard Prayers
const prayerList = [
  { key: 'fajr', name: 'Fajr', arabic: 'الفجر' },
  { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر' },
  { key: 'asr', name: 'Asr', arabic: 'العصر' },
  { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب' },
  { key: 'isha', name: 'Isha', arabic: 'العشاء' },
]

const visiblePrayers = computed(() => prayerList)

onMounted(async () => {
  await loadDate(selectedDate.value)
})

async function loadDate(dateStr: string) {
  selectedDate.value = dateStr
  await prayerStore.fetchDailyLog(dateStr)
}

function shiftDate(days: number) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + days)
  loadDate(d.toISOString().split('T')[0])
}

const completedCount = computed(() => {
  if (!prayerStore.dailyLog) return 0
  return visiblePrayers.value.filter(
    p => prayerStore.dailyLog?.prayers[p.key] === 'prayed'
  ).length
})

const totalPrayersCount = computed(() => visiblePrayers.value.length)

async function setStatus(prayerKey: string, status: 'prayed' | 'missed' | 'pending') {
  updatingPrayerKey.value = prayerKey
  try {
    await prayerStore.updatePrayerStatus(prayerKey, status)
    if (status === 'missed') {
      await prayerStore.addQaza(prayerKey as keyof PrayerCounts, 1)
    }
  } finally {
    updatingPrayerKey.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Date Header Navigator -->
    <div class="flex items-center justify-between p-4 bg-emerald-950/70 border border-emerald-800/50 rounded-2xl">
      <button
        @click="shiftDate(-1)"
        class="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-300 transition cursor-pointer"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <div class="text-center">
        <p class="text-sm font-bold text-white flex items-center justify-center gap-1.5">
          <CalendarDays class="w-4 h-4 text-[#d4af37]" />
          <span>{{ selectedDate === prayerStore.todayStr ? 'Today' : selectedDate }}</span>
        </p>
        <p class="text-[10px] text-emerald-400/80">
          {{ completedCount }} of {{ totalPrayersCount }} Fard prayers completed
        </p>
      </div>

      <button
        @click="shiftDate(1)"
        class="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-300 transition cursor-pointer"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Daily Progress Bar -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs text-emerald-200">
        <span>Today's Fard Completion</span>
        <span class="font-bold text-[#d4af37]">
          {{ Math.round((completedCount / totalPrayersCount) * 100) }}%
        </span>
      </div>

      <div class="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-900">
        <div
          class="bg-gradient-to-r from-[#d4af37] to-[#10b981] h-full transition-all duration-300"
          :style="{ width: `${(completedCount / totalPrayersCount) * 100}%` }"
        ></div>
      </div>

      <!-- Workflow Explanation Banner -->
      <div class="p-3 bg-emerald-950/50 border border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs text-emerald-200/80">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#d4af37]"></span>
          <span>Daily Salah Log: Marking a prayer as <strong>Missed</strong> automatically rolls over +1 to your Qaza Debt.</span>
        </div>
      </div>
    </div>

    <!-- Prayer List Status Cards with Loaders -->
    <div class="space-y-3">
      <div
        v-for="p in visiblePrayers"
        :key="p.key"
        class="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl flex items-center justify-between shadow-sm"
      >
        <div>
          <h4 class="text-sm font-bold text-white">{{ p.name }}</h4>
          <p class="text-[10px] text-emerald-400 font-arabic">{{ p.arabic }}</p>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Active status update loader -->
          <div v-if="updatingPrayerKey === p.key" class="p-2 text-[#d4af37] animate-spin">
            <Loader2 class="w-4 h-4" />
          </div>

          <template v-else>
            <!-- Prayed Button -->
            <button
              @click="setStatus(p.key, 'prayed')"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                prayerStore.dailyLog?.prayers[p.key] === 'prayed'
                  ? 'bg-[#10b981] text-[#022c22] shadow'
                  : 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60'
              ]"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Prayed</span>
            </button>

            <!-- Missed Button -->
            <button
              @click="setStatus(p.key, 'missed')"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                prayerStore.dailyLog?.prayers[p.key] === 'missed'
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60'
              ]"
            >
              <XCircle class="w-3.5 h-3.5" />
              <span>Missed</span>
            </button>

            <!-- Pending Button -->
            <button
              @click="setStatus(p.key, 'pending')"
              :class="[
                'px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
                !prayerStore.dailyLog?.prayers[p.key] || prayerStore.dailyLog?.prayers[p.key] === 'pending'
                  ? 'bg-emerald-950 text-[#d4af37] border border-[#d4af37]/40 shadow-inner'
                  : 'bg-emerald-900/20 text-emerald-400/60 hover:text-emerald-300'
              ]"
              title="Mark as pending"
            >
              <Clock class="w-3.5 h-3.5" />
            </button>
          </template>
        </div>
      </div>
    </div>

  </div>
</template>
