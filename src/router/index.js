import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from '@/views/PlaygroundView.vue'
import VendictMinesweeperView from '@/views/VendictMinesweeperView.vue'
import LogoMatchView from '@/views/LogoMatchView.vue'
import VendorAssessmentView from '@/views/VendorAssessmentView.vue'

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
    {
      path: '/logo-match',
      name: 'logo-match',
      component: LogoMatchView,
    },
    {
      path: '/vendor-assessment',
      name: 'vendor-assessment',
      component: VendorAssessmentView,
    },
  ],
})

export default router
