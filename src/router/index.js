import { createRouter, createWebHistory } from "vue-router";
import login from "./login";
import register from "./register";
import admin from "./admin";
import client from "./client";
import { getProfile } from "@/services/authService";
import { useProfileStore } from "@/stores/useProfile.js";
import Swal from "sweetalert2";

const routes = [
  ...login, 
  ...register,
  ...admin, 
  ...client
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const profileStore = useProfileStore();

  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'TMusic Streaming';
  }

  if (!to.meta.requiresAuth) {
    return next();
  }

  try {
    await getProfile();
    
    // Kiểm tra quyền truy cập theo role
    const userRole = profileStore.profile.role;
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      return next({ path: "/" });
    }
    
    next();
    
  } catch (error) {
    console.error("Lỗi khi lấy profile:", error);
    
    // unauthorized, redirect về login
    if (error.response?.status === 401) {
      if (!Swal.isVisible()) {
        await Swal.fire({
          title: "Phiên đăng nhập đã hết hạn!",
          text: "Vui lòng đăng nhập lại.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
      return next({ name: "login" });
    }
    
    next();
  }
});
// router.afterEach((to, from) => {
//   const routesNeedReload = ['/dashboard', '/explore']

//   if (routesNeedReload.includes(to.path)) {
//     setTimeout(() => {
//       window.location.reload()
//     }, 100)
//   }
// })

export default router;
