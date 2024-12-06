<script setup lang="ts">
import PostListComponentCareBoard from "@/components/Post/PostListComponentCareBoard.vue";



</script>

<template>
  <main class="homepage">
  

    <!-- Care Board Section -->
    <section class="care-board">
      <PostListComponentCareBoard />
    </section>

 
  </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");
/* Section Titles */
.section-title {
  background-color: black !important;
  font-size: 1.6rem;
  color: #fff;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.homepage {
  background-color: #ffe3e3;
  border-radius: 12px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Quando", serif;
  font-weight: 400;
  font-style: normal;
  padding: 2rem;
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

.care-board {
  background-color: #ffc1c1;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.care-board :deep(h2) {
  margin-bottom: 1rem;
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

.invites-button {
  color: white;
  background-color: black;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 1.2em;
  margin-left: 10px;
  margin-right: 10px;
  border: 1px solid white;
  font-size: 1rem;
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
.care-board > div {
  padding: 1rem;
  background-color: #ffe3e3;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
