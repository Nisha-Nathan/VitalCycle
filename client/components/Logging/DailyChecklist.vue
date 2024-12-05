<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const emit = defineEmits(["refreshReactCounts"]);

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
  console.log("got request results: ", requestResults);
  if (requestResults.checklist == null) allTasks.value = [];
  else allTasks.value = [requestResults.checklist];
  console.log("got tasks: ", allTasks.value);
}

function getTaskItems() {
  // Check if there are any tasks and if any of those tasks have valid items
  if (allTasks.value.length === 0) return false;

  console.log("wasnt 0, here is the value rn: ", allTasks.value);

  const firstTask = allTasks.value[0];
  const items = firstTask.items;

  // Validate that `items` exists and is an array
  if (!Array.isArray(items)) {
    console.warn("Invalid items structure in the first task: ", items);
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
      body: { allItems },
    });
  } catch (error) {
    console.log("trying update method instead");
    try {
      await fetchy("/api/checklists", "PUT", {
        body: { items: allItems },
      });
    } catch (error2) {
      console.log("a new error occurred");
      console.log(error2);
      return;
    }
  }
  getMyTasks();
};

onBeforeMount(async () => {
  console.log("mounting...");
  await getMyTasks();
});
</script>

<template>
  <div class="dailyChecklist">
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
  position: absolute;
  left: 10;
  top: 10;
  padding: 20px;
  border: 1px solid black;
  border-radius: 1rem;
  z-index: 100;
}

ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
}

li {
    margin: 5px;
}

</style>
