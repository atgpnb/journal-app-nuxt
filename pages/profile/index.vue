<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
const passwordStrength = ref<{ score: number; level: 'weak' | 'fair' | 'good' | 'strong'; feedback: string[] }>({
  score: 0,
  level: 'weak',
  feedback: []
})

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
            setProfileError(field as 'name' | 'username' | 'email', messages[0])
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
            setPasswordError(field as 'current_password' | 'password' | 'password_confirmation', messages[0])
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

// For the old profile card demo (if still needed)
const profile = {
  name: 'yoga',
  email: 'yoga@example.com',
  whatsapp: '',
  role: 'Admin',
  department: 'UPA-KK',
  avatar: 'A'
}


function useAuth(): { user: any; updateProfile: any; changePassword: any; isUpdatingProfile: any; isChangingPassword: any; profileError: any; passwordError: any; isProfileSuccess: any; isPasswordSuccess: any } {
  throw new Error('Function not implemented.')
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <div class="container mx-auto py-8">
      <h1 class="text-2xl font-bold mb-6">My Profile</h1>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Profile Photo Section -->
        <Card class="md:col-span-1">
          <CardHeader>
            <CardTitle class="text-lg">Photo Profile</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-4">
            <Avatar class="h-24 w-24">
              <AvatarImage :src="`https://avatar.vercel.sh/${profile.name}?rounded=60`" />
              <AvatarFallback class="text-2xl">{{ profile.avatar }}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </CardContent>
        </Card>

        <!-- User Information Section -->
        <Card class="md:col-span-2">
          <CardHeader>
            <CardTitle class="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="username">Username</Label>
                <Input id="username" :model-value="profile.name" disabled />
              </div>
              <div class="space-y-2">
                <Label for="name">Name</Label>
                <Input id="name" :model-value="profile.name" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input id="email" type="email" :model-value="profile.email" />
              </div>
              <div class="space-y-2">
                <Label for="whatsapp">No. WhatsApp</Label>
                <Input id="whatsapp" :model-value="profile.whatsapp" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="role">User Permission</Label>
                <Input id="role" :model-value="profile.role" disabled />
              </div>
              <div class="space-y-2">
                <Label for="department">Department</Label>
                <Input id="department" :model-value="profile.department" disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end flex gap-4">
            <Button variant="outline">
              <NuxtLink to="/dashboard"> Back </NuxtLink>
            </Button>
            <Button>
              <NuxtLink to="/editprofile">Edit Profile</NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    <div class="container mx-auto max-w-4xl p-6">
      <div class="space-y-6">
        <!-- Page Header -->
        <div class="space-y-2">
          
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
