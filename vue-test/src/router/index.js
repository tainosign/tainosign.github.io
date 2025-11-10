import TestMemberRegister from "@/components/TestMemberRegister.vue";
import Home from "@/views/Home.vue";
import ShiftPage from "@/views/ShiftPage.vue";

const routes = [
  // 既存ルート
  { path: "/", component: Home },
  { path: "/shifts", component: ShiftPage },
  
  // テストメンバー登録画面
  { path: "/test-members", component: TestMemberRegister },
];

export default routes;
