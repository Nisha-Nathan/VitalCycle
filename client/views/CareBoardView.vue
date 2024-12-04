<script setup lang="ts">
import CreatePostFormCareBoard from "@/components/Post/CreatePostFormCareBoard.vue";
import InvitesSection from "@/components/Post/InvitesSection.vue";
import CareBoardPostListComponent from "@/components/Post/PostListComponentCareBoard.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const userStore = useUserStore();

let createPostFormShowing = ref(false);
let invitesSectionShowing = ref(false);
let careBoardListKey = ref(0);

const toggleCreatePostForm = () => {
  createPostFormShowing.value = !createPostFormShowing.value;
};

const closeInvitesSection = () => {
  invitesSectionShowing.value = false;
};
const closeCreateSection = () => {
  createPostFormShowing.value = false;
};
const openInvitesSection = () => {
  createPostFormShowing.value = false;
  invitesSectionShowing.value = true;
};
const openCreateSection = () => {
  invitesSectionShowing.value = false;
  createPostFormShowing.value = true;
};
const remountCareBoardList = () => {
  closeInvitesSection();
  closeCreateSection();
  careBoardListKey.value++; // Increment the key to trigger remount
};

const goToMyCareboard = () => {
  userStore.goToCareboard("");
  remountCareBoardList();
};
</script>

<template>
  <main class="homepage">
    <!-- Header Section -->
    <section v-if="!isLoggedIn" class="header">
      <h1 class="welcome-message">
        <span>Please login to access your account!</span>
      </h1>
    </section>

    <!-- Care Board Section -->
    <section class="care-board">
      <h2 v-if="!userStore.currentlyViewingCareboard" class="section-title">My Care Board</h2>
      <h2 v-else class="section-title">{{ userStore.currentlyViewingCareboard }}'s Careboard</h2>
      <button v-if="userStore.currentlyViewingCareboard" @click="goToMyCareboard">< Go to My Careboard</button>
      <div class="top-buttons">
        <button :class="{ 'top-button-selected': createPostFormShowing, 'top-button': !createPostFormShowing }" @click="openCreateSection">+ Create Post</button>
        <button class="top-button" @click="openInvitesSection">Invites</button>
      </div>
      <CreatePostFormCareBoard v-if="createPostFormShowing" class="invites-section" @closeSection="closeCreateSection" />
      <InvitesSection v-if="invitesSectionShowing" class="invites-section" @closeSection="closeInvitesSection" @goToCareboard="remountCareBoardList" />
      <CareBoardPostListComponent :key="careBoardListKey" />
    </section>
  </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");

.homepage {
  background-color: #ffe3e3;
  border-radius: 12px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Quando", serif;
  font-weight: 400;
  font-style: normal;
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
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

/* Sister Circles & Care Board Sections */
.sister-circles,
.care-board {
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-buttons {
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.top-button {
  color: black;
  border: 1 px solid black;
  background-color: #ffe3e3;
  padding: 10px;
  border-radius: 1em;
  margin-left: 10px;
  margin-right: 10px;
}

.top-button-selected {
  color: black;
  border: 1 px solid black;
  background-color: lightgray;
  padding: 10px;
  border-radius: 1em;
  margin-left: 10px;
  margin-right: 10px;
}

.top-button:hover {
  background-color: white;
}

.sister-circles :deep(h2),
.care-board :deep(h2) {
  margin-bottom: 1rem;
}

/* Component Wrappers */
.sister-circles > div,
.care-board > div {
  padding: 1rem;
  background-color: #ffe3e3;
  border-radius: 8px;
}

/* Invites Section Styling */
.invites-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10; /* Ensures it appears on top of other elements */
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 80%; /* Adjust the width as needed */
  max-width: 600px; /* You can set a max-width */
  border: 1px solid black;
  color: black;
}
</style>
