<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["post"]);
const { currentUsername } = storeToRefs(useUserStore());

let allReacts = ref({ thumb: 0, heart: 0, sad: 0 });

async function getPostReacts() {
  let query: Record<string, string> = { postID: props.post._id };
  let requestResults;
  try {
    requestResults = await fetchy("/api/reacts", "GET", { query });
  } catch (error) {
    console.log(error);
    return;
  }
  allReacts.value.thumb = requestResults.thumb;
  allReacts.value.heart = requestResults.heart;
  allReacts.value.sad = requestResults.sad;
}

defineExpose({
  getPostReacts,
});

onBeforeMount(async () => {
  await getPostReacts();
});
</script>

<template>
  <div class="countsRow">
    <div class="countSection">
      <p class="emoji">👍</p>
      <p v-if="allReacts.thumb > 0" class="countNum">x{{ allReacts.thumb || 0 }}</p>
    </div>
    <div class="countSection">
      <p class="emoji">❤️</p>
      <p v-if="allReacts.heart > 0" class="countNum">x{{ allReacts.heart || 0 }}</p>
    </div>
    <div class="countSection">
      <p class="emoji">😢</p>
      <p v-if="allReacts.sad > 0" class="countNum">x{{ allReacts.sad || 0 }}</p>
    </div>
  </div>
</template>

<style scoped>
.countsRow {
  display: flex;
  flex-direction: row;
}

.countSection {
  display: flex;
  flex-direction: row;
  margin: 5px;
  align-items: center;
}

.emoji {
  font-size: large;
  margin: 2px;
}

.countNum {
  color: gray;
  text-decoration: italic;
  margin: 2px;
}
</style>
