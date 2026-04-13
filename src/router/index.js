import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from '@/views/PlaygroundView.vue'
import VendictMinesweeperView from '@/views/VendictMinesweeperView.vue'
import LogoMatchView from '@/views/LogoMatchView.vue'
import VendictQuestionnaireView from '@/views/VendictQuestionnaireView.vue'
import VendictQuestionnaireStudioView from '@/views/VendictQuestionnaireStudioView.vue'

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
    {
      path: '/vendict-questionnaire-studio',
      name: 'vendict-questionnaire-studio',
      component: VendictQuestionnaireStudioView,
    },
  ],
})

export default router
