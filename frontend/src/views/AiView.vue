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
  Copy
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
      const userName = authStore.profile?.name || 'Brother/Sister'
      messages.value = [
        {
          id: 'welcome',
          role: 'assistant',
          content: `### Assalamu Alaikum wa Rahmatullahi wa Barakatuh, ${userName} 🌿\n\n` +
            `I am your **AI Islamic Scholar & Spiritual Life Companion**. You can confide in me freely about your prayer struggles, Qaza calculations, spiritual lows, guilt, or any life challenge.\n\n` +
            `Aap mujhse **English, Urdu, ya Roman Urdu** kisi bhi zaban mein baat kar sakte hain. We provide empathetic solutions across **Spiritual**, **Mental**, and **Physical** dimensions.\n\n` +
            `*How can I assist and guide you today?*`
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
    const newHeight = Math.min(Math.max(textareaRef.value.scrollHeight, 44), 160)
    textareaRef.value.style.height = `${newHeight}px`
  }
}

async function sendMessage(textToSend?: string) {
  const content = (textToSend || inputText.value).trim()
  if (!content || isStreaming.value) return

  inputText.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = '44px'
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
      'Assalamu Alaikum. I am temporarily experiencing a connection delay. Please send your message again shortly.'
  } finally {
    isStreaming.value = false
    scrollToBottom()
  }
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

// Speech Recognition
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

// Clean markdown formatter
function formatMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm sm:text-base font-bold text-[#f3cf7a] mt-3 mb-1.5 flex items-center gap-1.5">$1</h3>')
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xs sm:text-sm font-semibold text-emerald-300 mt-2.5 mb-1">$1</h4>')

  // Blockquotes / Ayahs
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-[#d4af37] bg-emerald-950/60 pl-3.5 pr-2 py-1.5 my-2 text-xs italic text-amber-100/90 rounded-r-lg shadow-inner">$1</blockquote>')

  // Bold and Italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white tracking-wide">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-emerald-200/90">$1</em>')

  // Bullet points
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-xs sm:text-[13px] text-emerald-100/95 leading-relaxed my-0.5">$1</li>')

  // Paragraph breaks
  html = html.replace(/\n\n/g, '<div class="h-2.5"></div>')
  html = html.replace(/\n/g, '<br/>')

  return html
}
</script>

<template>
  <div class="flex flex-col h-full max-w-4xl mx-auto w-full">
    
    <!-- Top Mentor Header Bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-[#062c21]/90 backdrop-blur-xl border border-emerald-700/50 rounded-2xl shadow-xl mb-3 shrink-0">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/dashboard')"
          class="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 text-emerald-300 transition cursor-pointer active:scale-95"
          title="Back to Dashboard"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#022c22] flex items-center justify-center font-bold shadow-md shadow-amber-500/10">
            <Sparkles class="w-5 h-5 text-[#022c22]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm sm:text-base font-bold text-white leading-tight tracking-tight">AI Islamic Mentor</h2>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">Guide</span>
            </div>
            <p class="text-[11px] text-emerald-300/80 flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>Spiritual • Mental • Physical Guidance</span>
            </p>
          </div>
        </div>
      </div>

      <button
        @click="clearChat"
        title="Clear conversation"
        class="p-2 rounded-xl bg-emerald-950/60 hover:bg-red-950/60 border border-emerald-800/40 text-emerald-400 hover:text-red-400 transition cursor-pointer active:scale-95"
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
        :class="['flex gap-3 max-w-[94%] sm:max-w-[86%] animate-fade-in', msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto']"
      >
        <!-- Avatar -->
        <div
          :class="[
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md mt-0.5',
            msg.role === 'user'
              ? 'bg-gradient-to-tr from-[#d4af37] to-amber-300 text-[#022c22]'
              : 'bg-[#0a3d2e] border border-[#d4af37]/40 text-[#d4af37]'
          ]"
        >
          <User v-if="msg.role === 'user'" class="w-4 h-4" />
          <Bot v-else class="w-4 h-4" />
        </div>

        <!-- Message Bubble Card -->
        <div
          :class="[
            'p-4 sm:p-5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-lg relative group transition',
            msg.role === 'user'
              ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 text-white rounded-tr-none border border-emerald-700/60 font-medium'
              : 'bg-[#062c21]/95 text-emerald-50 rounded-tl-none border border-emerald-700/50 backdrop-blur-md shadow-emerald-950/50'
          ]"
        >
          <div v-if="msg.role === 'assistant'" v-html="formatMarkdown(msg.content)"></div>
          <div v-else class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>

          <!-- Copy Button for AI response -->
          <button
            v-if="msg.role === 'assistant' && msg.content"
            @click="copyMessage(msg.content, index)"
            class="absolute top-2.5 right-2.5 p-1.5 text-emerald-400/50 hover:text-white bg-emerald-950/50 hover:bg-emerald-900 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Copy response"
          >
            <CheckCircle2 v-if="copiedIndex === index" class="w-3.5 h-3.5 text-[#10b981]" />
            <Copy v-else class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Live Typing Indicator -->
      <div v-if="isStreaming && (!messages.length || messages[messages.length - 1].role === 'user')" class="flex gap-2 items-center text-xs text-[#d4af37] animate-pulse pl-2 py-1">
        <Sparkles class="w-4 h-4 animate-spin" />
        <span>Mentor is writing guidance...</span>
      </div>
    </div>

    <!-- ChatGPT-style Bottom Sticky Input Box -->
    <div class="p-2 sm:p-3 bg-[#062c21]/95 backdrop-blur-2xl border border-emerald-700/60 rounded-2xl shadow-2xl shrink-0 mt-auto">
      <form @submit.prevent="sendMessage()" class="flex items-end gap-2">
        <!-- Voice Input Button -->
        <button
          type="button"
          @click="toggleVoice"
          :class="[
            'p-2.5 rounded-xl transition cursor-pointer shrink-0 h-[44px] flex items-center justify-center',
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-lg'
              : 'bg-emerald-950/80 text-emerald-300 hover:text-white border border-emerald-800/50'
          ]"
          title="Voice input"
        >
          <MicOff v-if="isListening" class="w-4 h-4" />
          <Mic v-else class="w-4 h-4" />
        </button>

        <!-- Multiline Auto-Resizing Textarea -->
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @input="handleTextareaInput"
          @keydown.enter.exact.prevent="sendMessage()"
          rows="1"
          placeholder="Ask in English, Roman Urdu, or your native language..."
          class="flex-1 bg-emerald-950/90 border border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-400/60 focus:border-[#d4af37] focus:outline-none resize-none overflow-hidden leading-relaxed h-[44px]"
        ></textarea>

        <!-- Send Button -->
        <button
          type="submit"
          :disabled="!inputText.trim() || isStreaming"
          class="p-2.5 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-300 text-[#022c22] font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:scale-105 active:scale-95 shrink-0 h-[44px] w-[44px] flex items-center justify-center"
          title="Send message"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>
    </div>

  </div>
</template>
