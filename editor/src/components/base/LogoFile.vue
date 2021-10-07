<template>
    <div class="logos_item" @click="$emit('click', $event)" @contextmenu="$emit('contextmenu', $event)">
        <img :src="src" @load="preloader = false">
        <Preloader v-if="preloader" :scale=".5"/>
    </div>
</template>
<script>

import Preloader from '../base/Preloader';
export default {
    name: 'LogoFile',
    props: ['src'],
    components: { Preloader },
    data() {
        return { preloader: true }
    }
}
</script>

<style scoped>
.logos_item { position: relative; overflow: hidden; }

img {
    width: 100%;
}
</style>