<template>
    <div>
        <textarea v-if="!textareaBlock" @input="$emit('input', $event)" @change="$emit('change', $event)" :placeholder="placeholder" class="textarea_field" :value="value"></textarea>
        <div v-else class="textarea_field" @input="$emit('input', $event)" @change="$emit('change', $event)" v-html="value" contenteditable="true"></div>
    </div>
</template>

<script>
export default {
    name: 'SelectField',
    props: ['value', 'placeholder', 'textareaBlock'],
    computed: { }
}
</script>

<style>
    .textarea_field {
        padding: 10px;
        background: #0F282C;
        border-radius: 5px;
        font-family: 'Open Sans', sans-serif;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: #688286;
        display: block;
        width: 100%;
        border: 0;
        margin-bottom: 5px;
        min-height: 100px;
        resize: none;
    }
    .textarea_field::placeholder {
        color: #688286;
    }
</style>