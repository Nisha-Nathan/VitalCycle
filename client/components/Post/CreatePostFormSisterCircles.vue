<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

interface Circle {
  id: string;
  name: string;
}

const content = ref("");
const title = ref("");
const selectedCircle = ref("");
const isAnonymous = ref(true);
const allCircles = ref<Circle[]>([]);
const emit = defineEmits(["refreshPosts"]);


const createPost = async (title: string, content: string, anonymous: boolean, circles: string[]) => {
  try {
    await fetchy("/api/sistercircle/posts", "POST", {
      body: { title, content, anonymous, circles },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const getAllCircles = async () => {
  try {
    allCircles.value = await fetchy("/api/circles", "GET", { });
  } catch (error) {
    return;
  }
};

const emptyForm = () => {
  content.value = "";
};

onBeforeMount(async () => {
  getAllCircles();
});
</script>

<template>
  <form @submit.prevent="createPost(title, content, isAnonymous, [selectedCircle])">
    <label for="title">Post Title:</label>
    <textarea id="title" v-model="title" placeholder="Title of Post Here!" required> </textarea>
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Post Contents Here!" required> </textarea>
    <div>
      <label for="anonymous">Post Anonymously:</label>
      <input type="checkbox" class="anonymous-checkbox" v-model="isAnonymous" />
    </div>
    <div>
    <label for="circle">Select Circle:</label>
    <select id="circle" v-model="selectedCircle" required>
      <option v-for="circle in allCircles">
        {{ circle.name  }}
      </option>
    </select>
  </div>
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
