<script setup lang="ts">
import AddReact from "@/components/Post/AddReact.vue";
import ReactCounts from "@/components/Post/ReactCounts.vue";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import PostRepliesList from "./PostRepliesList.vue";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());
let repliesShowing = ref(false);

let allReacts = ref([]);

const isExpanded = ref(false); // Flag to track if the post is expanded

const toggleContent = () => {
  isExpanded.value = !isExpanded.value; // Toggle between truncated and full content
};

// Truncated content logic
const truncatedContent = computed(() => {
  return isExpanded.value
    ? props.post.content
    : props.post.content.slice(0, 200) + (props.post.content.length > 200 ? "..." : ""); // Show truncated content
});

const deletePost = async () => {
  // console.log("delete post called");
  try {
    const idToSend = String(props.post._id);
    //await fetchy(`/api/mycareboard/posts/${props.post._id}`, "DELETE");
    await fetchy(`/api/sistercircle/posts/${idToSend}`, "DELETE");
  } catch (error) {
    console.log(error);
    return;
  }
  emit("refreshPosts");
};

const isAuthor = (postUsername: string) => {
  return postUsername == currentUsername.value;
};

const reactCountsRef = ref<InstanceType<typeof ReactCounts> | null>(null);

const handleRefreshReactCounts = () => {
  reactCountsRef.value?.getPostReacts?.();
};

const toggleShowReplies = async () => {
  repliesShowing.value = !repliesShowing.value;
};
</script>

<template>
  <div class="titleAndReactCounts">
    <h2>{{ props.post.title }}</h2>
    <ReactCounts ref="reactCountsRef" :post="props.post" />
  </div>
  <p class="author">by {{ props.post.author ? props.post.username : "anonymous" }}</p>
  <p>
    {{ truncatedContent }}
    <button type="button" class="btn btn-primary btn-sm" v-if="props.post.content.length > 200"
      @click="toggleContent">{{ isExpanded ? "Read Less" : "Read More" }}
    </button>
  </p>
  <div class="base">
    <menu v-if="isAuthor(props.post.username)">
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}
      </p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
    <ul>
      <li v-for="circle in props.post.circles" :key="circle">
        <span class="badge rounded-pill bg-dark "> {{ circle }}</span>
      </li>
    </ul>
  </div>
  <AddReact :post="props.post" @refreshReactCounts="handleRefreshReactCounts" />
  <button class="see-replies" @click="toggleShowReplies">{{ repliesShowing ? "Hide Replies" : "See Replies" }}</button>
  <PostRepliesList v-if="repliesShowing" :post="props.post" />
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

.bg-dark {
  font-weight: lighter;
}

.btn-sm {
  background-color: transparent;
  border-color: black;
  color: black;
  font-size: small;
  height: fit-content;
  font-weight: medium;
}

.btn-sm:hover {
  background-color: black;
  color: white;
}

.see-replies {
  background-color: #ea7575;
  color: black;
  border: 1px solid black;
  border-radius: 0.5em;
  margin: 10px;
  width: fit-content;
}

.see-replies:hover {
  background-color: lightgray;
  color: black;
}
</style>
