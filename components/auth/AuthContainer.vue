<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">{{ title }}</h2>
      <p v-if="subtitle" class="text-muted-foreground">{{ subtitle }}</p>
    </div>

    <!-- Form Content -->
    <slot />

  </div>
</template>
