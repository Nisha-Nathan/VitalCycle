<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import { ref } from "vue";

const isNewUser = ref(false);

</script>


<template>
  <main class="column">
    <h1>Please register your account</h1>
    <RegisterForm />
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");

.column {
 
  font-family: "Quando", serif;
}

</style>
