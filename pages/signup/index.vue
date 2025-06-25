<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100).refine((val) => {
    // Custom validation logic for password
    const hasUpperCase = /[A-Z]/.test(val)
    const hasLowerCase = /[a-z]/.test(val)
    const hasNumber = /\d/.test(val)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val)
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
  }, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  toast('Account created successfully!', {
    description: `Welcome, ${values.firstName}!`,
  })
})
</script>

<template>
  <NuxtLayout :name="'auth'">
  <AuthContainer 
    title="Create account"
    subtitle="Start your journaling journey today"
    :alternate-action="{
      text: 'Already have an account?',
      linkText: 'Sign in',
      href: '/login'
    }"
  >
    <form class="space-y-4" @submit="onSubmit">
      <!-- Name fields -->
      <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="adi" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Email -->
      <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="adi@example.com" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Username -->
      <FormField v-slot="{ componentField }" name="username" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input type="text" placeholder="triginarsa" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Password -->
      <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="********" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Confirm Password -->
      <FormField v-slot="{ componentField }" name="confirmPassword" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="********" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
        <!-- Terms and conditions -->
      <div class="flex items-start space-x-2 text-sm">
        <Checkbox class="mt-1" required />
        <span class="text-muted-foreground">
          I agree to the 
          <NuxtLink to="/terms" class="text-primary hover:underline">Terms of Service</NuxtLink>
          and 
          <NuxtLink to="/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>
        </span>
      </div>
      
      <Button type="submit" class="w-full">
        Create Account
      </Button>
    </form>
    <div class="text-center text-sm text-muted-foreground mt-4">
      Already have an account? 
      <NuxtLink to="/login" class="text-primary hover:underline">
        Sign in
      </NuxtLink>
    </div>
  </AuthContainer>
  </NuxtLayout>
</template>
