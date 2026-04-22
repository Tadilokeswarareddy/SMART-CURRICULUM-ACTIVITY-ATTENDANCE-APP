import axios from "axios"
import { ACCESS_TOKEN } from './constants'

const BASE_URL = import.meta.env.VITE_API_URL

console.log("🔗 API Base URL:", BASE_URL)

if (!BASE_URL) {
    console.error("❌ VITE_API_URL is not set! Check Vercel environment variables.")
}

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 80000,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ECONNABORTED") {
            console.error("⏱️ Request timed out - slow network on mobile?")
        }
        if (!error.response) {
            console.error("🌐 Network error - request never reached server:", error.message)
        } else {
            console.error("❌ API Error:", error.response.status, error.response.data)
        }
        return Promise.reject(error)
    }
)

export default api