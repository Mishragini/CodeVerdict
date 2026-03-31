import axios from "axios"

export async function fetchUser() {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/me`, {
        withCredentials: true
    })
    if (response.data.user) {
        return response.data.user
    } else {
        return null
    }
}