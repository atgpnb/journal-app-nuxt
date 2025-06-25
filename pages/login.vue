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
  username: z.string().min(2).max(50),
    password: z.string().min(8).max(100).refine((val) => {
      // Custom validation logic for password
      const hasUpperCase = /[A-Z]/.test(val)
      const hasLowerCase = /[a-z]/.test(val)
      const hasNumber = /\d/.test(val)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val)
      return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
    }, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  toast('Event has been created', {
    description: `Hello, \n${JSON.stringify(values, null, 2)}`,
  })
})
</script>

<template>
    <NuxtLayout :name="'auth'">
    <AuthContainer 
        title="Welcome back"
        subtitle="Enter your credentials to access your account"
    >
        <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="username" :validate-on-blur="!isFieldDirty">
            <FormItem v-auto-animate>
            <FormLabel>Username</FormLabel>
            <FormControl>
                <Input type="text" placeholder="triginarsa" v-bind="componentField" />
            </FormControl>
            <FormMessage />
            </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
            <FormItem v-auto-animate>
            <FormLabel>Password</FormLabel>
            <FormControl>
                <Input type="password" placeholder="" v-bind="componentField" />
            </FormControl>
            <FormMessage />
            </FormItem>
        </FormField>
            <!-- Remember me and Forgot password -->
        <div class="flex items-center justify-between text-sm">
            <label class="flex items-center space-x-2">
            <Checkbox />
            <span>Remember me</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-primary hover:underline">
            Forgot password?
            </NuxtLink>
        </div>
        
        <Button type="submit" class="w-full">
            Sign In
        </Button>
        </form>
    </AuthContainer>
    </NuxtLayout>
</template>