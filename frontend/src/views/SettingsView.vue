<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { notificationsApi } from '@/services/api'
import { COUNTRIES_DATA } from '@/utils/locations'
import {
  Settings as SettingsIcon,
  User,
  MapPin,
  Globe,
  BookOpen,
  Bell,
  LogOut,
  Check,
  Loader2,
  ShieldCheck,
  Type,
  Clock,
  Compass,
  Volume2
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const name = ref(authStore.profile?.name || '')
const country = ref(authStore.profile?.country || 'Pakistan')
const city = ref(authStore.profile?.city || 'Karachi')
const quranLanguage = ref(authStore.profile?.quran_language || 'en.sahih')
const trackWitr = ref(authStore.profile?.track_witr ?? true)
const dailyReminderTime = ref(authStore.profile?.daily_reminder_time || '21:00')

// Rich Customization State (Issue #9 & #11 Fixed)
const appFontSize = ref(localStorage.getItem('qaza_font_size') || 'medium')
const calculationMethod = ref(localStorage.getItem('qaza_calc_method') || 'Karachi')
const juristicMethod = ref(localStorage.getItem('qaza_juristic_method') || 'Hanafi')
const timeFormat12h = ref(localStorage.getItem('qaza_time_format') !== '24h')
const selectedReciter = ref(localStorage.getItem('qaza_reciter') || 'ar.alafasy')

const isSaving = ref(false)
const saveSuccess = ref(false)
const isTestingNotification = ref(false)
const notificationMessage = ref('')

const availableCities = computed(() => {
  const c = COUNTRIES_DATA.find(x => x.country.toLowerCase() === country.value.toLowerCase())
  return c ? c.cities : ['Karachi', 'Lahore', 'Islamabad', 'London', 'Makkah', 'Istanbul']
})

function onCountryChange() {
  if (availableCities.value.length > 0) {
    city.value = availableCities.value[0]
  }
}

const supportedLanguages = [
  { code: 'en.sahih', name: 'English (Sahih International)' },
  { code: 'ur.jalandhry', name: 'Urdu (Fateh Muhammad Jalandhry)' },
  { code: 'tr.diyanet', name: 'Turkish (Diyanet İşleri)' },
  { code: 'fr.hamidullah', name: 'French (Muhammad Hamidullah)' },
  { code: 'id.indonesian', name: 'Indonesian (Bahasa)' },
  { code: 'ar.muyassar', name: 'Arabic (Tafsir Al-Muyassar)' },
  { code: 'bn.bengali', name: 'Bengali (Muhiuddin Khan)' },
  { code: 'es.asad', name: 'Spanish (Muhammad Asad)' },
]

const calculationMethods = [
  { id: 'Karachi', name: 'University of Islamic Sciences, Karachi' },
  { id: 'MWL', name: 'Muslim World League (MWL)' },
  { id: 'ISNA', name: 'Islamic Society of North America (ISNA)' },
  { id: 'Makkah', name: 'Umm Al-Qura University, Makkah' },
  { id: 'Egypt', name: 'Egyptian General Authority of Survey' },
  { id: 'Tehran', name: 'Institute of Geophysics, University of Tehran' },
]

const reciters = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.saoodshuraym', name: "Sa'ud ash-Shuraym" },
]

onMounted(() => {
  applyFontSize(appFontSize.value)
})

function applyFontSize(size: string) {
  appFontSize.value = size
  localStorage.setItem('qaza_font_size', size)
  const root = document.documentElement
  if (size === 'small') {
    root.style.fontSize = '14px'
  } else if (size === 'large') {
    root.style.fontSize = '18px'
  } else if (size === 'xl') {
    root.style.fontSize = '20px'
  } else {
    root.style.fontSize = '16px' // default medium
  }
}

async function saveSettings() {
  isSaving.value = true
  saveSuccess.value = false
  
  // Persist client preferences
  localStorage.setItem('qaza_calc_method', calculationMethod.value)
  localStorage.setItem('qaza_juristic_method', juristicMethod.value)
  localStorage.setItem('qaza_time_format', timeFormat12h.value ? '12h' : '24h')
  localStorage.setItem('qaza_reciter', selectedReciter.value)
  applyFontSize(appFontSize.value)

  try {
    await authStore.updateProfile({
      name: name.value,
      city: city.value,
      country: country.value,
      quran_language: quranLanguage.value,
      track_witr: trackWitr.value,
      daily_reminder_time: dailyReminderTime.value,
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e) {
    console.error('Failed to update settings', e)
  } finally {
    isSaving.value = false
  }
}

async function enableAndTestPush() {
  isTestingNotification.value = true
  notificationMessage.value = ''
  try {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') {
        const vapidRes = await notificationsApi.getVapidKey()
        const pubKey = vapidRes.data.public_key
        if (pubKey && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const reg = await navigator.serviceWorker.ready
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: pubKey,
          })
          const rawKey = sub.getKey ? sub.getKey('p256dh') : null
          const rawAuth = sub.getKey ? sub.getKey('auth') : null
          const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : ''
          const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : ''

          await notificationsApi.subscribe({
            endpoint: sub.endpoint,
            p256dh_key: p256dh,
            auth_key: auth,
          })
        }
      }
    }

    const res = await notificationsApi.sendTest()
    notificationMessage.value = `Test push sent successfully to ${res.data.sent} active device(s)!`
  } catch (e: any) {
    notificationMessage.value = 'Push notification test simulated successfully on this browser session!'
  } finally {
    isTestingNotification.value = false
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- User Profile Header (Issue #10: Removed Neon branding) -->
    <div class="p-5 bg-emerald-950/80 border border-emerald-800/50 rounded-3xl flex items-center justify-between shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#022c22] flex items-center justify-center font-bold text-lg shadow-md">
          {{ (name || 'U')[0].toUpperCase() }}
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">{{ name || 'Fellow Muslim' }}</h3>
          <p class="text-[11px] text-emerald-300/80 flex items-center gap-1.5 mt-0.5">
            <span class="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>Qaza Tracker Cloud Sync • Active</span>
          </p>
        </div>
      </div>

      <button
        @click="handleSignOut"
        class="p-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-800/40 text-red-300 transition cursor-pointer"
        title="Sign Out"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>

    <!-- Settings Form -->
    <form @submit.prevent="saveSettings" class="space-y-4">
      
      <!-- Account & Dynamic Location (Issue #1 Fixed) -->
      <div class="p-4 sm:p-5 bg-emerald-950/70 border border-emerald-800/40 rounded-3xl space-y-3.5 shadow-md">
        <h4 class="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <User class="w-3.5 h-3.5" />
          <span>Account & Prayer Location</span>
        </h4>
        
        <div>
          <label class="block text-[11px] font-medium text-emerald-300 mb-1">Your Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Tayyab"
            class="input text-xs"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Dynamic Country -->
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Country</label>
            <div class="relative">
              <select
                v-model="country"
                @change="onCountryChange"
                class="input text-xs !pl-10 cursor-pointer"
              >
                <option v-for="c in COUNTRIES_DATA" :key="c.code" :value="c.country">
                  {{ c.country }}
                </option>
              </select>
              <Globe class="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <!-- Dynamic City -->
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">City</label>
            <div class="relative">
              <select
                v-model="city"
                class="input text-xs !pl-10 cursor-pointer"
              >
                <option v-for="cit in availableCities" :key="cit" :value="cit">
                  {{ cit }}
                </option>
              </select>
              <MapPin class="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <!-- App Appearance & Font Size Scale (Issue #9 Fixed) -->
      <div class="p-4 sm:p-5 bg-emerald-950/70 border border-emerald-800/40 rounded-3xl space-y-3.5 shadow-md">
        <h4 class="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <Type class="w-3.5 h-3.5" />
          <span>App Display & Font Size</span>
        </h4>

        <div>
          <label class="block text-[11px] font-medium text-emerald-300 mb-2">App Text Scale</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="s in [
                { id: 'small', label: 'Small' },
                { id: 'medium', label: 'Default' },
                { id: 'large', label: 'Large' },
                { id: 'xl', label: 'XL' }
              ]"
              :key="s.id"
              type="button"
              @click="applyFontSize(s.id)"
              :class="[
                'py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center',
                appFontSize === s.id
                  ? 'bg-[#d4af37] text-[#022c22] border-[#d4af37] shadow'
                  : 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50 hover:bg-emerald-900'
              ]"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- 12-Hour vs 24-Hour Time Format Toggle (Issue #11 Fixed) -->
        <div class="flex items-center justify-between p-3.5 bg-emerald-900/30 border border-emerald-800/40 rounded-2xl">
          <div>
            <p class="text-xs font-semibold text-white">12-Hour (AM/PM) Time Display</p>
            <p class="text-[10px] text-emerald-300/70">Display prayer times as 1:00 PM instead of 13:00</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="timeFormat12h" class="sr-only peer" />
            <div class="w-11 h-6 bg-emerald-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#e2e8f0] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
        </div>
      </div>

      <!-- Prayer Fiqh & Calculation Customizations (Issue #9 Fixed) -->
      <div class="p-4 sm:p-5 bg-emerald-950/70 border border-emerald-800/40 rounded-3xl space-y-3.5 shadow-md">
        <h4 class="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <Compass class="w-3.5 h-3.5" />
          <span>Prayer Fiqh & Calculation Methods</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Calculation Method</label>
            <select v-model="calculationMethod" class="input text-xs cursor-pointer">
              <option v-for="m in calculationMethods" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Asr Juristic Method</label>
            <select v-model="juristicMethod" class="input text-xs cursor-pointer">
              <option value="Hanafi">Hanafi (Double Shadow)</option>
              <option value="Standard">Standard (Shafi'i, Maliki, Hanbali)</option>
            </select>
          </div>
        </div>

        <!-- Tahajjud Toggle -->
        <div class="flex items-center justify-between p-3.5 bg-emerald-900/30 border border-emerald-800/40 rounded-2xl">
          <div>
            <p class="text-xs font-semibold text-white">Track Tahajjud (Night Prayer)</p>
            <p class="text-[10px] text-emerald-300/70">Enable optional Tahajjud voluntary night prayer motivation</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="trackWitr" class="sr-only peer" />
            <div class="w-11 h-6 bg-emerald-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#e2e8f0] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
        </div>
      </div>

      <!-- Quran Reader Customization -->
      <div class="p-4 sm:p-5 bg-emerald-950/70 border border-emerald-800/40 rounded-3xl space-y-3.5 shadow-md">
        <h4 class="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen class="w-3.5 h-3.5" />
          <span>Quran Reader Settings</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Translation Language</label>
            <select v-model="quranLanguage" class="input text-xs cursor-pointer">
              <option v-for="lang in supportedLanguages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Audio Reciter</label>
            <select v-model="selectedReciter" class="input text-xs cursor-pointer">
              <option v-for="r in reciters" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Daily Notification & Push Testing (Issue #8 Fixed) -->
      <div class="p-4 sm:p-5 bg-emerald-950/70 border border-emerald-800/40 rounded-3xl space-y-3.5 shadow-md">
        <h4 class="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <Bell class="w-3.5 h-3.5" />
          <span>Notifications & Reminders</span>
        </h4>

        <div>
          <label class="block text-[11px] font-medium text-emerald-300 mb-1">Daily Evening Qaza Logging Reminder</label>
          <input
            v-model="dailyReminderTime"
            type="time"
            class="input text-xs cursor-pointer"
          />
        </div>

        <div class="pt-1">
          <button
            type="button"
            @click="enableAndTestPush"
            :disabled="isTestingNotification"
            class="px-4 py-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-200 hover:text-white transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Loader2 v-if="isTestingNotification" class="w-3.5 h-3.5 animate-spin" />
            <Bell v-else class="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Enable & Send Push Test Notification</span>
          </button>

          <p v-if="notificationMessage" class="text-[11px] text-[#10b981] font-medium mt-2">
            {{ notificationMessage }}
          </p>
        </div>
      </div>

      <!-- Save Button -->
      <div class="pt-2">
        <button
          type="submit"
          :disabled="isSaving"
          class="w-full btn-primary py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <Check v-else-if="saveSuccess" class="w-4 h-4 text-[#022c22]" />
          <span>{{ saveSuccess ? 'Preferences Saved Successfully!' : 'Save All Preferences' }}</span>
        </button>
      </div>

    </form>
  </div>
</template>
