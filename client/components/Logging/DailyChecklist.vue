<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted, ref, toRefs, watch } from "vue";
const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps<{
  currentDate: string; // Date passed from the parent component
}>();
const emit = defineEmits(["close-checklist"]);
const { currentDate } = toRefs(props); // Make the currentDate reactive

interface ChecklistItem {
  text: string;
  checked: boolean;
}

const checklistItems = ref<ChecklistItem[]>([]);
const newTask = ref("");

// Fetch tasks for the current date
const getMyTasks = async () => {
  try {
    const userName = currentUsername.value; // Assuming username maps to user ID
    const userInfo = await fetchy(`/api/users/${userName}`, "GET");
    const userId = userInfo._id;
    const response = await fetchy(`/api/checklisting/${userId}/${currentDate.value}`, "GET");
    checklistItems.value = response.tasks.map((task: any) => ({
      text: task.description,
      checked: task.completed,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    checklistItems.value = [];
  }
};

// Add a new task
const addNewTask = async () => {
  if (!newTask.value.trim()) return;
  try {
    const userName = currentUsername.value; // Assuming username maps to user ID
    const userInfo = await fetchy(`/api/users/${userName}`, "GET");
    const userId = userInfo._id;

    // Check if the checklist exists by attempting to fetch it
    try {
      await fetchy(`/api/checklisting/${userId}/${currentDate.value}`, "GET");
    } catch {
      await fetchy(`/api/checklisting/${userId}/${currentDate.value}/initialize`, "POST");
    }

    await fetchy(`/api/checklisting/${userId}/${currentDate.value}/task`, "POST", {
      body: { description: newTask.value.trim() },
    });
    newTask.value = "";
    await getMyTasks();
  } catch (error) {
    console.error("Failed to add new task:", error);
  }
};

// Delete a task
const deleteTask = async (index: number) => {
  try {
    const userName = currentUsername.value; // Assuming username maps to user ID
    const userInfo = await fetchy(`/api/users/${userName}`, "GET");
    const userId = userInfo._id;
    await fetchy(`/api/checklisting/${userId}/${currentDate.value}/task/${index}`, "DELETE");
    checklistItems.value.splice(index, 1);
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
};

// Toggle task status
const toggleTaskStatus = async (index: number) => {
  try {
    const userName = currentUsername.value; // Assuming username maps to user ID
    const userInfo = await fetchy(`/api/users/${userName}`, "GET");
    const userId = userInfo._id;
    await fetchy(`/api/checklisting/${userId}/${props.currentDate}/task/${index}`, "PATCH");
  } catch (error) {
    console.error("Failed to toggle task status:", error);
  }
  await getMyTasks();
};

// Watch for changes in the currentDate prop and reload tasks
watch(currentDate, async () => {
  await getMyTasks();
});

// Close checklist on outside click
const handleOutsideClick = (event: MouseEvent) => {
  const checklistElement = document.querySelector(".dailyChecklist");
  if (checklistElement && !checklistElement.contains(event.target as Node)) {
    emit("close-checklist");
  }
};

onMounted(async () => {
  await getMyTasks();
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <div class="dailyChecklist">
    <!-- Close Button -->
    <button class="close-btn" @click="$emit('close-checklist')">X</button>
    <h3>Checklist for {{ currentDate }}</h3>
    <ul>
      <li v-for="(task, index) in checklistItems" :key="index">
        <input type="checkbox" v-model="task.checked" @change="() => toggleTaskStatus(index)" />
        {{ task.text }}
        <button @click="() => deleteTask(index)" class="delete-btn">Delete</button>
      </li>
    </ul>
    <input type="text" v-model="newTask" placeholder="Enter a new task" />
    <button @click="addNewTask">Add Task</button>
  </div>
</template>

<style>
.dailyChecklist {
  background-color: white;
  color: black;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 80px;
  padding-top: 30px;
  padding-bottom: 30px;
  border: 1px solid black;
  border-radius: 1rem;
  z-index: 100;
}

h3 {
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  display: flex;
  flex-direction: column;
}

li {
  margin: 5px;
  display: flex;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

input[type="text"] {
  margin-top: 10px;
  padding: 5px;
  font-size: 1rem;
}

.delete-btn {
  margin-left: 10px;
  background-color: red;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  align-self: flex-end; /* Aligns the button properly */
}
</style>
