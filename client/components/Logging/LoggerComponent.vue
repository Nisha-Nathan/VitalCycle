<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { formatDateToday } from "@/utils/formatDate";
import moment from "moment";
import { computed, defineEmits, onMounted, ref, watch } from "vue";

// Emit flow changes to parent
const emit = defineEmits(["update-flow"]);

const definedMoods = ["Angry", "Happy", "Calm", "Sad", "Confused"];
const definedFlowIntensities = ["None", "Light", "Medium", "Heavy"];
const definedSymptoms = ["Abdominal Cramps", "Headache", "Acne", "Fatigue", "Constipation", "Diarrhea", "Nausea", "Bloating", "Chills", "Mood swings", "Dry skin"];

const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

const dateOfLog = ref(getCurrentDate());
const selectedSymptoms = ref<string[]>([]);
const selectedMood = ref<string | null>(null);
const selectedFlow = ref<string | null>("None");
const notes = ref("");
const logId = ref<string | null>(null);
const isEditMode = ref(false);
const showDatePicker = ref(false);

const isCurrentDate = computed(() => dateOfLog.value === getCurrentDate());

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
  } catch (_) {
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
          </div>
          <button type="button" class="btn btn-icon" @click="showDatePicker = !showDatePicker">
            <img class="springtime" src="/client/assets/images/Springtime.svg" alt="Springtime Icon" />
          </button>
          <div v-if="showDatePicker">
            <input type="date" v-model="dateOfLog" @change="handleDateChange" />
          </div>
        </div>
      </div>

      <div class="content">
        <textarea class="journal" id="notes" v-model="notes" placeholder="How did your day go..." :readonly="!isCurrentDate"></textarea>

        <div class="btn-group mood-section" role="group" aria-label="Mood Entries">
          <div v-for="(mood, index) in definedMoods" :key="index">
            <input type="radio" class="btn-check" name="btnradio-mood" :id="`btnradio-mood-${index}`" v-model="selectedMood" :value="mood" autocomplete="off" :disabled="!isCurrentDate" />
            <label class="btn btn-outline" :for="`btnradio-mood-${index}`">{{ mood }}</label>
          </div>
        </div>

        <div class="btn-group flow-section" role="group" aria-label="Flow Entries">
          <div v-for="(flow, index) in definedFlowIntensities" :key="index">
            <input type="radio" class="btn-check" name="btnradio-flow" :id="`btnradio-flow-${index}`" v-model="selectedFlow" :value="flow" autocomplete="off" :disabled="!isCurrentDate" />
            <label class="btn btn-outline" :for="`btnradio-flow-${index}`">{{ flow }}</label>
          </div>
        </div>

        <div class="btn-group symptoms-section" role="group" aria-label="Symptoms Entries">
          <div v-for="(symptom, index) in definedSymptoms" :key="index">
            <input type="checkbox" class="btn-check" name="btnradio-sym" :id="`btnradio-sym-${index}`" v-model="selectedSymptoms" :value="symptom" autocomplete="off" :disabled="!isCurrentDate" />
            <label class="btn btn-outline" :for="`btnradio-sym-${index}`">{{ symptom }}</label>
          </div>
        </div>
      </div>
    </div>
    <button v-if="isCurrentDate" type="submit" class="btn btn-primary">{{ isEditMode ? "Update" : "Submit" }}</button>
  </form>
</template>
