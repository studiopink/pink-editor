<template>
    <a class="btn btn_pink with_icon" :class="{active, sm_btn: sm}" @click="$emit('click', $event)">
        <slot />
        
        <svg v-if="sm && icon" 
            width="12" height="12" 
            viewBox="0 0 12 12" fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            v-html="src"></svg>

        <svg v-else-if="icon" 
            width="15" height="17" 
            viewBox="0 0 15 17" fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            v-html="src">
        </svg>
    </a>
</template>
<script>
import svg from "./svg"
export default {
    name: 'Tcontrol',
    props: ['icon', 'active', 'sm'],
    computed: {
        src() {
            if(this.icon && svg[this.icon]) {
                return svg[this.icon]
            } else return svg.default
        }
    }
}
</script>