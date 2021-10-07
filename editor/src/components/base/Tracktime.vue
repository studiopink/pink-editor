<template>
    <div class="video_track_time_numbers">
        <span v-for="(stamp, index) in timeStamps" :style="{ 'margin-top': !stamp ? '12px': '0px' }"
            :key="index" @click="stampClick($event, index)">{{stamp}}</span>
    </div>
</template>
<script>

import utils from '../../libs/utils';
export default {
    name: 'Tracktime',
    props: {},
    data() {
        return {
            isDragging: false,
            time: 5 * 60 * 1000,
            bottomWidth: 0
        };
    },

    watch: {
        currentVideos(videos) {
            this.time = this.videosDuration;
        }
    },

    mounted() {
        const timelineEl = document.getElementsByClassName('bottom_section')[0];
        new ResizeObserver(() => (this.bottomWidth = $(timelineEl).width())).observe(timelineEl);
    },

    computed: {
        activeCropVideo() {
            return this.$store.state.activeCropVideo;
        },

        videosDuration() {
            return utils.parseVideos(this.currentVideos).duration;
        },

        videosThumbs() {
            return utils.parseVideos(this.currentVideos).thumbs;
        },

        currentVideos() {
            return this.$store.state.selectedVideos || [];
        },

        minutes() {
            return this.time / (60 * 1000)
        },
        seconds() {
            return this.time / 1000
        },
        
        timeStamps() {
            if(this.videosDuration <= 0) return (new Array(10)).fill(0).map((q, i) => utils.parseSeconds(i + 1));
            
            let arr = []
            let pre = 0;

            const videos = this.$store.state.selectedVideos;

            if(!videos.find(vid => vid.isIntro)) {
                for(let q = 1; q <= 4; q++) {
                    arr.push('');
                }
            }
            
            for(const video of videos) {
                const { arr: res, timeLeft } = this.calcTimeVideo(pre, video);
                arr.push(...res);
                pre = timeLeft;
            }

            //if(!videos.find(vid => vid.isOutro)) {
                let timelineLn = Math.ceil((this.bottomWidth - (arr.length * 80)) / 80);
                
                if(timelineLn < 4) timelineLn = 4;
                for(let q = 1; q <= timelineLn; q++) {
                    //arr.push('');
                    arr.push(utils.parseSeconds(Math.ceil(pre + q)));
                }
            //}

            // while(pre > pre + 3) {
            //     pre += 1;
            //     arr.push(utils.parseSeconds(pre));
            // }

            //console.log(arr);

            return arr;
        }
    },
    methods: {
        calcTimeVideo(pre = 0, video) {
            var arr = [];
            var timeLeft = this.time;
            const videosDuration = video.meta.duration; //this.videosDuration;
            timeLeft += 5 * 1000;

            let incr = video.meta.duration / video.thumbs.length;
            //console.log(parseInt(incr));

            let timelineLn = video.thumbs.length;

            // activeCropVideo
            if(video.crop && this.activeCropVideo != video._id) {
                const duration = video.meta.duration;

                const diff = (video.crop.width / 80);
                timelineLn = diff;
            }
            // const audios = this.$store.state.videoPlayer.timelines.filter(file => file.type == 'audio');
            // if(audios && audios.length) {
            //     const maxDuration = audios.reduce((result, audio) => {
            //         const trTime = audio.time + audio.perTime;

            //         return trTime > result ? trTime : result;
            //     }, 0);

            //     if(maxDuration > timelineLn - 3) {
            //         timelineLn = maxDuration + 3;
            //     }
            // }

            timeLeft = pre ? (pre + incr) : 0;
            for(let q = pre ? 1 : 0; q <= timelineLn; q++) {
                arr.push(utils.parseSeconds(Math.ceil(timeLeft)));
                timeLeft += incr;
            }

            return { arr, timeLeft: timeLeft - incr };
        },

        stampClick(ev, index) {
            const scrollLeft = document.getElementsByClassName('video_tracks_block_wrpr')[0].scrollLeft;
            //var offset = ev.offsetX - 40;

            //const result = utils.parseSeconds(ev.x / 80);
            const x = ev.x + scrollLeft;
            const time = {
                ...utils.parseSeconds(x / 80),
                layerX: x
            }; /* {
                ...result,
                stamp: result.toString(),
                index: index,
                offset: offset,
                layerX: ev.layerX,
            }; */

            // var result;

            // if(offset < 0 && index !== 0) {
            //     time.index--;
            //     offset = Math.abs(offset);
            //     result = (100 - (100 / 80 * offset));
            // } else if(index === 0) {
            //     offset = ev.offsetX;
            //     result = (100 / 80 * offset);
            // } else {
            //     result = (100 / 80 * offset);
            // }

            // var sec = Math.floor(result / 10);
            // var cent = Math.floor(((result / 10) - sec) * 100);

            // var splitted = this.timeStamps[time.index].split(':');
            // var splittedM = splitted[0];
            // var splittedS = splitted[1];

            // time.stamp = this.timeStamps[time.index];
            
            // if(splittedS !== '00') splittedS = splittedS.replace('0', sec);
            // else splittedS = splittedS.replace('00', sec).padStart(2, '0');
            
            // time.s = splittedS
            // time.m = splittedM;
            // time.c = cent.toString().padStart(2, '0');

            this.$emit('timestamp', time);
        }
    }
}
</script>