<script setup lang="ts">

</script>


<template>

    <form>
        <h3>Create Notification</h3>
        <div class="input-group mb-3">
            <label for="notificationTime">Notify About</label>
            <input id="notificationTime" type="text" class="form-control"
                placeholder="What would you like to be notified about..." aria-label="Username"
                aria-describedby="basic-addon1">
        </div>
        <div class="input-group mb-3">
            <label for="notificationTime">Notification Time:</label>
            <input id="notificationTime" type="time" class="form-control"
                placeholder="What time would you like to be notified " aria-label="Notification Time"
                aria-describedby="basic-addon1">
        </div>

        <div class="form-select-in">
            <select class="form-select" aria-label="Default select example">
                <option selected>How frequently would you like to be notified></option>
                <option value="Once">Once</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
            </select>
        </div>


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