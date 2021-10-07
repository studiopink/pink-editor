<template>
  <div class="preloader" @click="$emit('click', $event)">
    <div class="bd">
      <vue-loaders-line-scale-party :scale="scale"/>
    </div>
  </div>
</template>
<script>
export default {
  name: "Preloader",
  props: {
      scale: {
          type: Number,
          default: 1
      }
  },
};
</script>

<style scoped>
.preloader {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.preloader > .bd {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
