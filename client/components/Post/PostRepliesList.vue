<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["post"]);

const loaded = ref(false);
let replies = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
const userStore = useUserStore();

async function getReplies() {
  let query: Record<string, string> = { postID: props.post._id };
  let postResults;
  try {
    postResults = await fetchy("/api/replies", "GET", { query });
  } catch (error) {
    return;
  }
  replies.value = postResults.replies;
}

const addDefaultReply = async () => {
  const placeholderContent = "Hi this is a reply.";
  try {
    await fetchy("/api/replies", "POST", {
      body: { postID: props.post._id, content: placeholderContent },
    });
  } catch (error) {
    console.log(error);
    return;
  }
};

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getReplies();
  loaded.value = true;
});
</script>

<template>
  <section v-if="loaded && replies.length !== 0">
    <article v-for="reply in replies" :key="reply._id">
      <p>{{ reply.username }}:</p>
      <p>{{ reply.content }}</p>
    </article>
  </section>
  <p v-else-if="loaded">No replies found</p>
  <p v-else>Loading...</p>
  <button @click="addDefaultReply">+ Add placeholder reply</button>
</template>

<style scoped>
article {
  background-color: white;
  border: 1px solid black;
  margin: 10px;
}
</style>
