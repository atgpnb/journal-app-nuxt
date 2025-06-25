<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'
import AuthContainer from '@/components/auth/AuthContainer.vue'

// Set layout for this page
definePageMeta({
  layout: 'auth'
})

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email address')
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  toast('Password reset email sent!', {
    description: `Check your inbox at ${values.email}`,
  })
})
</script>

<template>
    <NuxtLayout :name="'auth'">
  <AuthContainer 
    title="Reset password"
    subtitle="Enter your email address and we'll send you a link to reset your password"
    :alternate-action="{
      text: 'Remember your password?',
      linkText: 'Back to sign in',
      href: '/login'
    }"
  >
    <form class="space-y-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="john@example.com" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
      <Button type="submit" class="w-full">
        Send Reset Link
      </Button>
    </form>
  </AuthContainer>
</NuxtLayout>
</template>
