<template>
    <div class="app_content">
        <div class="center_section" :style="centerSlotStyle">
            <slot name="center"></slot>
        </div>

        <div class="bottom_section">
            <slot name="bottom"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Wrapper',
    computed: {
        centerSlotStyle() {
            return this.selectedVideos && this.selectedVideos.length ? {} : { height: `calc(100vh - 55px)` };
        },

        selectedVideos() {
            return this.$store.state.selectedVideos;
        }
    }
}
</script>