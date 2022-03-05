import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '../store/index'

const routes: Array<RouteRecordRaw> = [
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
		path: '/github',
		name: 'github',
		component: () => import(/* webpackChunkName: "github" */ '../views/github.vue')
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

router.beforeEach((to, from, next) => {

	// if (!to.name || (from.name == undefined && to.name != 'ok'))
	// {
	//   from.name = '/';
	//   next({name: 'Login'});
	// }
	// else
	next();
})


router.afterEach((to, from) => {

	if (from.name === "Game" && !store.getters.GET_DUEL) {
		const check = document.getElementById("PongBorder");

		if (check !== null)
			check.style.display = "none";
	}
})
export default router
