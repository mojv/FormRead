// src/main.js
import {createApp} from 'vue'
import App from './App.vue'
import router from "./router/index"
import './index.css'
import {store} from './store'

const app = createApp(App);
const globals = {'canvas': null};

app.use(router);
app.use(store);
// app.config.globalProperties.$http = api; // Allow axios in all componenets this.$http.get
/**
 * @property {fabric} $globals.canvas
 */
app.provide('$globals', globals)

app.mount('#app');

// Enable navigation prompt
window.onbeforeunload = function() {
    return true;
};

//Global prototype function for filtering objects
Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter( key => predicate(obj[key]) )
        .reduce( (res, key) => (res[key] = obj[key], res), {} );