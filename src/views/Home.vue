<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Search, Star } from "lucide-vue-next";
import { computed } from "vue";

const features = [
  {
    title: "播放记录同步",
    desc: "自动同步观看进度，跨设备无缝续播。",
    icon: History,
  },
  {
    title: "多端收藏管理",
    desc: "心仪内容实时同步，一键直达，即刻开追。",
    icon: Star,
  },
  {
    title: "历史搜索云存",
    desc: "记录搜索习惯，智能推荐感兴趣的内容。",
    icon: Search,
  },
];
const versionInfo = computed(() => `Version: ${__VITE_WEBAPP_VERSION__}`);
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 p-8 md:p-16">
    <main class="max-w-5xl mx-auto">
      <div class="mb-12">
        <div class="flex items-center gap-4 mb-3">
          <div
            class="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
            <img
              src="/favicon.svg"
              alt="TVBox Logo"
              class="h-6 w-6 object-contain block dark:invert" />
          </div>
          <h1
            class="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
            TVBox Sync Center
          </h1>
          <Badge
            variant="outline"
            class="rounded-full px-2 py-0.5 text-[10px] font-mono border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {{ versionInfo }}
          </Badge>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          v-for="item in features"
          :key="item.title"
          class="group relative overflow-hidden border border-zinc-200/80 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50 shadow-sm transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md">
          <CardHeader class="pb-2 pt-6 px-6">
            <div
              class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors group-hover:bg-zinc-900 dark:group-hover:bg-zinc-50 group-hover:text-white dark:group-hover:text-zinc-900">
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <CardTitle
              class="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >{{ item.title }}</CardTitle
            >
          </CardHeader>

          <CardContent class="px-6 pb-6">
            <p
              class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              {{ item.desc }}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 移除了原有的彩色渐变动画，保持极简 */
</style>
