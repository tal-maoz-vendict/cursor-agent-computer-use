<script setup lang="ts">
enum SidebarIcon {
  Home = 'home',
  Risk = 'risk',
  Contacts = 'contacts',
  Reports = 'reports',
  External = 'external',
  Workflows = 'workflows',
  Library = 'library',
}

interface SidebarTab {
  label: string
  to: string
  icon: SidebarIcon
}

const sidebarTabs: SidebarTab[] = [
  { label: 'Home', to: '/home', icon: SidebarIcon.Home },
  { label: 'Risk Per Domain', to: '/risk-per-domain', icon: SidebarIcon.Risk },
  { label: 'Contacts', to: '/contacts', icon: SidebarIcon.Contacts },
  { label: 'Reports', to: '/reports', icon: SidebarIcon.Reports },
  { label: 'External Risks', to: '/external-risks', icon: SidebarIcon.External },
  { label: 'Workflows', to: '/workflows', icon: SidebarIcon.Workflows },
  { label: 'Library', to: '/library', icon: SidebarIcon.Library },
]

const iconPaths: Record<SidebarIcon, string> = {
  [SidebarIcon.Home]: 'M3 11.5 12 4l9 7.5M6 10.5v8h12v-8',
  [SidebarIcon.Risk]: 'M12 4 20 18H4L12 4Zm0 5.2v4.4m0 2.4h.01',
  [SidebarIcon.Contacts]:
    'M18 19.5H6a1 1 0 0 1-1-1v-1.1c0-2.4 2.2-4.4 5-4.4h4c2.8 0 5 2 5 4.4v1.1a1 1 0 0 1-1 1ZM12 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 11Z',
  [SidebarIcon.Reports]:
    'M7 3.5h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z M15 3.5v4h4 M9 11h6 M9 14.5h6 M9 18h4',
  [SidebarIcon.External]:
    'M12 3.5 14.6 9.4 21 10l-4.8 4.2 1.5 6.3L12 17l-5.7 3.5 1.5-6.3L3 10l6.4-.6L12 3.5Z',
  [SidebarIcon.Workflows]:
    'M8.5 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm7 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM4.5 19v-.6c0-2 1.7-3.6 3.8-3.6h.4c2.1 0 3.8 1.6 3.8 3.6v.6m2.8 0v-.6c0-2 1.7-3.6 3.8-3.6h.4c2.1 0 3.8 1.6 3.8 3.6v.6',
  [SidebarIcon.Library]:
    'M6 4h5.5v16H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6.5 0H18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5.5',
}
</script>

<template>
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
</template>

<style scoped>
.vh-sidebar {
  border-right: 1px solid #e8e7f5;
  background: #f7f6fd;
  padding: 1.4rem 1rem 1.1rem;
}

.vh-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  padding-inline: 0.5rem;
}

.vh-logo-mark {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.55rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: #fff;
  background: #6f50f7;
}

.vh-logo-text {
  font-weight: 700;
  font-size: 1.05rem;
  color: #4c2fd1;
}

.vh-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.vh-nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  padding: 0.62rem 0.68rem;
  color: #5a4f8e;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.vh-nav-item-active {
  background: #e8e1ff;
  color: #4c2fd1;
}

.vh-nav-icon {
  width: 1.05rem;
  height: 1.05rem;
  display: inline-flex;
}

.vh-nav-icon svg {
  width: 100%;
  height: 100%;
}

@media (max-width: 960px) {
  .vh-sidebar {
    border-right: none;
    border-bottom: 1px solid #e8e7f5;
    padding-bottom: 0.9rem;
  }

  .vh-sidebar-nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  }
}
</style>
