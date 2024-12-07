<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { ref } from 'vue';


const notificationTime = ref<string>("");
const notifyAbout = ref("");
const frequency = ref("How frequently would you like to be notified?");
const nTime = ref(new Date().getTimezoneOffset());

const createNotification = async () => {
    try {
        const [hours, minutes] = notificationTime.value.split(":").map(Number);
        const offsetHours = (nTime.value / 60) + hours;

        await fetchy("/api/create/notification", "POST", {
            body: {
                notifyAbout: notifyAbout.value,
                frequency: frequency.value.toLowerCase(),
                timeFrame: {
                    hours: offsetHours,
                    minutes: minutes,
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


</script>


<template>

    <form @submit.prevent="createNotification()">
        <h3>Create Notification</h3>
        <div class="input-group mb-3">
            <label for="notificationContent">Notify About:</label>
            <input v-model="notifyAbout" id="notificationContent" type="text" class="form-control"
                placeholder="What would you like to be notified about..." aria-label="Notification Content"
                aria-describedby="basic-addon1">
        </div>
        <div class="input-group mb-3">
            <label for="notificationTime">Notification Time:</label>
            <input id="notificationTime" v-model="notificationTime" type="time" class="form-control"
                placeholder="What time would you like to be notified " aria-label="Notification Time"
                aria-describedby="basic-addon1">
        </div>

        <div class="form-select-in">
            <label for="notificationFrequency">Notification Frequency:</label>
            <select id="notificationFrequency" class="form-select" aria-label="Frequency Select" v-model="frequency">
                <option selected disabled>How frequently would you like to be notified?</option>
                <option value="Once">Once</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary btn-submit">Create Notification</button>

    </form>


</template>

<style scoped>
.input-group {
    gap: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
}

#notificationTime, #notificationContent, #notificationFrequency {
    width: 100%;
}

.form-select-in {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.btn-submit:hover {
    background-color: #ff7f7f;
}

.btn-submit {
    margin: 10px;
    width: 100%;
    background-color: black;
    border: none;
}

label {
    text-align: left;
}
</style>