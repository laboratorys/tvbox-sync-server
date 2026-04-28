<script setup lang="ts">
import ModeToggle from "@/components/ModeToggle.vue";
import { Toaster } from "@/components/ui/sonner";
import UserMenu from "@/components/UserMenu.vue";
import { computed } from "vue";
import "vue-sonner/style.css";
const versionInfo = computed(() => `Version: ${__VITE_WEBAPP_VERSION__}`);
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors">
    <header
      class="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <img src="/favicon.svg" alt="Logo" class="w-6 h-6 object-contain" />
        <h1
          class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          TVBox Sync Center
        </h1>
        <span
          class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {{ versionInfo }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <ModeToggle />
        <UserMenu />
      </div>
    </header>

    <main class="pt-15">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
  <Toaster />
</template>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
