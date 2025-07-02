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
  layout: 'auth',
  middleware: 'guest'
})

// Use auth composable
const { login, isLoggingIn, loginError, isLoginSuccess } = useAuth()

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2, 'Username/Email must be at least 2 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
}))

const { isFieldDirty, handleSubmit, setFieldError } = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: '',
    password: ''
  }
})

// Watch for login errors and display them
watch(loginError, (error) => {
  if (error) {
    try {
      const errorData = JSON.parse(error)

      if (errorData.errors) {
        // Set field-specific errors
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setFieldError(field as 'username' | 'password', messages[0])
          }
        })
      } else if (errorData.message) {
        toast.error('Login Failed', {
          description: errorData.message,
        })
      }
    } catch {
      toast.error('Login Failed', {
        description: 'An unexpected error occurred. Please try again.',
      })
    }
  }
})

// Watch for login success
watch(isLoginSuccess, (success) => {
  if (success) {
    toast.success('Login successful!', {
      description: 'Welcome back!',
    })
  }
})

const onSubmit = handleSubmit((values) => {
  login({
    username: values.username,
    password: values.password,
  })
})
</script>

<template>
  <NuxtLayout :name="'auth'">
    <AuthContainer title="Welcome back" subtitle="Enter your credentials to access your account">
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="username" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate>
            <FormLabel>Username or Email</FormLabel>
            <FormControl>
              <Input type="text" placeholder="johndoe or john@example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
          <FormItem v-auto-animate>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="********" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Remember me and Forgot password -->
        <div class="flex items-center justify-between text-sm">
          <NuxtLink to="/forgot-password" class="text-primary hover:underline">
            Forgot password?
          </NuxtLink>
        </div>
        <nuxt-link to="/dashboard">
          <Button type="submit" class="w-full" :disabled="isLoggingIn">
            <span v-if="isLoggingIn" class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Signing In...
            </span>
            <span v-else>Sign In</span>
          </Button>
        </nuxt-link>

      </form>
      <div class="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?
        <NuxtLink to="/signup" class="text-primary hover:underline">
          Sign up
        </NuxtLink>
      </div>
    </AuthContainer>
  </NuxtLayout>
</template>