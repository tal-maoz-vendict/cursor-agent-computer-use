import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'
import PlaceholderView from '@/views/placeholder/PlaceholderView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
  ],
})

export default router
