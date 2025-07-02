<template>
  <div 
    class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group"
    @click="$emit('click')"
  >
    <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-600 group-hover:bg-gray-200 transition-colors">
      <slot name="icon">{{ icon }}</slot>
    </div>
    <div class="flex-1">
      <div class="text-sm font-medium text-gray-900">{{ title }}</div>
      <div class="text-xs text-gray-500">{{ description }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>
