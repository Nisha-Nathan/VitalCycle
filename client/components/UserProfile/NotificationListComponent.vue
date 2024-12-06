<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

const notificationStore = useNotificationStore();
const { currentUsername } = storeToRefs(useUserStore());
const notifications = ref<Array<string>>([]);

async function deleteNotification(id: string) {
    try {
        await notificationStore.deleteNotification(id);
        getNotifications();
    } catch (error) {
        return;
    }
}

async function deleteAllNotifications() {
    try {
        await notificationStore.deleteAllNotifications();
        getNotifications();
    } catch (error) {
        return;
    }
}

async function getNotifications() {
    notifications.value = await notificationStore.fetchDeliveredNotifications();
    console.log("notifications: ", notifications.value);
}

onMounted(() => {
    getNotifications();
});


</script>

<template>
    <main class="profilepage">

        <section class="header">
            <h2 class="section-title">{{ currentUsername }}'s Notifications</h2>
            <div class="header-content">
                <div class="logout">
                    <button type="button" class="btn btn-outline-light btn-clear-all"
                        @click="deleteAllNotifications">Clear
                        All Notifications </button>
                </div>
            </div>

        </section>

        <section class="notifications">
            <div>
                <ol v-if="notifications.length > 0">
                    <li v-for="notification in notifications" :key="notification">
                        <p>{{ notification }}</p>
                        <button class="btn btn-delete" @click="deleteNotification(notification)">Remove
                            Notification</button>
                    </li>
                </ol>
                <p class="empty-message" v-else>You have no New Notifications =></p>
            </div>

        </section>
    </main>
</template>

<style scoped>
.header {
    background-color: black;
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 0;
    max-width: unset;

}

.header-content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

section {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

li {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid black;
}

.notifications {
    align-items: center;
}

.btn-delete {
    background-color: black;
    color: white;
    margin-bottom: 5px;
}

.btn-delete:hover {
    background-color: #ea7575;
    color: white;
}

.btn-clear-all:hover {
    background-color: #ea7575;
    color: white;
}
</style>