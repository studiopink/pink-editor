<template>
    <div class="texture_element" @click="$emit('click', $event)">
        <img :src="src">
    </div>
</template>
<script>
export default {
    name: 'TextureElement',
    props: ['src',]
}
</script>