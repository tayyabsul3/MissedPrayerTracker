import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { prayersApi } from '@/services/api'

export interface PrayerCounts {
  fajr: number
  dhuhr: number
  asr: number
  maghrib: number
  isha: number
  witr: number
  updated_at?: string
}

export interface DailyLog {
  log_date: string
  prayers: Record<string, 'prayed' | 'missed' | 'pending'>
}

export interface HistoryEntry {
  id: string
  prayer_name: string
  event_type: 'completed' | 'added' | 'reset'
  amount: number
  created_at: string
}

export const usePrayerStore = defineStore('prayers', () => {
  const counts = ref<PrayerCounts>({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 })
  const dailyLog = ref<DailyLog | null>(null)
  const history = ref<HistoryEntry[]>([])
  const loading = ref(false)

  const totalQaza = computed(() =>
    counts.value.fajr + counts.value.dhuhr + counts.value.asr +
    counts.value.maghrib + counts.value.isha + counts.value.witr
  )

  const todayStr = computed(() => new Date().toISOString().split('T')[0])

  async function fetchCounts() {
    loading.value = true
    try {
      const res = await prayersApi.getCounts()
      counts.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function addQaza(prayer: keyof PrayerCounts, amount = 1) {
    const newVal = (counts.value[prayer] as number) + amount
    const update = { [prayer]: newVal }
    const res = await prayersApi.updateCounts(update)
    counts.value = res.data
    await prayersApi.addHistory({ prayer_name: prayer, event_type: 'added', amount })
  }

  async function completeQaza(prayer: keyof PrayerCounts, amount = 1) {
    const current = counts.value[prayer] as number
    const newVal = Math.max(0, current - amount)
    const update = { [prayer]: newVal }
    const res = await prayersApi.updateCounts(update)
    counts.value = res.data
    await prayersApi.addHistory({ prayer_name: prayer, event_type: 'completed', amount })
  }

  async function fetchDailyLog(date?: string) {
    const d = date || todayStr.value
    const res = await prayersApi.getDailyLog(d)
    dailyLog.value = res.data
  }

  async function updatePrayerStatus(prayer: string, status: 'prayed' | 'missed' | 'pending') {
    const date = todayStr.value
    await prayersApi.updateDailyLog(date, [{ prayer_name: prayer, status }])
    if (dailyLog.value) {
      dailyLog.value.prayers[prayer] = status
    }
  }

  async function fetchHistory(limit = 50) {
    const res = await prayersApi.getHistory(limit)
    history.value = res.data
  }

  return {
    counts,
    dailyLog,
    history,
    loading,
    totalQaza,
    todayStr,
    fetchCounts,
    addQaza,
    completeQaza,
    fetchDailyLog,
    updatePrayerStatus,
    fetchHistory,
  }
})
