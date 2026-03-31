import axios from "axios"

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const BASE_AUTH_URL = `${BASE_BACKEND_URL}/api/v1/auth`

export async function fetchUser() {
    const response = await axios.get(`${BASE_AUTH_URL}/me`, {
        withCredentials: true
    })
    if (response.data.user) {
        return response.data.user
    } else {
        return null
    }
}

export async function logout() {
    const response = await axios.get(`${BASE_AUTH_URL}/logout`, {
        withCredentials: true
    })
    return response.data;
}

export async function fetchRepositories(page: number, per_page: number) {
    const response = await axios.get(
        `${BASE_BACKEND_URL}/api/v1/repositories?page=${page}&per_page=${per_page}`,
        {
            withCredentials: true,
        },
    );
    return response.data
}