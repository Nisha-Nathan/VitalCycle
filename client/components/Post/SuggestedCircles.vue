<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SuggestionPopup from "./SuggestionPopup.vue";

const { currentUsername } = storeToRefs(useUserStore());
let circleSuggestion = ref("");
let circleDescription = ref("");
let suggestionPopupShowing = ref(false);
let suggestionPopupCircle = ref("");
let popupKey = ref(0);

let circles = ref<Array<string>>([]);

async function getUserCircles() {
  let query: Record<string, string> = {};
  query.username = currentUsername.value;
  let circleResponse;
  try {
    circleResponse = await fetchy("/api/suggestedCircles/:username", "GET", { query });
    circles.value = circleResponse.circles;
  } catch (error) {
    console.log(error);
    return;
  }
}

async function addSuggestedCircle(circleName: string, circleDescription: string) {
  try {
    await fetchy("api/suggestedCircles", "POST", {
      body: { circleName, description: circleDescription },
    });
    getUserCircles();
  } catch (error) {
    return;
  }
  emptyForm();
}

async function removeUserCircle(circle: string) {
  try {
    await fetchy("api/remove/suggestedCircles", "POST", {
      body: { circleName: circle },
    });
    getUserCircles();
  } catch (error) {
    return;
  }
}

function openSuggestionPopup(circleName: string) {
  suggestionPopupShowing.value = true;
  suggestionPopupCircle.value = circleName;
  remountCareBoardList();
}

function closeSuggestionPopup() {
  suggestionPopupShowing.value = false;
  suggestionPopupCircle.value = "";
}

const emptyForm = () => {
  circleSuggestion.value = "";
  circleDescription.value = "";
};

const remountCareBoardList = () => {
  popupKey.value++; // Increment the key to trigger remount
};

onBeforeMount(() => {
  getUserCircles();
});
</script>

<template>
  <h2>Your Suggested Circles</h2>
  <SuggestionPopup :key="popupKey" v-if="suggestionPopupShowing" :circleName="suggestionPopupCircle" @closeSection="closeSuggestionPopup" class="popup" />
  <div class="circles">
    <ol v-if="circles.length > 0">
      <li v-for="circle in circles" :key="circle">
        <button @click="openSuggestionPopup(circle)">{{ circle }}</button>
        <button class="btn btn-delete" @click="removeUserCircle(circle)">Remove Suggestion</button>
      </li>
    </ol>
    <p class="empty-message" v-else>You haven't suggested any Circles yet.</p>
  </div>
  <p class="form-header">Suggest a new circle:</p>
  <form @submit.prevent="addSuggestedCircle(circleSuggestion, circleDescription)">
    <textarea id="circleSuggestion" v-model="circleSuggestion" placeholder="Circle Suggestion" required></textarea>
    <textarea id="circleDescription" v-model="circleDescription" placeholder="Why do you think this circle should be added?" required></textarea>
    <button type="submit" class="btn btn-primary">Add Suggestion</button>
  </form>
</template>

<style scoped>
li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid black;
}

p {
  margin: 0;
  padding: 5px;
  font-size: 1.2em;
}

.circles {
  align-items: center;
}

.btn-delete {
  background-color: black;
  color: white;
  margin-bottom: 5px;
}

.btn-delete:hover {
  background-color: #ea7575;
  color: white;
}

h2 {
  margin-top: 3rem;
}

form {
  display: flex;
  flex-direction: column;
}

textarea {
  margin-bottom: 10px;
  padding: 10px;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-header {
  margin-top: 20px;
}

.popup {
  position: absolute;
}
</style>
