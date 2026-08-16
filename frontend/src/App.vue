<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Sparkles,
  History as HistoryIcon,
  Settings as SettingsIcon,
  User,
  LogOut,
  ChevronDown,
  MapPin
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isPublicRoute = computed(() => route.meta.public === true)
const showProfileMenu = ref(false)
const profileMenuRef = ref<HTMLElement | null>(null)

const navItems = [
  { name: 'dashboard', label: 'Tracker', path: '/dashboard', icon: LayoutDashboard },
  { name: 'daily-log', label: 'Daily Log', path: '/daily-log', icon: CalendarDays },
  { name: 'quran', label: 'Quran Reader', path: '/quran', icon: BookOpen },
  { name: 'ai', label: 'AI Scholar', path: '/ai', icon: Sparkles },
  { name: 'history', label: 'History & Stats', path: '/history', icon: HistoryIcon },
  { name: 'settings', label: 'Settings', path: '/settings', icon: SettingsIcon },
]

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}

function handleMenuAction(path: string) {
  showProfileMenu.value = false
  router.push(path)
}

function handleSignOut() {
  showProfileMenu.value = false
  authStore.signOut()
  router.push('/login')
}

function handleClickOutside(event: MouseEvent) {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="min-h-screen bg-[#022c22] text-[#e2e8f0] font-sans flex flex-col md:flex-row justify-start selection:bg-[#d4af37]/30">
    
    <!-- DESKTOP SIDEBAR (Visible on md+ screens) -->
    <aside
      v-if="!isPublicRoute"
      class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-[#0a3d2e]/90 backdrop-blur-2xl border-r border-emerald-800/40 z-50 p-5 justify-between shadow-2xl"
    >
      <!-- Logo & Branding -->
      <div class="space-y-6">
        <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/dashboard')">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-emerald-950/80 border border-[#d4af37]/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <span class="text-2xl font-bold text-[#d4af37] font-arabic">ق</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold tracking-wide text-white leading-tight">Qaza Tracker</h1>
            <p class="text-[10px] text-[#d4af37] font-semibold tracking-wider uppercase">Prayer Accountability</p>
          </div>
        </div>

        <!-- City / Sync Info Card -->
        <div class="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl flex items-center justify-between">
          <div class="flex items-center gap-2 truncate text-xs text-emerald-200">
            <MapPin class="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <span class="truncate font-medium">{{ authStore.profile?.city || 'Location Pending' }}</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-[9px] text-emerald-300 font-semibold shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Live</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="router.push(item.path)"
            :class="[
              'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer text-left',
              route.path === item.path
                ? 'bg-gradient-to-r from-[#d4af37]/25 to-emerald-900/50 text-white border border-[#d4af37]/40 shadow-md translate-x-1'
                : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/40'
            ]"
          >
            <component
              :is="item.icon"
              class="w-4.5 h-4.5 transition-transform"
              :class="route.path === item.path ? 'text-[#d4af37] scale-110' : 'text-emerald-400'"
            />
            <span class="tracking-wide">{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <!-- User Profile Drawer & Logout Footer -->
      <div class="pt-4 border-t border-emerald-800/40 space-y-3">
        <div class="flex items-center justify-between p-2 rounded-2xl bg-emerald-950/60 border border-emerald-800/40">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#022c22] flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
              <User class="w-4 h-4" />
            </div>
            <div class="truncate">
              <p class="text-xs font-bold text-white truncate">{{ authStore.profile?.name || 'Fellow Muslim' }}</p>
              <p class="text-[10px] text-emerald-300/70 truncate">Logged in</p>
            </div>
          </div>
          <button
            @click="handleSignOut"
            title="Log Out"
            class="p-2 text-emerald-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>


      </div>
    </aside>

    <!-- MAIN CONTENT CONTAINER (Aligned with responsive padding) -->
    <div :class="['flex-1 flex flex-col h-screen overflow-hidden relative w-full', !isPublicRoute ? 'md:pl-64' : '']">
      
      <!-- Top Mobile/Tablet Header -->
      <header
        v-if="!isPublicRoute"
        class="py-3 px-4 sm:px-6 flex items-center justify-between border-b border-emerald-900/40 bg-[#022c22]/95 backdrop-blur-md sticky top-0 z-40 md:hidden"
      >
        <!-- Mobile Logo -->
        <div class="flex items-center space-x-2.5 cursor-pointer" @click="router.push('/dashboard')">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-emerald-900/40 border border-[#d4af37]/40 flex items-center justify-center shadow-inner">
            <span class="text-base font-bold text-[#d4af37] font-arabic">ق</span>
          </div>
          <div>
            <h1 class="text-sm font-bold text-white leading-tight">Qaza Tracker</h1>
            <p class="text-[9px] text-[#d4af37] font-medium">{{ authStore.profile?.city || 'Live' }}</p>
          </div>
        </div>

        <!-- Mobile Profile Dropdown -->
        <div class="relative" ref="profileMenuRef">
          <button
            @click.stop="toggleProfileMenu"
            class="flex items-center gap-1.5 py-1 px-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-700/60 transition cursor-pointer"
          >
            <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#022c22] flex items-center justify-center font-bold text-[10px]">
              <User class="w-3 h-3" />
            </div>
            <ChevronDown class="w-3 h-3 text-emerald-400" />
          </button>

          <!-- Mobile Dropdown Card -->
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-56 bg-[#0a3d2e]/95 backdrop-blur-2xl border border-emerald-700/60 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-emerald-900/60 text-xs"
            >
              <div class="p-2.5">
                <p class="font-bold text-white text-xs truncate">{{ authStore.profile?.name || 'Fellow Muslim' }}</p>
                <p class="text-[10px] text-emerald-300/80 truncate">{{ authStore.profile?.city || 'Location not set' }}</p>
              </div>

              <div class="py-1">
                <button
                  @click="handleMenuAction('/settings')"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-100 hover:text-[#d4af37] hover:bg-emerald-900/60 transition cursor-pointer text-left"
                >
                  <SettingsIcon class="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account Settings</span>
                </button>
              </div>

              <div class="pt-1">
                <button
                  @click="handleSignOut"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-950/60 transition cursor-pointer text-left font-medium"
                >
                  <LogOut class="w-3.5 h-3.5 text-red-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </header>

      <!-- VIEW SLOT -->
      <main :class="[
        'flex-1 w-full mx-auto animate-fade-in',
        (route.path === '/ai' || route.path === '/quran')
          ? 'flex flex-col overflow-hidden h-full px-3 sm:px-5 lg:px-8 pt-3 pb-3 max-w-5xl'
          : 'max-w-5xl px-4 sm:px-6 lg:px-8 py-4 pb-28 md:pb-12 overflow-y-auto'
      ]">
        <RouterView />
      </main>

      <!-- MOBILE BOTTOM FLOATING NAVIGATION (Hidden on /ai and /quran) -->
      <nav
        v-if="!isPublicRoute && route.path !== '/ai' && route.path !== '/quran'"
        class="md:hidden fixed bottom-3 left-4 right-4 max-w-md mx-auto bg-[#0a3d2e]/95 backdrop-blur-2xl border border-emerald-700/60 rounded-3xl z-50 p-1.5 shadow-2xl"
      >
        <div class="grid grid-cols-6 h-12">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="router.push(item.path)"
            :title="item.label"
            :class="[
              'flex items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer relative',
              route.path === item.path
                ? 'bg-emerald-950 text-[#d4af37] border border-[#d4af37]/40 shadow-inner'
                : 'text-emerald-300/70 hover:text-white hover:bg-emerald-900/40'
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 transition-transform"
              :class="route.path === item.path ? 'scale-115 text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''"
            />
            <!-- Tiny Active Indicator Dot -->
            <span
              v-if="route.path === item.path"
              class="absolute bottom-1 w-1 h-1 rounded-full bg-[#d4af37] animate-pulse"
            ></span>
          </button>
        </div>
      </nav>

    </div>
  </div>
</template>
