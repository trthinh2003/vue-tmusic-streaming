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
    },
    {
        path: '/share/:shareToken',
        name: 'share',
        component: () => import('@/layouts/client/share.vue'),
        meta: {
            requiresAuth: false,
            title: 'Chia sẻ bài hát'
        }
    }    
]
export default client;