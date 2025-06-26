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
  layout: 'auth',
  middleware: 'guest'
})

// Use auth composable
const { signup, isSigningUp, signupError, isSignupSuccess } = useAuth()

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100).refine((val) => {
    // Custom validation logic for password
    const hasUpperCase = /[A-Z]/.test(val)
    const hasLowerCase = /[a-z]/.test(val)
    const hasNumber = /\d/.test(val)
    const hasSpecialChar = /[@$!%*?&]/.test(val)
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
  }, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
  }),
  confirmPassword: z.string(),
  terms: z.boolean().default(false).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}))

const { isFieldDirty, handleSubmit, setFieldError } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    terms: false
  }
})

// Watch for signup errors and display them
watch(signupError, (error) => {
  if (error) {
    try {
      const errorData = JSON.parse(error)
      
      if (errorData.errors) {
        // Set field-specific errors
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setFieldError(field as 'name' | 'username' | 'email' | 'password' | 'confirmPassword' | 'terms', messages[0])
          }
        })
      } else if (errorData.message) {
        toast.error('Signup Failed', {
          description: errorData.message,
        })
      }
    } catch {
      toast.error('Signup Failed', {
        description: 'An unexpected error occurred. Please try again.',
      })
    }
  }
})

// Watch for signup success
watch(isSignupSuccess, (success) => {
  if (success) {
    toast.success('Account created successfully!', {
      description: 'Welcome to Journal App!',
    })
  }
})

const onSubmit = handleSubmit((values) => {
  // Check terms validation manually
  if (!values.terms) {
    toast.error('Validation Error', {
      description: 'You must agree to the terms and conditions',
    })
    return
  }
  
  signup({
    name: values.name,
    username: values.username,
    email: values.email,
    password: values.password,
    password_confirmation: values.confirmPassword,
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
      <!-- Name field -->
      <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="John Doe" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Email -->
      <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="john@example.com" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Username -->
      <FormField v-slot="{ componentField }" name="username" :validate-on-blur="!isFieldDirty">
        <FormItem v-auto-animate>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input type="text" placeholder="johndoe" v-bind="componentField" />
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
      <FormField v-slot="{ value, handleChange }" type="checkbox" name="terms">
        <FormItem class="flex flex-row items-start gap-x-3 space-y-0">
          <FormControl>
            <Checkbox :model-value="value" @update:model-value="handleChange" />
          </FormControl>
          <div class="space-y-1 leading-none">
            <FormLabel class="text-sm text-muted-foreground leading-normal">
              I agree to the 
              <NuxtLink to="/terms" class="text-primary hover:underline">Terms of Service</NuxtLink>
              and 
              <NuxtLink to="/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      </FormField>
      
      <Button type="submit" class="w-full" :disabled="isSigningUp">
        <span v-if="isSigningUp" class="flex items-center gap-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          Creating Account...
        </span>
        <span v-else>Create Account</span>
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
