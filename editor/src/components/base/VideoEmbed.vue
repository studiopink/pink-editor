<template>
  <div ref="videoDashboard" class="videos_dash">
    <video
      v-for="(video, index) in videoObjects"
      :key="index"
      preload="auto"
      :ref="`videoCanvas_${video._id}`"
      :style="{ display: activeVideo._id == video._id ? 'block' : 'none' }"
      class="global_origin_video"
      :type="video.type"
      :poster="getPoster"
      :src="video.src"

      @play="_play($event, video)"
      @pause="_pause($event, video)"
      @timeupdate="_timeupdate($event, video)"
      @ended="_ended($event, video)"
      @abort="_abort($event, video)"
      @canplay="_canplay($event, video)"
      @waiting="_waiting($event, video)"
      @progress="_progress($event, video)"
    ></video>
    <audio
      preload="auto"
      v-for="audio in getAudioTimeline"
      :key="audio._id"
      :ref="'ref_audio_' + audio._id"
      :id="'audio_' + audio._id"
      class="global_embed_audio"
    >
      <source :src="audio.src" :type="audio.fileType" />
    </audio>
    <div class="canvas_dash">
      <canvas id="videoEmbedCanvas"></canvas>
    </div>
    <div class="subtitles" v-if="subtitles && subtitles.length" v-html="subtitles"
      :style="subtitleStyles"></div>

    <Preloader v-if="videoPreload"></Preloader>
  </div>
</template>
<script>
import editor from "../../libs/editor";
import utils from "../../libs/utils";
import store from '../../store';
import Preloader from "../base/Preloader";
window.editor = editor;
export default {
  name: "VideoEmbed",
  components: { Preloader },
  props: {
    isPlay: { type: Boolean, default: false },
    time: { type: Number, default: 0 },
    volume: { type: Number, default: 1 },
    videoObjects: {
      type: Array,
      default() {
        return [{ thumbs: [{ src: "" }] }];
      },
    },
    videoTimeline: {
      type: Object,
      default: () => ({})
    },
  },

  data() {
    return {
      videoPreload: false,
      interval: null,
      awaitLoadVideo: false,
      change_time_state: false,
      ended: false,
      timer: 0,
      canvasSize: {},
      lockInterval: false,
      isLastLock: false,
      timelineDrag: {
        isLock: false,
        isPlay: false
      }
    };
  },

  mounted() {
    setInterval(() => {
      if(this.isPlay && !this.lockInterval) {
        this.updateTimeline();
      }
    }, 1000 / 30);

    // this.$refs.videoCanvas.onpause = this.pauseEvent;
    // this.$refs.videoCanvas.ontimeupdate = () => this.changeAudioTimes(true);
    // this.$refs.videoCanvas.onplay = () => this.changeAudioTimes();
    // this.$refs.videoCanvas.onended = () => {
    //   this.ended = true;
    // };

    // this.$refs.videoCanvas.onabort = () => {
    //   if (this.isPlay) {
    //     this.videoPreload = true;
    //     this.pauseAllAudio();
    //   }
    // };

    // this.$refs.videoCanvas.oncanplay = () => {
    //   this.videoPreload = false;
    // };

    this.initCanvas();

    new ResizeObserver(() => {
      editor.resizeCanvas(this.calculateCanvasSize(), true);

      const scale = ($('.main_workflow_section').height() - 100) / $('video').height();
      // console.log('scale', scale);

      this.$emit('transformScale', scale);
    }).observe(this.$refs.videoDashboard);
  },

  methods: {  
    _pause(ev, video) {
      const videoIndex = this.activeVideoIndex;
      const isLast = this.activeVideoIndex >= this.videoObjects.length - 1;
    
      if(video._id == this.activeVideo._id) {
        const videoEl = this.$refs[`videoCanvas_${this.activeVideo._id}`][0];
        const currentTime = videoEl.currentTime;

        const duration = /* utils.getVideoDuration(this.activeVideo); */ videoEl.duration;

        
        const pauseRefus = () => {
          this.updateTimeline();

          if(isLast && currentTime >= duration) {
            
            const firstVideo = this.videoObjects[0];
            this.timer = firstVideo.crop ? firstVideo.crop.startTime : 0;
          }
        }
        
        if (this.isPlay) {
          if (isLast) {
            this.$emit("pause");
            this.pauseAllAudio();
            pauseRefus();
          } else {
            this.lockInterval = true;
            const newTime = this.videoObjects.reduce((res, item, i) => {
              if(i <= this.activeVideoIndex) {
                res += /* utils.getVideoDuration(item); // */this.$refs[`videoCanvas_${item._id}`][0].duration;
              }

              return res;
            }, 0);

            

            this.timer = newTime + .1;

            try {
              const newVideo = this.videoObjects[videoIndex + 1];
              const newVideoEl = this.$refs[`videoCanvas_${newVideo._id}`][0];
              newVideoEl.currentTime = newVideo && newVideo.crop ? newVideo.crop.startTime : 0;
              newVideoEl.play();
            } catch(err) {
              console.error(err);
            }

            this.changePlayVideo(true);

            this.lockInterval = false;
          }
        } else {
          pauseRefus();
        }
      }

      
      const videoEl = this.$refs[`videoCanvas_${this.activeVideo._id}`][0];
      if(this.isPlay && videoEl.paused && !this.isLastLock) {
        videoEl.play();
      }
    },

    _timeupdate(ev, video) {
      this.pauseNotActive(ev, video);
      this.changeAudioTimes(true);

      if(this.activeVideo._id == video._id) {
        const currentTime = this.$refs[`videoCanvas_${video._id}`][0].currentTime;
        // this.$emit('timeUpdate', {
        //   time: currentTime,
        //   lineLeft: currentTime * (80 / this.activeVideo.thumbs[0].time)
        // });
      }
    },
    
    _play(ev, video) {
      this.pauseNotActive(ev, video);
      this.changeAudioTimes();

      this.isLastLock = this.activeVideoIndex >= this.videoObjects.length - 1

      if(this.activeVideo._id == video._id) {
        this.$emit('play');
      }
    },
    
    _ended(ev, video) {},
    
    _abort(ev, video) {
      //this.videoPreload = true;
      //console.log('LOADING');
    },
    
    _canplay(ev, video) {
      this.videoPreload = false;
    },
    
    _waiting(ev, video) {
      this.videoPreload = true;
      this.pauseAllAudio();
    },
    
    _progress(ev, video) {
      //console.log(ev.target.buffered);
    },

    pauseNotActive(ev, video) {
      if(video._id != this.activeVideo._id && !ev.target.paused) {
        ev.target.pause();
      }
    },

    updateTimeline(skipTimeLine = false) {
      const currentTime = this.$refs[`videoCanvas_${this.activeVideo._id}`][0].currentTime;

      if(!skipTimeLine) {
        const index = this.activeVideoIndex;
        const duration = this.videoObjects.reduce((res, item, i) =>
          res + (i < index ? /* utils.getVideoDuration(item) */ item.meta.duration : 0), 0);
          
        const diffStart = this.activeVideo.crop ? this.activeVideo.crop.startTime - currentTime : 0;
        if(this.activeVideo.crop && diffStart > .01) {
          const res = this.activeVideo.crop.startTime + duration + currentTime;

          this.timer = res;
        } else if(this.activeVideo.crop && currentTime > this.activeVideo.crop.endTime) {
          //if(this.activeVideoIndex == this.videoObjects.length - 1) {
            this.timer = this.activeVideo.meta.duration + duration;
          // } else {
          //   const nextVideo = this.videoObjects[this.activeVideoIndex + 1];
          //   const incr = nextVideo.crop ? nextVideo.crop.startTime : 0;

          //   this.timer = (this.activeVideo.meta.duration + duration) + incr;
          // }
        } else {
          this.timer = duration + currentTime;
        }

        let newPosition = (() => {
          const pos = this.videoObjects.reduce((res, item, i) => {
            if(i > index) return res;
            const durationWidth = item.crop ? item.crop.width : ((item.meta.duration / item._step) * 80);
            const localDuration = item.crop ? (item.crop.endTime - item.crop.startTime) : item.meta.duration;

            if(i == index) {
              const incrEndTime = item.crop ? (item.crop.endTime < currentTime ? (item.meta.duration - item.crop.endTime) : 0) : 0;
              
              const scaleSeconds = durationWidth / localDuration;
              const diff = (this.timer - duration) - (item.crop ? item.crop.startTime : 0) - incrEndTime;
              res.position += diff * scaleSeconds;
            } else {
              res.timer += item.meta.duration;
              res.position += durationWidth;
            }

            return res;
          }, { timer: 0, position: 0 });

          return pos.position;
        })();

        if(!this.videoObjects.find(vid => vid.isIntro)) {
          newPosition += 320;
        }

        this.$store.state.videoPlayer.timeLinePosition = newPosition;

        // let position = (() => {
        //   const activeIndex = this.activeVideoIndex;
        //   const newTimer = this.videoObjects.reduce((res, item, i) => {
        //     if(i > activeIndex) return res;
        //     const durationWidth = ((item.meta.duration / item._step) * 80);

        //     if(this.activeVideo._id == item._id) {
        //       const localTimer = (this.timer - res.timer);

        //       res.position += durationWidth * (localTimer / /* utils.getVideoDuration(item) */item.meta.duration); 
        //     } else {
        //       res.timer += /* utils.getVideoDuration(item) */item.meta.duration;
        //       res.position += durationWidth;
        //     }

        //     return res;
        //   }, { position: 0, timer: 0 }).position;

        //   return newTimer;
        // })();

        // console.log('TIMER POSITION', this.activeVideo._id, position);
        
        // if(!this.videoObjects.find(vid => vid.isIntro)) {
        //   position += 320;
        // }

        // const cropPosition = this.videoObjects.reduce((res, item, index) => {
        //   if(index > this.activeVideoIndex) return res;

        //   if(item.crop) {
        //     const durationWidth = ((item.meta.duration / item._step) * 80);

        //     const scale = (item.crop.endTime - item.crop.startTime) / item.meta.duration;
        //     const diff = durationWidth - (durationWidth * scale);
        //     //console.log('TIMER R:', durationWidth, scale, diff, res.position);
        //     res += diff;
        //   }

        //   return res;
        // }, 0);

        // console.log('WTF', cropPosition);

        // this.$store.state.videoPlayer.timeLinePosition = position - cropPosition;
      }

      const diffTime = this.videoObjects.reduce((res, item, i) => {
        if(i > this.activeVideoIndex) return res;

        if(i == this.activeVideoIndex) {
          const incrEndTime = item.crop ? (item.crop.endTime < currentTime ? (item.meta.duration - item.crop.endTime) : 0) : 0;
          res += (item.crop ? item.crop.startTime : 0) + incrEndTime;
        } else {
          res += item.crop ? (item.crop.startTime + (item.meta.duration - item.crop.endTime)) : 0;
        }

        return res;
      }, 0);

      this.$store.state.videoPlayer.printTime = utils.parseSeconds(this.timer - diffTime).toString();
      
      if(!this.timelineDrag.isLock) {
        this.$emit("timeUpdate");
      }
    },

    calculateTimeByPosition() {
      return this.$store.state.videoPlayer.timeLinePosition / 80;
    },

    changeAudioVolume(volume = 1) {
      this.getAudioTimeline.forEach((audio) => {
        const currentVolume =
          audio.volume || audio.volume == 0 ? audio.volume : 1;

        const elem = this.$refs["ref_audio_" + audio._id][0];
        if (!elem) return;

        elem.volume = (currentVolume / 1) * volume;
      });
    },

    changeAudioTimes(isTimeupdate = false) {
      const time = this.timer; //this.calculateTimeByPosition();

      this.getAudioTimeline.forEach((audio) => {
        const cropTime = (audio.crop ? audio.crop.min || 0 : 0);
        const perTime = audio.perTime + cropTime;

        let newTime = cropTime;
        const elem = this.$refs["ref_audio_" + audio._id][0];
        if (!elem) return;

        newTime = (time - audio.perTime) + cropTime;
        if(Math.abs(newTime - elem.currentTime) > .5) {
          elem.currentTime = newTime;
        }

        return;
        const isCurrent = perTime <= time && audio.time <= audio.time;
        if (isCurrent) {
          newTime = (time - audio.perTime) + cropTime;
        } else if (time > perTime + audio.time) {
          newTime = cropTime;
        } else if (perTime + audio.time < time) {
          newTime = cropTime;
        }

        if (isTimeupdate) {
          if (isCurrent && Math.abs(elem.currentTime - newTime) >= 0.5) {
            elem.currentTime = (time - audio.perTime) + cropTime;
          }
        } else {
          elem.currentTime = newTime;
        }
      });
    },

    initCanvas() {
      editor.initialCanvas("videoEmbedCanvas", {
        backgroundColor: "rgba(255, 0, 0, 0)",
        // selectable: false,
        // interactive: false,
        // selection: false,
        ...this.calculateCanvasSize(),
      });

      $('.upper-canvas').on('contextmenu', e => {
          e.preventDefault();
          const obj = editor.canvas.findTarget(e.originalEvent);
          this.$store.state.selectedContextObject = obj ? { ...obj, timestamp: Date.now() } : undefined;
      });
    },

    calculateCanvasSize() {
      if(this.$refs.videoDashboard) {
        this.canvasSize = {
          width: this.$refs.videoDashboard.clientWidth,
          height: this.$refs.videoDashboard.clientHeight,

          // width: $('.video_wrpr').width(),
          // height: $('.video_wrpr').height(),
        };  
      }

      return this.canvasSize;
    },

    pauseAllAudio() {
      const elements = document.getElementsByClassName("global_embed_audio");
      for (const elem of Array.from(elements)) {
        elem.pause();
      }
    },

    updatingCurrentTime() {
      return;
      clearInterval(this.interval);
      if (this.isPlay) {
        const video = utils.getSelectedVideoByTimeDuration(
          this.videoObjects,
          this.time,
          true
        );

        this.interval = setInterval(() => {
          if (
            video.time + this.$refs.videoCanvas.currentTime >
            this.videosDuration / 1000
          ) {
            clearInterval(this.interval);
            this.changePlayVideo(false);
            return;
          }

          this.$emit(
            "timeUpdate",
            video.time + this.$refs.videoCanvas.currentTime / video.videoStep,
            video.time + this.$refs.videoCanvas.currentTime
          );
        }, 1);
      }
    },

    changePlayVideo(isPlay = false, lockUpdate = false) {
      this.updatingCurrentTime();
      
      const video = utils.getSelectedVideoByTimeDuration(
        this.videoObjects,
        this.time,
        true
      );

      if (
        this.videoObjects.length > 1 &&
        video.index == this.videoObjects.length - 1 &&
        this.ended
      ) {
        this.$emit("toDuration", 0);
      }

      this.ended = false;
      this.$refs[`videoCanvas_${this.activeVideo._id}`][0][isPlay ? "play" : "pause"]();
      this.$store.state.videoPlayer.isPlay = isPlay;
    },

    calculateTimeByHorizontalLine(line) {
      let timer = 0;
      let currentTime = 0;
      let left = 0;

      if(!this.videoObjects.find(vid => vid.isIntro)) {
        line.left -= 320;
      }

      if(line.left >= 0) {
        for(let q = 0; q < this.videoObjects.length; q++) {
          const video = this.videoObjects[q];
          const videoWidth = video.crop ?
            video.crop.width : (video.meta.duration / video._step) * 80;

          if(left + videoWidth > line.left) {
            currentTime = ((line.left - left) / videoWidth) * utils.getVideoDuration(video)/* video.meta.duration */;
            timer += currentTime + (video.crop ? video.crop.startTime : 0);
            break;
          } else if(q == this.videoObjects.length - 1) {
            timer += /* utils.getVideoDuration(video) */video.meta.duration;
          } else {
            timer += /* utils.getVideoDuration(video) */video.meta.duration;
            left += videoWidth;
          }
        }
      }

      this.timer = timer;

      this.updateTimeline(true);
      //this.$refs[`videoCanvas_${this.activeVideo._id}`][0].currentTime = currentTime;
    }
  },

  computed: {
    subtitles() {
      return this.$store.state.videoPlayer.subtitlesText;
    },

    subtitleStyles() {
      const { width, height } = this.canvasSize;
      if(width && height) {
        const fontSize = 10 / (300 / height );
        return { 'font-size': `${parseInt(fontSize)}px` };
      } else {
        return {};
      }
    },

    updatingTimer() {
      return this.timer;
    },

    videoTimelineComputed() {
      return this.videoTimeline;
    },

    rewindBackward() {
      return this.$store.state.videoPlayer.rewind.backward;
    },
    
    rewindForward() {
      return this.$store.state.videoPlayer.rewind.forward;
    },

    getPoster() {
      const video = this.activeVideo;
      if(video.poster) return video.poster;
      if (!video || !video.thumbs || !video.thumbs.length) return "";

      return video.thumbs[0].src;
    },

    activeVideo() {
      return utils.getSelectedVideoByTimeDuration(this.videoObjects, this.timer);
      // this.$store.state.videoPlayer.timeLinePosition
      return this.videoObjects[0];
    },

    activeVideoIndex() {
      const activeVideo = utils.getSelectedVideoByTimeDuration(this.videoObjects, this.timer);
      return this.videoObjects.findIndex(vo => activeVideo._id == vo._id);
    },

    getAudioTimeline() {
      return this.$store.state.videoPlayer.timelines.filter(
        (file) => file.type == "audio"
      );
    },

    videosDuration() {
      return utils.parseVideos(this.videoObjects).duration;
    },

    getSelectedVideo() {
      if (this.awaitLoadVideo) {
        this.awaitLoadVideo = false;
        this.$nextTick(() => {
          this.changePlayVideo(true);
        });
      }

      return utils.getSelectedVideoByTimeDuration(this.videoObjects, this.time);
    },

    currentPoster() {
      const posters = utils.parseVideos(this.videoObjects).thumbs;

      return posters[parseInt((posters.length - 1) / 2)].src;
    },

    changeVolume() {
      return this.volume;
    },

    reInitialCanvas() {
      return this.$store.state.videoPlayer.canvasInit;
    },

    playVideo() {
      return this.isPlay;
    },

    timeUpdate() {
      return this.time;
    },
  },

  watch: {
    updatingTimer(timer) {
      editor.showHideAnotherElements(timer);
      const time = this.$refs[`videoCanvas_${this.activeVideo._id}`][0].currentTime;

      const realTimer = this.videoObjects.reduce((res, item, ind) => {
        if(this.activeVideoIndex > ind) {
          res += /* utils.getVideoDuration(item) */item.meta.duration;
        }

        return res;
      }, 0);

      const diff = Math.abs(time - (this.timer - realTimer));
      if(diff > .03) {
        this.$refs[`videoCanvas_${this.activeVideo._id}`][0].currentTime = this.timer - realTimer;
        //console.log('Sync video', this.timer - realTimer);
      }

      this.$store.state.videoPlayer.time = timer;
    },

    videoTimelineComputed(horizontalLine) {
      this.lockInterval = true;
      let left = horizontalLine.left;

      if(horizontalLine.isPoint) {
        left -= 10;
      }
      if(!this.videoObjects.find(vid => vid.isIntro)) {
        left += 0;//320;
      }
     
      this.calculateTimeByHorizontalLine({ ...horizontalLine });
      this.$store.state.videoPlayer.timeLinePosition = left - (horizontalLine.isPoint ? 11 : 0);

      if(this.timelineDrag.isLock && this.timelineDrag.isPlay && horizontalLine.isEnd) {
        this.timelineDrag = {};

        this.changePlayVideo(true);
      }

      if(!horizontalLine.isEnd) {
        if(this.isPlay) {
          this.timelineDrag.isPlay = true;
          this.timelineDrag.isLock = true;
          this.changePlayVideo(false);
        }
      }

      if(horizontalLine.isPoint) {
        this.timelineDrag = {};
        this.changePlayVideo(this.isPlay);
      }

      this.lockInterval = false;
      //console.log('videoTimelineComputed', horizontalLine);
    },

    rewindBackward(count) {
      this.lockInterval = true;
      this.timer -= .5;
      this.lockInterval = false;
    },
    
    rewindForward(count) {
      this.lockInterval = true;
      this.timer += 5;
      this.lockInterval = false;
    },

    changeVolume(volume) {
      for(const video of this.videoObjects) {
        try {
          this.$refs[`videoCanvas_${video._id}`][0].volume = volume;
        } catch(err) {}
      }

      this.changeAudioVolume(volume);
    },

    reInitialCanvas() {
      editor.destroyCanvas();
      this.initCanvas();
    },

    playVideo(isPlay = false) {
      this.changePlayVideo(isPlay);

      if (!isPlay) this.pauseAllAudio();
    },

    timeUpdate(time) {
      const video = utils.getSelectedVideoByTimeDuration(
        this.videoObjects,
        time,
        true
      );

      // this.$refs.videoCanvas.currentTime = time * video.videoStep - video.time;

      this.$emit(
        "timeUpdate",
        video.time + this.$refs.videoCanvas.currentTime / video.videoStep,
        video.time + this.$refs.videoCanvas.currentTime,
        true
      );
    },
  },
};
</script>

<style scoped>
.subtitles {
  user-select: none;
  pointer-events: none;
  position: absolute;
  padding: 3px;
  background: #000;
  color: #fff;
  bottom: 3px;
  text-align: center;
  max-width: 80%;
  word-break: break-all;
}

#videoEmbedCanvas {
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.videos_dash {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.global_origin_video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>