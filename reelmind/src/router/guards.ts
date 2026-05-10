import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export async function requireAuth(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: _to.fullPath } })
  } else {
    next()
  }
}

export async function requireAdmin(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    next({ name: 'login' })
  } else if (!auth.isAdmin) {
    next({ name: 'home' })
  } else {
    next()
  }
}

export async function redirectIfAuthenticated(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> {
  const auth = useAuthStore()
  if (auth.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
}
