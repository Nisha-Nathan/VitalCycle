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

  <div class="section">
    <h3>Update user details</h3>
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
  </div>


  <div class="section">
    <h3>Opt-in Preferences</h3>
    <div class="pure-form">
      <fieldset class="selection">
        <legend>Manage your preferences</legend>
        <label>
          <input type="checkbox" v-model="sisterCircleOptIn"
            @change="() => updateOptingStatus('sisterCircle', sisterCircleOptIn)" />
          SisterCircle
        </label>
        <label>
          <input type="checkbox" v-model="myCareBoardOptIn"
            @change="() => updateOptingStatus('myCareBoard', myCareBoardOptIn)" />
          MyCareBoard
        </label>
      </fieldset>
    </div>
  </div>

  <button class="button-error pure-button" @click="delete_">Delete User</button>
</template>

<style scoped>
h3{
  margin:0;
  font-weight:medium;
}
.section{
  margin-bottom: 20px;
  border-bottom: 1px solid black;
}

legend{
  margin:0;
  font-size: 1em;
}

.selection{
  display: flex;
  flex-direction: column;
}

.pure-button-primary:hover {
  background-color: #ff7f7f;
}

.pure-button-primary {
  margin: auto;
  background-color: black;
  border: none;
}

</style>
