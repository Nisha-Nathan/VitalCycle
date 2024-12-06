<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { ref, watch, watchEffect } from 'vue';


const notificationTime = ref<string>("");
const notifyAbout = ref("");
const frequency = ref("How frequently would you like to be notified?");

const createNotification = async () => {
    try {
        const [hours, minutes] = notificationTime.value.split(":").map(Number);
        await fetchy("/api/create/notification", "POST", {
            body: {
                notifyAbout: notifyAbout.value,
                frequency: frequency.value.toLowerCase(),
                timeFrame: {
                    hours,
                    minutes,
                },
            },
        });

        emptyForm();
    } catch (_) {
        return;
    }
    emptyForm();
};

const emptyForm = () => {
    notifyAbout.value = "";
    frequency.value = "How frequently would you like to be notified?";
    notificationTime.value = "";
};


const printTime = () => {
    console.log(notificationTime.value);
};

// Watch the notificationTime ref and log its value and type whenever it changes
watch(notificationTime, (newValue) => {
    console.log('Notification Time:', newValue);
    console.log('Type:', typeof newValue);
});
</script>


<template>

    <form @submit.prevent="createNotification()">
        <h3>Create Notification</h3>
        <div class="input-group mb-3">
            <label for="notificationTime">Notify About:</label>
            <input v-model="notifyAbout" id="notificationTime" type="text" class="form-control"
                placeholder="What would you like to be notified about..." aria-label="Username"
                aria-describedby="basic-addon1" @timeupdate="printTime">
        </div>
        <div class="input-group mb-3">
            <label for="notificationTime">Notification Time:</label>
            <input id="notificationTime" v-model="notificationTime" type="time" class="form-control"
                placeholder="What time would you like to be notified " aria-label="Notification Time"
                aria-describedby="basic-addon1">
        </div>

        <div class="form-select-in">
            <label for="notificationTime">Notification Frequency:</label>
            <select class="form-select" aria-label="Frequency Select" v-model="frequency">
                <option selected disabled >How frequently would you like to be notified?</option>
                <option value="Once">Once</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>

    </form>


</template>

<style scoped>
.input-group {
    gap: 5px;
}

#notificationTime {
    width: 100%;
}

</style>