import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from '@/views/PlaygroundView.vue'
import VendictMinesweeperView from '@/views/VendictMinesweeperView.vue'
import LogoMatchView from '@/views/LogoMatchView.vue'
import VendictQuestionnaireView from '@/views/VendictQuestionnaireView.vue'

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
      path: '/vendict-questionnaire',
      name: 'vendict-questionnaire',
      component: VendictQuestionnaireView,
    },
  ],
})

export default router
