<template>
    <ul class="color_circles_picker">
        <li class="color_item" v-for="(item, index) in colors" :key="index" :style="{ background: item.fill }" @click="openColorPicker(item)" :class="{'active': item._id === selected }">
            <input :ref="'color_input_' + item._id" type="color" :v-model="item.fill"
                @change="changeColor($event, item, true)"
                
            />
        </li>
    </ul>
</template>
<script>
// @input="changeColor($event, item)"
import editor from '../../libs/editor';
export default {
    name: 'ColorCirclesPicker',
    props: { },
    data() {
		return {
            selected: null,
            color: '#fff'
        }
	},

    computed: {
        colors() {
            return this.$store.state.videoPlayer.texts.filter(q => q.fill) || [];
        }
    },

    methods: {
        openColorPicker(item) {
            this.selected = item._id;
            this.color = item.fill;
            this.$refs['color_input_' + item._id][0].click();
        },

        changeColor(ev, text, isUpdate = false) {
            this.color = ev.target.value;
            
            editor.changeObjectParamsById({
				id: text._id,
				key: 'fill',
				value: ev.target.value,
				isUpdate
			});

            if(isUpdate) {
                this.selected = null;
            }
        }
    }
}
</script>

<style scoped>
.color_item {
    display: flex;
    justify-content: center;
    align-items: center;
}

.color_item input {
    width: 1px;
    height: 1px;
    overflow: hidden;
    border: none;
    opacity: 0;
}
</style>