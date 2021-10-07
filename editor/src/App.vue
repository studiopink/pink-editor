<template>
	<div id="app" @mousedown="mouseDown">
		<router-view/>
	</div>
</template>

<script>

import keyboard from './libs/keyboard';
export default {
	created() {
		window.swal = this.$swal;

		document.body.addEventListener('keyup', e => keyboard.bindKeyUp(e));
		document.body.addEventListener('keydown', e => keyboard.bindKeyDown(e));

		this.$store.dispatch('refreshStoreFiles');

		this.sockets.subscribe('disconnect', () => {
			if(this.$store.state.renderId) {
				console.log('Disconnect render queue: ', this.$store.state.renderId);
			}
		});

		this.sockets.subscribe('connect', () => {
			if(this.$store.state.renderId) {
				console.log('Connect await render status: ', this.$store.state.renderId);
				this.$socket.emit("render_subscribe", this.$store.state.renderId);
			}
		});

		document.onmousemove = e => {
			this.$store.state.mouse.x = e.clientX;
			this.$store.state.mouse.y = e.clientY;
		};
	},

	methods: {
		mouseDown(ev) { keyboard.mouseDown(ev); }
	},

	computed: {
        selectedContextObjectType() {
            return this.$store.state.selectedContextObject && this.$store.state.selectedContextObject.typeItem
                ? this.$store.state.selectedContextObject.typeItem : null;
        }
    },

	watch: {
		selectedContextObjectType(data) {
			keyboard.watchSelectedContextObjectType(data);
		}
	}
}
</script>

<style scoped>
 #app {
	overflow: hidden;
	height: 100vh;
}
</style>