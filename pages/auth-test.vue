<script setup lang="ts">
// Test page to check auth functionality
const { isAuthenticated, user, token } = useAuth()
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-4">Auth Test Page</h1>
    
    <div class="space-y-4">
      <div>
        <strong>Is Authenticated:</strong> {{ isAuthenticated }}
      </div>
      
      <div>
        <strong>User:</strong>
        <pre>{{ user ? JSON.stringify(user, null, 2) : 'null' }}</pre>
      </div>
      
      <div>
        <strong>Token:</strong> {{ token ? 'Present' : 'null' }}
      </div>
      
      <div class="space-x-4">
        <NuxtLink to="/signup" class="bg-blue-500 text-white px-4 py-2 rounded">
          Go to Signup
        </NuxtLink>
        <NuxtLink to="/login" class="bg-green-500 text-white px-4 py-2 rounded">
          Go to Login
        </NuxtLink>
        <NuxtLink to="/dashboard" class="bg-purple-500 text-white px-4 py-2 rounded">
          Go to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
