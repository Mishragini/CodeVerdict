interface User {
    id: number,
    avatar_url: string,
    name: string,
    login: string,
    access_token: string,
    app_installation_id: string,
    refresh_token: string | null,
    expires_at: string | null
}


export type { User }