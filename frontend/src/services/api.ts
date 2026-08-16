import axios from 'axios'

// Dynamically determine backend URL based on current host (supports mobile testing on local Wi-Fi)
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const port = '8000'
    const protocol = window.location.protocol
    const host = window.location.hostname
    return `${protocol}//${host}:${port}`
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

const api = axios.create({
  baseURL: getApiBaseUrl() + '/api/v1',
  timeout: 30000,
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qaza_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qaza_auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ─── Users ─────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.patch('/users/me', data),
}

// ─── Prayers ───────────────────────────────────────────────────
export const prayersApi = {
  getCounts: () => api.get('/prayers/counts'),
  updateCounts: (data: Record<string, number>) => api.patch('/prayers/counts', data),
  getDailyLog: (date: string) => api.get(`/prayers/daily/${date}`),
  updateDailyLog: (date: string, entries: Array<{prayer_name: string, status: string}>) =>
    api.patch(`/prayers/daily/${date}`, { entries }),
  getHistory: (limit = 50, offset = 0) =>
    api.get('/prayers/history', { params: { limit, offset } }),
  addHistory: (data: { prayer_name: string, event_type: string, amount: number }) =>
    api.post('/prayers/history', data),
}

// ─── Quran ─────────────────────────────────────────────────────
export const quranApi = {
  getPage: (page: number, edition = 'en.sahih') =>
    api.get(`/quran/page/${page}`, { params: { edition } }),
  getSurah: (num: number, edition = 'en.sahih') =>
    api.get(`/quran/surah/${num}`, { params: { edition } }),
  getAyah: (surah: number, ayah: number, edition = 'en.sahih') =>
    api.get(`/quran/ayah/${surah}/${ayah}`, { params: { edition } }),
  getRandomAyah: (edition = 'en.sahih') =>
    api.get('/quran/random', { params: { edition } }),
  getEditions: () => api.get('/quran/editions'),
  listSurahs: () => api.get('/quran/surahs'),
  search: (q: string, edition = 'en.sahih') =>
    api.get('/quran/search', { params: { q, edition } }),
  getPrayerTimes: (city: string, country: string, method = 4) =>
    api.get('/prayer-times', { params: { city, country, method } }),
}

// ─── AI ────────────────────────────────────────────────────────
export const aiApi = {
  chatUrl: () => getApiBaseUrl() + '/api/v1/ai/chat',
  getConversations: () => api.get('/ai/conversations'),
  clearConversations: () => api.delete('/ai/conversations'),
  generateImage: (prompt: string, style?: string) =>
    api.post('/ai/generate-image', { prompt, style }),

  // Full Server-Sent Events (SSE) chat streaming
  chatStream: async (content: string, onChunk: (chunk: string) => void): Promise<void> => {
    const token = localStorage.getItem('qaza_auth_token')
    const url = getApiBaseUrl() + '/api/v1/ai/chat'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error(`AI response error: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.replace('data:', '').trim()
          if (dataStr === '[DONE]') {
            return
          }
          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.chunk) {
              onChunk(parsed.chunk)
            }
          } catch (e) {
            // Ignore non-JSON chunks
          }
        }
      }
    }
  },
}

// ─── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  getVapidKey: () => api.get('/notifications/vapid-public-key'),
  subscribe: (data: { endpoint: string, p256dh_key: string, auth_key: string }) =>
    api.post('/notifications/subscribe', data),
  unsubscribe: (endpoint: string) =>
    api.delete('/notifications/unsubscribe', { params: { endpoint } }),
  sendTest: () => api.post('/notifications/test'),
}

export default api
