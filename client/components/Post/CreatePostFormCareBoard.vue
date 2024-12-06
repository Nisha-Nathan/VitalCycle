<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const userStore = useUserStore();

const content = ref("");
const title = ref("");
const postedOnUsername = ref("");
const emit = defineEmits(["refreshPosts", "closeSection"]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const createPost = async (title: string, content: string, postedOnUsername: string) => {
  let toPostOn: string = postedOnUsername;
  if (!postedOnUsername) {
    toPostOn = currentUsername.value;
  }
  try {
    await fetchy("/api/mycareboard/posts", "POST", {
      body: { title, content, postedOnUsername: toPostOn },
    });
  } catch (error) {
    console.log(error);
    return;
  }
  emit("closeSection");
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};


</script>

<template>
  <main>
    <form @submit.prevent="createPost(title, content, userStore.currentlyViewingCareboard)">
      <label for="title">Post Title:</label>
      <textarea id="title" v-model="title" placeholder="Title of Post Here!" required></textarea>
      <label for="content">Post Contents:</label>
      <textarea id="content" v-model="content" placeholder="Post Contents Here!" required></textarea>
      <button type="submit" class="btn btn-primary btn-submit">Create Post</button>
    </form>
  </main>
</template>

<style scoped>
main {
  color: white;
}
form {
  margin-top: 0;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  position: relative;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  color: black;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: #ff7f7f;
}

.btn-submit {
  margin: auto;
  width: 100%;
  background-color: black;
  border: none;
}
</style>
