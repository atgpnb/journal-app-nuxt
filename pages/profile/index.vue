<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const profile = {
  name: 'yoga',
  email: 'yoga@example.com',
  whatsapp: '',
  role: 'Admin',
  department: 'UPA-KK',
  avatar: 'A'
}
</script>

<template>
  <div class="container mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">Profil Saya</h1>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Profile Photo Section -->
      <Card class="md:col-span-1">
        <CardHeader>
          <CardTitle class="text-lg">Foto Profil</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col items-center gap-4">
          <Avatar class="h-24 w-24">
            <AvatarImage :src="`https://avatar.vercel.sh/${profile.name}?rounded=60`" />
            <AvatarFallback class="text-2xl">{{ profile.avatar }}</AvatarFallback>
          </Avatar>
          <Button variant="outline">Ubah Foto</Button>
        </CardContent>
      </Card>

      <!-- User Information Section -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle class="text-lg">Informasi Pengguna</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <Input id="username" :model-value="profile.name" disabled />
            </div>
            <div class="space-y-2">
              <Label for="name">Nama</Label>
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
              <Label for="role">Hak Akses</Label>
              <Input id="role" :model-value="profile.role" disabled />
            </div>
            <div class="space-y-2">
              <Label for="department">Departemen</Label>
              <Input id="department" :model-value="profile.department" disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end">
          <Button>Edit Profil</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>