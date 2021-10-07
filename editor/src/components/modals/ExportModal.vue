<template>
  <DragModal name="export_modal" :width="500" :minWidth="400" :height="300" title="Setting">
    <template v-slot:body>
      <div class="content">
        <label>
            <span>Video name</span>
            <input
              type="text"
              placeholder="Write video name"
              v-model="models.name"
            />
          </label>

          <label>
            <span>Format</span>
            <select v-model="models.type">
              <option
                v-for="(type, index) in types"
                :key="index"
                :value="type.value"
              >
                {{ type.title }}
              </option>
            </select>
          </label>

          <label>
            <span>Resolution </span>
            <select v-model="models.resolution">
              <option
                v-for="(resolution, index) in resolutions"
                :key="index"
                :value="resolution.value"
              >
                {{ resolution.title }} - {{ resolution.w }}x{{ resolution.h }}
              </option>
            </select>
          </label>

          <!-- <label>
            <span>Aspect Ratio </span>
            <select v-model="models.aspectRatio">
              <option
                v-for="(aspectRatio, index) in aspectRatioList"
                :key="index"
                :value="aspectRatio.value"
              >
                {{ aspectRatio.title }}
              </option>
            </select>
          </label> -->

          <label>
            <span>Frame per second </span>
            <select v-model="models.fps">
              <option
                v-for="(fps, index) in frameRates"
                :key="index"
                :value="fps"
              >
                {{ fps }}fps
              </option>
            </select>
          </label>
          
          <label>
            <span>Background Color</span>
            <input type="color" v-model="models.backgroundColor"/>
          </label>

          <a class="brdr_btn render_btn" @click="exportVideo"
            >Render and export</a
          >
        </div>
    </template>
  </DragModal>
</template>

<script>
import editor from "../../libs/editor";
import API from "../../providers/api";
import DragModal from './DragModal';

window.api = API;

export default {
  name: "ExportModal",
  components: { DragModal },
  data() {
    return {
      models: {
        name: "",
        type: "",
        resolution: "",
        aspectRatio: "",
        fps: "",
        backgroundColor: '#000000'
      },

      types: [
        {
          title: "MP4",
          value: "mp4",
        },
        {
          title: "GIF",
          value: "gif",
        },
        {
          title: "MP3",
          value: "mp3",
        },
      ],

      resolutions: [
        {
          title: "Preview",
          value: "preview",
          w: 512,
          h: 288,
          fps: 15,
          selected: true,
        },
        {
          title: "Mobile",
          value: "mobile",
          w: 640,
          h: 360,
          fps: 25,
        },
        {
          title: "SD",
          value: "sd",
          w: 1024,
          h: 576,
          fps: 25,
        },
        {
          title: "HD",
          value: "hd",
          w: 1280,
          h: 720,
          fps: 25,
        },
        {
          title: "Full HD",
          value: "1080",
          w: 1920,
          h: 1080,
          fps: 25,
        },
      ],

      aspectRatioList: [
        {
          title: "16:9",
          value: "16:9",
          formats: ["landscape", "youtube"]
        },
        {
          title: "9:16",
          value: "9:16",
          formats: ["story", "tiktok"]
        },
        {
          title: "1:1",
          value: "1:1",
          formats: ["square"]
        },
        {
          title: "4:5",
          value: "4:5",
          formats: ["tw-fb-portrait"]
        },
      ],

      frameRates: [12, 15, 24, 25, 30],
    };
  },

  mounted() {
    this.models = {
      type: this.types[0].value,
      resolution: this.resolutions[0].value,
      aspectRatio: this.calculateAspectRatio(),
      fps: this.frameRates[0],
    };
  },

  computed: {
    showModal() {
      return this.$store.state.modals.export;
    },
  },

  watch: {
    showModal() {
      this.$modal.show("export_modal");
    },
  },

  methods: {
    calculateAspectRatio() {
      const format = this.$store.state.videoPlayer.format;
      const aspectRatio = this.aspectRatioList.find(aspe => aspe.formats.find(f => f.toLowerCase() == (format || '').toLowerCase()));

      return aspectRatio ? aspectRatio.value : (this.aspectRatioList[0].value);
    },

    async errorMessage(message = "ERROR!") {
      await this.$store.dispatch("loaderStatus", {
        isActive: true,
        text: `<span style="color: red;">${message}</span>`,
      });
      setTimeout(
        async () =>
          await this.$store.dispatch("loaderStatus", { isActive: false })
      );
    },

    async exportVideo() {
      try {
        await this.$store.dispatch("loaderStatus", {
          isActive: true,
          text: "Sending data...",
        });

        const resolution = this.resolutions.find(
          (res) => res.value == this.models.resolution
        );

        const data = editor.compareRenderData({
          ...this.models,
          aspectRatio: this.calculateAspectRatio()
        }, resolution);
        const result = await API.renderVideo(data);

        if (result && result.success) {
          await this.$store.dispatch("loaderStatus", {
            isActive: true,
            text: "Rendering video...",
          });

          this.$socket.emit("render_subscribe", result.id);
          
          this.$store.state.renderId = result.id;

          this.sockets.subscribe("render_done", async (data) => {
            this.$store.state.renderId = null;
            this.sockets.unsubscribe("render_done");
            //console.log(data);
            await this.downloadVideo(data.url);
            this.$modal.hide("export_modal");
            this.$store.dispatch("loaderStatus", { isActive: false });
          });
        } else {
          this.$swal(result.error || 'Error', '', 'error');
          this.$store.dispatch("loaderStatus", { isActive: false });
        }
      } catch (err) {
        console.error(err);
        this.$swal('Error', '', 'error');

        this.$store.dispatch("loaderStatus", { isActive: false });
      }
    },

    async downloadVideo(url = "") {
        //window.open(url, "hello", "width=1024,height=600");
        //return;
      const name =
        (this.models.name || `Unnamed-${new Date().toLocaleString()}`) +
        `.${this.models.type}`;

      this.$store.dispatch("loaderStatus", {
        isActive: true,
        text: `Download video...`,
      });

      function byteToMB(bytes) {
          return `${(bytes / 1024 / 1024).toFixed(2)}Mb`;
      }

      const video = await API.downloadVideo(url, (e) => {
        this.$store.dispatch("loaderStatus", {
          isActive: true,
          text: `Downloading... <p>${byteToMB(e.loaded)}/${byteToMB(e.total)} ${((e.loaded / e.total) * 100).toFixed(2)}%</p>`,
        });
      });

      const link = URL.createObjectURL(video);

      const a = document.createElement("a");
      a.href = link;
      a.download = name;
      a.click();
    },
  },
};
</script>

<style scoped>
.render_btn {
  width: 200px;
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.body {
  padding: 10px;
}

.content {
  color: #fff;
}

.content > label {
  display: flex;
  padding: 5px;
}

label span {
  margin-right: 10px;
  min-width: 150px;
}

label select,
label input {
  width: 100%;
  padding: 5px;
}

.title {
  color: #fff;
  text-align: center;
  padding: 10px;
  font-size: 24px;
  font-weight: 500;
}

label input[type="color"] {
  padding: 0;
}
</style>
