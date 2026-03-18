const STUDIO_AUTH_TOKEN_KEY = 'dumb-studio-token'

export function isStudioAuthorized() {
  return localStorage.getItem(STUDIO_AUTH_TOKEN_KEY) !== null
}

export function saveStudioToken(token: string) {
  localStorage.setItem(STUDIO_AUTH_TOKEN_KEY, token)
}

export function getStudioToken() {
  return localStorage.getItem(STUDIO_AUTH_TOKEN_KEY)
}

export function clearStudioAuthorization() {
  localStorage.removeItem(STUDIO_AUTH_TOKEN_KEY)
}
