<template>
    <div class="desktop_mobile_toggle" :class="desktopMobileMode">
        <span @click="$emit('dMobToggle', 'desktop')">Desktop</span>
        <span @click="$emit('dMobToggle', 'mobile')">Mobile</span>
    </div>
</template>

<script>
export default {
    name: 'DMobToggle',
    props: ['desktopMobileMode', ]

}
</script>