<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'
// Set layout for this page
definePageMeta({
  layout: 'dashboard'
})  
const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
}))
const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})
const onSubmit = handleSubmit((values) => {
  // Simulate a successful submission
  toast('Journal entry added successfully!', {
    description: `Title: ${values.title}\nContent: ${values.content}`,
  })
})
</script>



<template>
<NuxtLayout name="dashboard">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- Title -->
      <FormField v-slot="{ componentField }" name="title" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input type="text" placeholder="My First Journal Entry" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Content -->
      <FormField v-slot="{ componentField }" name="content" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Content</FormLabel>
          <FormControl>
            <Textarea placeholder="Write your thoughts here..." v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <Button type="submit">Add Entry</Button>
    </form>
</NuxtLayout>
</template>