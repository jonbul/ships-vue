import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/HomeView.vue'
import GameView from '@/GameView.vue'
import GameStatusView from '@/GameStatusView.vue'
import LoginView from '@/LoginView.vue'
import RegisterView from '@/RegisterView.vue'
import ProjectsView from '@/paintingBoard/ProjectsView.vue'
import PaintingBoardView from '@/paintingBoard/PaintingBoardView.vue'
import AdminView from '@/AdminView.vue'

function getAuthenticatedUser(): { admin?: boolean } | null {
  try {
    const expiration = localStorage.getItem('sessionExpiration')
    if (expiration && Date.now() > parseInt(expiration, 10)) {
      localStorage.removeItem('user')
      localStorage.removeItem('sessionExpiration')
      return null
    }
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', component: HomeView},
    {path: '/game', name: 'game', component: GameView},
    {path: '/game/status', name: 'gameStatus', component: GameStatusView, meta: {requiresAdmin: true}},
    {path: '/login', name: 'login', component: LoginView},
    {path: '/register', name: 'register', component: RegisterView},
    {path: '/paintingBoard/projects', name: 'projects', component: ProjectsView, meta: {requiresAuth: true}},
    {path: '/paintingBoard', name: 'paintingBoard', component: PaintingBoardView, meta: {requiresAuth: true}},
    {path: '/game/admin', name: 'admin', component: AdminView, meta: {requiresAdmin: true}},
    {path: '/:pathMatch(.*)*', redirect: '/'}
  ],
})

router.beforeEach((to) => {
  const user = getAuthenticatedUser()

  if (to.meta.requiresAdmin) {
    if (!user) return {name: 'login'}
    if (!user.admin) return {name: 'home'}
  }

  if (to.meta.requiresAuth && !user) {
    return {name: 'login'}
  }
})

export default router
