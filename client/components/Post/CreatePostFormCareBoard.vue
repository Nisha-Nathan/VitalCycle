<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";



const content = ref("");
const title = ref("");
const postedOnUsername = ref("");
const emit = defineEmits(["refreshPosts"]);


const createPost = async (title: string, content: string, postedOnUsername: string) => {
  try {
    await fetchy("/api/mycareboard/posts", "POST", {
      body: { title, content, postedOnUsername },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};


const emptyForm = () => {
  content.value = "";
};


</script>

<template>
  <form @submit.prevent="createPost(title, content, postedOnUsername)">
    <label for="title">Post Title:</label>
    <textarea id="title" v-model="title" placeholder="Title of Post Here!" required> </textarea>
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Post Contents Here!" required> </textarea>
    <label for="postedOnUsername">Put this post on the careboard of username: :</label>
    <textarea id="postedOnUsername" v-model="postedOnUsername" placeholder="User123" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

.anonymous-checkbox {
  transform: scale(1.5);
  margin: 10px;
}

</style>
