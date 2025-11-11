import { createRouter, createWebHistory } from "vue-router";
import TopMenu from "@/views/TopMenu.vue";
import OpenSandSurvey from "@/views/OpenSandSurvey.vue";
import MemberView from "@/views/MemberView.vue";
import LeaderMenu from "@/views/LeaderMenu.vue";

const routes = [
  { path: "/", name: "TopMenu", component: TopMenu }, // トップメニュー
  { path: "/OPENSAND", name: "OpenSandSurvey", component: OpenSandSurvey },
  { path: "/:memberId", name: "MemberView", component: MemberView },
  { path: "/jg6p2jg6z", name: "LeaderMenu", component: LeaderMenu },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
