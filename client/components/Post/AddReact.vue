<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["post"]);
const { currentUsername } = storeToRefs(useUserStore());
const emit = defineEmits(["refreshReactCounts"]);

let allReacts = ref([]);
let myCurrentReacts = ref<Record<string, boolean>>({ thumb: false, heart: false, sad: false });

const reactToPost = async (emoji: string) => {
  try {
    myCurrentReacts.value = { ...myCurrentReacts.value, [emoji]: !myCurrentReacts.value[emoji] }; // change front-end first to avoid delay
    await fetchy("/api/reacts", "POST", {
      body: { postID: props.post._id, emoji: emoji },
    });
    emit("refreshReactCounts");
  } catch (error) {
    myCurrentReacts.value = { ...myCurrentReacts.value, [emoji]: !myCurrentReacts.value[emoji] }; // if there's an error, need to undo the change
    console.log(error);
    return;
  }
};

async function getMyReacts() {
  let query: Record<string, string> = { postID: props.post._id };
  let requestResults;
  try {
    requestResults = await fetchy("/api/reacts/bySessionUser", "GET", { query });
  } catch (error) {
    return;
  }
  myCurrentReacts.value = requestResults;
}

onBeforeMount(async () => {
  await getMyReacts();
});
</script>

<template>
  <div class="reactChoiceRow">
    <button :class="myCurrentReacts.thumb ? 'reactButtonSelected' : 'reactButtonUnselected'" @click="reactToPost('thumb')">👍</button>
    <button :class="myCurrentReacts.heart ? 'reactButtonSelected' : 'reactButtonUnselected'" @click="reactToPost('heart')">❤️</button>
    <button :class="myCurrentReacts.sad ? 'reactButtonSelected' : 'reactButtonUnselected'" @click="reactToPost('sad')">😢</button>
  </div>
</template>

<style>
.reactButtonUnselected {
  border: 1px dashed lightgray;
  border-radius: 100%;
  padding: 5px;
  margin: 2px;
  font-size: x-large;
}

.reactButtonSelected {
  border: 1px solid lightgray;
  border-radius: 100%;
  padding: 5px;
  margin: 2px;
  font-size: x-large;
  background-color: lightgray;
}

.reactButtonUnselected:hover {
  background-color: #dceefa;
}

.reactChoiceRow {
  display: flex;
  flex-direction: row;
}
</style>
