<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

withDefaults(defineProps<Props>(), {
  side: "top",
  align: "center",
});
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>

      <TooltipContent :side="side" :align="align">
        <slot name="content" />
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
