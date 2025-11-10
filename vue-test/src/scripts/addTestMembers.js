// src/scripts/addTestMembers.js
import { useFirestoreMembers } from "../composables/useFirestoreMembers.js";

async function addTestMembers() {
  const { addMember } = await useFirestoreMembers();

  const members = [
    { name_kanji: "田中 太郎", gender: "男性" },
    { name_kanji: "鈴木 花子", gender: "女性", teamId: null },
  ];

  for (const m of members) {
    const member = await addMember(m);
    console.log("登録済み:", member.id, member.name_kanji);
  }

  console.log("テストメンバー登録完了！");
}

addTestMembers()
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
