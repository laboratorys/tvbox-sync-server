<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { Home, LogIn, LogOut, Settings, User } from "lucide-vue-next";
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();

const handleLogout = () => {
  auth.clearAuth();
  window.location.href = "/login";
};
const handleConfigJump = () => {
  if (router.currentRoute.value.path === "/config") {
    router.push("/");
  } else {
    router.push("/config");
  }
};
const mainMenu = computed(() => {
  return [
    {
      label: router.currentRoute.value.path !== "/config" ? "配置管理" : "首页",
      icon: router.currentRoute.value.path !== "/config" ? Settings : Home,
      onClick: handleConfigJump,
    },
    {
      label: "退出登录",
      icon: LogOut,
      onClick: handleLogout,
      class: "text-red-600 focus:text-red-600",
    },
  ];
});
</script>

<template>
  <Button
    v-if="!auth.isAuthenticated"
    variant="ghost"
    type="button"
    class="relative h-9 w-9 rounded-full"
    @click="router.push('/login')">
     <LogIn class="h-5 w-5" />
    
  </Button>
  <DropdownMenu v-else>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        type="button"
        class="relative h-9 w-9 rounded-full">
       <User class="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      class="w-40"
      align="end"
      :side-offset="8"
      v-if="auth.isAuthenticated">
      <DropdownMenuItem
        v-for="item in mainMenu"
        :key="item.label"
        @click.stop="item.onClick"
        :class="item.class"
        class="cursor-pointer">
        <component :is="item.icon" class="mr-2 h-4 w-4" />
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
