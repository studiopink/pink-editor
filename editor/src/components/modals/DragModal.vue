<template>
    <modal @closed="$emit('closed')"
        :reset="true"
        :adaptive="true"
        :resizable="resizable"
        :name="name"
        transition="0"
        draggable=".left_header"
        :height="height"
        :width="width"
        classes="modal_window"
        :minWidth="minWidth"
        :minHeight="minHeight"
        :clickToClose="clickToClose"
    >
        <div class="content">
            <div class="header" v-if="!clearStyles">
                <div class="left_header" :class="{ line_space: line_space }">{{ title }}</div>
                <button @click="closeModal()">
                    <svg height="329pt" viewBox="0 0 329.26933 329" width="329pt" xmlns="http://www.w3.org/2000/svg"><path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"/></svg>
                </button>
            </div>
            <div class="body">
                <slot name="body"></slot>
            </div>
        </div>
    </modal>
</template>

<script>
export default {
  name: "DragModal",
  props: {
      clearStyles: {
          type: Boolean,
          default: () => false
      },

      name: {
          type: String,
          default: () => 'default'
      },

      title: {
          type: String,
          default: () => ''
      },

      minWidth: {
          type: Number,
          default: () => 300
      },

      minHeight: {
          type: Number,
          default: () => 200
      },

      resizable: {
          type: Boolean,
          default: () => false
      },
      
      clickToClose: {
          type: Boolean,
          default: () => true
      },
      
      line_space: {
          type: Boolean,
          default: () => true
      },

      width: {
          type: Number,
          default: () => 300
      },

      height: {
          type: Number,
          default: () => 300
      }
  },

  methods: {
      closeModal() {
          this.$modal.hide(this.name);
      }
  }
}
</script>

<style scoped>
.line_space {
    white-space: nowrap;
    overflow: hidden;
    margin-right: 15px;
    text-overflow: ellipsis;
}

.vm--overlay {
    background: rgba(0, 0, 0, 0);
}
</style>