<template>
    <div class="bottom_section_top_controls">
        <div class="left_controls">
            <slot name="left"></slot>
        </div>
        <div class="center_controls">
            <slot name="center"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Controlbar'
}
</script>