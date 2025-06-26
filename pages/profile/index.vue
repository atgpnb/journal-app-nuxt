<template>
  <div class="container mx-auto max-w-4xl p-6">
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p class="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Profile Information -->
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit="onProfileSubmit" class="space-y-4" v-auto-animate>
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      v-bind="componentField"
                      :disabled="isUpdatingProfile"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="username">
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      v-bind="componentField"
                      :disabled="isUpdatingProfile"
                    />
                  </FormControl>
                  <FormDescription>
                    This is your unique identifier. It can only contain letters, numbers, hyphens, and underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      v-bind="componentField"
                      :disabled="isUpdatingProfile"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" :disabled="isUpdatingProfile">
                <Icon v-if="isUpdatingProfile" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Password Change -->
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit="onPasswordSubmit" class="space-y-4" v-auto-animate>
              <FormField v-slot="{ componentField }" name="current_password">
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      v-bind="componentField"
                      :disabled="isChangingPassword"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="password">
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      v-bind="componentField"
                      :disabled="isChangingPassword"
                      @input="onPasswordInput"
                    />
                  </FormControl>
                  <FormDescription v-if="passwordStrength.feedback.length > 0">
                    <div class="space-y-1">
                      <div class="flex items-center space-x-2">
                        <div class="flex space-x-1">
                          <div 
                            v-for="i in 4" 
                            :key="i"
                            class="h-1 w-6 rounded"
                            :class="{
                              'bg-red-500': passwordStrength.level === 'weak' && i <= 1,
                              'bg-yellow-500': passwordStrength.level === 'fair' && i <= 2,
                              'bg-blue-500': passwordStrength.level === 'good' && i <= 3,
                              'bg-green-500': passwordStrength.level === 'strong' && i <= 4,
                              'bg-gray-200': (
                                (passwordStrength.level === 'weak' && i > 1) ||
                                (passwordStrength.level === 'fair' && i > 2) ||
                                (passwordStrength.level === 'good' && i > 3)
                              )
                            }"
                          />
                        </div>
                        <span class="text-xs font-medium capitalize">{{ passwordStrength.level }}</span>
                      </div>
                      <div class="text-xs text-muted-foreground">
                        <ul class="list-disc list-inside space-y-1">
                          <li v-for="feedback in passwordStrength.feedback" :key="feedback">
                            {{ feedback }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="password_confirmation">
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      v-bind="componentField"
                      :disabled="isChangingPassword"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button type="submit" :disabled="isChangingPassword">
                <Icon v-if="isChangingPassword" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- Account Information -->
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Account ID</Label>
              <p class="text-sm text-muted-foreground">#{{ user?.id }}</p>
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Member Since</Label>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(user?.created_at) }}
              </p>
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Email Status</Label>
              <div class="flex items-center space-x-2">
                <Badge v-if="user?.email_verified_at" variant="success">
                  <Icon name="lucide:check" class="mr-1 h-3 w-3" />
                  Verified
                </Badge>
                <Badge v-else variant="destructive">
                  <Icon name="lucide:x" class="mr-1 h-3 w-3" />
                  Not Verified
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AUTH_CONFIG, validateEmail, validateUsername, getPasswordStrength } from '@/constants/auth'
import { toast } from 'vue-sonner'

// Set layout and middleware for this page
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Use auth composable
const { 
  user,
  updateProfile,
  changePassword,
  isUpdatingProfile,
  isChangingPassword,
  profileError,
  passwordError,
  isProfileSuccess,
  isPasswordSuccess
} = useAuth()

// Profile form validation schema
const profileSchema = toTypedSchema(z.object({
  name: z.string()
    .min(AUTH_CONFIG.VALIDATION.NAME.MIN_LENGTH, 
         `Name must be at least ${AUTH_CONFIG.VALIDATION.NAME.MIN_LENGTH} characters`)
    .max(AUTH_CONFIG.VALIDATION.NAME.MAX_LENGTH, 
         `Name must not exceed ${AUTH_CONFIG.VALIDATION.NAME.MAX_LENGTH} characters`),
  username: z.string()
    .min(AUTH_CONFIG.VALIDATION.USERNAME.MIN_LENGTH,
         `Username must be at least ${AUTH_CONFIG.VALIDATION.USERNAME.MIN_LENGTH} characters`)
    .max(AUTH_CONFIG.VALIDATION.USERNAME.MAX_LENGTH,
         `Username must not exceed ${AUTH_CONFIG.VALIDATION.USERNAME.MAX_LENGTH} characters`)
    .regex(AUTH_CONFIG.VALIDATION.USERNAME.PATTERN, 
           AUTH_CONFIG.MESSAGES.USERNAME_INVALID),
  email: z.string()
    .email(AUTH_CONFIG.MESSAGES.EMAIL_INVALID)
    .max(AUTH_CONFIG.VALIDATION.EMAIL.MAX_LENGTH,
         `Email must not exceed ${AUTH_CONFIG.VALIDATION.EMAIL.MAX_LENGTH} characters`)
}))

// Password form validation schema
const passwordSchema = toTypedSchema(z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z.string()
    .min(AUTH_CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH,
         `Password must be at least ${AUTH_CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`)
    .max(AUTH_CONFIG.PASSWORD_REQUIREMENTS.MAX_LENGTH,
         `Password must not exceed ${AUTH_CONFIG.PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`)
    .regex(AUTH_CONFIG.PASSWORD_REQUIREMENTS.PATTERNS.UPPERCASE, 
           'Password must contain at least one uppercase letter')
    .regex(AUTH_CONFIG.PASSWORD_REQUIREMENTS.PATTERNS.LOWERCASE,
           'Password must contain at least one lowercase letter')
    .regex(AUTH_CONFIG.PASSWORD_REQUIREMENTS.PATTERNS.NUMBER,
           'Password must contain at least one number')
    .regex(AUTH_CONFIG.PASSWORD_REQUIREMENTS.PATTERNS.SPECIAL_CHAR,
           'Password must contain at least one special character (@$!%*?&)'),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: AUTH_CONFIG.MESSAGES.PASSWORD_MISMATCH,
  path: ["password_confirmation"],
}))

// Profile form
const { handleSubmit: handleProfileSubmit, setFieldError: setProfileError } = useForm({
  validationSchema: profileSchema,
  initialValues: {
    name: user.value?.name || '',
    username: user.value?.username || '',
    email: user.value?.email || ''
  }
})

// Password form
const { 
  handleSubmit: handlePasswordSubmit, 
  setFieldError: setPasswordError,
  resetForm: resetPasswordForm
} = useForm({
  validationSchema: passwordSchema,
  initialValues: {
    current_password: '',
    password: '',
    password_confirmation: ''
  }
})

// Password strength tracking
const passwordStrength = ref({ score: 0, level: 'weak' as const, feedback: [] as string[] })

const onPasswordInput = (event: Event) => {
  const password = (event.target as HTMLInputElement).value
  passwordStrength.value = getPasswordStrength(password)
}

// Watch for profile success
watch(isProfileSuccess, (success) => {
  if (success) {
    toast.success(AUTH_CONFIG.MESSAGES.PROFILE_UPDATE_SUCCESS, {
      description: 'Your profile has been updated successfully.'
    })
  }
})

// Watch for password success
watch(isPasswordSuccess, (success) => {
  if (success) {
    toast.success(AUTH_CONFIG.MESSAGES.PASSWORD_CHANGE_SUCCESS, {
      description: 'Your password has been changed successfully.'
    })
    resetPasswordForm()
  }
})

// Watch for profile errors
watch(profileError, (error) => {
  if (error) {
    try {
      const errorData = JSON.parse(error)
      if (errorData.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setProfileError(field, messages[0])
          }
        })
      } else {
        toast.error(AUTH_CONFIG.MESSAGES.PROFILE_UPDATE_FAILED, {
          description: error
        })
      }
    } catch {
      toast.error(AUTH_CONFIG.MESSAGES.PROFILE_UPDATE_FAILED, {
        description: error
      })
    }
  }
})

// Watch for password errors
watch(passwordError, (error) => {
  if (error) {
    try {
      const errorData = JSON.parse(error)
      if (errorData.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setPasswordError(field, messages[0])
          }
        })
      } else {
        toast.error(AUTH_CONFIG.MESSAGES.PASSWORD_CHANGE_FAILED, {
          description: error
        })
      }
    } catch {
      toast.error(AUTH_CONFIG.MESSAGES.PASSWORD_CHANGE_FAILED, {
        description: error
      })
    }
  }
})

// Profile form submission
const onProfileSubmit = handleProfileSubmit((values) => {
  // Client-side validation
  const emailValidation = validateEmail(values.email)
  if (!emailValidation.isValid) {
    setProfileError('email', emailValidation.error!)
    return
  }

  const usernameValidation = validateUsername(values.username)
  if (!usernameValidation.isValid) {
    setProfileError('username', usernameValidation.error!)
    return
  }

  // Submit to API
  updateProfile(values)
})

// Password form submission
const onPasswordSubmit = handlePasswordSubmit((values) => {
  changePassword({
    current_password: values.current_password,
    password: values.password,
    password_confirmation: values.password_confirmation
  })
})

// Utility function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
