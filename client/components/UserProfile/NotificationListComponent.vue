<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import CreateNotificationComponent from "./CreateNotificationComponent.vue";

const notificationStore = useNotificationStore();
const { deliveredNotifications } = storeToRefs(notificationStore);
const { currentUsername } = storeToRefs(useUserStore());

async function deleteNotification(id: string) {
    try {
        await notificationStore.deleteNotification(id);
    } catch (error) {
        return;
    }
}

async function deleteAllNotifications() {
    try {
        await notificationStore.deleteAllNotifications();
    } catch (error) {
        return;
    }
}


onMounted(() => {
    notificationStore.fetchDeliveredNotifications();
});


</script>

<template>
    <main class="profilepage">

        <section class="header">
            <h2 class="section-title">{{ currentUsername }}'s Notifications</h2>
            <div class="header-content">
                <div class="create-notificationa">
                    <button type="button" class="btn btn-outline-light btn-add-circle" data-bs-toggle="modal"
                        data-bs-target="#createNotificationModal">Create Notification</button>

                    <!-- Modal -->
                    <div class="modal fade" id="createNotificationModal" tabindex="-1"
                        aria-labelledby="createNotificationModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="staticBackdropLabel"></h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <CreateNotificationComponent />
                                </div>
                                <div class="modal-footer">
                                    <button type="button" ref="closeBtn" class="btn btn-secondary"
                                        data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn btn-outline-light btn-clear-all" @click="deleteAllNotifications">Clear
                    All Notifications
                </button>
            </div>

        </section>

        <section class="notifications">
            <div>
                <ol v-if="deliveredNotifications.length > 0">
                    <li v-for="notification in deliveredNotifications" :key="notification._id">
                        <div>
                            <p class="notification-message">{{ notification.notificationContent }}</p>
                            <p class="notification-time">{{ formatDate(new Date(notification.notificationTime)) }}</p>
                        </div>
                        <button class="btn btn-delete" @click="deleteNotification(notification._id)">Remove
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
    justify-content: space-between;
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
    width: 100%;
}

.notifications {
    align-items: center;
}

.notification-message {
    margin-bottom: 5px;
}

.notification-time {
    font-size: 0.8em;
    color: grey;
    margin-left: 10px;
    margin-top: 0;
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

.modal-body {
    color: black;
    align-items: flex-start;
}
</style>