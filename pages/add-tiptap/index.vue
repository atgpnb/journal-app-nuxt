<script setup lang="ts">
import { Button } from '@/components/ui/button'
// Set layout for this page
definePageMeta({
    layout: 'dashboard'
    })

</script>


<template>
    <NuxtLayout name="dashboard">
            <!-- Content -->
            <TipTapEditor />

            <!-- Submit Button -->
            <Button type="submit">Add Entry</Button>

    </NuxtLayout>
</template>