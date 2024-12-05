<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { text } from 'express';
import { onMounted, ref } from 'vue';


const selectedCircles = ref<string[]>([])
let allCircles = ref<Array<Record<string, string>>>([]);
const filteredCircles = ref<Array<Record<string, string>>>([]);
const filterQuery = ref<string>("");

const emit = defineEmits(["refreshCircles", "closeForm"]);

const getCircles = async () => {
    try {
        const response = await fetchy('/api/suggest/circles', "GET")
        allCircles.value = response.circles;
        filteredCircles.value = response.circles;
    } catch (error) {
        return;
    }
}

const addCircles = async () => {
    try {
        await fetchy('/api/circles', "POST", {
            body: { circles: selectedCircles.value }
        })
    } catch (error) {
        return;
    }
    emit("refreshCircles");
    emit("closeForm")
}

const filterFunction = () => {
    if (filterQuery.value) {
        filteredCircles.value = filteredCircles.value.filter((circle) => {
            return circle.name.toLowerCase().includes(filterQuery.value.toLowerCase());
        });
    } else {
        filteredCircles.value = allCircles.value;
        return;
    }
}



onMounted(() => {
    getCircles();

});


</script>

<template>
    <form @submit.prevent="addCircles()">
        <div class="input-group mb-3" v-if="filteredCircles.length !== 0">
            <input type="text" class="form-control" v-model="filterQuery" placeholder="Start typing to Filter Circles"
                aria-label="Sister Circle Name" aria-describedby="basic-addon2" @input="filterFunction()">

        </div>

        <div class="content">
            <div class="btn-group symptoms-section" v-if="filteredCircles.length !== 0" role="group"
                aria-label="Symptoms Entries">
                <div v-for="(circle, index) in filteredCircles" :key="index">
                    <input type="checkbox" class="btn-check" name="btnradio-sym" :id="`btnradio-sym-${index}`"
                        v-model="selectedCircles" :value="circle.name" autocomplete="off">
                    <label class="btn btn-outline" :for="`btnradio-sym-${index}`">{{ circle.name }} <img class="add"
                            src="/client/assets/images/Plus Math.svg" alt="Add Icon" />
                    </label>

                </div>
            </div>
            <div class="no-circles" v-else>
                <p>You have joined all circles! No new circles to join</p>
            </div>
        </div>
        <button v-if="filteredCircles.length !== 0" type="submit" class="btn btn-primary">Submit</button>

    </form>
</template>

<style scoped>
form {
    background-color: rgba(255, 251, 254, 0.9);
    border-color: black;
    border: #000000 1px solid;
    border-radius: 10px;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-family: 'Arial', sans-serif;
    color: #fff;
    background-color: #FFFBFE;
    border-radius: 10px;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 5px;
}

.form-control {
    border: 1px solid black;
    margin: 5px;

}

.symptoms-section {
    background-color: black;
    border-radius: 10px;
    padding: 0.75rem;
    gap: 10px;
    outline-color: #FFFBFE;
    display: flex;
    flex-wrap: wrap;

}


.btn {
    border-color: #FFFBFE;
    color: #FFFBFE;
}

.btn:hover {
    background-color: #EA7575;
    color: #000000
}

.btn-check:checked+.btn,
.btn-check:active+.btn {
    border-color: #000000;
    background-color: rgba(234, 117, 117, 1);
    color: #000000
}

.btn-check:not(:checked)+.btn {
    border-color: #FFFBFE;
    color: #FFFBFE;
    background-color: transparent;
    /* Reset background to default */
}

.btn-primary {
    width: 30%;
    margin: 10px;
    background-color: black;
}

.btn-primary:hover {
    background-color: #EA7575;
    color: black;
}

.add {
    width: 20px;
    height: 20px;
}

.no-circles {
    background-color: black;
    border-radius: 1em;
    margin-top: 0;
    padding: 10px;
    height: inherit;
    width: 100%;
}

.no-circles p {
    margin: 0;
}
</style>