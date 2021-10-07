<template>
    <a @click="$emit('click', $event)" v-if="!fileBtn">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" v-html="src"></svg>
    </a>
    <label class="file_btn" v-else>
        <input type="file" name="myInputFile" :accept="accept || '*/*'" @change="$emit('change', $event)">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" v-html="src"></svg>
    </label>
</template>
<script>
import svg from "./svg"
export default {
    name: 'IconBtn',
    props: ['icon', 'fileBtn', 'accept'],
    computed: {
        src() {
            if(this.icon && svg[this.icon]) {
                return svg[this.icon]
            } else return svg.default
        }
    }
}
</script>

<style lang="scss">
.file_btn {
    position: relative;
    overflow: hidden;
    input {
        position: absolute;
        width: 100%;
        height: 100%;
        cursor: pointer;
        opacity: 0;
        z-index: 1;
    }
    svg {
        position: relative;
        z-index: 0;
    }
}
</style>