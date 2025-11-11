import { createRouter, createWebHistory } from "vue-router";
import App from "@/App.vue"; // トップページ
import OpenSandSurvey from "@/views/OpenSandSurvey.vue";
import MemberView from "@/views/MemberView.vue";
import LeaderMenu from "@/views/LeaderMenu.vue";

const routes = [
  { path: "/", name: "AppTop", component: App }, // 既存トップメニュー
  { path: "/OPENSAND", name: "OpenSandSurvey", component: OpenSandSurvey },
  { path: "/:memberId", name: "MemberView", component: MemberView },
  { path: "/jg6p2jg6z", name: "LeaderMenu", component: LeaderMenu }, // リーダーページ
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
