<template>
    <div class="popup_obj">
      <div v-if="selectedContextObject && (selectedContextObject.typeItem == 'logo' || selectedContextObject.typeItem == 'text')">
          <div class="row">
              <div class="col">Title</div>

              <div class="col">
                  <input type="text" :value="getTitle" @change="setSelectedObjectTitle"/>
              </div>
          </div>

          <div class="row">
              <div class="col">Start time</div>

              <div class="col">
                  <input type="number" @change="changeTime('perTime', $event)" step=".01" :value="getStartTime"/>
              </div>
          </div>
          
          <div class="row">
              <div class="col">Duration</div>

              <div class="col">
                  <input type="number" @change="changeTime('time', $event)" step=".01" :value="getDuration"/>
              </div>
          </div>
      </div>

      <div
        v-if="selectedContextObject && selectedContextObject.typeItem == 'logo'">
            <div class="row">
                <div class="col">Opacity</div>

                <div class="col">
                    <input type="range" min="0" max="1" step=".01"
                        :value="(selectedContextObject.opacity || selectedContextObject.opacity == 0 ? selectedContextObject.opacity : 1)"
                        @input="changeObjProperty($event, 'opacity')" @change="changeObjProperty($event, 'opacity', true)"
                    />
                </div>
            </div>
        </div>

      <div v-if="selectedContextObject && selectedContextObject.typeItem == 'text'">        
        <div class="row">
          <div class="col">
            Color
          </div>
          <div class="col">
            <input
              type="color"
              :value="selectedContextObject.fill"
              @input="changeObjProperty($event, 'fill')"
              @change="changeObjProperty($event, 'fill', true)"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            Opacity
          </div>
          <div class="col">
            <input
              type="range"
              :value="(selectedContextObject.opacity || selectedContextObject.opacity == 0 ? selectedContextObject.opacity : 1)"
              min="0"
              max="1"
              step=".01"
              @input="changeObjProperty($event, 'opacity')"
              @change="changeObjProperty($event, 'opacity', true)"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            Font family
          </div>
          <div class="col">
            <select
              @change="changeObjProperty($event, 'fontFamily', true)"
              @input="changeObjProperty($event, 'fontFamily')"
            >
              <option
                v-for="(font, index) in fonts"
                :key="index"
                :value="font.family"
                :style="{ 'font-family': font.family }"
                :selected="font.family == selectedContextObject.fontFamily"
              >{{ font.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="selectedContextObject">
          <div class="row">
            <div class="col">
                Effect
            </div>
            <div class="col">
                <select @change="changeObjProperty($event, '_effect', true)">
                <option
                    v-for="(effect, index) in effects"
                    :key="index"
                    :value="effect.value"
                    :selected="effect.value == selectedContextObject._effect"
                >{{ effect.title }}</option>
                </select>
            </div>
        </div>

        <div class="row">
            <div class="col">
                Filter
            </div>
            <div class="col">
                <select @change="changeObjProperty($event, '_filter', true)">
                <option
                    v-for="(filter, index) in filters"
                    :key="index"
                    :value="filter.value"
                    :selected="filter.value == selectedContextObject._filter"
                >{{ filter.title }}</option>
                </select>
            </div>
        </div>

        <div class="row">
            <div class="col">
                Transition in
            </div>
            <div class="col">
                <select @change="changeObjProperty($event, '_transition_in', true)">
                <option
                    v-for="(tr, index) in transition.in"
                    :key="index"
                    :value="tr.value"
                    :selected="tr.value == selectedContextObject._transition_in"
                >{{ tr.title }}</option>
                </select>
            </div>
        </div>
        
        <div class="row">
            <div class="col">
                Transition out
            </div>
            <div class="col">
                <select @change="changeObjProperty($event, '_transition_out', true)">
                <option
                    v-for="(tr, index) in transition.out"
                    :key="index"
                    :value="tr.value"
                    :selected="tr.value == selectedContextObject._transition_out"
                >{{ tr.title }}</option>
                </select>
            </div>
        </div>
      </div>
    </div>
</template>

<script>
import DragModal from "./DragModal";
import editor from "../../libs/editor";
import history from "../../libs/history";

export default {
  name: "ObjectPopup",
  components: { DragModal },
  data: () => ({
    windowHeight: 360,
    transition: {
        in: [{
            title: 'None',
            value: ''
        }, {
            title: 'Fade in',
            value: 'fade'
        }, {
            title: 'Reveal from left to right',
            value: 'reveal'
        }, {
            title: 'Fade across screen to the left',
            value: 'wipeLeft'
        }, {
            title: 'Fade across screen to the right',
            value: 'wipeRight'
        }, {
            title: 'Move slightly left and fade in',
            value: 'slideLeft'
        }, {
            title: 'Move slightly right and fade in',
            value: 'slideRight'
        }, {
            title: 'Move slightly up and fade in',
            value: 'slideUp'
        }, {
            title: 'Move slightly down and fade in',
            value: 'slideDown'
        }, {
            title: 'Slide in from right to left',
            value: 'carouselLeft'
        }, {
            title: 'Slide in from left to right',
            value: 'carouselRight'
        }, {
            title: 'Slide in from bottom to top',
            value: 'carouselUp'
        }, {
            title: 'Slide in from top to bottom',
            value: 'carouselDown'
        }, {
            title: 'Fast zoom in',
            value: 'zoom'
        }],

        out: [{
            title: 'None',
            value: ''
        }, {
            title: 'Fade out',
            value: 'fade'
        }, {
            title: 'Reveal from left to right',
            value: 'reveal'
        }, {
            title: 'Fade across screen to the left',
            value: 'wipeLeft'
        }, {
            title: 'Fade across screen to the right',
            value: 'wipeRight'
        }, {
            title: 'Move slightly left and fade out',
            value: 'slideLeft'
        }, {
            title: 'Move slightly right and fade out',
            value: 'slideRight'
        }, {
            title: 'Move slightly up and fade out',
            value: 'slideUp'
        }, {
            title: 'Move slightly down and fade out',
            value: 'slideDown'
        }, {
            title: 'Slide out from right to left',
            value: 'carouselLeft'
        }, {
            title: 'Slide out from left to right',
            value: 'carouselRight'
        }, {
            title: 'Slide out from bottom to top',
            value: 'carouselUp'
        }, {
            title: 'Slide out from top to bottom',
            value: 'carouselDown'
        }, {
            title: 'Fast zoom out',
            value: 'zoom'
        }]
    },

    filters: [{
        title: 'None',
        value: ''
    }, {
        title: 'Boost contrast and saturation',
        value: 'boost'
    }, {
        title: 'Increase contrast',
        value: 'contrast'
    }, {
        title: 'Darken the scene',
        value: 'darken'
    }, {
        title: 'Remove colour',
        value: 'greyscale',
        preview: true
    }, {
        title: 'Lighten the scene',
        value: 'lighten'
    }, {
        title: 'Reduce saturation and contrast',
        value: 'muted'
    }, {
        title: 'Invert colors',
        value: 'negative',
        preview: true
    }],

    effects: [{
        title: 'None',
        value: ''
    }, {
        title: 'Slow zoom in',
        value: 'zoomIn'
    }, {
        title: 'Slow zoom out',
        value: 'zoomOut'
    }, {
        title: 'Slow slide (pan) left',
        value: 'slideLeft'
    }, {
        title: 'Slow slide (pan) right',
        value: 'slideRight'
    }, {
        title: 'Slow slide (pan) up',
        value: 'slideUp'
    },{
        title: 'Slow slide (pan) down',
        value: 'slideDown'
    }],

    fill: { active: false },

    fonts: [
      {
        name: "Open Sans",
        family: "Open Sans",
      },
      {
        name: "Grand Hotel",
        family: "Grand Hotel",
      },
      {
        name: "Hanalei",
        family: "Hanalei",
      },
      {
        name: "Monoton",
        family: "Monoton",
      },
      {
        name: "Montserrat",
        family: "Montserrat",
      },
      {
        name: "Reggae One",
        family: "Reggae One",
      }
    ]
  }),
  props: {},
  methods: {
    changeTime(type, ev) {
      let value = Number(ev.target.value);
      if(!value || value <= 0) {
        return this.$swal('Invalid value, please enter a number greater than zero!', '', 'warning');
      }

      if(type == 'perTime') {

      } else if(type == 'time') {

      } 

      // const maxDuration = this.cropAudio.max - this.cropAudio.min;
      // if(value > maxDuration) {
      //   value = maxDuration;
      // }
    },

    setSelectedObjectTitle(ev) {
      this.$store.state.videoPlayer.timelines = this.$store.state.videoPlayer.timelines.map(tl => {
        if(tl._id == this.currentObjectId) {
          tl.title = ev.target.value;
        }

        return tl;
      });

      history.add({ type: 'videoPlayer' });
    },

    changeObjProperty(ev, key, isUpdate) {
      editor.changeObjectParamsById({
        key,
        isUpdate,
        id: this.currentObjectId,
        value: ev.target.value,
      });
    }
  },
  computed: {
    timelines() {
      return this.$store.state.videoPlayer.timelines;
    },

    currentObjectId() {
      if (this.selectedContextObject) {
        return this.selectedContextObject._id;
      }

      return Date.now();
    },

    getStartTime() {
      const data = this.timelines.find(tl => tl._id == this.currentObjectId);

      return Number((data && (data.perTime || data.perTime == 0) ? data.perTime : 0).toFixed(1));
    },
    
    getDuration() {
      const data = this.timelines.find(tl => tl._id == this.currentObjectId);

      return Number((data && (data.time || data.time == 0) ? data.time : 0).toFixed(1));
    },

    getTitle() {
      const data = this.timelines.find(tl => tl._id == this.currentObjectId);

      return data && data.title ? data.title : '';
    },

    generateTitle() {
      if (!this.selectedContextObject) return "";

      switch (this.selectedContextObject.typeItem) {
        case "text":
          return "Text properties";
      }

      return "";
    },

    selectedContextObject() {
      return this.$store.state.selectedContextObject;
    }
  },

  watch: {
    selectedContextObject(object) {
      //console.log('WTDSDADas', object);
      if (!object) return;
      
      if(['logo', 'text', 'video'].find(q => q == object.typeItem)) {
        if(object.typeItem == 'logo') {
            this.windowHeight = 275;
        } else if(object.typeItem == 'video') {
            this.windowHeight = 240;
        } else {
            this.windowHeight = 360;
        }

        editor.setActiveObjectById(object._id);

        setTimeout(() => {
            this.$modal.show("editor_context_menu"); 
        }, 100);
      }
    }
  }
};
</script>

<style scoped>

.row {
  display: flex;
  width: 100%;
  align-items: left;
  padding: 8px;
  flex-direction: column;
}

.col:first-child {
  margin-bottom: 5px;
}

.col {
  flex: 1;
}

.col input,
.col select {
  width: 100%;
  padding: 6px;
}

.col input[type="color"] {
  padding: 0;
}

.col input[type="range"] {
  padding: 0;
}

.popup_obj {
  color: #9BAFB3;
}
</style>
