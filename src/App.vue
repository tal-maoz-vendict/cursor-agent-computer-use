<template>
  <VendorHubLayout>
    <RouterView />
  </VendorHubLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import VendorHubLayout from '@/components/vendorHubLayout/VendorHubLayout.vue'

onMounted(() => {
  console.log('onMounted App')
})
</script>
