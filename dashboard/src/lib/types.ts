interface User {
    id: number,
    avatar_url: string,
    name: string,
    login: string,
    access_token: string,
    app_installation_id: string,
    refresh_token: string | null,
    access_token_expiry: string | null,
    refresh_token_expiry: string | null
}


export type { User }