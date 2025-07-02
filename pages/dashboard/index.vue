<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<template>
<NuxtLayout name="dashboard">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-6">Journal Entries</h1>
    <p class="text-lg text-gray-600 mb-8">
      Here you can view and manage your journal entries.
    </p>
    
    <div class="flex gap-4 mb-6">
      <NuxtLink to="/journal/create" class="btn btn-primary">Create New Entry</NuxtLink>
      <NuxtLink to="/journal/archive" class="btn btn-secondary">View Archive</NuxtLink>
    </div>

    <!-- Journal entries list will be rendered here -->
    <div class="space-y-4">
      <!-- Example entry -->
      <div class="p-4 border
        rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h2 class="text-xl font-semibold">My First Journal Entry</h2>
        <p class="text-gray-700">This is a brief description of my first journal entry.</p>
        <div class="mt-2">
          <NuxtLink to="/journal/1" class="text-blue-600 hover:underline">Read more</NuxtLink>
        </div>
        </div>
        <!-- More entries can be added here -->
        <div class="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h2 class="text-xl font-semibold">My Second Journal Entry</h2>
        <p class="text-gray-700">This is a brief description of my second journal entry.</p>
        <div class="mt-2">
          <NuxtLink to="/journal/2" class="text-blue-600 hover:underline">Read more</NuxtLink>
        </div>
      </div>
        <!-- Add more entries as needed -->
    </div>
    </div>
    </NuxtLayout>
    

</template>