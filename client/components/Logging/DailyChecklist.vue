<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const emit = defineEmits(["refreshReactCounts", "closeChecklist"]);

interface ChecklistItem {
  text: string;
  checked: boolean;
  lastChecked: Date | null;
}

interface ChecklistDoc {
  author: string;
  dateOfChecklist: Date;
  items: ChecklistItem[];
  id: string;
}

let allTasks = ref<ChecklistDoc[]>([]);
let checklistItems = ref<ChecklistItem[]>([]);
const placeholderTask: string[] = ["Hi this is a task"];

async function getMyTasks() {
  let query: Record<string, string> = {};
  let requestResults;
  try {
    requestResults = await fetchy("/api/checklists", "GET", { query });
  } catch (error) {
    console.log(error);
    return;
  }
  if (requestResults.checklist == null) allTasks.value = [];
  else allTasks.value = [requestResults.checklist];
}

function getTaskItems() {
  // Check if there are any tasks and if any of those tasks have valid items
  if (allTasks.value.length === 0) return false;

  const firstTask = allTasks.value[0];
  const items = firstTask.items;

  // Validate that `items` exists and is an array
  if (!Array.isArray(items)) {
    return false;
  }
  checklistItems.value = items;
  return items;
}

const createPlaceholderTask = async (items: string[]) => {
  const allItems = [];
  for (const prevItem of checklistItems.value) {
    allItems.push(prevItem.text);
  }
  for (const newItem of items) {
    allItems.push(newItem);
  }
  try {
    await fetchy("/api/checklists", "POST", {
      body: { items: allItems },
    });
  } catch (error) {
    try {
      await fetchy("/api/checklists", "PUT", {
        body: { items: allItems },
      });
    } catch (error2) {
      return;
    }
  }
  getMyTasks();
};

onBeforeMount(async () => {
  await getMyTasks();
});

const closeChecklist = () => {
  emit("closeChecklist");  // Emit event to parent component to hide the checklist
};
</script>

<template>
  <div class="dailyChecklist">
    <button @click="closeChecklist" class="close-btn">X</button> <!-- Close button -->
    <h3>Daily Checklist</h3>
    <ul v-if="getTaskItems()">
      <li v-for="task in checklistItems"><input type="checkbox"> {{ task.text }}</input></li>
    </ul>
    <button @click="createPlaceholderTask(placeholderTask)">Add placeholder task</button>
  </div>
</template>

<style>
.dailyChecklist {
  background-color: white;
  color: black;
  position: fixed; /* Use fixed to keep it in place even if the page scrolls */
  top: 50%; /* Position the top edge at the vertical center of the page */
  left: 50%; /* Position the left edge at the horizontal center of the page */
  transform: translate(-50%, -50%); /* Offset the element by 50% of its width and height to truly center it */
  padding: 80px;
  padding-top: 30px;
  padding-bottom: 30px;
  border: 1px solid black;
  border-radius: 1rem;
  z-index: 100; /* Ensure it's above other elements */
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

</style>
