import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/HomeView.vue'
import GameView from '@/GameView.vue'
import LoginView from '@/LoginView.vue'
import RegisterView from '@/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', component: HomeView},
    {path: '/game', name: 'game', component: GameView},
    {path: '/login', name: 'login', component: LoginView},
    {path: '/register', name: 'register', component: RegisterView}
  ],
})

export default router
