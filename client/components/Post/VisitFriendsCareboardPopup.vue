<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const emit = defineEmits(["closeSection", "goToCareboard"]);

interface Invite {
  sentFromID: string;
  sentFromUsername: string;
  sentToID: string;
  sentToUsername: string;
  id: string;
}

const invitedTo = ref<Invite[]>([]);
const userStore = useUserStore();

const closeSection = () => {
  emit("closeSection");
};

async function getInvites() {
  let query: Record<string, string> = {};
  let requestResults;
  try {
    requestResults = await fetchy("/api/invites", "GET", { query });
  } catch (error) {
    console.log(error);
    return;
  }
  invitedTo.value = requestResults;
}

const goToUserCareboard = (username: string) => {
  console.log("going to user careboard: ", username);
  closeSection();
  userStore.goToCareboard(username);
  console.log("store value is now: ", userStore.currentlyViewingCareboard);
  emit("goToCareboard");
};

onBeforeMount(async () => {
  await getInvites();
});
</script>

<template>
  <main>
    <button class="close-btn" @click="closeSection">X</button>
    <h3>Friend's Careboards</h3>
    <div class="invites-parts">
      <ul v-if="invitedTo.length > 0">
        <li v-for="invite in invitedTo" :key="invite.id">
          <button @click="goToUserCareboard(invite.sentFromUsername)" class="visitFriendButton">{{ invite.sentFromUsername }}</button>
        </li>
      </ul>
      <p v-else>You haven't been invited to any careboards yet.</p>
    </div>
  </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");
main {
  border-radius: 1em;
  padding: 10px;
}
h3 {
  text-align: center;
}
.invites-parts {
  display: flex;
  flex-direction: column;
  align-content: center;
}
.invites-part {
  background-color: white;
  border-radius: 1em;
  margin: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
ul {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: black;
}

.section-title {
  text-align: center;
  color: black;
  margin-top: 0.5rem;
}

ul {
  list-style-type: none;
}

.invited-user:hover {
  background-color: lightcoral;
}

.invited-user {
  background-color: lightgray;
  border-radius: 1rem;
  padding: 3px;
  padding-right: 15px;
  padding-left: 15px;
  margin: 0.2rem;
}

.visitFriendButton {
  background-color: lightgray;
  border-radius: 1rem;
  padding: 3px;
  padding-right: 15px;
  padding-left: 15px;
  margin: 0.2rem;
}

.visitFriendButton:hover {
  background-color: darkgray;
}
</style>
