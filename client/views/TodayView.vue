<template>
    <div class="today-view">
      <!-- Header Section -->
      <div class="header">
        <h2>Sunday, 17 November</h2>
        <p class="subheader">Period Day</p>
      </div>

      <!-- Export Section -->
      <div class="export-section">
        <div v-if="showUsernameInput" class="username-input-container">
          <input
            v-model="targetUsername"
            class="pure-input"
            placeholder="Enter username to share with"
            @keyup.enter="submitExport"
          >
          <button
            @click.prevent="submitExport"
            class="pure-button pure-button-primary"
            :disabled="!targetUsername.trim()"
          >
            Share
          </button>
          <button
            @click.prevent="cancelExport"
            class="pure-button"
          >
            Cancel
          </button>
        </div>
        <button
          v-else
          @click.prevent="startExport"
          class="pure-button pure-button-primary"
          :disabled="!todaysLog"
        >
          Export to Care Board
        </button>
      </div>

      <!-- Journal Section -->
      <div class="journal-section">
        <h3>How did your day go?</h3>
        <textarea
          v-model="journalEntry"
          class="journal-input"
          placeholder="Add your notes here..."
          rows="4"
        ></textarea>
      </div>

      <!-- Mood Section -->
      <div class="mood-section">
        <h3>Mood</h3>
        <div class="button-group">
          <button
            v-for="mood in moods"
            :key="mood"
            @click.prevent="selectMood(mood)"
            :class="['button', { selected: selectedMood === mood }]"
          >
            {{ mood }}
          </button>
        </div>
      </div>

      <!-- Flow Intensity Section -->
      <div class="flow-section">
        <h3>Flow Intensity</h3>
        <div class="button-group">
          <button
            v-for="level in flowLevels"
            :key="level"
            @click.prevent="selectFlow(level)"
            :class="['button', { selected: selectedFlow === level }]"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <!-- Symptoms Section -->
      <div class="symptoms-section">
        <h3>Symptoms</h3>
        <div class="button-group">
          <button
            v-for="symptom in symptoms"
            :key="symptom"
            @click.prevent="toggleSymptom(symptom)"
            :class="['button', { selected: selectedSymptoms.includes(symptom) }]"
          >
            {{ symptom }}
          </button>
        </div>
      </div>

      <!-- Log Button -->
      <button
        @click.prevent="logSymptoms"
        class="log-button"
        :disabled="!selectedFlow && selectedSymptoms.length === 0 && !journalEntry.trim()"
      >
        Log Today's Symptoms
      </button>

      <!-- Today's Log -->
      <div v-if="todaysLog" class="todays-log">
        <h3>Today's Log:</h3>
        <p>Mood: {{ todaysLog.mood || 'Not specified' }}</p>
        <p>Flow Intensity: {{ todaysLog.flow || 'Not specified' }}</p>
        <p>Symptoms: {{ todaysLog.symptoms.join(', ') || 'None' }}</p>
        <div v-if="todaysLog.journal" class="journal-display">
          <h4>Journal Entry:</h4>
          <p>{{ todaysLog.journal }}</p>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref } from 'vue';
  import { fetchy } from '@/utils/fetchy';

  const flowLevels = ['Light', 'Medium', 'Heavy'];
  const moods = ['Angry', 'Happy', 'Calm', 'Sad', 'Confused'];
  const symptoms = ['Abdominal Cramps', 'Headache', 'Fatigue', 'Bloating', 'Mood Swings'];

  const selectedFlow = ref('');
  const selectedMood = ref('');
  const selectedSymptoms = ref([]);
  const journalEntry = ref('');
  const todaysLog = ref(null);
  const showUsernameInput = ref(false);
  const targetUsername = ref('');

  const selectFlow = (level) => {
    selectedFlow.value = level;
  };

  const selectMood = (mood) => {
    selectedMood.value = mood;
  };

  const toggleSymptom = (symptom) => {
    const index = selectedSymptoms.value.indexOf(symptom);
    if (index === -1) {
      selectedSymptoms.value.push(symptom);
    } else {
      selectedSymptoms.value.splice(index, 1);
    }
  };

  const logSymptoms = () => {
    todaysLog.value = {
      flow: selectedFlow.value,
      mood: selectedMood.value,
      symptoms: [...selectedSymptoms.value],
      journal: journalEntry.value,
    };
  };

  const formatLoggedData = () => {
    if (!todaysLog.value) return '';

    const date = new Date().toLocaleDateString();
    let formattedData = `Menstrual Log for ${date}\n\n`;

    formattedData += `Flow Level: ${todaysLog.value.flow}\n\n`;
    formattedData += `Symptoms: ${todaysLog.value.symptoms.length ? todaysLog.value.symptoms.join(', ') : 'None reported'}\n\n`;

    if (todaysLog.value.journal) {
      formattedData += `Journal Entry:\n${todaysLog.value.journal}`;
    }

    return formattedData;
  };

  const startExport = () => {
    showUsernameInput.value = true;
  };

  const cancelExport = () => {
    showUsernameInput.value = false;
    targetUsername.value = '';
  };

  const submitExport = async () => {
    try {
      const content = formatLoggedData();

      await fetchy("/api/mycareboard/posts", "POST", {
        body: {
          title: "Today's Menstrual Log",
          content,
          postedOnUsername: targetUsername.value.trim()
        }
      });

      // Reset and show success
      showUsernameInput.value = false;
      targetUsername.value = '';
      alert('Successfully shared to Care Board!');
    } catch (error) {
      alert(`Failed to share. Please check the username and try again.`);
      console.error('Export error:', error);
    }
  };
  </script>

  <style scoped>
  .today-view {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    background-color: #fde2e4;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .header {
    text-align: center;
    margin-bottom: 20px;
  }

  .header h2 {
    font-size: 1.5em;
    color: #c8553d;
  }

  .subheader {
    font-size: 1em;
    color: #e29578;
  }

  .export-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }

  .journal-section,
  .mood-section,
  .flow-section,
  .symptoms-section {
    margin-bottom: 20px;
  }

  .journal-input {
    width: 100%;
    border: 1px solid #ddd;
    padding: 8px;
    border-radius: 4px;
    font-size: 1em;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .button {
    padding: 8px 12px;
    border: 1px solid #c8553d;
    border-radius: 4px;
    cursor: pointer;
    background-color: white;
    color: #c8553d;
  }

  .button.selected {
    background-color: #c8553d;
    color: white;
  }

  .log-button {
    width: 100%;
    background-color: #6d6875;
    color: white;
    padding: 10px;
    font-size: 1.2em;
    border-radius: 4px;
  }

  .todays-log {
    padding: 15px;
    border: 1px solid #ddd;
    background-color: #fff;
    border-radius: 4px;
  }

  .journal-display {
    margin-top: 10px;
  }

  .username-input-container {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .username-input-container input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 200px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  </style>
