import { createRouter, createWebHistory } from "vue-router";
import login from "./login";
import admin from "./admin";
import client from "./client";
import { getProfile } from "@/services/authService";
import { useProfileStore } from "@/stores/useProfile.js";
import Swal from "sweetalert2";

const routes = [
  ...login, 
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
    if (!profileStore.profile || !profileStore.profile.id) {
      await getProfile();
    }
  } catch (error) {
    console.error("Lỗi khi lấy profile:", error);
  }

  // Nếu Unauthorized, hiển thị cảnh báo & chuyển về login
  if (profileStore.profile.message === "Unauthorized") {
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

  // Kiểm tra quyền truy cập theo role
  const userRole = profileStore.profile.role; // role có thể là "admin", "employee", "customer"...
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    // await Swal.fire({
    //   title: "Bạn không có quyền truy cập!",
    //   text: "Vui lòng liên hệ quản trị viên.",
    //   icon: "error",
    //   confirmButtonText: "OK",
    // });
    return next({ path: "/" }); // Điều hướng về trang chính hoặc trang lỗi
  }

  next();
});

export default router;
