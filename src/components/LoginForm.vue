<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types";
import { ref } from "vue";
import { useRouter } from "vue-router";
// 引入图标
import { CheckCircle, Lock, LogIn, ShieldCheck, User } from "lucide-vue-next";

const router = useRouter();
const auth = useAuthStore();
const authMode = ref<"password" | "otp">("password");
const isLoading = ref(false);
const errorMessage = ref("");

const form = ref({ username: "", password: "", otp: "" });

const handleLogin = async () => {
  if (isLoading.value) return; // 防止重复点击
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const endpoint =
      authMode.value === "password" ? "/api/login" : "/api/otp/verify";
    const body =
      authMode.value === "password"
        ? { username: form.value.username, password: form.value.password }
        : { username: form.value.username, otp: form.value.otp };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = (await res.json()) as ApiResponse<{
      token?: string;
      requireOtp?: boolean;
    }>;

    if (!result.success) {
      throw new Error(result.error || "Login failed");
    }

    const { data } = result;

    if (data.requireOtp) {
      authMode.value = "otp";
      return;
    }

    if (data.token) {
      auth.setToken(data.token);
      router.push("/config");
      return;
    } else {
      throw new Error("Invalid server response");
    }
  } catch (err: any) {
    errorMessage.value = err.message || "An unexpected error occurred";
    // 如果出错，重置OTP以便用户重试
    if (authMode.value === "otp") form.value.otp = "";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6 max-w-md mx-auto mt-20 px-4">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          {{ authMode === "password" ? "Login" : "Verification" }}
          <CheckCircle
            v-if="authMode === 'otp'"
            class="w-5 h-5 text-green-500" />
        </CardTitle>
        <CardDescription>
          {{
            authMode === "password"
              ? "Enter your credentials to continue"
              : "Enter the code from your authenticator app"
          }}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin()" class="space-y-4">
          <div
            v-if="errorMessage"
            class="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md">
            {{ errorMessage }}
          </div>

          <FieldGroup>
            <template v-if="authMode === 'password'">
              <Field>
                <FieldLabel for="username">Username</FieldLabel>
                <div class="relative">
                  <User
                    class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    v-model="form.username"
                    class="pl-9"
                    placeholder="Enter username"
                    required />
                </div>
              </Field>
              <Field>
                <div class="flex items-center justify-between">
                  <FieldLabel for="password">Password</FieldLabel>
                  <a
                    v-if="false"
                    href="#"
                    class="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >Forgot?</a
                  >
                </div>
                <div class="relative">
                  <Lock
                    class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    v-model="form.password"
                    class="pl-9"
                    placeholder="••••••••"
                    required />
                </div>
              </Field>
            </template>

            <template v-else>
              <Field>
                <FieldLabel for="otp">Verification Code</FieldLabel>
                <InputOTP
                  id="otp"
                  v-model="form.otp"
                  :maxlength="6"
                  :disabled="isLoading"
                  required>
                  <InputOTPGroup class="gap-2 justify-center w-full">
                    <InputOTPSlot
                      v-for="i in 6"
                      :key="i"
                      :index="i - 1"
                      class="w-12 h-12" />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
            </template>

            <Button
              type="submit"
              :variant="authMode === 'password' ? 'default' : 'outline'"
              class="w-full mt-4 flex items-center justify-center"
              :disabled="isLoading">
              <LogIn v-if="authMode === 'password'" class="mr-2 h-4 w-4" />
              <ShieldCheck v-else class="mr-2 h-4 w-4" />

              {{
                isLoading
                  ? "Processing..."
                  : authMode === "password"
                    ? "Login"
                    : "Verify"
              }}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
