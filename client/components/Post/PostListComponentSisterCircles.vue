<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostFormSisterCircles.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, onMounted, ref } from "vue";
import PostComponent from "./PostComponentSisterCircles.vue";
import SearchPostForm from "./SearchPostForm.vue";
import AddCirclesForm from "./AddCirclesForm.vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
let searchTitle = ref("");
let circles = ref<Array<Record<string, string>>>([]);
const selectedCircle = ref("All Circles");

async function getUserCircles() {
  let query: Record<string, string> = {};
  if (currentUsername.value) {
    query.username = currentUsername.value;
  }
  let circleResponse;
  try {
    circleResponse = await fetchy(`/api/circles/${currentUsername.value}`, "GET", { query });
  } catch (_) {
    return;
  }
  circles.value =["All Circles", ...circleResponse.circles];
}




onMounted(() => {
  getUserCircles();

});

async function getPosts(author?: string, circle?: string) {
  let query: Record<string, string> = {};
  if (author) {
    query.author = author;
  }

  if (circle && circle !== "All Circles") {
    query.circle = circle;
  }
  let postResults;
  try {
    postResults = await fetchy("/api/sistercircle/posts", "GET", { query });
  } catch (error) {
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
  <section class="header">
    <h2 class="section-title">Sister Circles </h2>
    <div class="btn-group section" role="group">
      <div v-if="circles.length !== 0" v-for="(flow, index) in circles" :key="index">
        <input type="radio" class="btn-check" :name="`btnradio-sistercircles`" :id="`btnradio-sistercircles-${index}`"
          v-model="selectedCircle" :value="flow" autocomplete="off" @change="getPosts(undefined,selectedCircle)">
        <label class=" btn btn-circle " :for="`btnradio-sistercircles-${index}`">{{ flow }}</label>
      </div>
    </div>
  </section>


  <section v-if="isLoggedIn">
    <a class="btn btn-primary " data-bs-toggle="collapse" href="#createPost" role="button" aria-expanded="false"
      aria-controls="collapse">
      Create a sister circles post
    </a>
    <div class="collapse show" id="createPost" style="">

      <CreatePostForm @refreshPosts="getPosts" />
    </div>
  </section>

  <section v-if="isLoggedIn">
    <a class="btn btn-primary  " data-bs-toggle="collapse" href="#addCircle" role="button" aria-expanded="false"
      aria-controls="collapse">
      Add a Circle
    </a>
    <div class="collapse show" id="addCircle" style="">
      <AddCirclesForm @refreshCircles="getUserCircles" />
    </div>
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
.header {
  background-color: black;
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-message {
  font-size: 1.8rem;
  color: #000;
  font-weight: bold;
}

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

.btn {
  width: 100%;
  margin: 20px;
  margin-left: 0;

}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  justify-content: center;
}

.btn-circle {
  border-color: #EA7575;
  color: #EA7575;
}

.btn-check:checked+.btn,
.btn-check:active+.btn {
  border-color: #000000;
  background-color: #EA7575;
  color: #000000
}

.btn-check:not(:checked)+.btn {
  border-color: #EA7575;
  color: #EA7575;
  /* Reset background to default */
}
</style>
