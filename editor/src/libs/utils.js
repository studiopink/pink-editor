import { uuid } from 'vue-uuid';
import store from '../store';
import CustomRecorder from './recorder';

export default new class {
    constructor() {
        this.CustomRecorder = CustomRecorder;
        this._idsCache = [];
    }
    
    timeFromString(time) {
        const tt = time.split(":");
        if(tt.length == 3 && tt.reduce((isValid, item) => {
            if(item.length != 2 || (!Number(item) && Number(item) != 0)) return false;

            return isValid;
        }, true)) {
            return tt.reduce((time, item, index) => {
                switch(index) {
                    case 0: return time += Number(item) * 60;
                    case 1: return time += Number(item);
                    case 2: return time += Number(item) / 100;
                }

                return time;
            }, 0);
        } else {
            return null;
        }
    }

    cloneObject(data) {
        return JSON.parse(JSON.stringify(data));
    }

    generateUniqID() {
        const uid = uuid.v4();
        return this._idsCache.find(id => id == uid) ? this.generateUniqID() : uid;
    }

    getSelectedVideoDuration() {
        return store.state.selectedVideos.reduce((duration, video) => {
            duration += video.crop ? video.crop.endTime - video.crop.startTime : video.meta.duration;
            
            return duration;
        }, 0);
    }

    parseSeconds(sec = 0) {
        let m = parseInt((sec / 60));// - (sec % 60);
        m = m <= 0 ? 0 : m;

        let s = sec - (m * 60);
        const c = ((s - parseInt(s)) * 100);

        return {
            m: parseInt(m).toString().padStart(2, '0'),
            s: parseInt(s).toString().padStart(2, '0'),
            c: Math.round(c).toString().substr(0, 2).padStart(2, '0'),

            toTime() {
                return `${this.m}:${this.s}`;
            },

            toString() {
                return `${this.m}:${this.s}:${this.c}`;
            }
        };
    }

    calculateCropTimes(video, crop = null) {
        if (!crop) { crop = video.crop; }

        let startTime = 0;
        let endTime = video.meta.duration;

        if (crop) {
            const duration = video.meta.duration;
            const maxWidth = video.thumbs.length * 80;

            const scale = (crop.left / maxWidth);
            startTime = duration * scale;

            const scaleEnd = (crop.left + crop.width) / maxWidth;
            endTime = duration * scaleEnd;
        }

        return { startTime, endTime };
    }

    parseVideos(videos = []) {
        return {
            duration: videos.map(video => (video.meta.duration /* this.getVideoDuration(video) */) * 1000).reduce((res, item) => res + item, 0) || 0,
            thumbs: videos.reduce((res, item) => {
                res.push(...item.thumbs.map((th, index, arr) => ({
                    ...th, id: item.id,
                    duration: /* this.getVideoDuration(item) */item.meta.duration,
                    isLast: index == (arr.length - 1)
                })));

                return res;
            }, []) || []
        };
    }

    getSelectedVideoByTimeDuration(videoObjects = [], timeDuration, isFull = false) {
        let time = 0;
        let resultVideo = videoObjects[videoObjects.length - 1];
        let index = 0;
        let videoStep = 0;

        for (const video of videoObjects) {
            videoStep = video.thumbs[0].time;

            if (time + /* this.getVideoDuration(video) */video.meta.duration > timeDuration) {
                resultVideo = video;
                break;
            }

            index += 1;
            time += /* this.getVideoDuration(video) */video.meta.duration;
        }

        if (isFull) {
            return { time, index, video: resultVideo, videoStep };
        } else {
            return resultVideo;
        }
    }

    calculatePositionLeftByTime(timer = 0, preLeft = 0) {
        return store.state.selectedVideos.reduce((res, video, index) => {
            if (res.lock) return res;

            const duration = video.crop ? video.crop.endTime - video.crop.startTime : video.meta.duration;
            const newTimer = res.duration + duration;
            if (newTimer < timer) {
                res.duration += duration;
                res.left += video.crop ? video.crop.width : (duration * 80 / video._step);
            } else {
                if(video.crop) {
                    const diff = timer - res.duration;
                    const duration = video.crop.endTime - video.crop.startTime;

                    res.left += (diff / duration) * video.crop.width;
                } else {
                    const diff = timer - res.duration;
                    res.left += (diff * 80 / video._step);
                }

                res.lock = true;
            }

            return res;
        }, { duration: 0, left: preLeft, lock: false }).left;
    }

    getVideoDuration(video) {
        if (video.crop) {
            return video.crop.endTime - video.crop.startTime;
        } else {
            return video.meta.duration;
        }
    }

    calculateRangeTrackRow(lineLeft) {
        let timer = 0;
        let currentTime = 0;
        let left = 0;

        if (lineLeft >= 0) {
            for (let q = 0; q < store.state.selectedVideos.length; q++) {
                const video = store.state.selectedVideos[q];
                const videoWidth = video.crop ? video.crop.width : (video.meta.duration / video._step) * 80;

                const duration = video.crop ? video.crop.endTime - video.crop.startTime : video.meta.duration;
                if (left + videoWidth > lineLeft) {
                    currentTime = ((lineLeft - left) / videoWidth) * duration;
                    timer += currentTime;
                    break;
                } else if (q == store.state.selectedVideos.length - 1) {
                    timer += duration;
                } else {
                    timer += duration;
                    left += videoWidth;
                }
            }
        }

        return timer;
    }

    aspectRatioSize(aspect = 1, maxSize = {}) {
        const videoSizes = store.state.selectedVideos.map(q => ({ width: Number(q.meta.imageWidth), height: Number(q.meta.imageHeight) }));;

        const maxWidth = Math.max(...videoSizes.map(q => q.width));
        const maxHeight = Math.max(...videoSizes.map(q => q.height));

        //const
        console.log(maxWidth, maxHeight);
        return 1;
    }
};