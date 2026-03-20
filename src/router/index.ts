import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/HomeView.vue'
import GameView from '@/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', component: HomeView},
    {path: '/game', name: 'game', component: GameView},

  ],
})

export default router
