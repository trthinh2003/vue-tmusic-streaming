const login = [
    {
        path: '/',
        component: () => import('@/layouts/login.vue'),
        name: 'login',
        meta: {},
    },
    {
        path: '/auth/callback',
        name: 'social-auth-callback',
        component: () => import('@/layouts/client/socialAuth.vue')
    }
]

export default login;