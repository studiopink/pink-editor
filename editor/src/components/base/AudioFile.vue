<template>
  <div class="audio_file_item" @contextmenu="$emit('contextmenu', $event)">
    <a
      class="play_btn"
      @click="playStopAudio(!isPlay)"
      :style="{ border: '2px solid ' + (!isPlay ? '#C3E365' : '#03A9F4') }"
    >
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
        <rect v-if="isPlay" x="8" y="0" width="3" height="30" fill="#03a9f4" />
        <rect v-if="isPlay" x="0" y="0" width="3" height="30" fill="#03a9f4" />
      </svg>
    </a>

    <audio ref="player" v-if="src" :src="src">
      Your browser does not support the
      <code>audio</code> element.
    </audio>
    <div class="select_audio" title="Add audio file" @click="addAudio">
      <h3>{{ title }}</h3>
      <span class="author" :key="currentTime"
        >{{ author }} [{{ getCurrentTime() }}/{{ parseDuration() }}]</span
      >
    </div>
  </div>
</template>
<script>
import utils from "../../libs/utils";
import editor from "../../libs/editor";
export default {
  name: "AudioFile",
  props: ["title", "author", "src", "id", "duration"],

  data() {
    return {
      isPlay: false,
      currentTime: 0,
    };
  },

  mounted() {
    this.$refs.player.ontimeupdate = () => {
      this.currentTime = this.$refs.player.currentTime;
    };

    this.$refs.player.onpause = () => { this.isPlay = false; };
  },

  methods: {
    getCurrentTime() {
        return utils.parseSeconds(this.currentTime).toTime();
    },

    parseDuration() {
      return utils.parseSeconds(this.duration).toTime();
    },

    async addAudio() {
      const files = this.$store.state.files;
      const audioObject = files.find((file) => file.id == this.id);
      if (!audioObject) return;

      const videos = this.$store.state.selectedVideos;
			if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

      await editor.addAudio(audioObject);
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
    playUserAudio() {
      return this.$store.state.playUserAudio;
    },
  },

  watch: {
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
}

.select_audio h3 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}

</style>
