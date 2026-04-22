import { set } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore(
  "app",
  () => {
    const themeMode = ref<string>("auto");
    return { themeMode, setThemeMode: (mode: string) => set(themeMode, mode) };
  },
  {
    persist: true,
  },
);
