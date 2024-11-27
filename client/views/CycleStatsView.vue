<template>
    <main class="cycle-stats">
      <h2>Your Cycle Statistics</h2>

      <div v-if="loading">Loading cycle statistics...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!stats">No cycle data available yet. Start logging to see your trends!</div>
      <div v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Cycle Length</h3>
            <p>{{ stats.averageCycleLength ? `${stats.averageCycleLength} days` : "Not enough data" }}</p>
          </div>

          <div class="stat-card">
            <h3>Period Length</h3>
            <p>{{ stats.averagePeriodLength ? `${stats.averagePeriodLength} days` : "Not enough data" }}</p>
          </div>

          <div class="stat-card">
            <h3>Regularity Score</h3>
            <p>{{ stats.regularityScore }}%</p>
          </div>
        </div>

        <div class="dates-section">
          <h3>Important Dates</h3>
          <p>Last Period: {{ stats.lastPeriodStart ? formatDate(new Date(stats.lastPeriodStart)) : "No data" }}</p>
          <p>Predicted Next Period: {{ stats.predictedNextPeriod ? formatDate(new Date(stats.predictedNextPeriod)) : "Not enough data" }}</p>
        </div>

        <div class="trends-section">
          <div class="common-symptoms">
            <h3>Most Common Symptoms</h3>
            <ul>
              <li v-for="(item, index) in stats.commonSymptoms.slice(0, 5)" :key="index">
                {{ item.symptom }}: {{ item.frequency }} times
              </li>
            </ul>
          </div>

          <div class="common-moods">
            <h3>Most Common Moods</h3>
            <ul>
              <li v-for="(item, index) in stats.commonMoods.slice(0, 5)" :key="index">
                {{ item.mood }}: {{ item.frequency }} times
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue';

  interface CycleStats {
    averageCycleLength: number | null;
    averagePeriodLength: number | null;
    commonSymptoms: { symptom: string; frequency: number }[];
    commonMoods: { mood: string; frequency: number }[];
    regularityScore: number;
    lastPeriodStart: string | null;
    predictedNextPeriod: string | null;
  }

  const stats = ref<CycleStats | null>(null);
  const loading = ref(true);
  const error = ref("");

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/cycles/stats");
      const data = await response.json();
      if (data.error) {
        error.value = data.error;
      } else {
        stats.value = data.stats;
      }
    } catch (e) {
      error.value = "Failed to fetch cycle statistics";
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchStats();
  });
  </script>

  <style scoped>
  .cycle-stats {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }

  .stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
  }

  .stat-card h3 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .stat-card p {
    font-size: 24px;
    font-weight: bold;
    color: #6b4cd5;
    margin: 0;
  }

  .dates-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin: 20px 0;
  }

  .trends-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .common-symptoms, .common-moods {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  li:last-child {
    border-bottom: none;
  }

  .error {
    color: red;
    text-align: center;
    padding: 20px;
  }
  </style>
