<template>
    <div class="app_header">
        <div class="app_header_left">
            <slot name="left"></slot>
        </div>
        <div class="app_header_right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Header'
}
</script>