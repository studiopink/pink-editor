import Base from './base';
import store from '../../store';
import utils from '../utils';
import history from '../history';

export default new class extends Base {
    constructor() { super(); }

    changeObjectParamsById(data) {
        const video = store.state.selectedVideos.find(vid => vid._id == data.id);
        if(video) {
            store.state.selectedVideos = store.state.selectedVideos.map(vid => {
                if(vid._id == data.id) { vid[data.key] = data.value; }

                return vid;
            });
        } else {
            const obj = this.canvas.getObjects().find(o => o._id == data.id);
            if(obj) {
                //obj[data.key] = data.value;
    
                let upd = {};
                upd[data.key] = data.value;
                obj.set(upd);
    
                this.canvas.renderAll();
                //if(data.isUpdate) console.log('UPDATE!');
                
                if(obj.typeItem == 'text' && data.isUpdate) this.changedText(obj);

                if(data.isUpdate) { history.add({ type: 'canvas' }); }
            }
        }
    }

    removeActiveObjects() {
        const objects = this.canvas.getActiveObjects();
        if(objects && objects.length) {
            store.state.videoPlayer.timelines = store.state.videoPlayer.timelines
                .filter(line => !objects.find(o => o._id == line._id));
            
            for(const obj of objects) {
                this.canvas.remove(obj);
            }

            this.canvas.discardActiveObject()
            this.canvas.renderAll();
            history.add({ type: 'all' });
        }
    }

    async addSubtitle(subtitle) {
        const subtitlesObject = parser.fromSrt(await fetch(subtitle.url).then(res => res.text()), true).map(sub => {
            sub.endTime /= 1000;
            sub.startTime /= 1000;

            return sub;
        });

        const _id = utils.generateUniqID();
        const duration = subtitlesObject.reduce((lastTimer, item) => {
            if(lastTimer == null) {
                return item.endTime;
            } else if(item.endTime > lastTimer) {
                lastTimer = item.endTime;
            }
        
            return lastTimer;
        }, null);

        await this.addToTimeline('subtitle', subtitle, {
            time: duration, _id,
            data: subtitlesObject,
            fileType: subtitle.type,
            type: 'subtitle'
        });

        history.add({ type: 'videoPlayer' });
    }

    async addAudio(audioObject) {
        const _id = utils.generateUniqID();

        // const videoEmbed = document.getElementsByClassName('global_origin_video')[0];
        // if(!videoEmbed) return;
        // const audioElem = document.createElement('audio');
        // audioElem.setAttribute('src', audioObject.src);
        // audioElem.setAttribute('type', audioObject.fileType);
        // audioElem.setAttribute('id', `audio_${_id}`);
        // audioElem.setAttribute('class', `global_embed_audio`);
        // audioElem.setAttribute('data-timeline_id', _id);
        // videoEmbed.append(audioElem);

        await this.addToTimeline('audio', audioObject, {
            time: audioObject.meta.duration, _id,
            fileType: audioObject.type, volume: 1
        });

        history.add({ type: 'videoPlayer' });
    }

    compareRenderData(output = {}, resolution = {}) {
        return {
            videos: store.state.selectedVideos,
            timelines: store.state.videoPlayer.timelines,
            canvas:  {
                width: this.canvas.width / this.canvas.getZoom(),
                height: this.canvas.height / this.canvas.getZoom(),
                objects: this.canvas.toJSON(this.defaultExportKeys).objects
            },
            videoResolution: resolution, output
        };
    }

    showHideAnotherElements(time) {
        const diffTimeStarTime = store.state.selectedVideos.reduce((result, video) => {
            if(result.duration >= time) return result;
            result.duration += video.meta.duration;

            if(video.crop) {
                result.value += video.crop.startTime;

                if(time >= result.duration) {
                    result.value += video.meta.duration - video.crop.endTime;
                }
            }

            return result;
        }, { value: 0, duration: 0 }).value;

        const realTimer = (time - diffTimeStarTime);
        const timelines = store.state.videoPlayer.timelines;

        // hide all canvas elements
        const objects = this.canvas.getObjects();
        let isChanged = false;
        for (const timeline of timelines) {
            const obj = objects.find(o => o._id == timeline._id);
            const isActive = timeline.perTime <= realTimer && (timeline.perTime + timeline.time) >= realTimer;
            if (obj || !timeline._id) {
                if (isActive != obj.visible) {
                    isChanged = true;
                }

                obj.visible = isActive;
            } else {
                switch (timeline.type) {
                    case 'audio': {
                        const element = document.getElementById(`audio_${timeline._id}`);
                        const isPlay = store.state.videoPlayer.isPlay;
                        if (isActive) {
                            if (isPlay) {
                                element.play();
                            } else if (!element.paused) {
                                element.pause();
                            }
                        } else {
                            element.pause();
                        }

                        break;
                    }

                    case 'subtitle': {
                        const text = timeline.data.reduce((txt, item) => {
                            if(item.startTime + timeline.perTime <= realTimer
                                && item.endTime + timeline.perTime >= realTimer) {
                                return item.text.replace(/\\n/g, '<br>');
                            }

                            return txt;
                        }, null);


                        store.state.videoPlayer.subtitlesText = text;
                        break;
                    }
                }
            }
        }

        if (isChanged) {
            // console.log('RENDER');
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
        }
    }
};