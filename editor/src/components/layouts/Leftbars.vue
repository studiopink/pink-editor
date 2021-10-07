<template>
    <div class="leftbars">
        <div class="left_sidebar_steps">
            <slot name="steps"></slot>
        </div>
        <div class="left_sidebar_files" v-if="stepNumber == 1 || stepNumber == 2">
            <slot name="files"></slot>
        </div>

        <div class="left_sidebar_subtitles" v-if="stepNumber === 3">
            <slot name="subtitles"></slot>
        </div>

        <div class="left_sidebar_elements" v-if="stepNumber === 4">
            <slot name="elements"></slot>
        </div>

        <div class="left_sidebar_brand" v-if="stepNumber === 4 && $store.state.videoPlayer.texts.length">
            <slot name="brand"></slot>
        </div>

        <div class="left_sidebar_elements text_properties_sidebar" v-if="selectedContextObjectType == 'text'">
            <slot name="text_properties"></slot>
        </div>
        
        <div class="left_sidebar_elements video_properties_sidebar" v-if="selectedContextObjectType == 'video'">
            <slot name="video_properties"></slot>
        </div>
        
        <div class="left_sidebar_elements audio_properties_menu" v-if="$store.state.editor.audio && $store.state.editor.audio.src">
            <slot name="audio_properties"></slot>
        </div>

        <div class="left_sidebar_files subtitles_properties_sidebar"
            v-if="$store.state.editor.subtitles && $store.state.editor.subtitles.data">
            <slot name="subtitles_properties"></slot>
        </div>

        <div class="left_sidebar_files logo_properties_sidebar" v-show="selectedContextObjectType == 'logo'">
            <slot name="active_image"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Leftbars',
    props: ['stepNumber'],
    computed: {
        selectedContextObjectType() {
            return this.$store.state.selectedContextObject && this.$store.state.selectedContextObject.typeItem
                ? this.$store.state.selectedContextObject.typeItem : null;
        }
    }
}
</script>

<style>
.leftbars {
    display: flex;
    transition: 1s;
}
.leftbars>div+div {
    margin-left: 10px;
}

.audio_properties_menu {
    width: 300px;
    overflow: hidden;
}
</style>