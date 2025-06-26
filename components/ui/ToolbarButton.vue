<template>
  <button
    class="flex items-center justify-center w-8 h-8 rounded-md border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out"
    :class="[
      active 
        ? 'bg-blue-500 text-white shadow-md' 
        : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:scale-105'
    ]"
    :title="title"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>
