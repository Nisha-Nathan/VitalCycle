<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const emit = defineEmits(["closeSection", "goToCareboard", "emptyForm"]);

interface Invite {
  sentFromID: string;
  sentFromUsername: string;
  sentToID: string;
  sentToUsername: string;
  id: string;
}

const username = ref("");
const sentInvites = ref<Invite[]>([]);
const invitedTo = ref<Invite[]>([]);
const userStore = useUserStore();

const closeInvitesSection = () => {
  emit("closeSection");
};

const sendInvite = async (inviteUsername: string) => {
  try {
    await fetchy("/api/invites", "POST", {
      body: { inviteUsername },
    });
  } catch (error) {
    console.log(error);
    return;
  }
  emit("emptyForm");
  await getSentInvites();
};

async function getSentInvites() {
  let query: Record<string, string> = {};
  let requestResults;
  try {
    requestResults = await fetchy("/api/invites/sent", "GET", { query });
    console.log("request results: ", requestResults);
  } catch (error) {
    console.log(error);
    return;
  }
  sentInvites.value = requestResults;
}

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

onBeforeMount(async () => {
  await getSentInvites();
  await getInvites();
});

const emptyForm = () => {
  username.value = "";
};

const goToUserCareboard = (username: string) => {
  userStore.goToCareboard(username);
  emit("goToCareboard");
};
</script>

<template>
  <main>
    <button class="close-btn" @click="closeInvitesSection">X</button>
    <h3>Invites</h3>
    <div class="invites-parts">
      <div class="invites-part">
        <p class="section-title">Invite a user to your careboard</p>
        <form @submit.prevent="sendInvite(username)">
          <input type="text" id="username" v-model="username" placeholder="Enter username" required />
          <button type="submit">send invite</button>
        </form>
        <p>Invited Users (can access your careboard):</p>
        <ul v-if="sentInvites.length > 0">
          <li v-for="invite in sentInvites" :key="invite.id">
            {{ invite.sentToUsername }}
          </li>
        </ul>
        <p v-else>You haven't invited anyone to your careboard yet.</p>
      </div>
      <div class="invites-part">
        <p>Visit a friend's careboard</p>
        <ul v-if="invitedTo.length > 0">
          <li v-for="invite in invitedTo" :key="invite.id">
            <button @click="goToUserCareboard(invite.sentFromUsername)">{{ invite.sentFromUsername }}</button>
          </li>
        </ul>
        <p v-else>You haven't been invited to any careboards yet.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");
main {
  background-color: black;
  border-radius: 1em;
  padding: 10px;
}
h3 {
  text-align: center;
  color: white;
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
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.section-title {
  text-align: center;
}
</style>
