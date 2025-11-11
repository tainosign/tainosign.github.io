import { createRouter, createWebHistory } from "vue-router";
//import LeaderMenu from "@/views/LeaderMenu.vue";
import App from "@/App.vue";
import OpenSandSurvey from "@/views/OpenSandSurvey.vue";
import MemberPage from "@/views/MemberPage.vue";

const routes = [
  { path: "/jg6p2jg6z", name: "LeaderMenu", component: App },
  { path: "/OPENSAND", name: "OpenSandSurvey", component: OpenSandSurvey },
  { path: "/:memberId", name: "MemberPage", component: MemberPage },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
