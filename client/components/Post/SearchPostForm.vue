<script setup lang="ts">
import { ref } from "vue";
const props = defineProps(["headerText", "placeholder"]);

const author = ref("");
const emit = defineEmits(["getPostsByAuthor"]);
</script>

<template>
  <form @submit.prevent="emit('getPostsByAuthor', author)" class="pure-form">
    <fieldset>
      <legend>{{ props.headerText }}</legend>
      <input id="author" type="text" v-model="author" :placeholder="props.placeholder" />
      <button type="submit" class="btn btn-primary btn-submit">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}

.btn-submit:hover {
  background-color: #ff7f7f;
}

.btn-submit {
  margin: auto;
  background-color: black;
  border: none;
}
</style>
