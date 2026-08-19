import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { usersApi, getApiBaseUrl } from '@/services/api'
import { triggerNativeGoogleSignIn } from '@/services/googleAuth'

export interface UserProfile {
  id: string
  auth_user_id: string
  name: string | null
  city: string | null
  country: string | null
  timezone: string | null
  track_witr: boolean
  quran_language: string
  onboarding_complete: boolean
  daily_reminder_time: string | null
  notifications_enabled: boolean
  joined_at: string
}

const API_BASE = getApiBaseUrl()

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('qaza_auth_token'))
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isOnboarded = computed(() => profile.value?.onboarding_complete ?? false)

  // Sign up with email + password
  async function signUp(email: string, password: string, name: string) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_BASE}/api/v1/auth/signup`, {
        email: email.trim(),
        password,
        name: name?.trim() || 'Fellow Muslim',
      })
      if (res.data?.token) {
        await _setSession(res.data.token)
      }
    } catch (e: any) {
      error.value = e.response?.data?.detail || e.message || 'Sign up failed'
      throw new Error(error.value || 'Sign up failed')
    } finally {
      loading.value = false
    }
  }

  // Sign in with email + password
  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_BASE}/api/v1/auth/login`, {
        email: email.trim(),
        password,
      })
      if (res.data?.token) {
        await _setSession(res.data.token)
      }
    } catch (e: any) {
      error.value = e.response?.data?.detail || e.message || 'Sign in failed'
      throw new Error(error.value || 'Sign in failed')
    } finally {
      loading.value = false
    }
  }

  // Request password reset OTP
  async function forgotPassword(email: string): Promise<string> {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_BASE}/api/v1/auth/forgot-password`, {
        email: email.trim(),
      })
      return res.data?.message || 'Verification code sent to your email.'
    } catch (e: any) {
      error.value = e.response?.data?.detail || e.message || 'Failed to send reset code'
      throw new Error(error.value || 'Failed to send reset code')
    } finally {
      loading.value = false
    }
  }

  // Verify OTP and reset password
  async function resetPassword(email: string, otp: string, newPassword: string) {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_BASE}/api/v1/auth/reset-password`, {
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      })
      if (res.data?.token) {
        await _setSession(res.data.token)
      }
      return res.data?.message || 'Password updated successfully'
    } catch (e: any) {
      error.value = e.response?.data?.detail || e.message || 'Password reset failed'
      throw new Error(error.value || 'Password reset failed')
    } finally {
      loading.value = false
    }
  }

  // Native Google OAuth Sign In
  async function signInWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const googleUser = await triggerNativeGoogleSignIn()
      const res = await axios.post(`${API_BASE}/api/v1/auth/google`, {
        email: googleUser.email,
        name: googleUser.name,
        id_token: googleUser.id_token,
      })
      if (res.data?.token) {
        await _setSession(res.data.token)
      }
    } catch (e: any) {
      error.value = e.response?.data?.detail || e.message || 'Google sign in failed'
      throw new Error(error.value || 'Google sign in failed')
    } finally {
      loading.value = false
    }
  }

  // Set token and load profile
  async function _setSession(newToken: string) {
    token.value = newToken
    localStorage.setItem('qaza_auth_token', newToken)
    await loadProfile()
  }

  // Load user profile from backend
  async function loadProfile() {
    if (!token.value) return
    try {
      const res = await usersApi.getMe()
      profile.value = res.data
    } catch (e) {
      console.error('Failed to load profile', e)
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    try {
      const res = await usersApi.updateMe(data as Record<string, unknown>)
      profile.value = res.data
    } catch (e) {
      console.error('Failed to update profile', e)
      throw e
    }
  }

  async function signOut() {
    token.value = null
    profile.value = null
    localStorage.removeItem('qaza_auth_token')
  }

  // Initialize on app load
  async function init() {
    if (token.value) {
      await loadProfile()
    }
  }

  return {
    token,
    profile,
    loading,
    error,
    isLoggedIn,
    isOnboarded,
    signUp,
    signIn,
    forgotPassword,
    resetPassword,
    signInWithGoogle,
    loadProfile,
    updateProfile,
    signOut,
    init,
  }
})
