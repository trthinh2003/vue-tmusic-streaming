import { createApp } from 'vue'
import { createPinia } from "pinia";

import { 
    Form,
    Spin
} from 'ant-design-vue';

import App from './App.vue'

import router from './router';

import "@/static/fontawesome/css/all.min.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "bootstrap/dist/css/bootstrap-utilities.min.css";

const app = createApp(App)
app.use(createPinia())
app.use(Form)
app.use(Spin)
app.use(router)
app.mount('#app')
