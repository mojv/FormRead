// src/main.js
import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from "./router/index"
import './index.css'
import {store} from './store'

const app = createApp(App);
const globals = {'canvas': null};

app.use(router);
app.use(store);
// app.config.globalProperties.$http = api; // Allow axios in all componenets this.$http.get
app.provide('$globals', globals)

app.mount('#app');


