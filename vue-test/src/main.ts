import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router"; // ルーター追加
import "./assets/main.css"; // Tailwind読み込み

const app = createApp(App);

// Pinia登録
const pinia = createPinia();
app.use(pinia);

// ルーター登録
app.use(router);

app.mount("#app");
