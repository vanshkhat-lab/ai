import axios from 'axios'

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '')

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sports-store-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return error.response.data.message
    if (error.request) {
      return `Unable to reach the server at ${API_BASE_URL}. Check that the backend is running and VITE_API_URL is correct.`
    }
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function getImageUrl(image) {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  return `${API_BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`
}
