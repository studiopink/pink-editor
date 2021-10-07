<template>
    <a class="header_menu_btn" @click="$emit('click', $event)">
        <span></span>
        <span></span>
        <span></span>
    </a>
</template>

<script>
    export default {
        name: 'Burger'
    }
</script>