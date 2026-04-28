import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/HomeView.vue'
import GameView from '@/GameView.vue'
import GameStatusView from '@/GameStatusView.vue'
import LoginView from '@/LoginView.vue'
import RegisterView from '@/RegisterView.vue'
import ProjectsView from '@/paintingBoard/ProjectsView.vue'
import PaintingBoardView from '@/paintingBoard/PaintingBoardView.vue'
import AdminView from '@/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path: '/', name: 'home', component: HomeView},
    {path: '/game', name: 'game', component: GameView},
    {path: '/game/status', name: 'gameStatus', component: GameStatusView},
    {path: '/login', name: 'login', component: LoginView},
    {path: '/register', name: 'register', component: RegisterView},
    {path: '/paintingBoard/projects', name: 'projects', component: ProjectsView},
    {path: '/paintingBoard', name: 'paintingBoard', component: PaintingBoardView},
    {path: '/game/admin', name: 'admin', component: AdminView}
  ],
})

export default router
