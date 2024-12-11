<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["circleName"]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const emit = defineEmits(["closeSection"]);
let myDescription = ref("");
const closeSection = () => {
  emit("closeSection");
};

async function getSuggestionDescription(circleName: string) {
  let query: Record<string, string> = { circleName };
  let requestResults;
  try {
    requestResults = await fetchy(`/api/suggestedCircles/description/${circleName}`, "GET");
  } catch (error) {
    return;
  }
  myDescription.value = requestResults.description;
}

function getDescription() {
  return myDescription.value;
}

onBeforeMount(async () => {
  await getSuggestionDescription(props.circleName);
});
</script>

<template>
  <main>
    <button type="button" class="close-btn" data-bs-dismiss="modal" aria-label="Close" @click="closeSection"></button>
    <button class="close-btn" @click="closeSection">X</button>
    <div class="invites-parts">
      <h4>Suggestion: {{ props.circleName }}</h4>
      <p>Description: {{ getDescription() }}</p>
    </div>
  </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");
main {
  background-color: white;
  color: black;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 80px;
  padding-top: 30px;
  padding-bottom: 30px;
  border: 1px solid black;
  border-radius: 1rem;
  z-index: 100;
  width: 30vw;
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
p {
  margin-top: 1rem;
}

h3 {
  text-align: center;
}
.invites-parts {
  display: flex;
  flex-direction: column;
  align-content: left;
}
.invites-part {
  background-color: white;
  border-radius: 1em;
  margin: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
ul {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: black;
}

.section-title {
  text-align: center;
  color: black;
  margin-top: 0.5rem;
}

ul {
  list-style-type: none;
}

.invited-user:hover {
  background-color: lightcoral;
}

.invited-user {
  background-color: lightgray;
  border-radius: 1rem;
  padding: 3px;
  padding-right: 15px;
  padding-left: 15px;
  margin: 0.2rem;
}

.visitFriendButton {
  background-color: lightgray;
  border-radius: 1rem;
  padding: 3px;
  padding-right: 15px;
  padding-left: 15px;
  margin: 0.2rem;
}

.visitFriendButton:hover {
  background-color: darkgray;
}
</style>
