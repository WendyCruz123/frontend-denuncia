import Cookies from 'js-cookie'
import { AuthUser } from '@/types/auth'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'auth_user'

export function saveToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1 })
}

export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
}

export function saveUser(user: AuthUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const value = localStorage.getItem(USER_KEY)
  if (!value) return null

  try {
    return JSON.parse(value) as AuthUser
  } catch {
    return null
  }
}

export function removeUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

export function logout() {
  removeToken()
  removeUser()
}

export function isAuthenticated() {
  return !!getToken()
}