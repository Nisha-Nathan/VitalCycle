<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "./stores/notification";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, sisterCircleOptIn, myCareBoardOptIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const notificationStore = useNotificationStore();
const { deliveredCount } = storeToRefs(notificationStore);


// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
    await notificationStore.fetchDeliveredCount();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="nav-item">Today</RouterLink>
    <RouterLink to="/sister-circle" class="nav-item" v-if="isLoggedIn && sisterCircleOptIn">Sister Circles</RouterLink>
    <RouterLink to="/care-board" class="nav-item" v-if="isLoggedIn && myCareBoardOptIn">Care Board</RouterLink>
    <RouterLink to="/login" class="nav-item" v-if="!isLoggedIn">Login</RouterLink>
    <RouterLink to="/user-profile" class="nav-item" v-if="isLoggedIn">User Profile</RouterLink>
    <RouterLink to="/notifications" class="nav-item" v-if="isLoggedIn"> <button type="button" class="btn btn-primary">
        Notifications <span class="badge bg-secondary">{{ deliveredCount }}</span>
      </button></RouterLink>

  </nav>
  <RouterView />
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.nav-item {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
}

.nav-item.router-link-active {
  font-weight: bold;
}
</style>
