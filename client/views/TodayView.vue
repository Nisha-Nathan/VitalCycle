<script setup lang="ts">
  import { useUserStore } from "@/stores/user";
  import { storeToRefs } from "pinia";
  import LoggerComponent from '@/components/Logging/LoggerComponent.vue';
  
  const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
  // Logic or imports can be added here
  </script>

<template>

  <main class="today-view">
    <section class="header">
      <h1 class="welcome-message">
        <span v-if="isLoggedIn">Welcome, {{ currentUsername }}!</span>
        <span v-else>Please login to access your account!</span>
      </h1>
    </section>
  <LoggerComponent/>
  </main>

  </template>

  

  <style scoped>
  /* General Styles */

  .today-view {
    background-color: #ffe3e3;
  padding: 2rem;
  border-radius: 12px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  }

  /* Welcome Section */
.header {
  background-color: #ffb3b3;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-message {
  font-size: 1.8rem;
  color: #000;
  font-weight: bold;
}

  
  </style>
