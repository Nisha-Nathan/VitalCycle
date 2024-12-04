<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { onBeforeMount, ref } from "vue";
import AddReact from "@/components/Post/AddReact.vue";
import ReactCounts from "@/components/Post/ReactCounts.vue";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

let allReacts = ref([]);

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};

const reactCountsRef = ref<InstanceType<typeof ReactCounts> | null>(null);

const handleRefreshReactCounts = () => {
  reactCountsRef.value?.getPostReacts?.();
};
</script>

<template>
  <div class="titleAndReactCounts">
    <h2>{{ props.post.title }}</h2>
    <ReactCounts ref="reactCountsRef" :post="props.post" />
  </div>
  <p class="author">by {{ props.post.author ? props.post.username : "anonymous" }}</p>
  <p>{{ props.post.content }}</p>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
    <ul>
      <li v-for="circle in props.post.circles" :key="circle">
        {{ circle }}
      </li>
    </ul>
  </div>
  <AddReact :post="props.post" @refreshReactCounts="handleRefreshReactCounts" />
</template>

<style scoped>
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
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

.titleAndReactCounts {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
