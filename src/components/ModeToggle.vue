<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/stores/app";
import { useColorMode } from "@vueuse/core";
import { BadgeCheck, Monitor, Moon, Sun } from "lucide-vue-next";
const appStore = useAppStore();
// useColorMode 会自动处理 class 切换，mode.value 即为当前状态
const mode = useColorMode({
  modes: {
    light: "light",
    dark: "dark",
    auto: "auto",
  },
});
const setMode = (newMode: "light" | "dark" | "auto") => {
  mode.value = newMode;
  appStore.setThemeMode(newMode);
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full w-9 h-9 hover:bg-slate-200/50 dark:hover:bg-slate-800/50">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-36 p-1.5 rounded-xl">
      <DropdownMenuItem
        @click="setMode('light')"
        class="flex justify-between items-center rounded-lg cursor-pointer">
        <div class="flex items-center gap-2 text-sm">
          <Sun class="h-4 w-4" /> 浅色
        </div>
        <BadgeCheck v-if="appStore.themeMode === 'light'" class="h-4 w-4" />
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="setMode('dark')"
        class="flex justify-between items-center rounded-lg cursor-pointer">
        <div class="flex items-center gap-2 text-sm">
          <Moon class="h-4 w-4" /> 深色
        </div>
        <BadgeCheck v-if="appStore.themeMode === 'dark'" class="h-4 w-4" />
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="setMode('auto')"
        class="flex justify-between items-center rounded-lg cursor-pointer">
        <div class="flex items-center gap-2 text-sm">
          <Monitor class="h-4 w-4" /> 跟随系统
        </div>
        <BadgeCheck v-if="appStore.themeMode === 'auto'" class="h-4 w-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
