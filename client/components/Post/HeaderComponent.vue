<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps(['entry'])

</script>

<template>
    <div>
        <h2 class="section-title">{{ props.entry.title }} </h2>
        <div class="btn-group section" role="group">
            <div v-for="(flow, index) in props.entry.options" :key="index">
                <input type="radio" class="btn-check" :name="`btnradio-${props.entry.title}`"
                    :id="`btnradio-${props.entry.title}-${index}`" v-model="selectedFlow" :value="flow"
                    autocomplete="off">
                <label class="btn btn-outline" :for="`btnradio-${props.entry.title}-${index}`">{{ flow }}</label>
            </div>
        </div>
    </div>
</template>

<style scoped>
.welcome-message {
  font-size: 1.8rem;
  color: #000;
  font-weight: bold;
}

</style>