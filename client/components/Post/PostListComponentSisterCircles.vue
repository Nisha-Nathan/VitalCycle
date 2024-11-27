<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostFormSisterCircles.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import PostComponent from "./PostComponentSisterCircles.vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let searchTitle = ref("");

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/sistercircle/posts", "GET", { query });
  } catch (error) {
    console.log(error);
    return;
  }
  searchAuthor.value = author ? author : "";
  searchTitle.value = "";
  posts.value = postResults;
}

async function getPostsByTitle(title?: string) {
  let query: Record<string, string> = title !== undefined ? { title: title } : {};
  let postResults;
  try {
    postResults = await fetchy("api/sistercircle/posts/byTitle", "GET", { query });
  } catch (error) {
    console.log(error);
    return;
  }
  posts.value = postResults;
  searchTitle.value = title ? title : "";
  searchAuthor.value = "";
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a sister circles post:</h2>
    <CreatePostForm @refreshPosts="getPosts" />
  </section>
  <div class="row">
    <h2 v-if="!searchAuthor && !searchTitle">Sister Circle Posts:</h2>
    <h2 v-else-if="searchAuthor">Posts by {{ searchAuthor }}:</h2>
    <h2 v-else>Search results for '{{ searchTitle }}':</h2>
    <SearchPostForm :headerText="'Search by Author:'" @getPostsByAuthor="getPosts" />
    <SearchPostForm :headerText="'Search by Title:'" @getPostsByAuthor="getPostsByTitle" />
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
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
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
