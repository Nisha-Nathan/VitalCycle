<script setup lang="ts">import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import PostComponent from "./PostComponentCareBoard.vue";
import CreatePostFormCareBoard from "./CreatePostFormCareBoard.vue";
import InvitesSection from "./InvitesSection.vue";
import VisitFriendsCareboardPopup from "./VisitFriendsCareboardPopup.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["currentlyViewing"]);

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");
const userStore = useUserStore();
let careBoardListKey = ref(0);

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
  console.log("remounting!!!");
  if (!userStore.currentlyViewingCareboard) {
    await getPosts(currentUsername.value);
  } else {
    await getPosts(userStore.currentlyViewingCareboard);
  }
  loaded.value = true;
});

const remountCareBoardList = () => {
  careBoardListKey.value++; // Increment the key to trigger remount
};


const goToMyCareboard = () => {
  userStore.goToCareboard("");
  remountCareBoardList();
};


</script>

<template>

  <section class="header">
    <h2 class="section-title" v-if="!userStore.currentlyViewingCareboard">My Care Board</h2>
    <h2 class="section-title" v-else>{{ userStore.currentlyViewingCareboard }}'s Careboard</h2>
    <div class="header-content">

      <div class="friends-careboard">
        <button type="button" class="btn btn-outline-light btn-add-circle" data-bs-toggle="modal"
          data-bs-target="#friendsCareboardModal">Friends' Careboards </button>

        <!-- Modal -->
        <div class="modal fade" id="friendsCareboardModal" tabindex="-1" aria-labelledby="friendsCareboardModalLabel"
          aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">Friends' Careboards</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <VisitFriendsCareboardPopup class="invites-section" @goToCareboard="remountCareBoardList" @closeSection="closeModal"/>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div class="add-circle">
        <button type="button" class="btn btn-outline-light btn-add-circle" data-bs-toggle="modal"
          data-bs-target="#inviteModal">Invite Friends <i class="bi bi-plus"></i> </button>

        <!-- Modal -->
        <div class="modal fade" id="inviteModal" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">Invites</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>

              <div class="modal-body">
                <InvitesSection @goToCareboard="remountCareBoardList" />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
            <CreatePostFormCareBoard @refreshPosts="getPosts" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </section>


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

.modal-title{
  color: black;
  margin-left: auto;
}

</style>
