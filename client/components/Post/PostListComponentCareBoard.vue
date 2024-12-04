<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostFormCareBoard.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import PostComponent from "./PostComponentCareBoard.vue";
import SearchPostForm from "./SearchPostForm.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["currentlyViewing"]);

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
const userStore = useUserStore();

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/mycareboard/posts", "GET", { query });
  } catch (error) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  console.log("remounting!!");
  if (!userStore.currentlyViewingCareboard) {
    await getPosts(currentUsername.value);
  } else {
    await getPosts(userStore.currentlyViewingCareboard);
  }
  loaded.value = true;
});
</script>

<template>
  <!--
  <section v-if="isLoggedIn">
    <h2>Create a my care board post</h2>
    <CreatePostForm @refreshPosts="getPosts" />
  </section>
-->
  <div class="row">
    <h2 v-if="!searchAuthor">My Care Board Posts:</h2>
    <!--
    <h2 v-else>Posts on {{ searchAuthor }}'s Care Board:</h2>
    <SearchPostForm :headerText="'Go to Careboard of User:'" @getPostsByAuthor="getPosts" />
    -->
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <PostComponent :post="post.post" @refreshPosts="getPosts" @editPost="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
