import history from '../history';
import store from '../../store';
import utils from '../utils';
import _ from 'lodash';

window._ = _;
export default class {
    constructor() {
        this.defaultExportKeys = [
            '_id', '_scaleToCanvas', 'scaleX', 'typeItem',
            'scaleY', 'width', 'height', 'alpha', 'color', '_controlsVisibility',
            'left', 'top', 'fontSize', 'fontFamily', 'textLines',
            'opacity', '_effect', '_filter', '_transition_in', '_transition_out',
            '_sizeCanvas'
        ];

        this.history = history;
        this.lockImages = [];
    }

    exportJSON() {
        return {
            ...this.canvas.toJSON(this.defaultExportKeys),
            zoom: this.canvas.getZoom()
        };
    }

    async importJSON(json) {
        this.blockChanges = true;
        const width = this.canvas.width;
        const height = this.canvas.height;

        const zoom = this.canvas.getZoom();
        return new Promise((resolve => {
            editor.canvas.loadFromJSON(_.omit(json, ['width', 'height', 'zoom']), () => {
                editor.canvas.renderAll();

                this.blockChanges = false;
                this.discardActiveObject();
                resolve();
            }, function (o, object) {
                const objectWidth = object.scaleX * object.width;
                const objectHeight = object.scaleY * object.height;

                const realSizeW = objectWidth * json.zoom;
                const realSizeH = objectHeight * json.zoom;

                const newWidth = realSizeW * (width / json.width) / zoom;
                const newHeight = realSizeH * (height / json.height) / zoom;
                object.set({
                    scaleX: newWidth / object.width,
                    scaleY: newHeight / object.height,
                });
            });
        }));
    }

    setActiveObjectById(id) {
        const obj = this.canvas.getObjects().find(o => o._id == id);
        if (obj) {
            this.canvas.setActiveObject(obj).renderAll();
        }
    }

    destroyCanvas() {
        this.canvas.clear();
        this.canvas.dispose();
    }

    initialCanvas(elementId = 'videoEmbedCanvas', options = {}) {
        this.canvas = new fabric.Canvas(elementId, options);

        this.canvas.on('selection:created', e => this.onSelect(e));
        this.canvas.on('selection:updated', e => this.onSelect(e));
        this.canvas.on('selection:cleared', e => this.onClearedSelect(e));
        this.canvas.on('object:removed', e => this.removeObject(e));

        this.canvas.on('text:changed', e => this.changedText(e.target));
        this.canvas.on('object:modified', e => {
            if(!this.blockChanges) {
                history.add({ type: 'canvas' });
            }
        });
    }

    removeObject(ev) {
        if(ev && ev.target && ev.target._id) {
            store.state.videoPlayer.texts = store.state.videoPlayer.texts
                .filter(text => text._id != ev.target._id);
        }
    }

    changedText(text) {
        if (!text || this.blockChanges) return;
       
        const payload = {
            value: text.text,
            fill: text.fill,
            _id: text._id
        };

        let isUpdated = false;
        store.state.videoPlayer.texts = store.state.videoPlayer.texts.map(txt => {
            if (txt._id == text._id) {
                isUpdated = true;

                return payload;
            }

            return txt;
        });

        if (!isUpdated) store.state.videoPlayer.texts.push(payload);
    }

    discardActiveObject() {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
    }

    onSelect(ev) {
        if (ev && ev.selected) {
            store.state.videoPlayer.timelines = store.state.videoPlayer.timelines.map(line => {
                if (ev.selected.find(sel => sel._id == line._id)) {
                    line.active = true;
                } else {
                    line.active = false;
                }

                return line;
            });
        }
    }

    onClearedSelect(ev) {
        store.state.selectedContextObject = null;
        if (!ev.deselected || !ev.deselected.length) return;

        store.state.videoPlayer.timelines = store.state.videoPlayer.timelines.map(line => {
            if (ev.deselected.find(sel => sel._id == line._id)) {
                line.active = false;
            }

            return line;
        });
    }

    resizeCanvas(size = {}, aspect = false) {
        if (aspect) {
            const currentZoom = this.canvas.getZoom() //|| 1;
            const scale = Math.min(
                size.width / (this.canvas.width / currentZoom),
                size.height / (this.canvas.height / currentZoom),
            );

            this.canvas.setZoom(scale);
        }

        this.canvas.setWidth(size.width);
        this.canvas.setHeight(size.height);
    }

    async imageFromURL(url = '', options = {}) {
        return new Promise(resolve => fabric.Image.fromURL(url, resolve, { ...options, crossOrigin: 'anonymous' }));
    }

    cloneObjectById(id, newId) {
        const object = this.canvas.getObjects().find(obj => obj._id == id);
        if (object) {
            const clone = fabric.util.object.clone(object);
            clone.set({ _id: newId });

            this.canvas.add(clone).renderAll();
            history.add({ type: 'canvas' });

            this.canvas.setActiveObject(clone).renderAll();
        }
    }

    deleteObjectById(id) {
        store.state.videoPlayer.timelines = store.state.videoPlayer.timelines
            .filter(line => line._id != id);

        const object = this.canvas.getObjects().find(obj => obj._id == id);
        if (object) {
            this.canvas.remove(object);
            this.canvas.renderAll();
        }

        history.add({ type: 'all' });
    }

    addText(data, timeline = {}) {
        const text = new fabric.Textbox(data.text, {
            fontFamily: data.fontFamily,
            fontWeight: data.fontWeight || 'normal',
            _id: utils.generateUniqID(),
            _controlsVisibility: { tl: true, ml: true, bl: true, mb: false, br: true, mr: true, mt: false, mtr: false }
        });

        const canvasWidth = this.canvas.width / this.canvas.getZoom();
        const canvasHeight = this.canvas.height / this.canvas.getZoom();
        const scale = Math.min(
            (canvasWidth * .8) / text.width,
            (canvasHeight * .8) / text.height
        );

        text.set({
            typeItem: 'text',
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - (text.width * scale)) / 2,
            top: (canvasHeight - (text.height * scale)) / 2,
            lockScalingFlip: true
        });

        this.canvas.add(text);

        this.addToTimeline('text', { ...data, _id: text._id, fileType: 'text/plain' }, timeline);

        store.state.videoPlayer.texts.push({
            value: text.text,
            fill: text.fill,
            _id: text._id
        });

        history.add({ type: 'canvas' });
        this.canvas.renderAll();

        this.canvas.setActiveObject(text).renderAll();
    }

    setupLogoMode(logo, mode = '') {
        const canvasWidth = this.canvas.width / this.canvas.getZoom();
        const canvasHeight = this.canvas.height / this.canvas.getZoom();

        switch (mode) {
            case 'contain': {
                const scale = Math.min(
                    (canvasWidth) / logo.width,
                    (canvasHeight) / logo.height
                );

                return {
                    scaleX: scale,
                    scaleY: scale,
                    left: (canvasWidth - (logo.width * scale)) / 2,
                    top: (canvasHeight - (logo.height * scale)) / 2,
                    _scaleToCanvas: scale,
                    _sizeCanvas: {
                        w: this.canvas.width,
                        h: this.canvas.height
                    },
                };
            }
        }

        const scale = Math.min(
            (canvasWidth * .8) / logo.width,
            (canvasHeight * .8) / logo.height
        );

        return {
            scaleX: scale, scaleY: scale,
            _scaleToCanvas: scale,
            _sizeCanvas: {
                w: this.canvas.width,
                h: this.canvas.height
            },
            left: (canvasWidth - (logo.width * scale)) / 2,
            top: (canvasHeight - (logo.height * scale)) / 2
        };
    }

    async addLogo(imageData, timeline = {}, mode = 'center') {
        store.state.loader.text = 'Downloading image...';
        store.state.loader.isActive = true;
        const _id = utils.generateUniqID();

        store.state.loader.cancel = () => {
            if (confirm('Are you sure you want to cancel the download?')) {
                this.lockImages.push(_id);
                store.state.loader.cancel = false;
                store.state.loader.isActive = false;
                store.state.loader.cancel = null;
            }
        }

        try {
            if (!imageData) return;
            const file = store.state.files.find(file => file.id == imageData.id);

            if (!file) return;
            imageData = file;
            const logo = await this.imageFromURL(imageData.src || imageData.img, { _id });

            if (this.lockImages.find(li => li == _id)) {
                console.warn(`Image ${_id} loaded!`);
                return;
            }

            logo.set({
                ...this.setupLogoMode(logo, mode),
                lockScalingFlip: true,
                typeItem: 'logo',
                _controlsVisibility: { tl: true, ml: false, bl: true, mb: false, br: true, mr: false, mt: false, mtr: false }
            });

            this.canvas.add(logo).renderAll();

            this.addToTimeline('logo', { ...imageData, _id: logo._id, fileType: imageData.type }, timeline);
            history.add({ type: 'canvas' });

            this.canvas.setActiveObject(logo).renderAll();
        } catch (err) {
            console.error(err);
        }

        store.state.loader.isActive = false;
    }

    async addToTimeline(type = '', obj = {}, timeline = {}) {
        const duration = utils.getSelectedVideoDuration();
        const isIntro = !!store.state.selectedVideos.find(vid => vid.isIntro);
        let perTime = utils.calculateRangeTrackRow(store.state.videoPlayer.timeLinePosition - (!isIntro ? 320 : 0));
        //store.state.videoPlayer.time;
        let time = timeline.time || 5;
        
        if(perTime + time > duration) {
            perTime = duration - time;
            if(perTime < 0) {
                perTime = 0;
                time = duration;
            }
        }

        const data = { ...obj, type, ...timeline, perTime, time };
        store.state.videoPlayer.timelines = [...store.state.videoPlayer.timelines, data];
        return store.state.videoPlayer.timelines
    }
}