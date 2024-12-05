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
const closeBtnAddCircle = ref<HTMLButtonElement | null>(null);
const closeBtnAddPost = ref<HTMLButtonElement | null>(null);


async function getUserCircles() {
  let query: Record<string, string> = {};
  if (currentUsername.value) {
    query.username = currentUsername.value;
  }
  let circleResponse;
  try {
    circleResponse = await fetchy("/api/circles", "GET", { query });
  } catch (error) {
    console.log(error);
    return;
  }
  circles.value = ["All Circles", ...circleResponse.circles];
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

const closeModal = () => {
 closeBtnAddCircle.value?.click();
 closeBtnAddPost.value?.click();
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>

  <section class="header">
    <h2 class="section-title">Sister Circles</h2>
    <div class="header-content">
      <div class="btn-group section" role="group">
        <div v-if="circles.length !== 0" v-for="(flow, index) in circles" :key="index">
          <input type="radio" class="btn-check" :name="`btnradio-sistercircles`" :id="`btnradio-sistercircles-${index}`"
            v-model="selectedCircle" :value="flow" autocomplete="off" @change="getPosts(undefined, selectedCircle)" />
          <label class="btn btn-circle" :for="`btnradio-sistercircles-${index}`">{{ flow }}</label>
        </div>
      </div>

      <div class="add-circle">
        <button type="button" class="btn btn-outline-light btn-add-circle" data-bs-toggle="modal"
          data-bs-target="#addCircleModal">Add a
          Circle <i class="bi bi-plus"></i> </button>

        <!-- Modal -->
        <div class="modal fade" id="addCircleModal" tabindex="-1" aria-labelledby="addCircleModalLabel"
          aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <AddCirclesForm @refreshCircles="getUserCircles" @closeForm="closeModal"/>
              </div>
              <div class="modal-footer">
                <button ref="closeBtnAddCircle" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-if="isLoggedIn">
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-add-post" data-bs-toggle="modal" data-bs-target="#createPostModal">
      <i class="bi bi-plus-lg"></i>
    </button>

    <!-- Modal -->
    <div class="modal fade" id="createPostModal" tabindex="-1" aria-labelledby="createPostModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="createPostModalLabel">Create A Sister Circles Post</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <CreatePostForm @refreshPosts="getPosts" @closeForm="closeModal"/>
          </div>
          <div class="modal-footer">
            <button type="button" ref="closeBtnAddPost" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </section>


  <div class="row">
    <SearchPostForm :headerText="'Search by Title:'" :placeholder="'Post title'" @getPostsByAuthor="getPostsByTitle" />
    <h2 v-if="searchTitle">Search results for '{{ searchTitle }}':</h2>
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
  margin-top: 0;
  max-width: unset;

}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* .btn {
  width: 100%;
  margin: 20px;
  margin-left: 0;
} */

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  justify-content: center;
}

.btn-circle {
  border-color: #ea7575;
  color: #ea7575;
}

.btn-check:checked+.btn,
.btn-check:active+.btn {
  border-color: #000000;
  background-color: #ea7575;
  color: #000000;
}

.btn-check:not(:checked)+.btn {
  border-color: #ea7575;
  color: #ea7575;
  /* Reset background to default */
}

.btn-add-post {
  background-color: black;
  color: white;
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 1em;
  outline: none;
  border-radius: 50%;
  width: 4em;
  height: 4em;
}

.btn-add-post:hover {
  color: black;
  background-color: white;
}

.bi-plus-lg {
  font-size: 2em;

}

.btn-add-circle {
  max-width: fit-content;
  border-radius: 1em !important;
  align-self: flex-end;
}

.btn-add-circle:hover,
.btn-add-post:hover {
  background-color: #ea7575;
  color: white;

}

.btn-add-post:hover {
  border-color: black !important;
}
</style>
