<script setup lang="ts">
import {
  BookOpen,
  NotebookText,
  CirclePlus,
} from 'lucide-vue-next'

import NavMain from '@/components/NavMain.vue'
import NavUser from './NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from '../components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset',
})

const data = {
  user: {
    name: 'adi',
    email: 'adi@example.com',
    avatar: 'https://avatar.vercel.sh/adi?rounded=60',
  },
  navMain: [
    {
      title: 'Add Journal',
      url: '/add-journal',
      icon: CirclePlus,
    },
    {
      title: 'My Journals',
      url: '/dashboard',
      icon: NotebookText,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpen class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Journal App</span>
                <span class="truncate text-xs">Free Plan</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
  </Sidebar>
</template>
