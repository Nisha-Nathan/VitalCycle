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
let replyText = ref("");
let searchAuthor = ref("");
const userStore = useUserStore();

async function getReplies() {
  let query: Record<string, string> = { postID: props.post._id };
  let postResults;
  try {
    postResults = await fetchy("/api/replies", "GET", { query });
    console.log("post results: ", postResults);
  } catch (error) {
    return;
  }
  replies.value = postResults.replies;
  console.log("replies: ", replies.value);
}

const addReply = async (textString: string) => {
  try {
    await fetchy("/api/replies", "POST", {
      body: { postID: props.post._id, content: textString },
    });
  } catch (error) {
    console.log(error);
    return;
  }
  getReplies();
  replyText.value = "";
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
  <form @submit.prevent="addReply(replyText)">
    <textarea v-model="replyText" placeholder="Write your reply here..." rows="3" required></textarea>
    <button type="submit">Post Reply</button>
  </form>
</template>

<style scoped>
article {
  background-color: white;
  border: 1px solid black;
  margin: 10px;
}

textarea {
  margin-bottom: 10px;
  padding: 10px;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 5px;
}

form {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
}

button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
