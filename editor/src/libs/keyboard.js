import store from '../store';
import editor from './editor';
import history from './history';

export default new class {
    constructor() {
        this.selectedContextObjectType = null;
		this.selectedVideo = null;
    }

	// WATCHS
    watchSelectedContextObjectType(data) {
        this.selectedContextObjectType = data;
    }

	watchSelectedVideo(active) {
		this.selectedVideo = active;
	}

	//

    bindKeyUp(e) {
        store.state.keys = store.state.keys.filter(key => key != e.code);
    }

    bindKeyDown(e) {
		//if(!store.state.keys.find(key => key == e.code)) {
			store.state.keys.push(e.code);

			switch(e.code) {
				case 'Delete': {
					let isLock = false;
					if(editor && editor.canvas && editor.canvas.getActiveObject()) {
						editor.removeActiveObjects();
						isLock = true;
					} else if(this.selectedVideo && confirm('Delete selected video?')) {
						isLock = true;
						store.dispatch('deleteVideoById', this.selectedVideo);
					} else if(store.state.editor.audio && store.state.editor.audio._id) {
						store.state.videoPlayer.timelines = store.state.videoPlayer.timelines
							.filter(tl => tl._id != store.state.editor.audio._id);
						store.state.editor.audio = null;
						history.add({ type: 'videoPlayer' });
					} else if(store.state.editor.subtitles && store.state.editor.subtitles._id) {
						store.state.videoPlayer.timelines = store.state.videoPlayer.timelines
							.filter(tl => tl._id != store.state.editor.subtitles._id);
						store.state.editor.subtitles = null;
						history.add({ type: 'videoPlayer' });
					}

					if(isLock) {
						e.preventDefault();
						e.stopPropagation();
					}

					break;
				}

				case 'Escape': {
					const timelines = store.state.videoPlayer.timelines;
					if(timelines && timelines.length) {
						this.discardActiveTimelinesObjects();
						editor.discardActiveObject();

						store.state.editor.audio = null;

						e.preventDefault();
						e.stopPropagation();
					}
					
					break;
				}
			}
		//}

		//console.log(JSON.parse(JSON.stringify(store.state.keys)));
	}

	discardActiveTimelinesObjects() {
		const timelines = store.state.videoPlayer.timelines;

		if(timelines.find(tl => tl.active)) {
			store.state.videoPlayer.timelines = store.state.videoPlayer.timelines.map(tl => {
				tl.active = false;

				return tl;
			});
		}
	}

	mouseDown(ev) {
		if(window.innerHeight - ev.pageY < 10) return;
		if(ev.button > 0) return;

		if(this.selectedContextObjectType && this.selectedContextObjectType == 'logo'
			&& !ev.target.classList.contains('upper-canvas') && !$(ev.target).closest('.logo_properties_sidebar')[0]) {
			store.state.selectedContextObject = false;
			this.discardActiveTimelinesObjects();
			editor.discardActiveObject();

			console.log(1);
		}
		
		if(this.selectedContextObjectType && this.selectedContextObjectType == 'text'
			&& !ev.target.classList.contains('upper-canvas') && !$(ev.target).closest('.text_properties_sidebar')[0]) {
			store.state.selectedContextObject = false;
			this.discardActiveTimelinesObjects();
			editor.discardActiveObject();
			console.log(2);
		}

		if(store.state.editor.audio && store.state.editor.audio._id && !$(ev.target).closest('.audio_properties_menu')[0]) {
			store.state.editor.audio = false;
			this.discardActiveTimelinesObjects();
			console.log(3);
		}
		
		if(store.state.selectedContextObject
				&& store.state.selectedContextObject.typeItem == 'video' && !$(ev.target).closest('.video_properties_sidebar')[0]) {
			store.state.selectedContextObject = false;
			this.discardActiveTimelinesObjects();
			console.log(4);
		}
		
		if(store.state.editor.subtitles && store.state.editor.subtitles._id && store.state.editor.subtitles.data
			&& !$(ev.target).closest('.subtitles_properties_sidebar')[0]) {
			store.state.editor.subtitles = {};
			this.discardActiveTimelinesObjects();

			console.log(5);
		}

		store.state.events.clickElement = ev.target;
	}
}