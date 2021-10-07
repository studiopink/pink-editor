<template>
  <div class="audio_file_item">
    <div
      class="flex_audio_player"
      :style="{ 'margin-top': !hiddenCrop ? '12px' : '0px' }"
    >
      <div v-if="!isColumn">
        <a @click="playStopAudio(!isPlay)">
          <svg
            width="11"
            :class="{ active_play: isPlay }"
            height="13"
            viewBox="0 0 11 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              v-if="!isPlay"
              d="M10.5 5.63398C11.1667 6.01888 11.1667 6.98113 10.5 7.36603L2.25 12.1292C1.58333 12.5141 0.75 12.0329 0.75 11.2631L0.750001 1.73686C0.750001 0.967059 1.58333 0.485934 2.25 0.870835L10.5 5.63398Z"
              :fill="!isPlay ? '#C3E365' : '#03A9F4'"
            ></path>
            <rect
              v-if="isPlay"
              x="8"
              y="0"
              width="3"
              height="30"
              fill="#03a9f4"
            />
            <rect
              v-if="isPlay"
              x="0"
              y="0"
              width="3"
              height="30"
              fill="#03a9f4"
            />
          </svg>
        </a>
      </div>

      <div
        class="timeline"
        ref="timeline"
        :style="{ 'margin-left': isColumn ? '0px' : '5px' }"
        @mousemove="mouseMove"
        @click="updateCurrentTime(timeHover)"
      >
        <div class="crop_control" v-show="!hiddenCrop">
          <VueDragResize
            :parentLimitation="true"
            axis="x"
            :isResizable="false"
            :sticks="[]"
            :x="crop.left.x"
            :w="14"
            :h="28"
            @dragstop="draggingCrop('left', $event, true)"
            @dragging="draggingCrop('left', $event)"
          >
            <div
              class="horizontal_line"
              ref="horizontal_line"
              :style="{ top: 0, left: 0 }"
            ></div>
          </VueDragResize>

          <VueDragResize
            @dragstop="draggingCrop('right', $event, true)"
            :parentLimitation="true"
            @dragging="draggingCrop('right', $event)"
            axis="x"
            :isResizable="false"
            :sticks="[]"
            :minX="0"
            :x="crop.right.x"
            :w="14"
            :h="28"
          >
            <div
              class="horizontal_line"
              ref="horizontal_line"
              :style="{ top: 0, left: 0 }"
            ></div>
          </VueDragResize>
        </div>

        <span
          class="title"
          ref="title_timeline"
          :style="{ left: `${timeLayerX}px` }"
          >{{ parseTime(timeHover) }}</span
        >
        <span class="line" :style="{ width: `${getProcentage}%` }"></span>
        <p :style="{ 'user-select': 'none' }">{{ getCurrentTime() }}/{{ parseDuration() }}</p>
      </div>

      <!-- <VolumeControl :value="50" @change="volumeChange"/> -->
    </div>

    <Bbutton @click="playStopAudio(!isPlay)"
      :icon="isPlay ? 'audioPause' : 'audioPlay'"
      iconSize="12" style="user-select: none; margin-top: 5px;" v-if="isColumn">
      Play
    </Bbutton>

    <div class="crop_player_menu" :style="{ display: hiddenCrop ? 'none': 'block' }">
      <input
        type="string"
        class="input_spl"
        @change="changeCrop('left', $event)"
        ref="crop_time_left"
      />
      <span>{{ parseTime(cropTime.max - cropTime.min) }}</span>
      <input
        type="string"
        class="input_spl"
        @change="changeCrop('right', $event)"
        ref="crop_time_right"
      />
    </div>

    <audio ref="player" v-if="audioObject" :src="audioObject.src">
      Your browser does not support the
      <code>audio</code> element.
    </audio>

    <div
      class="select_audio"
      v-if="false"
      style="overflow: auto;height: 130px;"
    >
      <div v-for="(meta, i) in audioObject.meta" :key="i">
        <span class="key">{{ i }}</span> {{ meta }}
      </div>
    </div>
  </div>
</template>
<script>
import utils from "../libs/utils";
import editor from "../libs/editor";
import VueDragResize from "vue-drag-resize";
import VolumeControl from '../components/base/VolumeControl';
import Bbutton from '../components/base/Bbutton';

export default {
  name: "AudioPlayer",
  components: { VueDragResize, VolumeControl, Bbutton },
  props: {
    audioObject: {
      type: Object,
      default: () => {},
    },

    isColumn: {
      type: Boolean,
      default: () => false
    },

    hiddenCrop: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isPlay: false,
      currentTime: 0,
      timeHover: 0,
      timeLayerX: 0,
      crop: {
        left: {
          x: -1,
          time: 0,
        },
        right: {
          x: -1,
          time: 0,
        },
      },
    };
  },

  beforeDestroy() {
    this.playStopAudio(false);
  },

  mounted() {
    this.$refs.player.volume = this.volume || 1;
    this.$refs.player.ontimeupdate = () => {
      if (!this.$refs.player) return;
      if (this.$refs.player.currentTime >= this.cropTime.max && !this.hiddenCrop) {
        //this.$refs.player.pause();
        this.$refs.player.currentTime = this.cropTime.min;
      }

      this.currentTime = this.$refs.player.currentTime;
    };

    this.$refs.player.onpause = () => {
      this.isPlay = false;
    };

    this.calculateCrop();
  },

  methods: {
    volumeChange() {

    },

    changeCrop(type, ev) {
      let val = ev.target.value;

      const parsedTime = utils.timeFromString(val);
      if(parsedTime != null) {
        if (type == "left") {
          if (parsedTime < 0) {
            parsedTime = 0;
          }

          if (parsedTime > this.cropTime.max) {
            parsedTime = this.cropTime.max;
          }
        } else {
          if (parsedTime > this.audioObject.meta.duration) {
            parsedTime = this.audioObject.meta.duration;
          }

          if (parsedTime < this.cropTime.min) {
            parsedTime = this.cropTime.min;
          }
        }

        this.crop[type].time = parsedTime;
        this.crop[type].x = this.calcCropByTime(parsedTime);
        this.updateCurrentTime(parsedTime);

        this.$emit('changedCrop');
      } else {
        ev.target.value = utils.parseSeconds(this.crop[type].time);
        this.$swal('Bad time!\nExample: 00:01:00', '', 'error');
      }
    },

    calcCropByTime(time) {
      const elemWidth = this.$refs.timeline.clientWidth;
      let proc = time / this.audioObject.meta.duration;
      if(proc > 1) proc = 1;

      return (elemWidth * proc) - 1;
    },

    calculateCrop() {
      if(this.hiddenCrop) return;

      if (this.audioObject && this.audioObject.crop) {
        this.crop.left.time = this.audioObject.crop.min;
        this.crop.right.time = this.audioObject.crop.max;

        this.crop.left.x = this.calcCropByTime(this.crop.left.time);
        this.crop.right.x = this.calcCropByTime(this.crop.right.time);

        this.updateCurrentTime(this.crop.left.time);
      } else {
        //console.log("NOT HAVE A CROP");
        this.crop.left = { x: -1, time: 0 };
        this.crop.right = {
          x: this.$refs.timeline.clientWidth,
          time: this.audioObject.meta.duration,
        };
      }
    },

    draggingCrop(type, ev, stop = false) {
      if (this.isPlay) {
        this.playStopAudio(false);
      }

      const left = ev.left + 1;
      let proc = left / this.$refs.timeline.clientWidth;
      if (proc > 1) proc = 1;

      const time = this.audioObject.meta.duration * proc;
      this.crop[type].x = proc * this.$refs.timeline.clientWidth;
      this.crop[type].time = time;

      if(this.crop[type].x < -1) {
          this.crop[type].x = -1;
          this.crop[type].time = 0;
      }

      this.timeHover = this.crop[type].time;
      if(this.timeHover >= this.audioObject.meta.duration) {
        this.timeHover = this.audioObject.meta.duration - .001;
      }

      this.updateCurrentTime(this.timeHover);

      if(stop) this.$emit('changedCrop');
    },

    updateCurrentTime(time) {
      this.$refs.player.currentTime = time;
    },

    parseTime(time) {
      return utils.parseSeconds(time);
    },

    mouseMove(ev) {
      const left = ev.x - this.$refs.timeline.getBoundingClientRect().x;
      this.timeLayerX = left - this.$refs.title_timeline.clientWidth / 2;

      let proc = left / this.$refs.timeline.clientWidth;
      if (proc > 1) proc = 1;

      this.timeHover = this.audioObject.meta.duration * proc;

      if(this.hiddenCrop) return;
      if (this.timeHover < this.cropTime.min) {
        this.timeHover = this.cropTime.min;
      }

      if (this.timeHover > this.cropTime.max) {
        this.timeHover = this.cropTime.max;
      }
    },

    getCurrentTime() {
      return utils.parseSeconds(this.currentTime).toTime();
    },

    parseDuration() {
      return utils.parseSeconds(this.audioObject.meta.duration).toTime();
    },

    playStopAudio(isPlay) {
      this.isPlay = isPlay;

      const method = !this.isPlay ? "pause" : "play";
      this.$refs.player[method]();

      if (this.isPlay) {
        this.$store.state.playUserAudio = this.id;
      }
    },
  },

  computed: {
    volume() {
      return this.audioObject.volume || this.audioObject.volume == 0 ? this.audioObject.volume : 1;
    },

    cropTime() {
      return {
        min: Math.min(this.crop.left.time, this.crop.right.time),
        max: Math.max(this.crop.left.time, this.crop.right.time),
      };
    },

    getProcentage() {
      return (this.currentTime / this.audioObject.meta.duration) * 100;
    },

    playUserAudio() {
      return this.$store.state.playUserAudio;
    },
  },

  watch: {
    volume(value) {
      this.$refs.player.volume = value;

      try {
        document.getElementById(`audio_${this.audioObject._id}`).volume = (value / 1) * this.$store.state.videoPlayer.volume;
      } catch(err) {
        console.error(err);
      }
    },

    cropTime(time) {
      this.$refs.crop_time_left.value = utils.parseSeconds(time.min);
      this.$refs.crop_time_right.value = utils.parseSeconds(time.max);

      this.$emit('cropEvent', time);
    },

    playUserAudio(id) {
      if (id != this.id && this.isPlay) {
        this.playStopAudio(false);
      }
    },
  },
};
</script>

<style scoped>
.select_audio {
  cursor: pointer;
}

.active_play > rect {
  fill: rgba(3, 169, 244, 0.7);
}

.audio_file_item {
  padding: 5px 0;
  display: block;
}

.flex_audio_player {
  display: flex;
  padding: 3px;
  width: 100%;
}

.flex_audio_player > div:first-child {
  width: 20px;
  display: block;
  padding: 2px;
}

.flex_audio_player .timeline {
  position: relative;
  width: 100%;
  flex: 1;
  text-align: center;
  border: 1px solid #03a9f4;
  color: #9BAFB3;
}

.flex_audio_player .timeline .title {
  display: none;
  position: absolute;
  padding: 3px 15px;
  background: #464a65;
  top: -30px;
  border-radius: 5px;
}

.flex_audio_player .timeline:hover .title {
  display: block;
}

.flex_audio_player .timeline .line {
  position: absolute;
  background-color: rgb(195 227 101 / 0.3);
  height: 16px;
  height: 100%;
  left: 0;
  top: 0;
}

span.key {
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: #9bafb3;
}

.crop_control {
  position: absolute;
  left: -10px;
  top: -12px;
  width: calc(100% + 15px);
  height: 30px;
}

.audio_file_item {
  width: 100%;
}

.crop_player_menu {
  width: 100%;
  padding: 6px 3px;
  display: flex;
  flex-direction: row;
}

.crop_player_menu input {
  text-align: left;
  width: 33%;
}

.crop_player_menu span {
  width: 34%;
  display: inline-block;
  text-align: center;
  color: #9bafb3;
}

.crop_player_menu input:last-child {
  text-align: right;
}

.input_spl {
  color: #9bafb3;
  background-color: #001b1f;
  border: 0;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
