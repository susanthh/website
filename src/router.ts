import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import NotFoundView from "./views/NotFoundView.vue";

/**
 * The standalone preview build (scripts/build-standalone.mjs) runs from a
 * single HTML file, so it needs hash history. The real build uses clean URLs.
 */
const useHash = import.meta.env.VITE_ROUTER_MODE === "hash";
const base = import.meta.env.BASE_URL;

const router = createRouter({
  history: useHash ? createWebHashHistory(base) : createWebHistory(base),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
});

export default router;
