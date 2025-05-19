const client = [
    {
        path: '/watch',
        name: 'client',
        component: () => import('@/layouts/client/index.vue'),
        meta: { requiresAuth: true, roles: "User" },
    },
    {
        path: '/explore',
        name: 'explore',
        component: () => import('@/layouts/client/explore.vue'),
        meta: { requiresAuth: true, roles: "User" },
    }
]
export default client;