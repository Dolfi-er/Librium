<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="greeting">
    Добро пожаловать, <strong>{{ authStore.user?.name }}</strong>!
  </div>
</template>