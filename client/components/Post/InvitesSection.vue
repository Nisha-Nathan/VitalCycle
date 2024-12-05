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
const xButtonsOnInvitedUsers = ref<string[]>([]);
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

const removeInvitedUser = async (sentToUsername: string) => {
  try {
    await fetchy(`/api/invites/${sentToUsername.substring(2)}`, "DELETE");
  } catch (error) {
    console.log(error);
    return;
  }
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

const hoverInvite = (username: string) => {
  const button = sentInvites.value.find((invite) => invite.sentToUsername === username);
  if (button) {
    button.sentToUsername = "x " + username; // Temporarily change text
  }
};

const unhoverInvite = (username: string) => {
  const button = sentInvites.value.find((invite) => invite.sentToUsername === username);
  if (button) {
    button.sentToUsername = username.substring(2); // Revert to the original text
  }
};

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
    <!-- <button class="close-btn" @click="closeInvitesSection">X</button> -->
    <!-- <h3>Invites</h3> -->
    <div class="invites-parts">
      <div class="invites-part">
        <p class="section-title">Invite a user to your careboard</p>
        <form @submit.prevent="sendInvite(username)">
          <input type="text" id="username" v-model="username" placeholder="Enter username" required />
          <button type="submit">send invite</button>
        </form>
        <p class="section-title">Invited Users (can access your careboard):</p>
        <ul v-if="sentInvites.length > 0">
          <li v-for="invite in sentInvites" :key="invite.id">
            <button class="invited-user" @mouseover="hoverInvite(invite.sentToUsername)" @mouseout="unhoverInvite(invite.sentToUsername)" @click="removeInvitedUser(invite.sentToUsername)">
              {{ invite.sentToUsername }}
            </button>
          </li>
        </ul>
        <p v-else>You haven't invited anyone to your careboard yet.</p>
      </div>
      <!--
      <div class="invites-part">
        <p class="section-title">Visit a friend's careboard</p>
        <ul v-if="invitedTo.length > 0">
          <li v-for="invite in invitedTo" :key="invite.id">
            <button @click="goToUserCareboard(invite.sentFromUsername)">{{ invite.sentFromUsername }}</button>
          </li>
        </ul>
        <p v-else>You haven't been invited to any careboards yet.</p>
      </div>
      -->
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
</style>
