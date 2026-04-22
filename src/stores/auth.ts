import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    // --- State ---
    const user = ref<string | null>(null);
    const token = ref<string | null>(null);

    // --- Getters ---
    const isAuthenticated = computed(() => !!token.value);

    // --- Actions ---
    function setToken(newToken: string) {
      token.value = newToken;
    }

    function clearAuth() {
      user.value = null;
      token.value = null;
    }

    async function fetchUser() {
      if (!token.value) return false;
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token.value}` },
        });

        if (res.ok) {
          const resp: AuthMeResponse = await res.json();
          user.value = resp.data.sub;
          return true;
        }

        clearAuth();
        return false;
      } catch {
        clearAuth();
        return false;
      }
    }

    return { user, token, isAuthenticated, setToken, clearAuth, fetchUser };
  },
  {
    persist: true,
  },
);

interface AuthMeResponse {
  data: {
    sub: string;
  };
}
