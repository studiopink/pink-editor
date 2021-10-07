<template>
    <div class="video_tracks_block_wrpr" style="user-select: none"
        @mousedown="$emit('mousedown', $event)"
        @scroll="$emit('scroll', $event)"
        @mouseup="$emit('mouseup', $event)"
    >
        <div class="video_tracks_block">
            <div class="video_track_time">
                <slot name="track-time"></slot>
            </div>
            <div class="video_tracks" ref="video_tracks">
                <slot name="tracks"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Timeline',
    mounted() {
        new ResizeObserver(ev => {
            this.$emit('videoTrackScroll', ev);
		}).observe($('.track_rows')[0]);
    }
}
</script>

<style scoped>
.video_tracks {
    padding: 0 10px 0 10px;
}
</style>