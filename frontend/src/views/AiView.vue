<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { aiApi } from '@/services/api'
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Trash2,
  ArrowLeft,
  Bot,
  User,
  CheckCircle2,
  Copy,
  ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

const messages = ref<Message[]>([])
const inputText = ref('')
const isStreaming = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const copiedIndex = ref<number | null>(null)

// Voice Recognition State
const isListening = ref(false)
let recognition: any = null

const suggestionChips = [
  'Struggling to wake up for Fajr ⏰',
  'Heavy guilt over past missed prayers 💫',
  'How to build consistent Salah habits 🌿',
  'Fiqh of Qaza & Witr calculation 📖',
  'Feeling anxious and lacking Khushu 🤲'
]

onMounted(async () => {
  await loadConversations()
  setupSpeechRecognition()
})

async function loadConversations() {
  try {
    const res = await aiApi.getConversations()
    if (res.data && res.data.length > 0) {
      messages.value = res.data
    } else {
      // Default Welcome Message from the Mentor
      messages.value = [
        {
          id: 'welcome',
          role: 'assistant',
          content: `### Assalamu Alaikum wa Rahmatullahi wa Barakatuh, ${authStore.profile?.name || 'Fellow Muslim'}.\n\n` +
            `I am your safe, compassionate **Islamic Mentor & Life Guide**. You can confide in me about your prayer struggles, spiritual lows, guilt, or any life challenge.\n\n` +
            `Together, we will look at solutions across **Spiritual**, **Mental**, and **Physical** dimensions to help you find peace and steadfastness.\n\n` +
            `*How can I support and guide you today?*`
        }
      ]
    }
    scrollToBottom()
  } catch (e) {
    console.error('Failed to load chat history', e)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

watch(messages, () => scrollToBottom(), { deep: true })

function handleTextareaInput() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const newHeight = Math.min(Math.max(textareaRef.value.scrollHeight, 40), 160)
    textareaRef.value.style.height = `${newHeight}px`
  }
}

async function sendMessage(textToSend?: string) {
  const content = (textToSend || inputText.value).trim()
  if (!content || isStreaming.value) return

  inputText.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  // Add User message
  const userMsgId = `user_${Date.now()}`
  messages.value.push({
    id: userMsgId,
    role: 'user',
    content,
  })
  scrollToBottom()

  // Add empty Assistant message for streaming
  const assistantMsgId = `assistant_${Date.now()}`
  const assistantMsgIndex = messages.value.push({
    id: assistantMsgId,
    role: 'assistant',
    content: '',
  }) - 1

  isStreaming.value = true

  try {
    await aiApi.chatStream(content, (chunk: string) => {
      messages.value[assistantMsgIndex].content += chunk
      scrollToBottom()
    })
  } catch (err: any) {
    messages.value[assistantMsgIndex].content =
      'Assalamu Alaikum. I am temporarily experiencing connection issues. Please try again shortly.'
  } finally {
    isStreaming.value = false
    scrollToBottom()
  }
}

function selectSuggestion(chip: string) {
  sendMessage(chip)
}

async function clearChat() {
  if (!confirm('Are you sure you want to clear your conversation history?')) return
  try {
    await aiApi.clearConversations()
    messages.value = []
    await loadConversations()
  } catch (e) {
    console.error(e)
  }
}

function copyMessage(text: string, index: number) {
  navigator.clipboard.writeText(text)
  copiedIndex.value = index
  setTimeout(() => {
    copiedIndex.value = null
  }, 2000)
}

// Voice Recognition setup
function setupSpeechRecognition() {
  if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      inputText.value = (inputText.value ? inputText.value + ' ' : '') + transcript
      handleTextareaInput()
      isListening.value = false
    }

    recognition.onerror = () => {
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }
  }
}

function toggleVoice() {
  if (!recognition) {
    alert('Voice speech recognition is not supported in your browser.')
    return
  }
  if (isListening.value) {
    recognition.stop()
    isListening.value = false
  } else {
    isListening.value = true
    recognition.start()
  }
}

// Lightweight, safe markdown formatter
function formatMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-extrabold text-[#d4af37] mt-2 mb-1">$1</h3>')
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-emerald-200 mt-2 mb-1">$1</h4>')

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-[#d4af37] pl-3 py-1 my-1.5 text-xs italic text-amber-100/90 bg-emerald-950/40 rounded-r-lg">$1</blockquote>')

  // Bold and Italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-emerald-200">$1</em>')

  // Bullet points
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-xs leading-relaxed">$1</li>')

  // Paragraph breaks
  html = html.replace(/\n\n/g, '<div class="h-2"></div>')
  html = html.replace(/\n/g, '<br/>')

  return html
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto w-full">
    
    <!-- Top Mentor Header Bar -->
    <div class="flex items-center justify-between p-3.5 bg-[#0a3d2e]/90 backdrop-blur-xl border border-emerald-700/50 rounded-2xl shadow-lg mb-3 shrink-0">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/dashboard')"
          class="p-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-300 transition cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#022c22] flex items-center justify-center font-bold shadow-md">
            <Sparkles class="w-5 h-5 text-[#022c22]" />
          </div>
          <div>
            <h2 class="text-xs sm:text-sm font-bold text-white leading-tight">AI Islamic Mentor & Guide</h2>
            <p class="text-[10px] text-emerald-300/80 flex items-center gap-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>Spiritual • Mental • Physical Mentorship</span>
            </p>
          </div>
        </div>
      </div>

      <button
        @click="clearChat"
        title="Clear conversation"
        class="p-2 rounded-xl bg-emerald-950/70 hover:bg-red-950/60 border border-emerald-800/40 text-emerald-400 hover:text-red-400 transition cursor-pointer"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Scrollable Message Stream -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto px-1 sm:px-2 space-y-4 pb-4 scroll-smooth"
    >
      <div
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        :class="['flex gap-3 max-w-[92%] sm:max-w-[85%] animate-fade-in', msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto']"
      >
        <!-- Avatar -->
        <div
          :class="[
            'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow',
            msg.role === 'user'
              ? 'bg-[#d4af37] text-[#022c22]'
              : 'bg-emerald-900 border border-[#d4af37]/40 text-[#d4af37]'
          ]"
        >
          <User v-if="msg.role === 'user'" class="w-4 h-4" />
          <Bot v-else class="w-4 h-4" />
        </div>

        <!-- Message Bubble Card -->
        <div
          :class="[
            'p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg relative group',
            msg.role === 'user'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-tr-none border border-emerald-700/50'
              : 'bg-[#0a3d2e]/90 text-emerald-100 rounded-tl-none border border-emerald-700/60 backdrop-blur-md'
          ]"
        >
          <div v-if="msg.role === 'assistant'" v-html="formatMarkdown(msg.content)"></div>
          <div v-else class="whitespace-pre-wrap">{{ msg.content }}</div>

          <!-- Copy Button for AI response -->
          <button
            v-if="msg.role === 'assistant' && msg.content"
            @click="copyMessage(msg.content, index)"
            class="absolute top-2 right-2 p-1 text-emerald-400/60 hover:text-white rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Copy response"
          >
            <CheckCircle2 v-if="copiedIndex === index" class="w-3.5 h-3.5 text-[#10b981]" />
            <Copy v-else class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Live Typing Indicator -->
      <div v-if="isStreaming && (!messages.length || messages[messages.length - 1].role === 'user')" class="flex gap-2 items-center text-xs text-[#d4af37] animate-pulse pl-2">
        <Sparkles class="w-4 h-4" />
        <span>Mentor is reflecting on your question...</span>
      </div>
    </div>

    <!-- Quick Suggestion Chips (Above Input) -->
    <div class="px-1 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
      <button
        v-for="chip in suggestionChips"
        :key="chip"
        @click="selectSuggestion(chip)"
        :disabled="isStreaming"
        class="px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-[11px] text-emerald-200/90 whitespace-nowrap transition cursor-pointer hover:border-[#d4af37]/60 active:scale-95 shrink-0"
      >
        {{ chip }}
      </button>
    </div>

    <!-- ChatGPT-style Bottom Sticky Input Box (Issue #6 Fixed) -->
    <div class="p-2 sm:p-3 bg-[#0a3d2e]/95 backdrop-blur-2xl border border-emerald-700/60 rounded-2xl shadow-2xl shrink-0 mt-1">
      <form @submit.prevent="sendMessage()" class="flex items-end gap-2">
        <!-- Voice Input Button -->
        <button
          type="button"
          @click="toggleVoice"
          :class="[
            'p-2.5 rounded-xl transition cursor-pointer shrink-0',
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-lg'
              : 'bg-emerald-950/80 text-emerald-300 hover:text-white border border-emerald-800/50'
          ]"
          title="Voice input"
        >
          <MicOff v-if="isListening" class="w-4 h-4" />
          <Mic v-else class="w-4 h-4" />
        </button>

        <!-- Multiline Auto-Resizing Textarea without Scrollbar -->
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @input="handleTextareaInput"
          @keydown.enter.exact.prevent="sendMessage()"
          rows="1"
          placeholder="Talk freely with your Islamic mentor about any struggle, question, or goal..."
          class="flex-1 bg-emerald-950/80 border border-emerald-800/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-400/60 focus:border-[#d4af37] focus:outline-none resize-none overflow-hidden leading-relaxed"
        ></textarea>

        <!-- Send Button -->
        <button
          type="submit"
          :disabled="!inputText.trim() || isStreaming"
          class="p-2.5 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-300 text-[#022c22] font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:scale-105 active:scale-95 shrink-0"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>
    </div>

  </div>
</template>
