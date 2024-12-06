<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import UpdateUserForm from "@/components/Setting/UpdateUserForm.vue";
import UserCirclesComponent from "@/components/UserProfile/UserCirclesComponent.vue";
import { useRoute, useRouter } from "vue-router";
import CreateNotificationComponent from "@/components/UserProfile/CreateNotificationComponent.vue";
const router = useRouter();
const route = useRoute();
const { logoutUser } = useUserStore();


const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
// const selectedSetting = ref("");
const selectedSetting = ref(route.query.tab || "");

async function logout() {
    await logoutUser();
    void router.push({ name: "Today" });
}


watch(
    () => route.query.tab,
    (newTab) => {
        selectedSetting.value = newTab || ""; // Fallback to default
    }
);

const updateTab = (tab: string) => {
    router.push({ query: { tab } });
    selectedSetting.value = tab;
};


</script>

<template>
    <main class="profilepage">

        <section class="user-profile">
            <section class="header">
                <h2 class="section-title">{{ currentUsername }}'s Profile</h2>
                <div class="header-content">
                    <div class="logout">
                        <button type="button" class="btn btn-outline-light btn-logout" @click="logout">Logout </button>
                    </div>
                </div>

            </section>




            <section v-if="!selectedSetting" class="user-profile">

                <!-- <h2 class="section-title">{{ currentUsername }}'s Profile</h2> -->

                <div class="btn-group-vertical btn-group-profile" role="group" aria-label="Vertical button group">
                    <button type="button" class="btn btn-dark" @click="updateTab('Account')">Account</button>
                    <button type="button" class="btn btn-dark" @click="updateTab('User Circles')">User Circles</button>
                    <button type="button" class="btn btn-dark" @click="updateTab('Notifications')">Create
                        Notifications</button>
                    <!-- <button type="button" class="btn btn-dark">Privacy Features</button>
                    <button type="button" class="btn btn-dark">Export to Doctor</button> -->
                </div>
            </section>

            <section v-else class="user-profile">
                <!-- <h2 class="section-title">{{ currentUsername }}'s Profile</h2> -->
                <button class="btn btn-primary btn-go-back" type="button" @click="updateTab('')">Return to My
                    Profile</button>

                <div v-if="selectedSetting === 'Account'">
                    <UpdateUserForm />
                </div>

                <div v-if="selectedSetting === 'User Circles'">
                    <UserCirclesComponent />
                </div>

                <div v-if="selectedSetting === 'Notifications'">
                    <CreateNotificationComponent />
                </div>



            </section>
        </section>
\
    </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");

.profilepage {
    background-color: #ffe3e3;
    padding: 2rem;
    border-radius: 12px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: "Quando", serif;

}

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

.welcome-message {
    font-size: 1.8rem;
    color: #000;
    font-weight: bold;
}

/* Section Titles */
.section-title {
    font-size: 1.6rem;
    color: #fff;
    background-color: #000;
    padding: 0.8rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
}

/* Sister Circles & Care Board Sections */
.user-profile {
    background-color: #ffc1c1;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-profile:deep(h2) {
    margin-bottom: 1rem;
}

/* Component Wrappers */
.user-profile>div {
    padding: 1rem;
    background-color: #ffe3e3;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-group-profile {
    display: flex;
    gap: 1em;
    flex-direction: column;
}

.btn-group-profile button {
    background-color: #000;
    color: #fff;
    border: none;
    padding: 1em;
    border-radius: 8px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-group-profile button:hover {
    background-color: #ff7575;
}


.btn-go-back {
    background-color: black;
    color: white;
    border: none;
    margin-top: 1em;
    margin-bottom: 1em;
}

.btn-go-back:hover {
    background-color: #ea7575;
    color: white;
}


.btn-add-circle {
    max-width: fit-content;
    border-radius: 1em !important;
    align-self: flex-end;
}

.btn-add-circle:hover,
.btn-logout:hover {
    background-color: #ea7575;
    color: white;

}
</style>
