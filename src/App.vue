<script setup lang="ts">
import ModeToggle from "@/components/ModeToggle.vue";
import { Toaster } from "@/components/ui/sonner";
import UserMenu from "@/components/UserMenu.vue";
import "vue-sonner/style.css";
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors">
    <header class="fixed top-6 right-6 z-50 flex items-center gap-3">
      <ModeToggle />
      <UserMenu />
    </header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
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
