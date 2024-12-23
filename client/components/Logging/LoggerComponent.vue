<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { formatDateToday } from "@/utils/formatDate";
import moment from "moment";
import { computed, onMounted, ref, watch } from "vue";
import DailyChecklist from "./DailyChecklist.vue";
// Emit flow changes to parent
const emit = defineEmits(["update-flow"]);

const definedMoods = ["Angry", "Happy", "Calm", "Sad", "Confused"];
const definedFlowIntensities = ["None", "Light", "Medium", "Heavy"];
const definedSymptoms = ["Abdominal Cramps", "Headache", "Acne", "Fatigue", "Constipation", "Diarrhea", "Nausea", "Bloating", "Chills", "Mood swings", "Dry skin"];
const definedActivities = ["Walking", "Running", "Biking", "Weightlifting", "Yoga", "Meditation", "Dance", "HIIT", "Other"];

const getCurrentDate = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();
  const estDate = new Date(now.getTime() - (timezoneOffset + 300) * 60 * 1000);
  return estDate.toISOString().split("T")[0];
};

const currentDate = ref(getCurrentDate());
const dateOfLog = ref(currentDate.value);
const selectedSymptoms = ref<string[]>([]);
const selectedActivity = ref<string | null>(null);
const selectedMood = ref<string | null>(null);
const selectedFlow = ref<string | null>("None");
const notes = ref("");
const logId = ref<string | null>(null);
const isEditMode = ref(false);
const showDatePicker = ref(false);
const showDailyChecklist = ref(false);

const isCurrentDate = computed(() => {
  return dateOfLog.value === currentDate.value;
});

watch(selectedFlow, (newValue) => {
  emit("update-flow", newValue);
});

const submitLog = async () => {
  try {
    const response = await fetchy("/api/logs", "POST", {
      body: {
        dateOfLog: dateOfLog.value,
        symptoms: selectedSymptoms.value,
        mood: selectedMood.value,
        flow: selectedFlow.value,
        notes: notes.value,
        activity: selectedActivity.value,
      },
    });
    logId.value = response.log.id;
    isEditMode.value = true;
  } catch (_) {
    return;
  }
};

const updateLog = async () => {
  try {
    await fetchy(`/api/logs/${logId.value}`, "PUT", {
      body: {
        symptoms: selectedSymptoms.value,
        mood: selectedMood.value,
        flow: selectedFlow.value,
        notes: notes.value,
      },
    });
  } catch (_) {
    return;
  }
};

const fetchLogByDate = async (date: string) => {
  let query: Record<string, string> = {};
  query.date = date;
  try {
    const response = await fetchy(`/api/log`, "GET", { query });
    const log = response?.log;
    showDatePicker.value = false;
    if (log) {
      dateOfLog.value = log.dateOfLog;
      selectedSymptoms.value = log.symptoms;
      selectedMood.value = log.mood;
      selectedFlow.value = log.flow;
      notes.value = log.notes;
      logId.value = log._id;
      isEditMode.value = true;
    } else {
      // Reset form if no log found for the selected date
      dateOfLog.value = date;
      selectedSymptoms.value = [];
      selectedMood.value = null;
      selectedFlow.value = "None";
      notes.value = "";
      logId.value = null;
      isEditMode.value = false;
    }
  } catch (error) {
    // couldn't get response, reset form
    dateOfLog.value = date;
    selectedSymptoms.value = [];
    selectedMood.value = null;
    selectedFlow.value = "None";
    notes.value = "";
    logId.value = null;
    isEditMode.value = false;
    return;
  }
};
const handleDateChange = () => {
  fetchLogByDate(dateOfLog.value);
  showDatePicker.value = false;
};

const handleFormSubmit = () => {
  if (isEditMode.value) {
    updateLog();
  } else {
    submitLog();
  }
};

const displayChecklist = () => {
  showDailyChecklist.value = true;
};

onMounted(() => {
  fetchLogByDate(dateOfLog.value);
});
</script>

<template>
  <form @submit.prevent="handleFormSubmit">
    <div class="today-view">
      <div class="header">
        <div class="date-info">
          <div>
            <h1>{{ formatDateToday(moment(dateOfLog).toDate()) }}</h1>
            <p>{{ selectedFlow !== "None" ? "Period Day" : "No Period Today" }}</p>
          </div>
          <button type="button" class="btn btn-icon" @click="showDatePicker = !showDatePicker">
            <img class="springtime" src="/client/assets/images/Springtime.svg" alt="Springtime Icon" />
          </button>
          <!-- <button @click="displayChecklist">Daily Checklist</button> -->
          <div v-if="showDatePicker">
            <input type="date" v-model="dateOfLog" @change="handleDateChange" />
          </div>
          <button type="button" class="btn btn-outline-light btn-checklist" @click="displayChecklist">Daily Checklist</button>
        </div>
      </div>

      <div class="content">
        <DailyChecklist v-if="showDailyChecklist" :current-date="dateOfLog" @close-checklist="showDailyChecklist = false" />
        <textarea class="journal" id="notes" v-model="notes" placeholder="How did your day go..."></textarea>

        <div class="btn-group mood-section" role="group" aria-label="Mood Entries">
          <div v-for="(mood, index) in definedMoods" :key="index">
            <input type="radio" class="btn-check" name="btnradio-mood" :id="`btnradio-mood-${index}`" v-model="selectedMood" :value="mood" autocomplete="off" />
            <label class="btn btn-outline" :for="`btnradio-mood-${index}`">{{ mood }}</label>
          </div>
        </div>

        <div class="btn-group flow-section" role="group" aria-label="Flow Entries">
          <div v-for="(flow, index) in definedFlowIntensities" :key="index">
            <input type="radio" class="btn-check" name="btnradio-flow" :id="`btnradio-flow-${index}`" v-model="selectedFlow" :value="flow" autocomplete="off" />
            <label class="btn btn-outline" :for="`btnradio-flow-${index}`">{{ flow }}</label>
          </div>
        </div>

        <div class="btn-group symptoms-section" role="group" aria-label="Symptoms Entries">
          <div v-for="(symptom, index) in definedSymptoms" :key="index">
            <input type="checkbox" class="btn-check" name="btnradio-sym" :id="`btnradio-sym-${index}`" v-model="selectedSymptoms" :value="symptom" autocomplete="off" />
            <label class="btn btn-outline" :for="`btnradio-sym-${index}`">{{ symptom }}</label>
          </div>
        </div>

        <div class="btn-group activity-section" role="group" aria-label="Activity Entries">
          <div v-for="(activity, index) in definedActivities" :key="index">
            <input type="radio" class="btn-check" name="btnradio-activity" :id="`btnradio-activity-${index}`" v-model="selectedActivity" :value="activity" autocomplete="off" />
            <label class="btn btn-outline" :for="`btnradio-activity-${index}`">{{ activity }}</label>
          </div>
        </div>
      </div>
    </div>
    <button type="submit" class="btn btn-primary btn-submit">{{ isEditMode ? "Update" : "Submit" }}</button>
  </form>
</template>

<style scoped>
/* General Styles */
form {
  background-color: rgba(255, 251, 254, 0.9);
  border-color: black;
  border: #000000 1px solid;
  border-radius: 10px;
}

.today-view {
  color: #fff;
  background-color: #fffbfe;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 5px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.date-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-info h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #fff;
}

.date-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #ffe3e3;
}

.header-actions .btn {
  background-color: #f09b9b;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  color: #fff;
  cursor: pointer;
}

.header-actions .btn.checklist {
  margin-right: 0.5rem;
}

/* Content */
.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.journal {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  border: 1px solid #ffb6b6;
  padding: 0.5rem;
  background-color: #fff;
  color: #333;
  resize: none;
}

/* Sections */
.header,
.mood-section,
.flow-section,
.symptoms-section,
.activity-section {
  background-color: #ea7575;
  border-radius: 10px;
  padding: 0.75rem;
  gap: 10px;
  outline-color: #fffbfe;
  display: flex;
  flex-wrap: wrap;
}

h2 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}

.btn-icon {
  margin-left: 5px;
  border: none;
  background: transparent;
}

.btn-check {
  margin: 5px;
}

.btn-outline {
  padding: 5px 10px;
  border-radius: 5px;
  border: 2px solid #fff;
  font-size: 0.9rem;
}

.btn-submit:hover,
.btn-outline:hover {
  background-color: #ff7f7f;
}

.btn-submit {
  width: 100%;
  margin: 10px;
  background-color: black;
  border: none;
}

.btn-checklist {
  max-width: fit-content;
  border-radius: 1em !important;
  justify-self: flex-end;
}

.btn-checklist:hover {
  background-color: black;
  color: white;
}
</style>
