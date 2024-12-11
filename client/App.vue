<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, onUnmounted } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useNotificationStore } from "./stores/notification";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, sisterCircleOptIn, myCareBoardOptIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const notificationStore = useNotificationStore();
const { deliveredCount } = storeToRefs(notificationStore);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

function startPolling() {
  pollingInterval = setInterval(async () => {
    await notificationStore.fetchDeliveredCount();
    await notificationStore.fetchDeliveredNotifications();
  }, 10000); // Poll every 10 seconds
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
    if (isLoggedIn.value) {
      await notificationStore.fetchDeliveredCount();
      startPolling();
    }
  } catch {
    // User is not logged in
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <header>
    <nav class="navbar">
      <RouterLink :to="{ name: 'Today' }">
        <img style="align-items: center" src="@/assets/images/vitalcycle-logo.png" />
      </RouterLink>
      <RouterLink to="/" class="nav-item">Today</RouterLink>
      <RouterLink to="/sister-circle" class="nav-item" v-if="isLoggedIn && sisterCircleOptIn">Circles </RouterLink>
      <RouterLink to="/care-board" class="nav-item" v-if="isLoggedIn && myCareBoardOptIn">Care Board</RouterLink>
      <RouterLink to="/login" class="nav-item" v-if="!isLoggedIn">Login</RouterLink>
      <RouterLink to="/user-profile" class="nav-item" v-if="isLoggedIn">User Profile</RouterLink>
      <RouterLink to="/notifications" class="nav-item" v-if="isLoggedIn">
        <button type="button" class="btn btn-primary btn-notifications">
          Notifications <span class="badge bg-secondary bg-notifications">{{ deliveredCount }}</span>
        </button>
      </RouterLink>
    </nav>

    <p v-if="toast" :class="toast.style" class="toast-message">{{ toast.message }}</p>
  </header>

  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");

img {
  width: 50px;
  height: 50px;
}

a:hover {
  text-decoration: 2px underline;
}

.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  font-family: "Quando", serif;
}

.nav-item {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
}

.nav-item.router-link-active {
  font-weight: bold;
  text-decoration: none;
}

.toast-message {
  font-size: 1em;
  margin: 10px;
  border-radius: 10px;
  width: 90%;
  text-align: center;
  justify-self: center;
  font-family: "Quando", serif;
}

.btn-notifications {
  background-color: black;
  border: none;
}

.btn-notifications:hover {
  background-color: #ea7575;
  border: none;
}
</style>
