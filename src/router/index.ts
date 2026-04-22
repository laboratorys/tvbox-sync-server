import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";
const routes = [
  { path: "/", component: () => import("@/views/Home.vue") },
  {
    path: "/config",
    component: () => import("@/views/Config.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/login", component: () => import("@/views/Login.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  if (!to.meta.requiresAuth) {
    return true;
  }

  try {
    const authStore = useAuthStore();
    const result = await authStore.fetchUser();
    if (result) {
      return true;
    } else {
      return "/login";
    }
  } catch (error) {
    return "/login";
  }
});
export default router;
