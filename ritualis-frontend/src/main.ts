import { createApp } from "vue";
import { createPinia } from "pinia";
import vue3GoogleLogin from 'vue3-google-login'

import App from "./App.vue";
import router from "./router";

import "bootstrap/dist/css/bootstrap.css"
// import "bootstrap"

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vue3GoogleLogin, {
    clientId: '1047084327798-6hs1ia09l0suhs0mkkubfl73mv67d36g.apps.googleusercontent.com'
})

app.mount("#app");
