<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Moon, Loader2, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, Mail } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

type AuthTab = 'login' | 'signup' | 'forgot_request' | 'forgot_verify'
const currentTab = ref<AuthTab>('login')

const email = ref('')
const password = ref('')
const name = ref('')
const otp = ref('')
const newPassword = ref('')

const isSubmitting = ref(false)
const isGoogleLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function switchTab(tab: AuthTab) {
  currentTab.value = tab
  errorMessage.value = ''
  successMessage.value = ''
}

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both your email and password.'
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await authStore.signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message || 'Incorrect email or password.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleSignUp() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter your email and a password.'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await authStore.signUp(email.value, password.value, name.value || 'Fellow Muslim')
    router.push('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message || 'Registration failed. Email may already be in use.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleForgotPasswordRequest() {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address to receive the verification code.'
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const msg = await authStore.forgotPassword(email.value)
    successMessage.value = msg
    currentTab.value = 'forgot_verify'
  } catch (err: any) {
    errorMessage.value = err.message || 'No account found with this email.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleResetPassword() {
  if (!otp.value || !newPassword.value) {
    errorMessage.value = 'Please enter the 6-digit code and your new password.'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = 'New password must be at least 6 characters long.'
    return
  }
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await authStore.resetPassword(email.value, otp.value, newPassword.value)
    successMessage.value = 'Password reset successful! Logging you in...'
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  } catch (err: any) {
    errorMessage.value = err.message || 'Invalid or expired code. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleGoogleLogin() {
  isGoogleLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    // Triggers official Google Identity Services native account chooser popup
    await authStore.signInWithGoogle()
    router.push('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message || 'Google sign-in was cancelled or encountered an error.'
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between items-center py-6 px-4">
    <!-- Top Nav Bar -->
    <div class="w-full max-w-md flex items-center justify-between mb-4">
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-white px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 transition cursor-pointer"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <div class="flex items-center gap-1 bg-emerald-950/80 p-1 rounded-2xl border border-emerald-800/50 text-xs">
        <button
          @click="switchTab('login')"
          :class="[
            'px-3 py-1 rounded-xl font-bold transition cursor-pointer',
            currentTab === 'login' ? 'bg-[#d4af37] text-[#022c22] shadow' : 'text-emerald-300 hover:text-white'
          ]"
        >
          Log In
        </button>
        <button
          @click="switchTab('signup')"
          :class="[
            'px-3 py-1 rounded-xl font-bold transition cursor-pointer',
            currentTab === 'signup' ? 'bg-[#d4af37] text-[#022c22] shadow' : 'text-emerald-300 hover:text-white'
          ]"
        >
          Sign Up
        </button>
      </div>
    </div>

    <!-- Main Card -->
    <div class="w-full max-w-md bg-[#0a3d2e]/85 backdrop-blur-2xl border border-emerald-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
      
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#d4af37]/30 to-emerald-800/40 border border-[#d4af37]/40 flex items-center justify-center shadow-lg">
          <Moon class="w-7 h-7 text-[#d4af37]" />
        </div>
        <h2 class="text-2xl font-bold text-white tracking-wide">
          <span v-if="currentTab === 'login'">Welcome Back</span>
          <span v-else-if="currentTab === 'signup'">Create Account</span>
          <span v-else-if="currentTab === 'forgot_request'">Reset Password</span>
          <span v-else>Verify & New Password</span>
        </h2>
        <p class="text-xs text-emerald-200/80">
          <span v-if="currentTab === 'login'">Access your missed prayers and daily schedule</span>
          <span v-else-if="currentTab === 'signup'">Start tracking your Qaza prayers with cloud sync</span>
          <span v-else-if="currentTab === 'forgot_request'">Enter your email to receive a 6-digit verification code</span>
          <span v-else>Enter the code sent to your email to set a new password</span>
        </p>
      </div>

      <!-- Warning / Error Banner -->
      <div
        v-if="errorMessage"
        class="p-3.5 bg-red-950/85 border border-red-500/60 rounded-xl flex items-start gap-2.5 text-xs text-red-200 shadow-md animate-fade-in"
      >
        <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div class="leading-relaxed font-medium">{{ errorMessage }}</div>
      </div>

      <!-- Success Banner -->
      <div
        v-if="successMessage"
        class="p-3.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200 shadow-md animate-fade-in"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div class="leading-relaxed font-medium">{{ successMessage }}</div>
      </div>

      <!-- GOOGLE AUTH BUTTON -->
      <div v-if="currentTab === 'login' || currentTab === 'signup'" class="space-y-4">
        <button
          @click="handleGoogleLogin"
          :disabled="isSubmitting || isGoogleLoading"
          type="button"
          class="w-full py-3 bg-emerald-950/90 hover:bg-emerald-900/80 border border-emerald-600/50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition cursor-pointer shadow-sm hover:border-[#d4af37]/60 active:scale-98"
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
          <div class="flex-1 h-px bg-emerald-800/80"></div>
          <span class="text-[10px] text-emerald-400/80 uppercase font-semibold tracking-wider">or with email</span>
          <div class="flex-1 h-px bg-emerald-800/80"></div>
        </div>
      </div>

      <!-- TAB 1: LOGIN FORM -->
      <form v-if="currentTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="input text-xs"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-[11px] font-semibold text-emerald-200">Password</label>
            <button
              type="button"
              @click="switchTab('forgot_request')"
              class="text-[11px] text-[#d4af37] hover:underline cursor-pointer font-medium"
            >
              Forgot password?
            </button>
          </div>
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
          :disabled="isSubmitting || isGoogleLoading"
          class="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span v-else>Log In</span>
        </button>

        <div class="text-center pt-2">
          <button
            type="button"
            @click="switchTab('signup')"
            class="text-xs text-emerald-300 hover:text-[#d4af37] transition cursor-pointer"
          >
            Don't have an account? <strong class="text-[#d4af37] underline">Sign Up</strong>
          </button>
        </div>
      </form>

      <!-- TAB 2: SIGNUP FORM -->
      <form v-else-if="currentTab === 'signup'" @submit.prevent="handleSignUp" class="space-y-4">
        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">Your Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Abdullah"
            class="input text-xs"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="input text-xs"
          />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">Create Password (Min 6 chars)</label>
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
          :disabled="isSubmitting || isGoogleLoading"
          class="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span v-else>Create Account</span>
        </button>

        <div class="text-center pt-2">
          <button
            type="button"
            @click="switchTab('login')"
            class="text-xs text-emerald-300 hover:text-[#d4af37] transition cursor-pointer"
          >
            Already have an account? <strong class="text-[#d4af37] underline">Log In</strong>
          </button>
        </div>
      </form>

      <!-- TAB 3: FORGOT PASSWORD REQUEST -->
      <form v-else-if="currentTab === 'forgot_request'" @submit.prevent="handleForgotPasswordRequest" class="space-y-4">
        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">Your Registered Email</label>
          <div class="relative">
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="input text-xs pl-9"
            />
            <Mail class="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <span v-else>Send 6-Digit Code</span>
        </button>

        <div class="text-center pt-2">
          <button
            type="button"
            @click="switchTab('login')"
            class="text-xs text-emerald-300 hover:text-[#d4af37] flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" /> Back to Log In
          </button>
        </div>
      </form>

      <!-- TAB 4: FORGOT PASSWORD VERIFY -->
      <form v-else-if="currentTab === 'forgot_verify'" @submit.prevent="handleResetPassword" class="space-y-4">
        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">6-Digit Code from Email</label>
          <div class="relative">
            <input
              v-model="otp"
              type="text"
              required
              maxlength="6"
              placeholder="123456"
              class="input text-xs pl-9 tracking-widest font-mono font-bold"
            />
            <KeyRound class="w-4 h-4 text-[#d4af37] absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-emerald-200 mb-1">New Password (Min 6 chars)</label>
          <input
            v-model="newPassword"
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
          <span v-else>Reset Password & Log In</span>
        </button>

        <div class="text-center pt-2 flex items-center justify-between">
          <button
            type="button"
            @click="switchTab('forgot_request')"
            class="text-xs text-emerald-300 hover:text-[#d4af37] cursor-pointer"
          >
            Resend Code
          </button>
          <button
            type="button"
            @click="switchTab('login')"
            class="text-xs text-emerald-300 hover:text-[#d4af37] cursor-pointer"
          >
            Back to Log In
          </button>
        </div>
      </form>

    </div>
  </div>
</template>
