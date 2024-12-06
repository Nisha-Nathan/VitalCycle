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
      meta: { requiresAuth: true, requiresSisterCircle: true },
    },
    {
      path: "/care-board",
      name: "Care Board",
      component: CareBoardView,
      meta: { requiresAuth: true, requiresCareBoard: true },
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
 * Navigation guards to prevent user from accessing pages without proper opting preferences.
 */
router.beforeEach((to, from) => {
  const userStore = useUserStore();
  const { isLoggedIn, sisterCircleOptIn, myCareBoardOptIn } = storeToRefs(userStore);

  // Redirect to login if authentication is required and user is not logged in
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }

  // Prevent access to Sister Circle if the user has opted out
  if (to.meta.requiresSisterCircle && !sisterCircleOptIn.value) {
    return { name: "Settings" };
  }

  // Prevent access to Care Board if the user has opted out
  if (to.meta.requiresCareBoard && !myCareBoardOptIn.value) {
    return { name: "Settings" };
  }
});

export default router;
