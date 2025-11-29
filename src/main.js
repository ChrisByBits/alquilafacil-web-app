import { createApp } from 'vue'
import './style.css'
import 'leaflet/dist/leaflet.css'
import router from "@/public/router/router.js";
import {createPinia} from "pinia";
import App from './App.vue'

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app')
