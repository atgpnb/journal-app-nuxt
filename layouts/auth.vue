<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding/Info -->
     <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
      <div class="absolute inset-0 bg-grid-pattern opacity-5" />
      <div class="relative z-10 flex flex-col justify-center px-12 text-center">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-primary mb-4">Journal App</h1>
          <p class="text-lg text-muted-foreground leading-relaxed">
            Capture your thoughts, track your progress, and reflect on your journey with our intuitive journaling platform.
          </p>
        </div>
        <div class="space-y-4 text-sm text-muted-foreground">
          <div class="flex items-center justify-center space-x-2">
            <Icon name="lucide:shield-check" class="w-4 h-4" />
            <span>Secure & Private</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <Icon name="lucide:cloud" class="w-4 h-4" />
            <span>Cloud Sync</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <Icon name="lucide:smartphone" class="w-4 h-4" />
            <span>Cross-Platform</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Auth Form -->
    <div class="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-20">
      <div class="mx-auto w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
          <h1 class="text-2xl font-bold text-primary">Journal App</h1>
        </div>
        
        <!-- Dynamic content -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
