<script setup lang="ts">
import CareBoardPostListComponent from "@/components/Post/PostListComponentCareBoard.vue";
import SisterCirclesPostListComponent from "@/components/Post/PostListComponentSisterCircles.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <SisterCirclesPostListComponent />
    <CareBoardPostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
