<template>
    <div class="center_control_item volume_control">
        <a class="open_trigger" @click="volumeToggle" :class="[{'mute': propValue === 0}, {'volume_icon_50_hide': propValue < 30}, {'volume_icon_100_hide': propValue < 70}]">
            <svg
                width="25" height="25" 
                viewBox="0 0 25 25" fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                v-html="src"></svg>
        </a>
        
        <div class="volume_range_wrpr">
            <div class="volume_range">
                <!-- <VueDragResize :x="value" :isResizable="false" :sticks="[]" :w="16" :h="16" @dragging="drag" axis="x" :parentLimitation="true">  
                    <div class="volume_range_drag"></div>
                </VueDragResize> -->

                <!-- <input type="range" :value="value" min="0" max="100" step=".01"
                    @input="drag($event.target.value)" class="range_vlume"/> -->
                <vue-range-slider
                    :process-style="{ background: '#C3E365' }"
                    ref="slider"
                    :real-time="true"
                    @slide-end="drag"
                    :min="0"
                    :max="100"
                    :use-keyboard="false"
                    :value="value"
                    :height="3"
                    :width="100"
                    :bg-style="{ background: '#243d42' }"
                >
                </vue-range-slider>
                <!-- <div class="volume_range_click_box" @click.self="volumeClick"></div>
                <div class="volume_range_color" :style="{width: value+'px'}"></div> -->
            </div>
        </div>
    </div>
</template>
<script>
import svg from "./svg"
import { debounce, trottle } from '@/providers/helpers'

import VueDragResize from 'vue-drag-resize';
export default {
    name: 'VolumeControl',
    props: {
        value: {
            type: Number,
            default: () => 100
        }
    },
    components: { VueDragResize },
    data() {
		return {
            lastX: 0,
            movementX: 0, 
            target: null,
            maxX: 0,
            lastVolume: 0,
		}
	},

    computed: {
        src() {
            return svg['volume']
        },

        propValue() {
            return this.value;
        }
    },

    methods: {
        drag(value) {
            //ev.preventDefault();
            // this.movementX = 0;
            // this.maxX = ev.target.closest('.volume_range').getBoundingClientRect().right;
            this.$emit('change', value);
        },
        // dragging: trottle(function(ev) {
        //     this.movementX += ev.movementX;
        //     if(ev.clientX <= this.maxX) {
        //         var left = this.lastX + this.movementX;
        //         left = left >= 0 ? left : 0;

        //         this.$emit('change', left);
        //         this.target.style.left = left + 'px';
        //     }
        // }, 0, true),
        // dragstop(ev) {
        //     window.removeEventListener('mousemove', this.dragging);
        //     window.removeEventListener('mouseup', this.dragstop);
        //     this.target.style.cursor = 'grab';
        //     this.target = null;
        //     this.lastX = 0;
        //     this.movementX = 0;
        // },
        
        volumeClick(event){
            let value = (event.clientX - event.target.getBoundingClientRect().left) - 8;
            if(value < 0) {
                this.$emit('change', 0);
            } else if(value > 100) {
                this.$emit('change', 100);
            } else {
                this.$emit('change', value);
            }
        },

        volumeToggle(){
            if(this.value > 0) {
                this.lastVolume = this.value;
                this.$emit('change', 0);
            } else {
                this.$emit('change', this.lastVolume);
            }
        }
    },
}
</script>

<style>
.range_vlume {
    height: 6px;
    margin-bottom: 10px;
    width: 100px;
    cursor: pointer;
}

/* .volume_range_wrpr {
    opacity: 1;
    visibility: visible;
} */

body .volume_range_drag {
    top: 1px;
}

</style>
