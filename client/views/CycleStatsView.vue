<template>
  <main class="cycle-stats">
    <h2 class="section-title">Cycle Trends</h2>

    <!-- Tab Section -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab', { active: currentTab === tab }]"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Cycle History Tab -->
    <div v-if="currentTab === 'Cycle History'" class="stats-overview">
      <div class="stat-item">Average Cycle Length: 28 days</div>
      <div class="stat-item">Average Period Length: 4 days</div>
      <div class="stat-item">Last Menstrual Period Start: 17th Nov</div>
    </div>

    <!-- Activity Trends Tab -->
    <div v-if="currentTab === 'Activity Trends'" class="stats-overview">
      <div class="stat-item">Recent Activities</div>
      <div class="stat-item">Activity Duration Trends</div>
      <div class="stat-item">Most Common Activities</div>
    </div>

    <!-- Weight Trends Tab -->
    <div v-if="currentTab === 'Weight Trends'" class="stats-overview">
      <div class="stat-item">Weight Tracking Coming Soon!</div>
      <div class="stat-item">Track your weight changes over time</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tabs = ['Cycle History', 'Activity Trends', 'Weight Trends'];
const currentTab = ref('Cycle History');
</script>

<style scoped>
/* General Styling */
.cycle-stats {
  background-color: #ffe3e3;
  color: #000;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

/* Section Title */
.section-title {
  font-size: 1.8rem;
  color: #fff;
  background-color: #000;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  text-align: center;
}

/* Tabs Section */
.tabs {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;
}

.tab {
  background-color: #ffc1c1;
  border: 2px solid transparent;
  border-radius: 12px;
  color: #000;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab:hover {
  background-color: #ffb3b3;
}

.tab.active {
  background-color: #ffb3b3;
  border-color: #ff7575;
  font-weight: bold;
}

/* Statistics Section */
.stats-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #ffe3e3;
  border-radius: 12px;
}

.stat-item {
  background-color: #ffc1c1;
  color: #000;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
