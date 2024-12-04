<script setup lang="ts">
import LoggerComponent from "@/components/Logging/LoggerComponent.vue";
import CycleStatsComponent from "@/components/Logging/CycleStatsComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";




const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>

  <main class="todaypage">
    <!-- Header Section -->
    <section v-if="!isLoggedIn" class="header">
      <h1 class="welcome-message">
        <span>Please login to access your account!</span>
      </h1>
    </section>

    <section class="logger" v-if="isLoggedIn">

      <LoggerComponent />
    </section>

    <section class="cycle-stats" v-if="isLoggedIn">
       <CycleStatsComponent/>
    </section>
  </main>

</template>

<style scoped>
/* General Styles */
.todaypage {
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

/* Section Titles */
.section-title {
  font-size: 1.6rem;
  color: #fff;
  background-color: #000;
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}

/* Sister Circles & Care Board Sections */
.logger,
.cycle-stats {
  background-color: #ffc1c1;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logger :deep(h2),
.cycle-stats :deep(h2) {
  margin-bottom: 1rem;
}

/* Component Wrappers */
.logger>div,
.cycle-stats>div {
  padding: 1rem;
  background-color: #ffe3e3;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
