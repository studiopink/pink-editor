<template>
  <div class="track_rows" :key="resi">
    <!-- <div class="track_row">
            <div class="track_item" @mousedown.stop.prevent="drag" style="left: 50px; width: 300px;">
                <i class="left" v-html="bars"></i>
                <span>TEXT</span>
                <i class="right" v-html="bars"></i>
            </div>
            <div class="track_item" @mousedown.stop.prevent="drag" style="left: 435px; width: 365px">
                <i class="left" v-html="bars"></i>
                <span>ELEMENT</span>
                <i class="right" v-html="bars"></i>
            </div>
            <div class="track_item" @mousedown.stop.prevent="drag" style="left: 861px; width: 500px">
                <i class="left" v-html="bars"></i>
                <span>TEXT</span>
                <i class="right" v-html="bars"></i>
            </div>
        </div> -->

    <!-- <div class="track_row">
            <div class="track_item">INTRO</div>
            <div class="track_item current">LOGO</div>
            <div class="track_item">OUTRO</div>
        </div>
        <div class="track_row">
            <div class="track_item">AUDIO</div>
            <div class="track_item">SUBTITLES</div>
            <div class="track_item">AUDIO</div>
        </div> -->
    <!-- <div class="track_row">
            <VueDragResize
                :parentLimitation="true" 
                :isActive="true" 
                :w="1900" :h="38" :x="0" 
                @resizing="resize" 
                @dragging="resize" 
                axis="x" 
                :stickSize="16"
                :sticks="['ml','mr']">
                <div class="track_item blue" style="width: 100%"><span>AUDIO</span></div>
            </VueDragResize>
        </div>
        <div class="track_row">
            <VueDragResize
                :parentLimitation="true" 
                :isActive="true" 
                :w="300" :h="38" :x="50" 
                @resizing="resize" 
                @dragging="resize" 
                axis="x" 
                :stickSize="16"
                :sticks="['ml','mr']">
                <div class="track_item" style="width: 100%"><span>TEXT</span></div>
            </VueDragResize>
             <VueDragResize
                :parentLimitation="true" 
                :isActive="true" 
                :w="365" :h="38" :x="453" 
                @resizing="resize" 
                @dragging="resize" 
                axis="x" 
                :stickSize="16"
                :sticks="['ml','mr']">
                <div class="track_item pink" style="width: 100%"><span>ELEMENT</span></div>
            </VueDragResize>
             <VueDragResize
                :parentLimitation="true" 
                :isActive="true" 
                :w="500" :h="38" :x="861" 
                @resizing="resize" 
                @dragging="resize" 
                axis="x" 
                :stickSize="16"
                :sticks="['ml','mr']">
                <div class="track_item green" style="width: 100%"><span>TEXT</span></div>
            </VueDragResize> -->
    <!-- <div class="track_item">TEXT</div>
            <div class="track_item">ELEMENT</div>
            <div class="track_item">ELEMENT</div>
            <div class="track_item">AUDIO</div>
            <div class="track_item">SUBTITLES</div> -->
    <!-- </div>

        <div class="track_row">
            <VueDragResize
                :parentLimitation="true" 
                :isActive="true" 
                :w="1400" :h="38" :x="0" 
                @resizing="resize" 
                @dragging="resize" 
                axis="x" 
                :stickSize="16"
                :sticks="['ml','mr']">
                <div class="track_item violet" style="width: 100%"><span>SUBTITLE</span></div>
            </VueDragResize>
        </div> -->
    

    <div class="track_row" v-for="(object, index) in timelines" :key="index">
      <VueDragResize        
        :parentLimitation="false"
        :isActive="true"
        :w="parseWidthByTime(object.perTime, object.time)"
        :h="38"
        :x="parsePerTimePostion(object.perTime)"
        @resizing="resize($event, object._id, false, true, 'resize')"
        @dragging="resize($event, object._id, false, true)"
        @dragstop="resize($event, object._id, true)"
        @resizestop="resize($event, object._id, true, 'resize')"
        :axis="activeKeys.find(key => key == 16) ? 'both' : 'x'"
        :stickSize="16"
        :sticks="['ml', 'mr']"
        :preventActiveBehavior="true"
      >
        <div
          class="track_item violet track_update"
          @contextmenu="handleContextClick($event, object)"
          @click="editTimeline(object)"
          :title="object.title"
          :style="{
              width: '100%',
              background: object.active ? '#006275' : '#243d42',
          }"
        >
          <span>{{ printTitle(object) }}</span>
        </div>
      </VueDragResize>
    </div>
  </div>
</template>
<script>
import svg from "@/components/base/svg";
import { debounce, trottle } from "@/providers/helpers";
import Models from "@/providers/models";
import GrayLabel from "@/components/base/GrayLabel";
import AudioPlayer from "@/components/AudioPlayer";
import VueDragResize from "vue-drag-resize";
//console.log(Models);
import editor from "../../libs/editor";
import utils from "../../libs/utils";
import history from "../../libs/history";
import DragModal from '../modals/DragModal';
import store from '../../store';

export default {
  name: "Trackrows",
  components: {
    VueDragResize, DragModal,
    GrayLabel, AudioPlayer
  },
  data() {
    return {
      resi: 0,
      lastX: 0,
      movementX: 0,
      lastWidth: 0,
      target: null,
      resizeTarget: null,
      // width: 0,
      // height: 0,
      // top: 0,
      // left: 0,
      edit: {
        audio: {},
      },
      changes: 0
    };
  },

  methods: {
    printTitle(object) {
      const title = object.title || "Unnamed";

      return `[${object.type}] ${title}`;
    },

    handleContextClick(event, item) {
			event.preventDefault();

      this.$emit('trackRowMenu', { event, item });
		},

    parseTime(time) {
      return utils.parseSeconds(time);
    },

    changePositionTimeline(element) {
      const positionPer = utils.calculatePositionLeftByTime(element.perTime) + (this.isIntro ? 0 : 320);
      const positionEnd = utils.calculatePositionLeftByTime(element.perTime + element.time) + (this.isIntro ? 0 : 320);

      if(this.timeLinePosition < positionPer || this.timeLinePosition > positionEnd) {
        this.$store.state.videoPlayer.timeLinePosition = positionPer;
        editor.showHideAnotherElements(element.perTime);
      }
    },

    async editTimeline(object) {
      if(object.type != 'audio') this.$store.state.editor.audio = false;
      if(object.type != 'subtitle') this.$store.state.editor.subtitles = false;

      switch (object.type) {
        case "audio": {
          this.$store.state.editor.audio = JSON.parse(JSON.stringify(object));
          //this.$store.state.stepNumber = 5;

          this.$store.state.videoPlayer.timelines = this.$store.state.videoPlayer.timelines.map(tl => {
            if(tl._id != object._id) {
              tl.active = false;
            } else {
              tl.active = true;
            }

            return tl;
          });

          editor.discardActiveObject();
          this.changePositionTimeline(object);
          // this.$modal.show("audio_setting_modal");
          break;
        }
        
        case "logo":
        case "text": {
          this.changePositionTimeline(object);

          const obj = editor.canvas.getObjects().find(o => o._id == object._id);
          if(obj) {
            editor.canvas.setActiveObject(obj).renderAll();
          }

          break;
        }
        
        case "subtitle": {
          this.changePositionTimeline(object);
          await this.$store.dispatch('openSubtitlesEditor', {
            data: JSON.parse(JSON.stringify(object))
          });

          //this.$store.state.stepNumber = 3;
          this.$store.state.videoPlayer.timelines = this.$store.state.videoPlayer.timelines.map(tl => {
            if(tl._id != object._id) {
              tl.active = false;
            } else {
              tl.active = true;
            }

            return tl;
          });
          editor.discardActiveObject();

          break;
        }
      }
    },

    parseWidthByTime(perTime = 0, time = 0) {
      const rightOffset = utils.calculatePositionLeftByTime(perTime + time);
      const leftOffset = utils.calculatePositionLeftByTime(perTime);
      const width = rightOffset - leftOffset;
      return width <= 0 ? 1 : width;
    },

    parsePerTimePostion(perTime = 0) {
      const isIntro = this.currentVideos.find(cv => cv.isIntro);
      const left = utils.calculatePositionLeftByTime(perTime, !isIntro ? 320 : 0); //perTime * 80;;

      //console.log(left);

      return left;
    },

    resize(data = {}, _id, toHistory = false, isChanged = false, type = 'drag') {
      if(isChanged) this.changes += 1;
      const ch = this.changes;
      if(!isChanged) this.changes = 0;
      if(ch <= 2) return;

      const isIntro = this.currentVideos.find(cv => cv.isIntro);
      const left = data.left - (!isIntro ? 320 : 0);
      //console.log(left);

      let updated = false;
      let perTime = utils.calculateRangeTrackRow(left);
      let toTime = utils.calculateRangeTrackRow(left + data.width);
      //console.log(perTime);

      const duration = utils.getSelectedVideoDuration();
      const timeline = this.$store.state.videoPlayer.timelines.find(tk => tk._id == _id);
      if(!timeline) return;
      if(left < 0) {
        perTime = 0;
        toTime = timeline.time;
      } else if(data.left + data.width > this.parsePerTimePostion(toTime)) {        
        perTime = duration - timeline.time;
        toTime = duration;
      }

      //console.log(perTime, toTime);
      this.$store.state.videoPlayer.timelines = this.$store.state.videoPlayer.timelines.map(
        (line) => {
          if (line._id == _id) {
            line.time = toTime - perTime;
            line.perTime = perTime;
            updated = true;

            if(line.type == 'audio') {
              store.state.editor.audio = line;
              store.state.editor.subtitles = false;
              editor.discardActiveObject();
            }

            if(line.type == 'subtitle') {
              store.state.editor.audio = false;
              store.state.editor.subtitles = line;
              editor.discardActiveObject();
            }
          }

          return line;
        }
      );

      if (updated) {
        editor.showHideAnotherElements(store.state.videoPlayer.time);

        if(toHistory) { history.add({ type: 'videoPlayer' }); }
        this.$store.state.videoPlayer.timelines = this.$store.state.videoPlayer.timelines.map(ln => {
          ln.active = false;
          if(ln._id == _id) {
            ln.active = true;
            if(ln.type != 'audio') {
              store.state.editor.audio = false;
            }

            if(ln.type != 'subtitle') {
              store.state.editor.subtitles = false;
            }
          }

          return ln;
        });
      }

      if(toHistory) {
        this.resi += 1;
        this.resi += 1;
        //setTimeout(() => this.resi += 1, 10);
      }
    },
    drag(ev) {
      ev.preventDefault();
      var resize =
        ev.target.classList.contains("left") ||
        ev.target.classList.contains("right");
      this.movementX = 0;

      if (!resize) {
        this.target = ev.target.classList.contains("track_item")
          ? ev.target
          : ev.target.closest(".track_item");
        this.lastX = parseInt(this.target.style.left.replace("px", "")) || 0;
        this.target.style.cursor = "grabbing";
        window.addEventListener("mouseup", this.dragstop);
        window.addEventListener("mousemove", this.dragging);
      } else {
        this.target = ev.target.closest(".track_item");
        this.resizeTarget = ev.target.classList.contains("left");
        this.lastX = parseInt(this.target.style.left.replace("px", "")) || 0;
        this.lastWidth = this.target.offsetWidth;
        this.target.style.cursor = "grabbing";
        window.addEventListener("mouseup", this.dragstop);
        window.addEventListener("mousemove", this.resizing);
      }
    },
    dragging: trottle(
      function(ev) {
        this.movementX += ev.movementX;
        var left = this.lastX + this.movementX;
        left = left >= 0 ? left : 0;
        this.target.style.left = left + "px";
      },
      0,
      true
    ),
    resizing: trottle(
      function(ev) {
        if (this.resizeTarget) {
          //LEFT
          if (ev.movementX > 0) {
            this.lastWidth -= ev.movementX;
            this.movementX += ev.movementX;
          } else {
            this.lastWidth += Math.abs(ev.movementX);
            this.movementX -= Math.abs(ev.movementX);
          }
          var left = this.lastX + this.movementX;
          left = left >= 0 ? left : 0;
          this.target.style.left = left + "px";
        } else {
          //RIGHT
          this.lastWidth += ev.movementX;
          this.movementX += ev.movementX;
        }

        this.target.style.width = this.lastWidth + "px";
      },
      0,
      true
    ),
    dragstop(ev) {
      window.removeEventListener("mousemove", this.dragging);
      window.removeEventListener("mousemove", this.resizing);
      window.removeEventListener("mouseup", this.dragstop);
      this.target.style.cursor = "grab";
      this.target = null;
      this.resizeTarget = null;
      this.lastX = 0;
      this.movementX = 0;
      this.lastWidth = 0;
    },
    async init() {
      var result = await this.$api.result(
        "6fc9d53b-3ddb-40c4-a94f-d4126521cb63"
      );
      //console.log("result: ", result);
    },

    updateTimelineProgress(timePosition) {
      // editor.showHideAnotherElements(timePosition / 80);
    },
  },

  watch: {
    timelineProgress(timePosition) {
      this.updateTimelineProgress(timePosition);
    }
  },

  computed: {
    isIntro() {
      return !!this.$store.state.selectedVideos.find(vid => vid.isIntro);
    },

    activeKeys() {
      return this.$store.state.keys;
    },

    currentVideos() {
			return this.$store.state.selectedVideos;
		},

    timelines() {
      return this.$store.state.videoPlayer.timelines;
    },

    bars() {
      return `<svg width="4" height="14" viewBox="0 0 4 14" fill="none" xmlns="http://www.w3.org/2000/svg">${svg.bars}</svg>`;
    },

    timelineProgress() {
      return this.$store.state.videoPlayer.timeLinePosition;
    },

    timeLinePosition() {
      return this.$store.state.videoPlayer.timeLinePosition;
    }
  },

  created() {
    //this.init();

    var soundtrack = {
      src: "https://s3-ap-northeast-1.amazonaws.com/my-bucket/music.mp3",
      effect: "fadeIn",
      volume: 1,
    };
    var background = "#000000";
    var fonts = [
      {
        src: "https://s3-ap-northeast-1.amazonaws.com/my-bucket/open-sans.ttf",
      },
    ];
    var tracks = [
      {
        clips: [
          {
            asset: {
              type: "video",
              src:
                "https://s3-ap-northeast-1.amazonaws.com/my-bucket/video.mp4",
              trim: 2,
              volume: 1,
              crop: {
                top: 0.15,
                bottom: 0.15,
                left: 0,
                right: 0,
              },
            },
            start: 2,
            length: 5,
            fit: "crop",
            scale: 0,
            position: "center",
            offset: {
              x: 0.1,
              y: -0.2,
            },
            transition: {
              in: "fade",
              out: "fade",
            },
            effect: "zoomIn",
            filter: "greyscale",
            opacity: 1,
          },
        ],
      },
    ];

    var timeline = new Models.Timeline(soundtrack, background, fonts, tracks);
  },
};
</script>

<style>
.panel {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 100px;
}

.vm--modal {
  background-color: #001b1f !important;
  box-shadow: rgb(255, 255, 255) 0px 0px 1px 0px !important;
}

.audio_modal_body {
  background-color: #001b1f;
}
</style>

<style lang="scss">
.vdr {
  &.active:before {
    display: none;
  }
  .vdr-stick {
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    box-shadow: none;
    border: none;
    width: 12px !important;
    &-ml {
      left: 0 !important;
    }
    &-mr {
      right: 0 !important;
    }
    &:before {
      content: "";
      display: block;
      height: 14px;
      width: 4px;
      border-left: 1px solid #9bafb3;
      border-right: 1px solid #9bafb3;
    }
  }
}

.track_rows {
  color: #fff;
  position: relative;
  z-index: 1;
  height: auto;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  .track_row {
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
    position: relative;
    &:last-child {
      height: 38px;
    }
    .track_item {
      position: absolute;
      top: 6px;
      height: 26px;
      text-transform: uppercase;
      color: hsl(190, 14%, 65%);
      background: hsl(190, 30%, 20%);
      border-radius: 7px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      overflow: hidden;
      cursor: grab;
      &:hover {
        opacity: 0.7;
      }
      &.current {
        box-shadow: inset 0 0 0 1px #beec3d;
      }
      span {
        display: block;
        pointer-events: none;
        padding: 0 5px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
      }
      // i {
      //     display: flex;
      //     justify-content: center;
      //     align-items: center;
      //     width: 16px;
      //     height: 14px;
      //     cursor: e-resize;
      //     svg {
      //         pointer-events: none;
      //     }
      // }
      &.blue {
        filter: hue-rotate(40deg);
      }
      &.pink {
        filter: hue-rotate(150deg);
      }
      &.green {
        filter: hue-rotate(300deg);
      }
      &.violet {
        filter: hue-rotate(90deg);
      }
    }
  }
}
</style>

<style scoped>
  .track_update span {
    max-width: 70%;
    margin: 0 auto;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap; 
  }

  .audio_modal_body label, .audio_modal_body .label {
      display: flex;
      padding: 5px 0;
      margin: 5px 0;
      align-items: center;
  }
  
  .audio_modal_body label span,
  .audio_modal_body label input,
  .audio_modal_body label select {
    flex: 1;
    text-align: center;
  }

  .audio_modal_body .label div {
    flex: 2;
    text-align: center;
  }

  .audio_modal_body .label span {
    flex: 1;
    text-align: center;
  }

  .audio_modal_body .volume_range_s {
    display: flex;
    align-items: center;
  }

  .audio_modal_body .volume_range_s input {
    flex: 2;
  }

  .audio_modal_body .volume_range_s span {
    width: 30px;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }

  .audio_modal_body label select, .audio_modal_body label input {
    padding: 4px;
    font-size: 16px;
    text-align: center;
  }
</style>