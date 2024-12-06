<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());

let circles = ref<Array<string>>([]);

async function getUserCircles() {
  let query: Record<string, string> = {};
  query.username = currentUsername.value;
  let circleResponse;
  try {
    circleResponse = await fetchy("/api/circles", "GET", { query });
    circles.value = circleResponse.circles;
  } catch (error) {
    return;
  }
}

async function removeUserCirlce(circle: string) {
  try {
    await fetchy("api/remove/circles", "POST", {
      body: { circle: circle },
    });
    getUserCircles();
  } catch (error) {
    return;
  }
}

onBeforeMount(() => {
  getUserCircles();
});
</script>

<template>
  <h2>Your Sister Circles</h2>
  <div class="circles">
    <ol v-if="circles.length > 0">
      <li v-for="circle in circles" :key="circle">
        <p>{{ circle }}</p>
        <button class="btn btn-delete" @click="removeUserCirlce(circle)">Remove Circle</button>
      </li>
    </ol>
    <p class="empty-message" v-else>You are not a part of any Sister Cirlce yet!</p>
  </div>
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
</style>
