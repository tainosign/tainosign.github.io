import TestMemberRegister from "@/components/TestMemberRegister.vue";

const routes = [
  // 既存ルート
  { path: "/", component: Home },
  { path: "/shifts", component: ShiftPage },
  
  // テストメンバー登録画面
  { path: "/test-members", component: TestMemberRegister },
];

export default routes;
