<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};
</script>

<template>
  <div class="all-post">
    <div class="post-header">
      <p class="post-title">{{ props.post.title }}</p>
      <article class="timestamp">
        <p>{{ formatDate(props.post.dateUpdated) }}</p>
      </article>
    </div>
    <p class="post-content">{{ props.post.content }}</p>
    <div class="base">
      <button class="see-replies">See Replies</button>
    </div>
  </div>
</template>

<style scoped>
.all-post {
  background-color: #ea7575;
  border-radius: 1em;
  border: 1px solid black;
}

.post-content {
  background-color: rgba(255, 251, 254, 0.7);
  margin: 1em;
  margin-top: 0;
  padding: 0.5em;
  padding-top: 1.5em;
  border: 1px solid black;
}

.post-title {
  color: white;
}

.post-header {
  background-color: black;
  padding: 1.5rem;
  padding-bottom: 0;
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;
}
.see-replies {
  background-color: #ea7575;
  color: white;
  border: 1px solid white;
  border-radius: 0.5em;
  margin: 10px;
  width: fit-content;
}
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.7em;
  font-style: italic;
  color: gray;
}

.base {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.base article:only-child {
  margin-left: auto;
}
</style>
