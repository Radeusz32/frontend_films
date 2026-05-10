import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireAdmin, redirectIfAuthenticated } from './guards'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/movie/:id',
      name: 'movie',
      component: () => import('@/pages/MoviePage.vue'),
    },
    {
      path: '/movies',
      name: 'movies',
      component: () => import('@/pages/MoviesPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/ProfilePage.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: () => import('@/pages/RecommendationsPage.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/pages/AdminPage.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

export default router
