<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl text-foreground font-bold mb-6">Welcome to Journal App</h1>
    <p class="text-lg text-muted-foreground mb-8">
      Start documenting your thoughts and experiences with our intuitive journal application.
    </p>
    
    <div class="flex gap-4">
      <Button>
        <NuxtLink to="/login">Get Started</NuxtLink>
      </Button>
      <Button variant="outline">
        <NuxtLink to="/dashboard">Dashboard Example</NuxtLink>
      </Button>
    </div>
  </div>
</template>
