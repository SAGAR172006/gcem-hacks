// In dev: Vite proxy rewrites /api → localhost:3001, so BASE = '/api' works.
// In production (Vercel): set VITE_API_URL to your Render backend URL, e.g.
//   VITE_API_URL=https://ami-backend.onrender.com
// If not set, falls back to relative /api (safe for same-origin deploys).
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'

const TOKEN_KEY = 'ami_token'

// Restore token from localStorage on load
let _token = localStorage.getItem(TOKEN_KEY) || null

export const setToken = (t) => {
  _token = t
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}
export const getToken = () => _token
export const clearToken = () => {
  _token = null
  localStorage.removeItem(TOKEN_KEY)
}

const headers = () => ({
  'Content-Type': 'application/json',
  ...(_token ? { Authorization: `Bearer ${_token}` } : {})
})

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Auth
  register: (body) => req('POST', '/auth/register', body),
  login: (body) => req('POST', '/auth/login', body),
  getGoogleUrl: () => req('GET', '/auth/google/url'),
  googleAuth: (accessToken) => req('POST', '/auth/google', { accessToken }),
  logout: () => req('POST', '/auth/logout'),
  getMe: () => req('GET', '/auth/me'),
  updateMe: (body) => req('PUT', '/auth/me', body),
  deleteMe: () => req('DELETE', '/auth/me'),

  // Modules
  generateModule: (topic, persona) => req('POST', '/modules/generate', { topic, persona }),
  getModules: () => req('GET', '/modules'),
  getModule: (id) => req('GET', `/modules/${id}`),
  getModuleStatus: (id) => req('GET', `/modules/${id}/status`),
  updateProgress: (id, progress) => req('PUT', `/modules/${id}/progress`, { progress }),
  deleteModule: (id) => req('DELETE', `/modules/${id}`),

  // Upload (multipart)
  uploadFiles: async (files, persona, deadline) => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    form.append('persona', JSON.stringify(persona))
    if (deadline) form.append('deadline', deadline)
    const res = await fetch(`${BASE}/modules/upload`, {
      method: 'POST',
      headers: _token ? { Authorization: `Bearer ${_token}` } : {},
      body: form
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },

  // Demo modules (no auth needed — instant load from Supabase)
  getDemoModule: (id) => req('GET', `/demo/${id}`),

  // Chat
  embedModule: (moduleId) => req('POST', `/chat/embed/${moduleId}`),
  chat: (moduleId, message, history) => req('POST', '/chat', { moduleId, message, history }),

  // Learning stats
  recordQuiz: (moduleId, sectionId, correct, attempts) =>
    req('POST', '/stats/quiz', { moduleId, sectionId, correct, attempts }),
  recordTest: (moduleId, score) =>
    req('POST', '/stats/test', { moduleId, score }),
  scoreExplanation: (moduleId, explanation, sourceExcerpt) =>
    req('POST', '/stats/score-explanation', { moduleId, explanation, sourceExcerpt }),
  getMyStats: () => req('GET', '/stats/me'),
}
