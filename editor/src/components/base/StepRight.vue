<template>
    <div class="right_step_item" :class="{ active, }" @click="$emit('click', $event)">
        <h3>{{title}}</h3>
        <div class="img_wrpr">
            <img :src="img" >
        </div>
    </div>
</template>

<script>
export default {
    name: 'StepRight',
    props: ['active', 'title', 'img',],
}
</script>

<style scoped>
.right_step_item {
    cursor: pointer;
}
</style>