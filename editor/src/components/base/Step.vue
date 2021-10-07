<template>
    <div class="sidebar_step" :class="{active, current}" @click="$emit('click', $event)">
        <h3 class="step_number">{{numb}}</h3>
        <p><slot></slot></p>
    </div>
</template>

<script>
export default {
    name: 'Step',
    props: ['active', 'current', 'numb'],
}
</script>