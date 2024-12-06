<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

// Store references
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

// Reactive properties
const tabs = ["Cycle History", "Activity Trends", "Weight Trends"];
const currentTab = ref("Cycle History");

const cycleStats = ref<{
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  lastPeriodStart: string | null;
} | null>(null);

const isLoading = ref(false);
const errorMessage = ref("");

// Fetch Cycle Stats
const fetchCycleStats = async () => {
  if (!isLoggedIn.value || !currentUsername.value) {
    cycleStats.value = null;
    errorMessage.value = "Please log in to view your cycle statistics.";
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetchy("/api/cycle/stats", "GET");
    console.log("API Response:", response); // Log the full response

    if (response?.stats) {
      cycleStats.value = response.stats; // Assign the stats directly
    } else {
      cycleStats.value = null;
      errorMessage.value = "No cycle data found. Start logging your cycles to see statistics!";
    }
  } catch (error) {
    cycleStats.value = null;
    errorMessage.value = "Failed to fetch cycle statistics. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Fetch stats on component mount
onMounted(() => {
  fetchCycleStats();
});
</script>

<template>
  <main class="cycle-stats">
    <h2 class="section-title">Cycle Trends</h2>

    <!-- Tabs Section -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab" :class="['tab', { active: currentTab === tab }]" @click="currentTab = tab">
        {{ tab }}
      </button>
    </div>

    <!-- Dynamic Content -->
    <div v-if="currentTab === 'Cycle History'" class="stats-overview">
      <div v-if="isLoading" class="stat-item">Loading...</div>
      <div v-else-if="errorMessage" class="stat-item">{{ errorMessage }}</div>
      <div v-else>
        <div class="stat-item">
          Average Cycle Length:
          {{ cycleStats?.averageCycleLength ? `${cycleStats.averageCycleLength} days` : "No data available" }}
        </div>
        <div class="stat-item">
          Average Period Length:
          {{ cycleStats?.averagePeriodLength ? `${cycleStats.averagePeriodLength} days` : "No data available" }}
        </div>
        <div class="stat-item">
          Last Menstrual Period Start:
          {{ cycleStats?.lastPeriodStart || "No data available" }}
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'Activity Trends'" class="stats-overview">
      <div class="stat-item">Recent Activities</div>
      <div class="stat-item">Activity Duration Trends</div>
      <div class="stat-item">Most Common Activities</div>
    </div>

    <div v-if="currentTab === 'Weight Trends'" class="stats-overview">
      <div class="stat-item">Weight Tracking Coming Soon!</div>
      <div class="stat-item">Track your weight changes over time</div>
    </div>
  </main>
</template>

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
