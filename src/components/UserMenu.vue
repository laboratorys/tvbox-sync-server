<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { LogOut, User } from "lucide-vue-next";

const auth = useAuthStore();

const handleLogout = () => {
  auth.clearAuth();
  window.location.href = "/login";
};
</script>

<template>
  <DropdownMenu v-if="auth.isAuthenticated">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        type="button"
        class="relative h-9 w-9 rounded-full">
        <Avatar class="h-5 w-5">
          <AvatarImage
            src="https://github.com/evilrabbit.png"
            alt="@evilrabbit" />
          <AvatarFallback>{{
            auth.user?.slice(0, 2).toUpperCase() || "CN"
          }}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-40" align="end" :side-offset="8">
      <DropdownMenuItem
        @click.stop="handleLogout"
        class="cursor-pointer text-red-600 focus:text-red-600">
        <LogOut class="mr-2 h-4 w-4" />
        退出登录
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <Button
    v-else
    variant="ghost"
    size="icon"
    class="rounded-full w-9 h-9"
    as-child>
    <a href="/login">
      <User class="h-5 w-5" />
    </a>
  </Button>
</template>
