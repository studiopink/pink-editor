<template>
    <select @change="valueChange($event)" :value="value" class="select_field">
        <option value="" selected disabled v-if="placeholder && (!options || (options && !options.find(o => o.value == value)))">{{placeholder}}</option>
        <option :value="item.value" v-for="(item, index) in options" :key="index">{{ item.text }}</option>
    </select>
</template>

<script>
export default {
    name: 'SelectField',
    props: ['value', 'options', 'placeholder'],
    computed: {

    },
    methods: {
        valueChange(event){
            this.$emit('change', event)
        }
    }
}
</script>

<style>
    .select_field {
        padding: 10px 11px;
        border-radius: 5px;
        font-weight: normal;
        font-size: 12px;
        line-height: 16px;
        color: #688286;
        display: block;
        width: 100%;
        margin-bottom: 5px;
        background: #0F282C url(../../assets/img/select_arrow.svg) no-repeat;
        background-position: calc(100% - 16px) center;
        border: 0;
        appearance: none;
        outline: none;
    }
</style>