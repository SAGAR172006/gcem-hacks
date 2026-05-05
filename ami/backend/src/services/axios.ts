import axios from 'axios'

export const httpClient = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Retry once on network errors or 5xx responses
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (!config || config._retried) return Promise.reject(error)

    const shouldRetry =
      !error.response || // network error
      error.response.status >= 500

    if (shouldRetry) {
      config._retried = true
      console.warn(`[Axios] Retrying request to ${config.url}`)
      await new Promise((r) => setTimeout(r, 1000))
      return httpClient(config)
    }

    return Promise.reject(error)
  }
)
