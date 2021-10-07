<template>
    <div class="prop_audio_modal">
      <div class="audio_modal_body">
        <div class="flex_bl">
          <label>
            <span>Title</span>
            <input type="string" v-model="audio.title" @change="changeAudioTitle()"/>
          </label>
        </div>
        
        <div class="flex">
          <label>
            <span>Start time</span>
            <input type="number" :value="fixedTime(audio.perTime)"  @change="changeStartTime" step=".01"/>
          </label>
          
          <label>
            <span>Duration</span>
            <input type="number" :value="fixedTime(audio.time)" @change="changeDurationTime" step=".01"/>
          </label>
        </div>
        
        <div class="volume">
          <div class="volume_texts">
            <div>Volume</div>
            <div>{{ parseInt((audio.volume || 1) * 100) }}</div>
          </div>

          <div class="volume_range_s">
            <input type="range" v-model="audio.volume" min="0" @change="changeVolume()" max="1" step=".01"/>
          </div>
        </div>

        <div class="audio_editor">
          <AudioPlayer :audioObject="audio" @cropEvent="updateCropAudio" @changedCrop="changedCrop"/>
        </div>
          
        <!-- <a class="brdr_btn brdr_btn_save" @click="saveAudioChanges">Save changes</a> -->
      </div>
    </div>
</template>

<script>

import DragModal from './DragModal';
import utils from '../../libs/utils';
import AudioPlayer from "@/components/AudioPlayer";
import history from '../../libs/history';

export default {
  name: "AudioSetting",
  components: { DragModal, AudioPlayer },
  props: {},
  data: () => ({
    cropAudio: {}
  }),

  methods: {
    changedCrop() {
      this.saveAudioChanges();
    },

    changeVolume() {
      this.saveAudioChanges();
    },

    changeAudioTitle() {
      this.saveAudioChanges();
    },

    fixedTime(time) {
      if(!time) return 0;
      return Number(time.toFixed(2));
    },

    saveAudioChanges() {
      this.$store.state.editor.audio.crop = this.cropAudio;

      const timelineIndex = this.$store.state.videoPlayer.timelines.findIndex(tl => {
        return tl._id == this.audio._id;
      });

      if(timelineIndex != -1) {
        this.$store.state.videoPlayer.timelines[timelineIndex] = this.audio;
        this.$store.state.videoPlayer.timelines = JSON.parse(JSON.stringify(this.$store.state.videoPlayer.timelines));

        history.add({ type: 'videoPlayer' });
        this.$store.state.videoPlayer.timelines[timelineIndex].active = true;
      }

      //this.$modal.hide('audio_setting_modal');
    },

    changeStartTime(ev) {
      let value = Number(ev.target.value);
      if((!value && value != 0) || value < 0) {
        return this.$swal('Invalid value, please enter a number greater than zero!', '', 'warning');
      }

      const maxDuration = this.cropAudio.max - this.cropAudio.min;
      if(value > maxDuration) {
        value = maxDuration;
      }

      this.$store.state.editor.audio.perTime = Number(value.toFixed(2));

      this.saveAudioChanges();
    },

    changeDurationTime(ev) {
      let value = Number(ev.target.value);
      if(!value || value <= 0) {
        return this.$swal('Invalid value, please enter a number greater than zero!', '', 'warning');
      }

      const maxDuration = this.cropAudio.max - this.cropAudio.min;
      if(value > maxDuration) {
        value = maxDuration;
      }

      this.$store.state.editor.audio.time = Number(value.toFixed(2));
      this.saveAudioChanges();
    },

    updateCropAudio(data) {
      this.cropAudio = data;

      const maxDuration = data.max - data.min;
      const duration = utils.getSelectedVideoDuration() - this.audio.perTime;

      if((this.audio.time > maxDuration && maxDuration > 1) || (duration >= maxDuration && maxDuration > 1)) {
        this.audio.time = Number(maxDuration.toFixed(2));
      } else if(duration < maxDuration && maxDuration > 1) {
        this.audio.time = Number(duration.toFixed(2));
      }
    }
  },

  computed: {
    audio() {
      return this.$store.state.editor.audio;
    }
  }
}

</script>

<style scoped>
.brdr_btn_save {
  margin-top: 15px;
}

.flex_bl {
  display: flex;
  flex-direction: column;
}

label > span {
  margin-bottom: 8px;
}

.flex_bl > label {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-items: left;
  justify-content: left;
}

.flex_bl label span {
  flex: .5;
}

.flex_bl label input {
  flex: 1;
  padding: 5px;
  font-size: 16px;
}

.audio_modal_body {
  background-color: #001b1f;
}

.flex {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.flex label {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px 10px;
}

.flex label input {
  padding: 5px;
  font-size: 16px;
  font-size: 16px;
  text-align: center;
  margin-top: 5px;
}

.volume {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 10px 10px 10px;
}

.volume > .volume_texts {
  flex: 1;
  flex-direction: row;
  display: flex;
}

.volume_texts div {
  flex: 1;
}

.volume_texts div:last-child {
  text-align: right;
}

.volume_range_s {
  width: 100%;
  margin-top: 5px;
}

.volume_range_s input {
  width: 100%;
}

.audio_editor {
  padding: 0 10px 10px 10px;
}

.prop_audio_modal {
  color: #9BAFB3;
}

</style>