import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from '@/views/PlaygroundView.vue'
import VendictMinesweeperView from '@/views/VendictMinesweeperView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'playground',
      component: PlaygroundView,
    },
    {
      path: '/vendict-minesweeper',
      name: 'vendict-minesweeper',
      component: VendictMinesweeperView,
    },
  ],
})

export default router
