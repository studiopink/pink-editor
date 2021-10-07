<template>
    <a class="brdr_btn" :class="{green, pink, fullred,}" @click="$emit('click', $event)" v-if="!fileBtn">
        <svg 
            v-if="icon && !iconSize"
            width="18" height="17" viewBox="0 0 18 17" fill="none" :style="iconStyle"
            v-html="src">
        </svg>
        <svg 
            v-else-if="icon && iconSize"
            :width="iconSize" :height="iconSize" :viewBox="`0 0 ${iconSize} ${iconSize}`" :style="iconStyle" fill="none"
            v-html="src">
        </svg>
        <slot />
    </a>
    <label class="brdr_btn file_btn" :class="{green, pink, fullred,}" v-else>
        <input type="file" :accept="accept" name="myInputButton" @change="$emit('changeFile', $event)">
        <svg 
            v-if="icon && !iconSize"
            width="18" height="17" viewBox="0 0 18 17" fill="none"
            v-html="src">
        </svg>
        <svg 
            v-else-if="icon && iconSize"
            :width="iconSize" :height="iconSize" :viewBox="`0 0 ${iconSize} ${iconSize}`" fill="none"
            v-html="src">
        </svg>
        <slot />
    </label>
</template>
<script>
import svg from "./svg"
export default {
    name: 'Bbutton',
    props: {
        icon: {
            type: String,
        },
        iconStyle: {
            type: String,
            default: () => ''
        },
        iconSize: {
            type: String,
        },
        green: {
            type: Boolean,
            default: false
        },
        pink: {
            type: Boolean,
            default: false
        },
        fullred: {
            type: Boolean,
            default: false
        },
        fileBtn: {
            type: Boolean,
            default: false
        },

        accept: {
            type: String,
            default: 'image/*'
        }
    },
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
    cursor: pointer;
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