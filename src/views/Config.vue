<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import {
  Check,
  Copy,
  Link,
  Pencil,
  Plus,
  RefreshCw,
  Rss,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { toast } from "vue-sonner";

// --- 状态管理 ---
const activeTab = ref(localStorage.getItem("config-active-tab") || "sub");
const copiedStates = ref<Record<string, boolean>>({});
// 监听变化并存入 localStorage
watch(activeTab, (newVal) => {
  localStorage.setItem("config-active-tab", newVal);
});

const isOpen = ref(false);
const dialogType = ref<"sub" | "user" | "bind">("sub");

const subscriptions = ref<any[]>([]);
const users = ref<any[]>([]);
const otpSecret = ref("");
const otpUri = ref("");

// 临时状态
const activeUser = ref<any>(null);
const selectedSubIds = ref<number[]>([]);
const currentSelectedUser = ref<any>(null);

// 表单数据
const subData = ref({ id: null as number | null, name: "", url: "", path: "" });
const userData = ref({ id: null as number | null, name: "", user_key: "" });

// --- API 交互 ---
const fetchSubList = async () => {
  const res: any = await api.get("/subscriptions");
  subscriptions.value = Array.isArray(res) ? res : res.data || [];
};

const fetchUserList = async () => {
  const res: any = await api.get("/users");
  users.value = Array.isArray(res) ? res : res.data || [];
};

const fetchUserBindings = async (user: any) => {
  activeUser.value = user;
  selectedSubIds.value = user.subscriptions?.map((s: any) => s.id) || [];
};

const handleBindSave = async () => {
  try {
    await api.post("/user/bind", {
      user_key: activeUser.value.user_key,
      subscription_ids: selectedSubIds.value,
    });
    await fetchUserList();
    isOpen.value = false;
    toast.success("绑定更新成功");
  } catch (err) {
    toast.error("绑定更新失败");
  }
};

const handleSubSave = async () => {
  try {
    if (subData.value.id) {
      await api.put(`/subscriptions/${subData.value.id}`, subData.value);
    } else {
      await api.post("/subscriptions", subData.value);
    }
    await fetchSubList();
    isOpen.value = false;
  } catch (err) {
    toast.error("保存失败");
  }
};

const handleUserSave = async () => {
  try {
    const res: any = await api.post("/users", { name: userData.value.name });
    activeUser.value = { name: res.data.name, user_key: res.data.user_key };
    await handleBindSave();
    selectedSubIds.value = [];
    await fetchUserList();
    isOpen.value = false;
  } catch (err) {
    toast.error("创建失败");
  }
};

const handleSubRemove = async (id: number) => {
  if (!confirm("确定删除此订阅？")) return;
  await api.delete(`/subscriptions/${id}`);
  await fetchSubList();
};

const handleUserRemove = async (id: number) => {
  if (!confirm("确定删除此用户？")) return;
  await api.delete(`/users/${id}`);
  await fetchUserList();
};

// --- OTP 逻辑 ---
const fetchOtp = async () => {
  const res: any = await api.get("/otp/secret");
  otpSecret.value = res.data.secret;
  otpUri.value = res.data.uri;
};

const refreshOtp = async () => {
  const res: any = await api.post("/otp/generate", {});
  otpSecret.value = res.data.secret;
  otpUri.value = res.data.uri;
};

const qrUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    otpUri.value,
  )}`;
});

// --- 工具逻辑 ---
const openDialog = (type: "sub" | "user", item?: any) => {
  dialogType.value = type;
  if (type === "sub") {
    subData.value = item
      ? { ...item }
      : { id: null, name: "", url: "", path: "" };
  } else {
    userData.value = { id: null, name: "", user_key: "" };
  }
  isOpen.value = true;
};

const openBindDialog = (user: any) => {
  dialogType.value = "bind";
  currentSelectedUser.value = user;
  fetchUserBindings(user);
  isOpen.value = true;
};

const triggerCopy = async (id: string, text: string) => {
  await navigator.clipboard.writeText(text);
  copiedStates.value[id] = true;
  toast.success("已复制到剪贴板");
  setTimeout(() => {
    delete copiedStates.value[id];
  }, 2000);
};

const copyText = (user: any) => {
  const baseUrl = window.location.origin;
  const path =
    user.subscriptions?.length > 1
      ? "/api/sub"
      : `/api/sub/${user.subscriptions[0]?.path.replace(/^\//, "")}`;
  const fullUrl = `${baseUrl}${path}?key=${user.user_key}`;
  triggerCopy(`user-${user.id}`, fullUrl);
};
const copySubText = (sub: any, user: any) => {
  const baseUrl = window.location.origin;
  const path = `/api/sub/${sub.path.replace(/^\//, "")}`;
  const fullUrl = `${baseUrl}${path}?key=${user.user_key}`;
  triggerCopy(`sub-${sub.id}-${user.id}`, fullUrl);
};
onMounted(async () => {
  await Promise.all([fetchSubList(), fetchUserList(), fetchOtp()]);
});
const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-purple-100 text-purple-700",
  "bg-cyan-100 text-cyan-700",
];

const getTagColor = (index: string | number) => {
  index = Number(index);
  return tagColors[index % tagColors.length];
};
</script>

<template>
  <main class="min-h-screen pt-24 pb-20">
    <div class="max-w-2xl mx-auto px-6">
      <Tabs v-model="activeTab" class="w-full">
        <div class="flex justify-center w-full mb-10">
          <TabsList class="grid w-full grid-cols-3 max-w-[400px]">
            <TabsTrigger value="sub"
              ><Rss class="mr-2 h-4 w-4" />订阅源</TabsTrigger
            >
            <TabsTrigger value="user"
              ><Users class="mr-2 h-4 w-4" />用户</TabsTrigger
            >
            <TabsTrigger value="otp"
              ><ShieldCheck class="mr-2 h-4 w-4" />OTP</TabsTrigger
            >
          </TabsList>
        </div>

        <TabsContent value="sub" class="mt-2 space-y-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">订阅源配置</h2>
            <Button size="sm" @click="openDialog('sub')"
              ><Plus class="mr-2 h-4 w-4" /> 添加订阅</Button
            >
          </div>
          <div class="space-y-3">
            <div
              v-for="item in subscriptions"
              :key="item.id"
              class="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
              <div>
                <h3 class="font-medium">{{ item.name }}</h3>
                <p class="text-xs text-muted-foreground">{{ item.url }}</p>
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="openDialog('sub', item)"
                  ><Pencil class="w-4 h-4"
                /></Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive"
                  @click="handleSubRemove(item.id)"
                  ><Trash2 class="w-4 h-4"
                /></Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="user" class="mt-2 space-y-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">用户KEY管理</h2>
            <Button size="sm" @click="openDialog('user')"
              ><Plus class="mr-2 h-4 w-4" /> 新建用户</Button
            >
          </div>
          <div class="space-y-3">
            <div
              v-for="user in users"
              :key="user.id"
              class="p-4 border rounded-xl space-y-3 hover:bg-muted/30 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium">{{ user.name }}</h3>
                  <p class="text-xs text-muted-foreground font-mono">
                    {{ user.user_key }}
                  </p>
                </div>
                <div class="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="复制"
                    @click="copyText(user)">
                    <Check
                      v-if="copiedStates[`user-${user.id}`]"
                      class="w-4 h-4 text-green-500" />
                    <Copy v-else class="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="绑定"
                    @click="openBindDialog(user)"
                    ><Link class="w-4 h-4"
                  /></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-destructive"
                    @click="handleUserRemove(user.id)"
                    ><Trash2 class="w-4 h-4"
                  /></Button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(sub, index) in user.subscriptions"
                  :key="sub.id"
                  class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="getTagColor(index)"
                  >{{ sub.name }}</span
                >
                <span
                  v-if="!user.subscriptions?.length"
                  class="text-xs text-muted-foreground italic"
                  >未绑定任何源</span
                >
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="otp" class="mt-2">
          <div class="p-6 border rounded-xl bg-card space-y-6">
            <h2 class="text-xl font-bold">OTP 安全密钥</h2>
            <div class="flex gap-2">
              <Input readonly v-model="otpSecret" class="font-mono" />
              <Button variant="outline" @click="refreshOtp"
                ><RefreshCw class="w-4 h-4"
              /></Button>
            </div>
            <div class="flex flex-col items-center border p-4 rounded-lg">
              <img :src="qrUrl" alt="QR Code" class="w-48 h-48 rounded-lg" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <Dialog v-model:open="isOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{
            dialogType === "sub"
              ? "订阅设置"
              : dialogType === "user"
                ? "新建用户"
                : "绑定订阅源"
          }}</DialogTitle>

          <DialogDescription class="hidden"> </DialogDescription>
        </DialogHeader>

        <div
          v-if="dialogType === 'bind'"
          class="py-4 space-y-2 max-h-75 overflow-y-auto">
          <label
            v-for="sub in subscriptions"
            :key="sub.id"
            class="flex items-center justify-between gap-3 p-3 border rounded hover:bg-muted cursor-pointer">
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :value="sub.id"
                v-model="selectedSubIds"
                class="w-4 h-4" />
              <span>{{ sub.name }}</span>
            </div>
            <Button
              class="w-4 h-4"
              v-if="selectedSubIds.includes(sub.id)"
              variant="ghost"
              size="icon"
              title="复制"
              @click="copySubText(sub, currentSelectedUser)"
              ><Check
                v-if="copiedStates[`sub-${sub.id}-${currentSelectedUser.id}`]"
                class="w-4 h-4 text-green-500" />
              <Copy v-else class="w-4 h-4"
            /></Button>
          </label>
        </div>

        <div v-else class="py-4 space-y-4">
          <template v-if="dialogType === 'sub'">
            <Input v-model="subData.name" placeholder="名称" />

            <Input v-model="subData.url" placeholder="URL" />

            <Input v-model="subData.path" placeholder="路径" />
          </template>

          <template v-else>
            <Input v-model="userData.name" placeholder="用户名称" />

            <Select v-model="selectedSubIds" multiple>
              <SelectTrigger>
                <SelectValue placeholder="绑定订阅源" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem
                  v-for="sub in subscriptions"
                  :key="sub.id"
                  :value="sub.id">
                  {{ sub.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </div>

        <DialogFooter>
          <Button
            @click="
              dialogType === 'sub'
                ? handleSubSave()
                : dialogType === 'user'
                  ? handleUserSave()
                  : handleBindSave()
            "
            >保存</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>
