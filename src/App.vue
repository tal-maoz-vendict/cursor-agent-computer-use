<template>
  <VendorHubLayout>
    <!-- Remount route component per path so placeholders log onMounted on each tab. -->
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
