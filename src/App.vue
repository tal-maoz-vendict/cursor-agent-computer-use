<template>
  <VendorHubLayout>
    <!-- Remount main content per route so tab switches always run onMounted (benchmark + fresh tab state). -->
    <RouterView :key="route.fullPath" />
  </VendorHubLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import VendorHubLayout from '@/components/vendorHubLayout/VendorHubLayout.vue'

const route = useRoute()

onMounted(() => {
  console.log('onMounted App')
})
</script>
