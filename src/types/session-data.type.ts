export const sessionKey = 'rossi-games-session'

export type SessionData = {
	UserName: string | null
	Token: string | null
	SignedIn: boolean
}

export const blankSession: SessionData = {
	UserName: null,
	Token: null,
	SignedIn: false,
}
