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
    Row,
    DatePicker,
    Tabs,
    Menu,
    Dropdown,
    Upload,
    Popconfirm,
    Tooltip,
    Avatar,
    Empty,
    Comment,
    Switch,
    Carousel,
    Pagination,
    List,
    Slider,
    AutoComplete,
    Checkbox,
    Divider,
    Alert
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
app.use(DatePicker)
app.use(Tabs)
app.use(Menu)
app.use(Dropdown)
app.use(Upload)
app.use(Popconfirm)
app.use(Tooltip)
app.use(Avatar)
app.use(Empty)
app.use(Comment)
app.use(Switch)
app.use(Carousel)
app.use(Pagination)
app.use(List)
app.use(Slider)
app.use(AutoComplete)
app.use(Checkbox)
app.use(Divider)
app.use(Alert)
app.use(formatDate)
app.use(truncateWords)
app.use({
    install(app) {}
})
app.use(router)
app.mount('#app')
