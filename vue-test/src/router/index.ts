// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TestMemberRegister from "@/components/TestMemberRegister.vue";
import ShiftCreateView from "@/views/ShiftCreateView.vue";
import Home from "@/views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", component: Home },
  { path: "/shifts", component: ShiftCreateView },
  { path: "/test-members", component: TestMemberRegister },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
