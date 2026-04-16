export const TAB_PATHS = [
  '/home',
  '/risk-per-domain',
  '/contacts',
  '/reports',
  '/external-risks',
  '/workflows',
  '/library',
] as const

export type TabPath = (typeof TAB_PATHS)[number]

export const EXPECTED_MOUNTED_BY_TAB: Record<TabPath, string[]> = {
  '/home': [
    'HomeView',
    'VendorHeader',
    'VendorProfileCard',
    'VendorScoreGrid',
    'VendorDetailsGrid',
    'VendorProjectsSection',
  ],
  '/risk-per-domain': ['PlaceholderView'],
  '/contacts': ['PlaceholderView'],
  '/reports': ['PlaceholderView'],
  '/external-risks': ['PlaceholderView'],
  '/workflows': ['PlaceholderView'],
  '/library': ['PlaceholderView'],
}

export const TAB_LABEL: Record<TabPath, string> = {
  '/home': 'Home',
  '/risk-per-domain': 'Risk Per Domain',
  '/contacts': 'Contacts',
  '/reports': 'Reports',
  '/external-risks': 'External Risks',
  '/workflows': 'Workflows',
  '/library': 'Library',
}

export const VISITS_PER_TAB = 10
