<template>
    <div class="video_file_item" @contextmenu="$emit('contextmenu', $event)" :title="title" @click="$emit('click', $event)">
        <img :src="placeholder" @load="preloader = false">
        <Preloader v-if="preloader" :scale=".5"/>
    </div>
</template>
<script>

import Preloader from '../base/Preloader';
export default {
    components: { Preloader },
    name: 'VideoFile',
    props: ['placeholder', 'title'],
    data() {
        return { preloader: true }
    }
}
</script>