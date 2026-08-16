<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { quranApi } from '@/services/api'
import {
  BookOpen,
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Bookmark,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  FileText,
  Volume2,
  Sparkles
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

type QuranViewMode = 'home' | 'surah_index' | 'juz_index' | 'reader'
const currentView = ref<QuranViewMode>('home')

const currentPage = ref(1)
const selectedLanguage = ref(authStore.profile?.quran_language || 'en.sahih')
const isLoadingPage = ref(false)
const searchQuery = ref('')

interface AyahData {
  number: number
  numberInSurah: number
  text: string
  translationText?: string
  surah: {
    number: number
    name: string
    englishName: string
  }
  juz: number
  page: number
}

const pageAyahs = ref<AyahData[]>([])
const surahs = ref<Array<{ number: number; name: string; englishName: string; numberOfAyahs: number }>>([])

// Last Read Bookmark (tracks page, surah, ayah, juz)
const lastRead = ref<{ page: number; surah: number; surahName: string; ayah: number; juz: number } | null>(null)

// 30 Juz Directory
const JUZ_LIST = [
  { juz: 1, name: 'Alif Lam Meem', arabic: 'الم', page: 1, surahName: 'Al-Fatihah' },
  { juz: 2, name: 'Sayaqool', arabic: 'سَيَقُولُ', page: 22, surahName: 'Al-Baqarah' },
  { juz: 3, name: 'Tilkal Rusul', arabic: 'تِلْكَ الرُّسُلُ', page: 42, surahName: 'Al-Baqarah' },
  { juz: 4, name: 'Lan Tanaloo', arabic: 'لَنْ تَنَالُوا', page: 62, surahName: "Ali 'Imran" },
  { juz: 5, name: 'Wal Muhsanat', arabic: 'وَالْمُحْصَنَاتُ', page: 82, surahName: 'An-Nisa' },
  { juz: 6, name: 'La Yuhibbullah', arabic: 'لَا يُحِبُّ اللَّهُ', page: 102, surahName: 'An-Nisa' },
  { juz: 7, name: 'Wa Iza Samiu', arabic: 'وَإِذَا سَمِعُوا', page: 121, surahName: "Al-Ma'idah" },
  { juz: 8, name: 'Wa Law Annana', arabic: 'وَلَوْ أَنَّنَا', page: 142, surahName: "Al-An'am" },
  { juz: 9, name: 'Qalal Malao', arabic: 'قَالَ الْمَلَأُ', page: 162, surahName: "Al-A'raf" },
  { juz: 10, name: 'Wa Alamu', arabic: 'وَاعْلَمُوا', page: 182, surahName: 'Al-Anfal' },
  { juz: 11, name: 'Yatazeroon', arabic: 'يَعْتَذِرُونَ', page: 201, surahName: 'At-Tawbah' },
  { juz: 12, name: 'Wa Ma Min Dabbah', arabic: 'وَمَا مِنْ دَابَّةٍ', page: 222, surahName: 'Hud' },
  { juz: 13, name: 'Wa Ma Ubarri-u', arabic: 'وَمَا أُبَرِّئُ', page: 242, surahName: 'Yusuf' },
  { juz: 14, name: 'Rubama', arabic: 'رُبَمَا', page: 262, surahName: 'Al-Hijr' },
  { juz: 15, name: 'Subhanallazi', arabic: 'سُبْحَانَ الَّذِي', page: 282, surahName: 'Al-Isra' },
  { juz: 16, name: 'Qal Alam', arabic: 'قَالَ أَلَمْ', page: 302, surahName: 'Al-Kahf' },
  { juz: 17, name: 'Iqtaraba Lin Nasi', arabic: 'اقْتَرَبَ لِلنَّاسِ', page: 322, surahName: 'Al-Anbiya' },
  { juz: 18, name: 'Qad Aflaha', arabic: 'قَدْ أَفْلَحَ', page: 342, surahName: "Al-Mu'minun" },
  { juz: 19, name: 'Wa Qalal Lazina', arabic: 'وَقَالَ الَّذِينَ', page: 362, surahName: 'Al-Furqan' },
  { juz: 20, name: 'Amman Khalaqa', arabic: 'أَمَّنْ خَلَقَ', page: 382, surahName: 'An-Naml' },
  { juz: 21, name: 'Utlu Ma Oohiya', arabic: 'اتْلُ مَا أُوحِيَ', page: 402, surahName: "Al-'Ankabut" },
  { juz: 22, name: 'Wa Man Yaqnut', arabic: 'وَمَنْ يَقْنُتْ', page: 422, surahName: 'Al-Ahzab' },
  { juz: 23, name: 'Wa Maliya', arabic: 'وَمَا لِيَ', page: 442, surahName: 'Ya-Sin' },
  { juz: 24, name: 'Faman Azlamu', arabic: 'فَمَنْ أَظْلَمُ', page: 462, surahName: 'Az-Zumar' },
  { juz: 25, name: 'Ilayhi Yuraddu', arabic: 'إِلَيْهِ يُرَدُّ', page: 482, surahName: 'Fussilat' },
  { juz: 26, name: 'Ha-Meem', arabic: 'حم', page: 502, surahName: 'Al-Ahqaf' },
  { juz: 27, name: 'Qala Fama Khatbukum', arabic: 'قَالَ فَمَا خَطْبُكُمْ', page: 522, surahName: 'Adh-Dhariyat' },
  { juz: 28, name: 'Qad Sami Allah', arabic: 'قَدْ سَمِعَ اللَّهُ', page: 542, surahName: 'Al-Mujadila' },
  { juz: 29, name: 'Tabarakallazi', arabic: 'تَبَارَكَ الَّذِي', page: 562, surahName: 'Al-Mulk' },
  { juz: 30, name: 'Amma Yatasa-aloon', arabic: 'عَمَّ يَتَسَاءَلُونَ', page: 582, surahName: 'An-Naba' },
]

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

onMounted(async () => {
  loadBookmark()
  await loadSurahsList()
})

watch(currentPage, (newPage) => {
  if (currentView.value === 'reader') {
    loadPageData(newPage)
  }
})

watch(selectedLanguage, () => {
  if (currentView.value === 'reader') {
    loadPageData(currentPage.value)
  }
})

function loadBookmark() {
  const saved = localStorage.getItem('qaza_quran_last_read_v2')
  if (saved) {
    try {
      lastRead.value = JSON.parse(saved)
    } catch (e) {}
  } else {
    // Default bookmark at Page 1
    lastRead.value = { page: 1, surah: 1, surahName: 'Al-Fatihah', ayah: 1, juz: 1 }
  }
}

function saveCurrentPageBookmark() {
  if (pageAyahs.value.length > 0) {
    const firstAyah = pageAyahs.value[0]
    const data = {
      page: currentPage.value,
      surah: firstAyah.surah.number,
      surahName: firstAyah.surah.englishName,
      ayah: firstAyah.numberInSurah,
      juz: firstAyah.juz,
    }
    lastRead.value = data
    localStorage.setItem('qaza_quran_last_read_v2', JSON.stringify(data))
  }
}

async function loadSurahsList() {
  try {
    const res = await quranApi.listSurahs()
    if (res.data) {
      surahs.value = res.data
    }
  } catch (e) {
    console.error('Failed to load surahs list', e)
  }
}

async function loadPageData(pageNum: number) {
  if (pageNum < 1) pageNum = 1
  if (pageNum > 604) pageNum = 604
  currentPage.value = pageNum
  isLoadingPage.value = true

  try {
    const res = await quranApi.getPage(pageNum, selectedLanguage.value)
    if (res.data && Array.isArray(res.data) && res.data.length >= 2) {
      const arabicAyahs = res.data[0].ayahs || []
      const transAyahs = res.data[1].ayahs || []

      const paired: AyahData[] = []
      for (let i = 0; i < arabicAyahs.length; i++) {
        paired.push({
          number: arabicAyahs[i].number,
          numberInSurah: arabicAyahs[i].numberInSurah,
          text: arabicAyahs[i].text,
          translationText: transAyahs[i]?.text || '',
          surah: arabicAyahs[i].surah,
          juz: arabicAyahs[i].juz,
          page: arabicAyahs[i].page,
        })
      }
      pageAyahs.value = paired
      saveCurrentPageBookmark()
    }
  } catch (e) {
    console.error('Failed to load page data', e)
  } finally {
    isLoadingPage.value = false
  }
}

function openResume() {
  const targetPage = lastRead.value?.page || 1
  currentPage.value = targetPage
  currentView.value = 'reader'
  loadPageData(targetPage)
}

async function openSurah(surahNum: number) {
  currentView.value = 'reader'
  isLoadingPage.value = true
  try {
    const res = await quranApi.getAyah(surahNum, 1)
    let pageNum = 1
    if (res.data && Array.isArray(res.data) && res.data[0]?.page) {
      pageNum = res.data[0].page
    } else if (res.data?.page) {
      pageNum = res.data.page
    }
    currentPage.value = pageNum
    await loadPageData(pageNum)
  } catch (e) {
    currentPage.value = 1
    await loadPageData(1)
  }
}

function openJuz(juzItem: typeof JUZ_LIST[0]) {
  currentPage.value = juzItem.page
  currentView.value = 'reader'
  loadPageData(juzItem.page)
}

function nextPage() {
  if (currentPage.value < 604) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const currentSurahHeader = computed(() => {
  if (pageAyahs.value.length > 0) {
    return pageAyahs.value[0].surah
  }
  return { number: 1, name: 'سورة الفاتحة', englishName: 'Al-Fatihah' }
})

const currentJuzNumber = computed(() => {
  if (pageAyahs.value.length > 0) {
    return pageAyahs.value[0].juz
  }
  return 1
})

const filteredSurahs = computed(() => {
  if (!searchQuery.value) return surahs.value
  const q = searchQuery.value.toLowerCase()
  return surahs.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.englishName.toLowerCase().includes(q) ||
    s.number.toString().includes(q)
  )
})
</script>

<template>
  <div class="space-y-6">
    
    <!-- 1. QURAN ENTRY HUB (3 Main Action Buttons Only) -->
    <div v-if="currentView === 'home'" class="space-y-5 animate-fade-in py-4">
      
      <!-- Hub Header -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#d4af37]/30 to-emerald-800/40 border border-[#d4af37]/40 flex items-center justify-center shadow-xl">
          <BookOpen class="w-8 h-8 text-[#d4af37]" />
        </div>
        <h2 class="text-2xl font-bold text-white font-arabic">الْقُرْآن الْكَرِيم</h2>
        <p class="text-xs text-emerald-200/80 max-w-xs mx-auto">
          The Noble Quran • 16-Line Classical Mushaf with Dual Page Translations
        </p>
      </div>

      <!-- 3 Main Action Cards -->
      <div class="grid grid-cols-1 gap-3.5 max-w-md mx-auto pt-2">
        
        <!-- Action 1: Resume Reading -->
        <button
          @click="openResume"
          class="p-5 bg-gradient-to-r from-emerald-950 via-[#0a3d2e] to-emerald-950 hover:to-emerald-900 border border-[#d4af37]/50 rounded-3xl text-left transition duration-200 cursor-pointer group shadow-xl flex items-center justify-between active:scale-98"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 group-hover:scale-105 transition-transform">
              <RotateCcw class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider">Continue Reading</span>
              <h3 class="text-base font-extrabold text-white group-hover:text-[#d4af37] transition">
                Resume from Page {{ lastRead?.page || 1 }}
              </h3>
              <p class="text-xs text-emerald-300/80 mt-0.5">
                {{ lastRead?.surahName || 'Al-Fatihah' }} • Juz {{ lastRead?.juz || 1 }}
              </p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-[#d4af37] group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        <!-- Action 2: Surah Index -->
        <button
          @click="currentView = 'surah_index'"
          class="p-5 bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-800/60 hover:border-[#d4af37]/40 rounded-3xl text-left transition duration-200 cursor-pointer group shadow-md flex items-center justify-between active:scale-98"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Directory</span>
              <h3 class="text-base font-bold text-white group-hover:text-[#d4af37] transition">
                Surah Index (1–114)
              </h3>
              <p class="text-xs text-emerald-300/70 mt-0.5">Browse all 114 Surahs by name & revelations</p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        <!-- Action 3: Juz Index -->
        <button
          @click="currentView = 'juz_index'"
          class="p-5 bg-emerald-950/70 hover:bg-emerald-900/60 border border-emerald-800/60 hover:border-[#d4af37]/40 rounded-3xl text-left transition duration-200 cursor-pointer group shadow-md flex items-center justify-between active:scale-98"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
              <Layers class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">30 Paras</span>
              <h3 class="text-base font-bold text-white group-hover:text-[#d4af37] transition">
                Juz Index (1–30)
              </h3>
              <p class="text-xs text-emerald-300/70 mt-0.5">Jump directly to any of the 30 Juz chapters</p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

      </div>
    </div>

    <!-- 2. SURAH INDEX VIEW -->
    <div v-else-if="currentView === 'surah_index'" class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <button
          @click="currentView = 'home'"
          class="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/50 transition cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Hub</span>
        </button>
        <h3 class="text-sm font-bold text-white">Surah Index (1–114)</h3>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search surah by name or number..."
          class="input text-xs pl-9"
        />
        <Search class="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <!-- Surah List Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
        <button
          v-for="s in filteredSurahs"
          :key="s.number"
          @click="openSurah(s.number)"
          class="p-3.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/50 hover:border-[#d4af37]/60 rounded-2xl flex items-center justify-between text-left transition cursor-pointer group shadow-sm"
        >
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-xl bg-emerald-900 text-[#d4af37] text-xs font-bold flex items-center justify-center border border-emerald-700/50">
              {{ s.number }}
            </span>
            <div>
              <p class="text-xs font-bold text-white group-hover:text-[#d4af37]">{{ s.englishName }}</p>
              <p class="text-[10px] text-emerald-400/80">{{ s.numberOfAyahs }} Verses</p>
            </div>
          </div>
          <span class="text-sm font-arabic font-bold text-amber-100">{{ s.name }}</span>
        </button>
      </div>
    </div>

    <!-- 3. JUZ INDEX VIEW (1 to 30) -->
    <div v-else-if="currentView === 'juz_index'" class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <button
          @click="currentView = 'home'"
          class="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/50 transition cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Hub</span>
        </button>
        <h3 class="text-sm font-bold text-white">Juz Index (1–30 Paras)</h3>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[70vh] overflow-y-auto pr-1">
        <button
          v-for="j in JUZ_LIST"
          :key="j.juz"
          @click="openJuz(j)"
          class="p-3.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/50 hover:border-[#d4af37]/60 rounded-2xl text-left transition cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold text-[#d4af37] bg-emerald-900 px-2 py-0.5 rounded-md">Juz {{ j.juz }}</span>
            <span class="text-xs font-arabic text-emerald-300">{{ j.arabic }}</span>
          </div>
          <div>
            <p class="text-xs font-bold text-white group-hover:text-[#d4af37] truncate">{{ j.name }}</p>
            <p class="text-[9px] text-emerald-400/80 truncate mt-0.5">{{ j.surahName }} • Page {{ j.page }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- 4. 16-LINE STACKED DUAL-PAGE READER -->
    <div v-else-if="currentView === 'reader'" class="space-y-4 animate-fade-in pb-20">
      
      <!-- Reader Controls Header -->
      <div class="p-3.5 bg-emerald-950/90 backdrop-blur-xl border border-emerald-800/60 rounded-2xl flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-2.5">
          <button
            @click="currentView = 'home'"
            class="p-1.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 transition cursor-pointer"
            title="Back to Quran Hub"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <h3 class="text-xs sm:text-sm font-bold text-white">
              {{ currentSurahHeader.englishName }} • Juz {{ currentJuzNumber }}
            </h3>
            <p class="text-[10px] text-[#d4af37] font-semibold">
              Page {{ currentPage }} of 604 (16-Line Format)
            </p>
          </div>
        </div>

        <!-- Translation Selector Dropdown -->
        <select
          v-model="selectedLanguage"
          class="bg-emerald-900/60 border border-emerald-700/50 text-white text-[11px] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#d4af37] cursor-pointer"
        >
          <option v-for="lang in supportedLanguages" :key="lang.code" :value="lang.code">
            {{ lang.name.split('(')[0] }}
          </option>
        </select>
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoadingPage" class="py-24 text-center text-emerald-300 flex flex-col items-center justify-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-[#d4af37]" />
        <span class="text-xs font-medium">Loading Page {{ currentPage }}...</span>
      </div>

      <!-- STACKED PAGES CONTAINER -->
      <div v-else class="space-y-4">
        
        <!-- PAGE STACK 1: 16-LINE CLASSICAL ARABIC MUSHAF PAGE -->
        <div class="p-6 sm:p-8 bg-[#0a3d2e]/95 border-2 border-[#d4af37]/35 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
          
          <!-- Classical Surah / Bismillah Header Banner -->
          <div class="text-center pb-3 border-b border-[#d4af37]/30 space-y-1">
            <div class="flex items-center justify-between text-[11px] text-[#d4af37] font-bold px-2">
              <span>Juz {{ currentJuzNumber }}</span>
              <span class="font-arabic text-base text-white">{{ currentSurahHeader.name }}</span>
              <span>Page {{ currentPage }}</span>
            </div>
            <p v-if="currentPage === 1 || pageAyahs[0]?.numberInSurah === 1" class="font-arabic text-xl sm:text-2xl text-[#d4af37] pt-2">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          <!-- 16-Line Authentic Quran Text Flow -->
          <div
            class="text-right font-arabic leading-[2.6] sm:leading-[2.8] text-xl sm:text-2xl text-amber-50 selection:bg-[#d4af37]/40 tracking-wide"
            dir="rtl"
          >
            <span
              v-for="ayah in pageAyahs"
              :key="ayah.number"
              class="inline hover:text-[#d4af37] transition"
            >
              {{ ayah.text }}
              <span class="inline-flex items-center justify-center w-7 h-7 mx-1.5 text-xs text-[#d4af37] border border-[#d4af37]/60 rounded-full font-sans align-middle shadow-inner">
                {{ ayah.numberInSurah }}
              </span>
            </span>
          </div>

          <!-- Page Bottom Ornament & Bookmark -->
          <div class="pt-3 border-t border-[#d4af37]/30 flex items-center justify-between text-xs text-[#d4af37] font-bold">
            <span>{{ currentSurahHeader.englishName }}</span>
            <div class="flex items-center gap-1.5 text-[10px] text-emerald-300">
              <CheckCircle2 class="w-3.5 h-3.5 text-[#10b981]" />
              <span>Auto-saved to bookmark</span>
            </div>
            <span>Page {{ currentPage }}</span>
          </div>
        </div>

        <!-- PAGE STACK 2: STACKED CONTINUOUS TRANSLATION PAGE (FLOWING LIKE AYAH PAGE) -->
        <div class="p-6 sm:p-8 bg-emerald-950/95 border-2 border-emerald-800/60 rounded-3xl shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-800/50 pb-2.5">
            <h4 class="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5" />
              <span>Translation — Page {{ currentPage }}</span>
            </h4>
            <span class="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 rounded-md bg-emerald-900/60">
              {{ selectedLanguage.split('.')[0].toUpperCase() }}
            </span>
          </div>

          <!-- Flowing continuous translation text with inline numbered badges -->
          <div class="text-left leading-[2.2] sm:leading-[2.4] text-xs sm:text-sm text-emerald-100/90 selection:bg-[#d4af37]/30 tracking-normal">
            <span
              v-for="ayah in pageAyahs"
              :key="`trans-${ayah.number}`"
              class="inline hover:text-white transition"
            >
              {{ ayah.translationText }}
              <span class="inline-flex items-center justify-center w-5 h-5 mx-1.5 text-[10px] font-bold text-[#d4af37] border border-[#d4af37]/50 rounded-full font-sans align-middle bg-emerald-900/50 shadow-inner">
                {{ ayah.numberInSurah }}
              </span>
            </span>
          </div>

          <div class="pt-3 border-t border-emerald-800/50 flex items-center justify-between text-xs text-emerald-400/80">
            <span>{{ currentSurahHeader.englishName }}</span>
            <span>Page {{ currentPage }} Translation</span>
          </div>
        </div>

      </div>

      <!-- FIXED BOTTOM PAGINATION BAR AT DOCK POSITION -->
      <div class="fixed bottom-3 left-4 right-4 max-w-md mx-auto bg-[#0a3d2e]/95 backdrop-blur-2xl border border-emerald-700/60 rounded-3xl p-2 sm:p-2.5 shadow-2xl flex items-center justify-between z-50">
        <button
          @click="prevPage"
          :disabled="currentPage <= 1"
          class="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-xs font-bold text-emerald-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <ChevronLeft class="w-4 h-4" />
          <span>Prev</span>
        </button>

        <div class="flex items-center gap-1.5 px-2">
          <span class="text-[11px] text-emerald-300/70 font-semibold">Page</span>
          <input
            v-model.number="currentPage"
            type="number"
            min="1"
            max="604"
            class="w-12 text-center bg-emerald-950/80 border border-emerald-700/50 rounded-xl py-1 text-xs font-black text-[#d4af37] focus:outline-none"
          />
          <span class="text-xs text-emerald-300/80 font-bold">/ 604</span>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage >= 604"
          class="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-xs font-bold text-emerald-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <span>Next</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

    </div>

  </div>
</template>
