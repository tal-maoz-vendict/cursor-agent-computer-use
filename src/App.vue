<script setup>
const sidebarTabs = [
  { label: 'Home', to: '/home', icon: 'home' },
  { label: 'Risk Per Domain', to: '/risk-per-domain', icon: 'risk' },
  { label: 'Contacts', to: '/contacts', icon: 'contacts' },
  { label: 'Reports', to: '/reports', icon: 'reports' },
  { label: 'External Risks', to: '/external-risks', icon: 'external' },
  { label: 'Workflows', to: '/workflows', icon: 'workflows' },
  { label: 'Library', to: '/library', icon: 'library' },
]

const iconPaths = {
  home: 'M3 11.5 12 4l9 7.5M6 10.5v8h12v-8',
  risk: 'M12 4 20 18H4L12 4Zm0 5.2v4.4m0 2.4h.01',
  contacts: 'M18 19.5H6a1 1 0 0 1-1-1v-1.1c0-2.4 2.2-4.4 5-4.4h4c2.8 0 5 2 5 4.4v1.1a1 1 0 0 1-1 1ZM12 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 11Z',
  reports: 'M7 3.5h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z M15 3.5v4h4 M9 11h6 M9 14.5h6 M9 18h4',
  external: 'M12 3.5 14.6 9.4 21 10l-4.8 4.2 1.5 6.3L12 17l-5.7 3.5 1.5-6.3L3 10l6.4-.6L12 3.5Z',
  workflows: 'M8.5 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm7 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM4.5 19v-.6c0-2 1.7-3.6 3.8-3.6h.4c2.1 0 3.8 1.6 3.8 3.6v.6m2.8 0v-.6c0-2 1.7-3.6 3.8-3.6h.4c2.1 0 3.8 1.6 3.8 3.6v.6',
  library: 'M6 4h5.5v16H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6.5 0H18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5.5',
}
</script>

<template>
  <div class="vh-shell">
    <aside class="vh-sidebar">
      <div class="vh-sidebar-brand">
        <span class="vh-logo-mark" aria-hidden="true">S</span>
        <span class="vh-logo-text">Sling</span>
      </div>

      <nav class="vh-sidebar-nav" aria-label="Vendor hub tabs">
        <RouterLink
          v-for="tab in sidebarTabs"
          :key="tab.to"
          :to="tab.to"
          class="vh-nav-item"
          active-class="vh-nav-item-active"
        >
          <span class="vh-nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path :d="iconPaths[tab.icon]" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ tab.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="vh-main-column">
      <header class="vh-topbar">
        <p class="vh-breadcrumb">TPRM &gt; Vendors &amp; Projects &gt; Turbines Technologies Inc.</p>
        <div class="vh-topbar-tools" aria-label="header tools">
          <span class="vh-topbar-tool" aria-hidden="true">⌕</span>
          <span class="vh-topbar-tool" aria-hidden="true">🔔</span>
          <span class="vh-topbar-user">John Rambo</span>
          <span class="vh-topbar-tool" aria-hidden="true">⚙</span>
        </div>
      </header>

      <main class="vh-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
