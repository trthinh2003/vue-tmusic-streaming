const client = [
    {
        path: '/watch',
        name: 'client',
        component: () => import('@/layouts/client/index.vue'),
        meta: { requiresAuth: true, roles: "User" },
    },
]
export default client;