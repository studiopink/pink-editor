<template>
    <div class="example-timeline" ref="exampleTimeline" @scroll.prevent="scroll">
        <div class="content-example" ref="content">
            <div class="horizontal_line"
                ref="horizontal_line"
                @mousedown="mousedown"
                :style="{ left: `${left}px` }">
            </div>

            <div class="fl" ref="contentFrames" draggable="false">
                <div v-for="(im, index) in images" draggable="false" :key="index">
                    <img draggable="false" :src="im.src" :alt="im.time"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ExampleTimeline',
    data: () => ({
        left: 50,
        isDown: false,
        interval: false,
        incr: 50,
        speed: 10,
        images: [{"time":0.9677419354838709,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-0.9677419354838709-seconds.png"},{"time":1.9354838709677418,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-1.9354838709677418-seconds.png"},{"time":2.903225806451612,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-2.903225806451612-seconds.png"},{"time":3.8709677419354835,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-3.8709677419354835-seconds.png"},{"time":4.838709677419355,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-4.838709677419355-seconds.png"},{"time":5.806451612903224,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-5.806451612903224-seconds.png"},{"time":6.774193548387096,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-6.774193548387096-seconds.png"},{"time":7.741935483870967,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-7.741935483870967-seconds.png"},{"time":8.70967741935484,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-8.70967741935484-seconds.png"},{"time":9.67741935483871,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-9.67741935483871-seconds.png"},{"time":10.64516129032258,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-10.64516129032258-seconds.png"},{"time":11.612903225806448,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-11.612903225806448-seconds.png"},{"time":12.580645161290322,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-12.580645161290322-seconds.png"},{"time":13.548387096774192,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-13.548387096774192-seconds.png"},{"time":14.516129032258064,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-14.516129032258064-seconds.png"},{"time":15.483870967741934,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-15.483870967741934-seconds.png"},{"time":16.451612903225804,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-16.451612903225804-seconds.png"},{"time":17.41935483870968,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-17.41935483870968-seconds.png"},{"time":18.387096774193548,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-18.387096774193548-seconds.png"},{"time":19.35483870967742,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-19.35483870967742-seconds.png"},{"time":20.32258064516129,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-20.32258064516129-seconds.png"},{"time":21.29032258064516,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-21.29032258064516-seconds.png"},{"time":22.25806451612903,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-22.25806451612903-seconds.png"},{"time":23.225806451612897,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-23.225806451612897-seconds.png"},{"time":24.193548387096772,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-24.193548387096772-seconds.png"},{"time":25.161290322580644,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-25.161290322580644-seconds.png"},{"time":26.129032258064516,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-26.129032258064516-seconds.png"},{"time":27.096774193548384,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-27.096774193548384-seconds.png"},{"time":28.06451612903226,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-28.06451612903226-seconds.png"},{"time":29.032258064516128,"width":300,"height":168,"src":"http://178.150.84.181:3000/storage/video/file_data_606173a2c367ec260b920391/thumbnail-at-29.032258064516128-seconds.png"}]
    }),

    mounted() {
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
        qq(ev) {
            console.log(ev.type);
        },
        scroll(ev) {
            // const scrollLeft = this.$refs.exampleTimeline.scrollLeft;
            // const originalWidth = this.$refs.exampleTimeline.clientWidth;
            // const contentWidth = this.$refs.contentFrames.clientWidth;

            // console.log('SCROLL', this.$refs.exampleTimeline.scrollLeft, this.$refs.exampleTimeline.scrollWidth);
            // this.clearIntervalLocal();
            ev.preventDefault();
            ev.stopPropagation();
        },

        mousedown(ev) {
            this.isDown = true;
        },

        mousemove(ev) {
            // console.log(
            //     this.$refs.exampleTimeline.scrollLeft,
            //     this.$refs.exampleTimeline.scrollWidth,
            //     this.$refs.exampleTimeline.clientWidth
            // );

            if(this.isDown) {
                //console.log(this.$refs.exampleTimeline.scrollWidth);
                const rightOffset = 30;
                const scrollLeft = this.$refs.exampleTimeline.scrollLeft;
                const originalWidth = this.$refs.exampleTimeline.clientWidth;
                const contentWidth = this.$refs.contentFrames.clientWidth;
                //console.log('SIZES: ', originalWidth, contentWidth);

                const left = scrollLeft + ev.x - 10;
                if(left + 10 >= contentWidth) {
                    this.left = contentWidth - 10;
                    this.clearIntervalLocal();
                    return;
                }

                if(left + 10 < 0) {
                    this.left = -10;
                    this.clearIntervalLocal();
                    return;
                }

                if(left > (scrollLeft + originalWidth - this.incr - rightOffset)) {
                    // RIGHT
                    if(!this.interval) {
                        const diff = left - (scrollLeft + originalWidth - this.incr - rightOffset);
                        const scrollTo = left - (originalWidth - this.incr - rightOffset);
                        this.$refs.exampleTimeline.scrollTo(scrollTo, 0);

                        this.interval = setInterval(() => {
                            const scrollLeft = this.$refs.exampleTimeline.scrollLeft;
                            const originalWidth = this.$refs.exampleTimeline.clientWidth;

                            this.left += this.speed;
                            const scrollTo = this.left - (originalWidth - this.incr - rightOffset);
                            this.$refs.exampleTimeline.scrollTo(scrollTo, 0);
                                                        
                            if(scrollLeft + originalWidth >= contentWidth + this.incr + 5) {
                                this.clearIntervalLocal();
                            }
                        }, 10); 
                    }
                } else if((left - 10 - scrollLeft) < this.incr && scrollLeft > 0) {
                    // LEFT
                    if(!this.interval) {
                        this.$refs.exampleTimeline.scrollTo(this.left - this.speed - this.incr, 0);

                        this.interval = setInterval(() => {
                            if(this.$refs.exampleTimeline.scrollLeft == 0) {this.clearIntervalLocal()};
                            this.left -= this.speed;
                            this.$refs.exampleTimeline.scrollTo(this.left - this.incr, 0);
                        }, 10); 
                    }
                } else {
                    this.clearIntervalLocal();
                    this.left = left;
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
    }
}
</script>

<style scoped>
.fl {
    pointer-events: none;
    user-select: none;
    display: inline-flex;
    flex-direction: row;
    height: 100%;
}

.fl div, .fl img {
    pointer-events: none;
}

.example-timeline {
    margin-top: 70px;
    background: #3d3d3d;
    overflow: auto;
    overflow-anchor: none;
}

.content-example {
    width: 9200px;
    height: 300px;
    position: relative;
    overflow-anchor: none;
}

.example-move {
    width: 20px;
    height: 50px;
    position: absolute;
    background: red;
    cursor: pointer;
    top: 0px;
}

.horizontal_line {
    transition: none;
}
</style>