<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { onMounted, ref } from "vue";

let username = ref("");
let currentPassword = ref("");
let newPassword = ref("");

const { updateUserUsername, updateUserPassword, updateSession, deleteUser, sisterCircleOptIn, myCareBoardOptIn, fetchOptingStatus, updateOptingStatus } = useUserStore();

async function updateUsername() {
  await updateUserUsername(username.value);
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUserPassword(currentPassword.value, newPassword.value);
  await updateSession();
  currentPassword.value = newPassword.value = "";
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Today" });
}

onMounted(() => {
  fetchOptingStatus();
});
</script>

<template>
  <h2>Update user details</h2>
  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Change your username</legend>
      <input type="text" placeholder="New username" v-model="username" required />
      <button type="submit" class="pure-button pure-button-primary">Update username</button>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <input type="password" placeholder="Old password" v-model="currentPassword" required />
      <input type="password" placeholder="New password" v-model="newPassword" required />
      <button type="submit" class="pure-button pure-button-primary">Update password</button>
    </fieldset>
  </form>

  <button class="button-error pure-button" @click="delete_">Delete User</button>

  <h2>Opt-in Preferences</h2>
  <div class="pure-form">
    <fieldset>
      <legend>Manage your preferences</legend>
      <label>
        <input type="checkbox" v-model="sisterCircleOptIn" @change="() => updateOptingStatus('sisterCircle', sisterCircleOptIn)" />
        SisterCircle
      </label>
      <label>
        <input type="checkbox" v-model="myCareBoardOptIn" @change="() => updateOptingStatus('myCareBoard', myCareBoardOptIn)" />
        MyCareBoard
      </label>
    </fieldset>
  </div>
</template>
