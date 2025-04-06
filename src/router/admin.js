const admin = [
  {
    path: "/admin",
    component: () => import("@/layouts/admin/index.vue"),
    name: "admin",
    redirect: "/admin/dashboard",
    meta: { requiresAuth: true, roles: "Admin" }, // Chỉ cho phép admin truy cập
    children: [
      {
        path: "/admin/dashboard",
        name: "admin-dashboard",
        component: () => import("@/pages/admin/dashboard/index.vue"),
        meta: { requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/artists",
        name: "admin-artists",
        component: () => import("@/pages/admin/artists/index.vue"),
        meta: { requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/albums",
        name: "admin-albums",
        component: () => import("@/pages/admin/albums/index.vue"),
        meta: { requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/songs",
        name: "admin-songs",
        component: () => import("@/pages/admin/songs/index.vue"),
        meta: { requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/genres",
        name: "admin-genres",
        component: () => import("@/pages/admin/genres/index.vue"),
        meta: { requiresAuth: true, roles: "Admin" },
      },
    ],
  },
];

export default admin;
