<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding/Info -->
     <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
      <Nuxt-img
        src="/images/bg-auth.jpg"
        alt="Journal Background"
        class="absolute inset-0 object-cover w-full h-full" />
      <div class="absolute z-10 flex flex-col justify-center px-12 text-left bottom-0 bg-gradient-to-b from-transparent via-background to-background w-full h-fit py-16">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-foreground mb-4">Journal App</h1>
          <p class="text-lg text-muted-foreground leading-relaxed">
           Simple journal app for documenting your PNS Journey.
          </p>
        </div>
      </div>
    </div>

    <!-- Right side - Auth Form -->
    <div class="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-20">
      <div class="mx-auto w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
            <Icon name="lucide:book-open" class="mx-auto -mb-2 h-24 w-24 text-primary" />
          <h1 class="text-base font-bold text-primary">Journal App</h1>
        </div>
        
        <!-- Dynamic content -->
        <slot />
      </div>
    </div>
  </div>
</template>
