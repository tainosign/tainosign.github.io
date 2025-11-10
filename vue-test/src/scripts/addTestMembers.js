// src/scripts/addTestMembersSafe.js
import { useFirestoreMembers } from "../composables/useFirestoreMembers.js";

async function addTestMembersSafe() {
  const { addMember, getMemberByToken } = await useFirestoreMembers();

  // 固定IDを使いたい場合は token を固定値にする
  const testMembers = [
    { token: "tanaka_taro_001", name_kanji: "田中 太郎", gender: "男性" },
    { token: "suzuki_hanako_002", name_kanji: "鈴木 花子", gender: "女性" },
  ];

  for (const m of testMembers) {
    const exists = await getMemberByToken(m.token);
    if (exists) {
      console.log(`既に存在: ${m.name_kanji} (ID: ${exists.id})`);
      continue; // 登録済みならスキップ
    }

    const member = await addMember(m);
    console.log("新規登録:", member.id, member.name_kanji);
  }

  console.log("安全なテストメンバー登録完了！");
}

addTestMembersSafe()
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
