<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="nav-item">Today</RouterLink>
    <RouterLink to="/sister-circle" class="nav-item" v-if="isLoggedIn">Sister Circles</RouterLink>
    <!-- <RouterLink to="/cycle-stats" class="nav-item" v-if="isLoggedIn">Cycle Stats</RouterLink> -->
    <RouterLink to="/care-board" class="nav-item" v-if="isLoggedIn">Care Board</RouterLink>
    <RouterLink to="/settings" class="nav-item" v-if="isLoggedIn">Settings</RouterLink>
    <RouterLink to="/login" class="nav-item" v-if="!isLoggedIn">Login</RouterLink>
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
