import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/home/HomeView.vue'
import PlaceholderView from '@/views/placeholder/PlaceholderView.vue'

enum RouteName {
  Home = 'home',
  RiskPerDomain = 'risk-per-domain',
  Contacts = 'contacts',
  Reports = 'reports',
  ExternalRisks = 'external-risks',
  Workflows = 'workflows',
  Library = 'library',
}

interface PlaceholderRouteDefinition {
  path: string
  name: RouteName
  title: string
}

const placeholderRoutes: PlaceholderRouteDefinition[] = [
  { path: '/risk-per-domain', name: RouteName.RiskPerDomain, title: 'Risk Per Domain' },
  { path: '/contacts', name: RouteName.Contacts, title: 'Contacts' },
  { path: '/reports', name: RouteName.Reports, title: 'Reports' },
  { path: '/external-risks', name: RouteName.ExternalRisks, title: 'External Risks' },
  { path: '/workflows', name: RouteName.Workflows, title: 'Workflows' },
  { path: '/library', name: RouteName.Library, title: 'Library' },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: RouteName.Home,
    component: HomeView,
  },
  ...placeholderRoutes.map<RouteRecordRaw>((route) => ({
    path: route.path,
    name: route.name,
    component: PlaceholderView,
    meta: {
      title: route.title,
    },
  })),
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
