import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router"; 
import "./assets/main.css"; // Tailwind読み込み

const app = createApp(App);
app.use(createPinia());
app.use(router); // router を登録
app.mount("#app");
