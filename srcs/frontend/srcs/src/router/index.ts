import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "auth" */ '../views/Auth.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "Login" */ '../views/Login.vue')
  },
  {
    path: '/ok',
    name: 'ok',
    component: () => import(/* webpackChunkName: "ok" */ '../views/ok.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import(/* webpackChunkName: "Register" */ '../views/Register.vue')
  },
  {
    path: '/profil',
    name: 'profil',
    component: () => import(/* webpackChunkName: "Profil" */ '../views/Profil.vue')
  },
  {
    path: '/authLogin',
    name: 'authLogin',
    component: () => import(/* webpackChunkName: "AuthLogin" */ '../views/AuthLogin.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import(/* webpackChunkName: "Chat" */ '../views/Chat.vue')
  },
  {
    path: '/',
    name: 'Game',
    component: () => import(/* webpackChunkName: "Game" */ '../views/Game.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkExactActiveClass: "exact-active",
})

router.afterEach((to, from) => {
  if (to.name === "Game")
  {
    const check = document.getElementById("PongBorder");

    if (check !== null)
      check.style.removeProperty( 'display' );
  }
  else if (from.name === "Game")
  {
    const check = document.getElementById("PongBorder");

    if (check !== null)
      check.style.display = "none";
  }
})
export default router
