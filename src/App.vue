<template>
  <VendorHubLayout>
    <RouterView :key="route.path" />
  </VendorHubLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import VendorHubLayout from '@/components/vendorHubLayout/VendorHubLayout.vue'

const route = useRoute()

onMounted(() => {
  console.log('onMounted App (shell)')
})
</script>
