<template>
    <!-- <div class="horizontal-timeline" @scroll.prevent="scroll"> -->
    <div class="horizontal_line" ref="horizontal_line" @mousedown="mousedown" :style="{ left: `${left}px` }"></div>
    <!-- </div> -->
</template>
<script>
export default {
    props: {
        left: {
            type: Number,
            default: () => 0
        }
    },
    name: 'TimelineHorizontal',
    data: () => ({
        isDown: false,
        interval: false,
        incr: 50,
        speed: 10
    }),

    mounted() {
        this.$refs.timeline = $('.video_tracks_block_wrpr')[0];
        this.$refs.contentFrames = $('.frames_wrpr')[0];

        document.documentElement.addEventListener('mousemove', this.mousemove);
        document.documentElement.addEventListener('mouseup', this.mouseup);
        document.documentElement.addEventListener('mouseleave', this.mouseup);
    },

    beforeDestroy() {
        document.documentElement.removeEventListener('mousemove', this.mousemove);
        document.documentElement.removeEventListener('mouseup', this.mouseup);
        document.documentElement.removeEventListener('mouseleave', this.mouseup);
    },
    
    methods: {
        changeLeft(left, isStop = false) {
            this.$emit('changeLeft', { left, isStop });
        },

        scroll(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        },

        mousedown(ev) {
            this.isDown = true;
        },

        mousemove(ev) {
            if(this.isDown) {
                const rightOffset = 30;
                const scrollLeft = this.$refs.timeline.scrollLeft;
                const originalWidth = this.$refs.timeline.clientWidth;
                const contentWidth = this.$refs.contentFrames.clientWidth + this.introSpace;

                const left = scrollLeft + ev.x - 10;
                if(left + 10 >= contentWidth) {
                    this.changeLeft(contentWidth - 10);
                    this.clearIntervalLocal();
                    return;
                }
                
                if(left < 0 || (!this.isIntro && left < 320)) {
                    this.clearIntervalLocal();
                    this.changeLeft(this.isIntro ? 0 : 320);
                    return;
                }

                if(left > (scrollLeft + originalWidth - this.incr - rightOffset)) {
                    if(!this.interval) {
                        const diff = left - (scrollLeft + originalWidth - this.incr - rightOffset);
                        const scrollTo = left - (originalWidth - this.incr - rightOffset);
                        this.$refs.timeline.scrollTo(scrollTo, 0);

                        this.interval = setInterval(() => {
                            const scrollLeft = this.$refs.timeline.scrollLeft;
                            const originalWidth = this.$refs.timeline.clientWidth;
                            const left = this.left + this.speed;

                            this.changeLeft(left);
                            const scrollTo = left - (originalWidth - this.incr - rightOffset);
                            this.$refs.timeline.scrollTo(scrollTo, 0);
                                                        
                            if(left + 10 >= contentWidth) {
                                this.clearIntervalLocal();
                                this.changeLeft(contentWidth - 10);
                            }
                        }, 10); 
                    }
                } else if((left - 10 - scrollLeft) < this.incr && scrollLeft > 0) {
                    if(!this.interval) {
                        this.$refs.timeline.scrollTo(this.left - this.speed - this.incr, 0);

                        this.interval = setInterval(() => {
                            if(this.$refs.timeline.scrollLeft == 0 || (!this.isIntro && this.$refs.timeline.scrollLeft <= 320)) {
                                this.clearIntervalLocal();
                                this.changeLeft(!this.isIntro ? 320 : 0);
                                return;
                            };

                            const left = this.left - this.speed;

                            this.changeLeft(left);
                            this.$refs.timeline.scrollTo(left - this.incr, 0);
                        }, 10); 
                    }
                } else {
                    this.clearIntervalLocal();
                    this.changeLeft(left);
                }
            }
        },
        
        clearIntervalLocal() {
            clearInterval(this.interval);
            this.interval = false;
        },
        
        mouseup(ev) {
            this.isDown = false;
            this.clearIntervalLocal();
        }
    },

    computed: {
        introSpace() {
            return (this.isIntro ? 0 : 320) + 10;
        },

        isIntro() {
            return !!this.$store.state.selectedVideos.find(vid => vid.isIntro);
        }
    }
}
</script>

<style scoped>
.horizontal_line {
    transition: none;
    top: 0;
}
</style>