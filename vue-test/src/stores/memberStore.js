// src/stores/memberStore.js
import { defineStore } from "pinia";

export const useMemberStore = defineStore("memberStore", {
  state: () => ({
    members: [
      { id: 1, name: "佐藤", team: null, assigned: false, resting: false },
      { id: 2, name: "田中", team: "Aチーム", assigned: true, resting: false },
      { id: 3, name: "鈴木", team: null, assigned: false, resting: true },
    ],
  }),
});
