import axios from 'axios'
import { API_URL } from './apiEndpoints'

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const normalizeBase = (base) => {
  if (!base || base === '/') return '/'
  return trimTrailingSlash(base)
}

const normalizeApiInput = (url) => {
  if (typeof url !== 'string' || url.length === 0) return url
  return url.replace(/^https?:\/\/localhost:5000/i, '')
}

const buildApiUrl = (url) => {
  const normalizedInput = normalizeApiInput(url)
  if (typeof normalizedInput !== 'string' || normalizedInput.length === 0) return normalizedInput

  if (/^https?:\/\//i.test(normalizedInput)) return normalizedInput

  const base = normalizeBase(API_URL)
  if (base === '/' || normalizedInput.startsWith(base)) return normalizedInput

  if (normalizedInput === '/api') return base
  if (normalizedInput.startsWith('/api/')) return `${base}${normalizedInput.slice(4)}`
  if (normalizedInput.startsWith('/')) return `${base}${normalizedInput}`

  return `${base}/${normalizedInput}`
}

axios.interceptors.request.use((config) => {
  if (config?.url) {
    config.url = buildApiUrl(config.url)
  }
  return config
})

const originalFetch = window.fetch.bind(window)
window.fetch = (input, init) => {
  if (typeof input === 'string') {
    return originalFetch(buildApiUrl(input), init)
  }

  if (input instanceof URL) {
    return originalFetch(buildApiUrl(input.toString()), init)
  }

  return originalFetch(input, init)
}

export { buildApiUrl }
