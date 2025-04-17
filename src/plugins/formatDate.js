import dayjs from "dayjs";

export default {
    install(app) {
        app.config.globalProperties.$formatDate = (dateString) => {
            return dayjs(dateString).format("DD/MM/YYYY");
        };
    },
};