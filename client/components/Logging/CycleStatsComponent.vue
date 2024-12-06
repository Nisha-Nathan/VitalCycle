<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import Chart from "chart.js/auto"; // Import Chart.js


// Store references
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

// Reactive properties
const tabs = ["Cycle History", "Activity Trends"];
const currentTab = ref("Cycle History");

const cycleStats = ref<{
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  lastPeriodStart: string | null;
} | null>(null);

const exerciseStats = ref<{
  averageActivityDuration: number | null;
  mostCommonActivities: string | null;
  // activity duration later?
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
    const response = await fetchy("/api/cycles/stats", "GET");
    console.log("API Response:", response); // Log the full response

    if (response?.stats) {
      cycleStats.value = response.stats; // Assign the stats directly
      renderGraph(response.stats.periodStarts);
    } else {
      cycleStats.value = null;
      errorMessage.value = "No cycle data found. Start logging your cycles to see statistics!";
    }
  } catch (error) {
    console.log("error: ", error);
    cycleStats.value = null;
    errorMessage.value = "Failed to fetch cycle statistics. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Render graph after data is fetched
const renderGraph = (periodStarts: Array<{ date: string; cycleLength: number }>) => {
  const ctx = document.getElementById("cycleStatsGraph") as HTMLCanvasElement;
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: periodStarts.map((item) => item.date),
      datasets: [
        {
          label: "Cycle Length",
          data: periodStarts.map((item) => item.cycleLength),
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Cycle Length (Days)",
          },
        },
      },
    },
  });
};


// Fetch Exercise Stats
const fetchExerciseStats = async () => {
  if (!isLoggedIn.value || !currentUsername.value) {
    exerciseStats.value = null;
    errorMessage.value = "Please log in to view your exercise statistics.";
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetchy("/api/exercise", "GET");
    console.log("API Response:", response); // Log the full response

    if (response?.stats) {
      exerciseStats.value = response.stats; // Assign the stats directly
    } else {
      exerciseStats.value = null;
      errorMessage.value = "No cycle data found. Start logging your exercise to see statistics!";
    }
  } catch (error) {
    exerciseStats.value = null;
    errorMessage.value = "Failed to fetch exercise statistics. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Fetch stats on component mount
onMounted(() => {
  fetchCycleStats();
  fetchExerciseStats();
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
          {{ cycleStats?.averageCycleLength ? `${cycleStats.averageCycleLength} days` : "Not enough data yet! At least 2 cycles needed." }}
        </div>
        <div class="stat-item">
          Average Period Length:
          {{ cycleStats?.averagePeriodLength ? `${cycleStats.averagePeriodLength} days` : "At least 1 full period needed." }}
        </div>
        <div class="stat-item">
          Last Menstrual Period Start:
          {{ cycleStats?.lastPeriodStart || "No data available" }}
        </div>

        <!-- Graph Container -->
        <div class="stat-item">
          <canvas id="cycleStatsGraph"></canvas>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'Activity Trends'" class="stats-overview">
      <div v-if="isLoading" class="stat-item">Loading...</div>
      <div v-else-if="errorMessage" class="stat-item">{{ errorMessage }}</div>
      <div v-else>
        <!-- Example: Displaying Exercise Stats -->
        <div class="stat-item">
          Average Activity Duration:
          {{ exerciseStats?.averageActivityDuration ? `${exerciseStats.averageActivityDuration} minutes` : "No data available" }}
        </div>
        <div class="stat-item">
          Most Common Activities:
          {{ exerciseStats?.mostCommonActivities?.join(", ") || "No data available" }}
        </div>
      </div>
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

#cycleStatsGraph {
  width: 100%;
  height: 300px;
  margin-top: 1.5rem;
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
