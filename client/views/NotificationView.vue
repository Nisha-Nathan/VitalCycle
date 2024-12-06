<script setup lang="ts">
import NotificationListComponent from '@/components/UserProfile/NotificationListComponent.vue';


</script>

<template>
    <main class="notificationspage">


        <!-- Care Board Section -->
        <section class="notification">
            <NotificationListComponent />
        </section>


    </main>
</template>

<style scoped>
/* General Layout */
@import url("https://fonts.googleapis.com/css2?family=Quando&display=swap");

.notificationspage {
  background-color: #ffe3e3;
  padding: 2rem;
  border-radius: 12px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Quando", serif;

}

/* Welcome Section */
.header {
  background-color: #ffb3b3;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
.notification {
  background-color: #ffc1c1;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification :deep(h2) {
  margin-bottom: 1rem;
}

/* Component Wrappers */
.notification>div {
  padding: 1rem;
  background-color: #ffe3e3;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
