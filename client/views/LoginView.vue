<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
// import RegisterForm from "@/components/Login/RegisterForm.vue";
// import { ref } from "vue";

// const isNewUser = ref(false);

</script>


<template>
  <main class="column">
    <h1>Please login</h1>
    <LoginForm />
    <p>
      New user? <RouterLink to="/register">Register here</RouterLink>
    </p>
    
    <!-- <RegisterForm /> -->
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");

.column {
  font-family: "Quando", serif;
}

p > a{
  color:black;
}

p > a:hover{
  color:white;
}

</style>
