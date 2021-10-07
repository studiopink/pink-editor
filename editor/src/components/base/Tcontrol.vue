<template>
    <a class="with_text_control" :class="{active}" @click="$emit('click', $event)">
        <svg width="12" height="12" 
            viewBox="0 0 12 12" fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            v-html="src"></svg>
        <slot />
    </a>
</template>
<script>
import svg from "./svg"
export default {
    name: 'Tcontrol',
    props: ['icon', 'active'],
    computed: {
        src() {
            if(this.icon && svg[this.icon]) {
                return svg[this.icon]
            } else return svg.default
        }
    }
}
</script>