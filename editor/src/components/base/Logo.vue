<template>
  <a class="header_logo">
    <img :src="src" />
  </a>
</template>

<script>
export default {
  name: "Logo",
  props: ["src"], //img/logo.svg,
  methods: {},
};
</script>
