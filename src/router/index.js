import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'

/** Route table shared with tests (paths must match sidebar links in App.vue). */
export const routes = [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/risk-per-domain',
      name: 'risk-per-domain',
      component: PlaceholderView,
      meta: {
        title: 'Risk Per Domain',
      },
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: PlaceholderView,
      meta: {
        title: 'Contacts',
      },
    },
    {
      path: '/reports',
      name: 'reports',
      component: PlaceholderView,
      meta: {
        title: 'Reports',
      },
    },
    {
      path: '/external-risks',
      name: 'external-risks',
      component: PlaceholderView,
      meta: {
        title: 'External Risks',
      },
    },
    {
      path: '/workflows',
      name: 'workflows',
      component: PlaceholderView,
      meta: {
        title: 'Workflows',
      },
    },
    {
      path: '/library',
      name: 'library',
      component: PlaceholderView,
      meta: {
        title: 'Library',
      },
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
