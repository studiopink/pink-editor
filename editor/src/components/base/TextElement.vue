<template>
    <div class="text_element" :style="printStyle" @click="$emit('click', textObject)">
        {{ textObject.text }}
    </div>
</template>
<script>
export default {
    name: 'TextElement',
    props: {
        textObject: Object,
        default: () => ({})
    },
    computed:{
        printStyle() {
            return {
                'font-family': this.textObject.fontFamily,
                'font-weight': this.textObject.fontWeight || 'normal'
            };
        }
    },
}
</script>