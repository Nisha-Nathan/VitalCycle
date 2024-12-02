<script setup lang="ts">
import { ref } from "vue";
import CareBoardPostListComponent from "@/components/Post/PostListComponentCareBoard.vue";
import CreatePostFormCareBoard from "@/components/Post/CreatePostFormCareBoard.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

let createPostFormShowing = ref(false);

const toggleCreatePostForm = () => {
  console.log("hi ", createPostFormShowing.value);
  createPostFormShowing.value = !createPostFormShowing.value;
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
      <h2 class="section-title">My Care Board</h2>
      <div class="top-buttons">
        <button :class="{ 'top-button-selected': createPostFormShowing, 'top-button': !createPostFormShowing }" @click="toggleCreatePostForm">+ Create Post</button>
        <button class="top-button">+ Invite User</button>
      </div>
      <CreatePostFormCareBoard v-if="createPostFormShowing" />
      <CareBoardPostListComponent />
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
</style>
