import { createApp } from 'vue'
import { createPinia } from "pinia";

import { 
    Form,
    Spin,
    Drawer,
    Button,
    Input,
    Table,
    Card,
    Modal,
    Select,
    Tag,
    Col,
    Row
} from 'ant-design-vue';

import App from './App.vue'

//Plugin
import formatDate from '@/plugins/formatDate';
import truncateWords from '@/plugins/truncateWords';

import router from './router';

import "@/static/fontawesome/css/all.min.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "bootstrap/dist/css/bootstrap-utilities.min.css";

const app = createApp(App)
app.use(createPinia())
app.use(Form)
app.use(Spin)
app.use(Drawer)
app.use(Button)
app.use(Input)
app.use(Table)
app.use(Card)
app.use(Modal)
app.use(Select)
app.use(Tag)
app.use(Col)
app.use(Row)
app.use(formatDate)
app.use(truncateWords)
app.use(router)
app.mount('#app')
