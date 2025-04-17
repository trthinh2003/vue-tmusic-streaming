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
        meta: { title: "Dashboard", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/artists",
        name: "admin-artists",
        component: () => import("@/pages/admin/artists/index.vue"),
        meta: { title: "Nghệ sĩ", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/albums",
        name: "admin-albums",
        component: () => import("@/pages/admin/albums/index.vue"),
        meta: { title: "Album", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/songs",
        name: "admin-songs",
        component: () => import("@/pages/admin/songs/index.vue"),
        meta: { title: "Bài hát", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/genres",
        name: "admin-genres",
        component: () => import("@/pages/admin/genres/index.vue"),
        meta: { title: "Thể loại", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/comments",
        name: "admin-comments",
        component: () => import("@/pages/admin/comments/index.vue"),
        meta: { title: "Bình luận", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/playlists",
        name: "admin-playlists",
        component: () => import("@/pages/admin/playlists/index.vue"),
        meta: { title: "Playlist", requiresAuth: true, roles: "Admin" },
      },
      {
        path: "/admin/users",
        name: "admin-users",
        component: () => import("@/pages/admin/users/index.vue"),
        meta: { title: "Người dùng", requiresAuth: true, roles: "Admin" },
      },
    ],
  },
];

export default admin;
