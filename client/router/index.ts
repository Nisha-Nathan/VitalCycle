import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import CareBoardView from "../views/CareBoardView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SettingView from "../views/SettingView.vue";
import TodayView from "../views/TodayView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import NotificationView from "../views/NotificationView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Today",
      component: TodayView,
    },
    {
      path: "/sister-circle",
      name: "Sister Circle",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/care-board",
      name: "Care Board",
      component: CareBoardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },

    {
      path: "/user-profile",
      name: "UserProfile",
      component: UserProfileView,
    },

    {
      path: "/notifications",
      name: "Notifications",
      component: NotificationView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
