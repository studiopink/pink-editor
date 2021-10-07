<template>
    <a class="center_control_item" 
        :class="{active, video_format: format, video_time: timer}"
        @click="$emit('click', $event)">

        <slot v-if="timer"></slot>

        <div v-else-if="format" class="aic" @click="formatsOpen = !formatsOpen">
            <span :class="['format_icon', format]"></span> {{ getFormatName(format) }}
        </div>

        <svg v-else
            width="25" height="25" 
            viewBox="0 0 25 25" fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            v-html="src"></svg>

        <ul class="video_format_dropdown" v-if="formatsOpen">
            <li v-for="(item, index) in formats" :key="index" @click="formatChange(item.id)" :class="{'active': item.id === format}">
                <div class="left">
                    <span :class="['format_icon', item.id]"></span>
                    {{item.title}}
                </div>
                <span class="sides" v-if="item.sides">{{item.sides}}</span>
            </li>
        </ul>
    </a>
</template>
<script>
import svg from "./svg"
export default {
    name: 'Ccontrol',
    props: ['icon', 'active', 'format', 'timer'],
    data() {
		return {
            formatsOpen: false,
            formats: [
                {
                    title: 'Landscape',
                    id: 'landscape',
                    sides: '16:9'
                }, {
                    title: 'YouTube',
                    id: 'youtube',
                    sides: '16:9'
                },{
                    title: 'Story',
                    id: 'story',
                    sides: '9:16'
                },
                {
                    title: 'TikTok',
                    id: 'tiktok',
                    sides: '9:16'
                },
                {
                    title: 'Square',
                    id: 'square',
                    sides: '1:1'
                },
                {
                    title: 'TW & FB Portrait',
                    id: 'tw-fb-portrait',
                    sides: '4:5'
                }
            ]
		}
	},
    computed: {
        src() {
            if(this.icon && svg[this.icon]) {
                return svg[this.icon]
            } else return svg.default
        }
    },
    methods: {
        getFormatName(formatId) {
            const format = this.formats.find(f => f.id == formatId);
            return format ? format.title : formatId;
        },
        formatChange(value){
            this.formatsOpen = false;
            this.$emit('formatChange', value)
        }
    },
}
</script>