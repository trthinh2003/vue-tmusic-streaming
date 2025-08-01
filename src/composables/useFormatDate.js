import { getCurrentInstance } from 'vue';

export default function useFormatDate() {
    const { appContext } = getCurrentInstance();
    return appContext.config.globalProperties.$formatDate;
}