import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import ShiftPage from "@/views/ShiftPage.vue";
import TestMemberRegister from "@/components/TestMemberRegister.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/shifts", component: ShiftPage },
  { path: "/test-members", component: TestMemberRegister },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
