<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { notificationsApi } from '@/services/api'
import { COUNTRIES_DATA } from '@/utils/locations'
import {
  Sparkles,
  MapPin,
  Globe,
  Bell,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Moon,
  Loader2
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Step 2 Auth form state
const authMode = ref<'signup' | 'login'>('signup')
const email = ref('')
const password = ref('')
const authName = ref('')

// Step 3 Personalization state
const userName = ref('')
const userCountry = ref('Pakistan')
const userCity = ref('Karachi')
const trackWitr = ref(true)

// Dynamically compute cities for selected country
const availableCities = computed(() => {
  const c = COUNTRIES_DATA.find(x => x.country.toLowerCase() === userCountry.value.toLowerCase())
  return c ? c.cities : ['Karachi', 'Lahore', 'Islamabad', 'London', 'Makkah', 'Istanbul']
})

function onCountryChange() {
  if (availableCities.value.length > 0) {
    userCity.value = availableCities.value[0]
  }
}

function selectCity(city: string) {
  userCity.value = city
}

async function handleAuth() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please provide both email and password.'
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    if (authMode.value === 'signup') {
      await authStore.signUp(email.value, password.value, authName.value || 'Fellow Muslim')
    } else {
      await authStore.signIn(email.value, password.value)
    }
    currentStep.value = 3
  } catch (err: any) {
    errorMessage.value = err.message || 'Authentication failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const isGoogleLoading = ref(false)

async function handleGoogleLogin() {
  isGoogleLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.signInWithGoogle()
    currentStep.value = 3
  } catch (err: any) {
    errorMessage.value = err.message || 'Google sign-in was cancelled or encountered an error.'
  } finally {
    isGoogleLoading.value = false
  }
}

async function savePersonalization() {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await authStore.updateProfile({
      name: userName.value || authName.value || 'Fellow Muslim',
      city: userCity.value,
      country: userCountry.value,
      track_witr: trackWitr.value,
    })
    currentStep.value = 4
  } catch (err: any) {
    errorMessage.value = err.message || 'Could not save profile.'
  } finally {
    isSubmitting.value = false
  }
}

// Fixed Step 4: Non-hanging Push Notification Registration
async function requestNotificationPermission() {
  isSubmitting.value = true
  
  const registrationPromise = (async () => {
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
            await authStore.updateProfile({ notifications_enabled: true })
          }
        }
      }
    } catch (e) {
      console.log('Notification permission note:', e)
    }
  })()

  // Always timeout after 1.5 seconds so user is never blocked
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1200))
  
  try {
    await Promise.race([registrationPromise, timeoutPromise])
  } finally {
    isSubmitting.value = false
    currentStep.value = 5
  }
}

async function finishOnboarding() {
  try {
    await authStore.updateProfile({ onboarding_complete: true })
  } catch (e) {
    console.error(e)
  }
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center py-6 px-4">
    <div class="w-full max-w-md bg-[#0a3d2e]/85 backdrop-blur-2xl border border-emerald-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      <!-- Progress Bar (Steps 1 to 5) -->
      <div class="flex items-center justify-between gap-1.5 px-2">
        <div
          v-for="s in 5"
          :key="s"
          :class="[
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            s <= currentStep ? 'bg-[#d4af37]' : 'bg-emerald-950/80 border border-emerald-800/40'
          ]"
        ></div>
      </div>

      <!-- Error message banner -->
      <div
        v-if="errorMessage"
        class="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 font-medium"
      >
        {{ errorMessage }}
      </div>

      <!-- STEP 1: Welcome & Hook -->
      <div v-if="currentStep === 1" class="text-center space-y-6">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37]/30 to-emerald-800/40 border border-[#d4af37]/40 flex items-center justify-center shadow-lg">
            <Moon class="w-8 h-8 text-[#d4af37]" />
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-white tracking-wide">Qaza Tracker</h2>
          <p class="text-xs text-emerald-100/80 leading-relaxed max-w-xs mx-auto">
            Calculate, track, and complete your missed prayers systematically with cloud sync and AI guidance.
          </p>
        </div>

        <div class="space-y-2.5 text-left p-4 bg-emerald-950/60 border border-emerald-800/50 rounded-2xl text-xs text-emerald-200">
          <div class="flex items-center gap-2.5">
            <CheckCircle2 class="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Automatic cloud backup via Neon DB</span>
          </div>
          <div class="flex items-center gap-2.5">
            <CheckCircle2 class="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>Accurate city-based prayer schedules</span>
          </div>
          <div class="flex items-center gap-2.5">
            <CheckCircle2 class="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>AI Islamic Scholar & Qaza calculations</span>
          </div>
        </div>

        <button
          @click="currentStep = 2"
          class="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <span>Get Started</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- STEP 2: Sign Up / Sign In -->
      <div v-else-if="currentStep === 2" class="space-y-5">
        <div class="text-center space-y-1">
          <h2 class="text-xl font-bold text-white">
            {{ authMode === 'signup' ? 'Create Your Account' : 'Welcome Back' }}
          </h2>
          <p class="text-xs text-emerald-100/70">
            {{ authMode === 'signup' ? 'Sync your prayers across all devices' : 'Sign in to access your saved tracker' }}
          </p>
        </div>

        <!-- Google OAuth Button -->
        <button
          @click="handleGoogleLogin"
          :disabled="isSubmitting || isGoogleLoading"
          class="w-full py-3 bg-emerald-950/80 hover:bg-emerald-900/70 border border-emerald-700/60 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition cursor-pointer active:scale-98"
        >
          <Loader2 v-if="isGoogleLoading" class="w-4 h-4 animate-spin text-[#d4af37]" />
          <template v-else>
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-1.9.4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"/>
            </svg>
            <span>Continue with Google</span>
          </template>
        </button>

        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-emerald-800/60"></div>
          <span class="text-[10px] text-emerald-300/70 uppercase tracking-wider">or with email</span>
          <div class="flex-1 h-px bg-emerald-800/60"></div>
        </div>

        <form @submit.prevent="handleAuth" class="space-y-3.5">
          <div v-if="authMode === 'signup'">
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Your Name</label>
            <input
              v-model="authName"
              type="text"
              placeholder="e.g. Tayyab"
              class="input text-xs"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Email Address</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="input text-xs"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="input text-xs"
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else>{{ authMode === 'signup' ? 'Create Account' : 'Sign In' }}</span>
          </button>
        </form>

        <div class="text-center pt-2">
          <button
            type="button"
            @click="authMode = authMode === 'signup' ? 'login' : 'signup'"
            class="text-xs text-[#d4af37] hover:underline cursor-pointer"
          >
            {{ authMode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
          </button>
        </div>
      </div>

      <!-- STEP 3: Personalization & Dynamic Country / City -->
      <div v-else-if="currentStep === 3" class="space-y-5">
        <div class="text-center space-y-1">
          <h2 class="text-xl font-bold text-white">Prayer Configuration</h2>
          <p class="text-xs text-emerald-100/70">Tailor prayer times to your specific country and city</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Preferred Name</label>
            <input
              v-model="userName"
              type="text"
              placeholder="How should the app greet you?"
              class="input text-xs"
            />
          </div>

          <!-- Dynamic Country Selector -->
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">Country</label>
            <div class="relative">
              <select
                v-model="userCountry"
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

          <!-- Dynamic City Selector -->
          <div>
            <label class="block text-[11px] font-medium text-emerald-300 mb-1">City for Prayer Times</label>
            <div class="relative">
              <input
                v-model="userCity"
                type="text"
                placeholder="Select or enter city..."
                class="input text-xs !pl-10"
              />
              <MapPin class="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <!-- Dynamic City Chips based on selected country -->
            <div class="flex flex-wrap gap-1.5 mt-2.5">
              <button
                v-for="city in availableCities"
                :key="city"
                type="button"
                @click="selectCity(city)"
                :class="[
                  'text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer',
                  userCity === city
                    ? 'bg-[#d4af37] text-emerald-950 font-bold border-[#d4af37]'
                    : 'bg-emerald-950/70 text-emerald-200/80 border-emerald-700/40 hover:border-emerald-500'
                ]"
              >
                {{ city }}
              </button>
            </div>
          </div>
        </div>

        <button
          @click="savePersonalization"
          :disabled="isSubmitting"
          class="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span v-else>Continue</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- STEP 4: Notifications Permission -->
      <div v-else-if="currentStep === 4" class="text-center space-y-6">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center">
            <Bell class="w-8 h-8 text-[#d4af37]" />
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-bold text-white">Daily Salah & Qaza Reminders</h2>
          <p class="text-xs text-emerald-100/70 max-w-xs mx-auto leading-relaxed">
            Receive timely alerts 5 minutes before each prayer and an evening reminder to log your completed Qaza prayers.
          </p>
        </div>

        <div class="space-y-3">
          <button
            @click="requestNotificationPermission"
            :disabled="isSubmitting"
            class="w-full btn-primary py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else>Enable Reminders</span>
          </button>

          <button
            @click="currentStep = 5"
            type="button"
            class="text-xs text-emerald-300/70 hover:text-emerald-200 cursor-pointer block mx-auto pt-1"
          >
            Skip for now
          </button>
        </div>
      </div>

      <!-- STEP 5: Aha! Moment -->
      <div v-else-if="currentStep === 5" class="text-center space-y-6">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-emerald-900/60 border border-[#d4af37] flex items-center justify-center animate-pulse-gold">
            <Sparkles class="w-8 h-8 text-[#d4af37]" />
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-white font-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
          <p class="text-xs text-emerald-100 font-medium">
            You're all set, {{ userName || 'Fellow Muslim' }}!
          </p>
          <p class="text-[11px] text-emerald-200/70 max-w-xs mx-auto">
            "Indeed, prayer has been decreed upon the believers a decree of specified times." (Surah An-Nisa: 103)
          </p>
        </div>

        <button
          @click="finishOnboarding"
          class="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
        >
          <span>Open Dashboard</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Back button for steps > 1 -->
      <div v-if="currentStep > 1 && currentStep < 5" class="mt-4 text-center">
        <button
          @click="currentStep--"
          class="inline-flex items-center gap-1 text-[11px] text-emerald-300/60 hover:text-emerald-200 cursor-pointer"
        >
          <ArrowLeft class="w-3 h-3" />
          <span>Back</span>
        </button>
      </div>

    </div>
  </div>
</template>
