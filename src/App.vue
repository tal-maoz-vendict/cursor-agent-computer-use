<template>
  <VendorHubLayout>
    <!-- Force remount per path so placeholder routes each fire onMounted (tab nav benchmarks). -->
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
