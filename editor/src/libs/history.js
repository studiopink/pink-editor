import utils from './utils';
import store from '../store';
import editor from './editor';
import _ from 'lodash';

export default new class {
    constructor() {
        this.store = [];
        this.currentItem = false;
        this.localStorageKey = '_editor_project';
        this.version = '1.1.0';

        this.loadFromLocalStorage();
    }

    async loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem(this.localStorageKey));
        if (!data || data._version != this.version) return;
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));

        store.state.loader.isActive = true;
        store.state.loader.text = 'Loading your project...';
        
        this.store = data.history.data;
        this.currentItem = data.history.currentItem;
        
        store.state.projectName = data.projectName;
        store.state.selectedVideos = data.selectedVideos;
        this.setVideoPlayerData(data.videoPlayer);

        const updateInterval = setInterval(() => {
            if (editor && editor.canvas) {
                clearInterval(updateInterval);
                
                editor.importJSON(data.canvas);
                store.state.loader.isActive = false;
            }
        }, 100);
    }

    saveToLocaleStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.generateHistoryToSave()));
    }

    generateHistoryToSave() {
        return {
            history: {
                data: this.store,
                currentItem: this.currentItem
            },

            projectName: store.state.projectName,
            selectedVideos: store.state.selectedVideos,
            videoPlayer: store.state.videoPlayer,
            canvas: editor && editor.canvas ? editor.exportJSON() : {},
            _version: this.version
        };
    }

    clearHistory() {
        this.store = [];
        this.currentItem = null;
    }

    setVideoPlayerData(data) {
        let newData = _.omit(utils.cloneObject(data), 'canvasInit');
        if(newData.timelines && newData.timelines.length) {
            newData.timelines = newData.timelines.map(tl => {
                tl.active = false;
                return tl;
            });
        }

        store.state.videoPlayer = { ...store.state.videoPlayer, ...newData };
    }

    async undo() {
        const index = this.getCurrentIndex();

        const current = this.store[index];
        const item = this.store[index - 1];
        if (index == -1 || this.currentItem == 'first') return;

        switch (current.type) {
            case 'videos': {
                const videos = this.store.slice(0, index).filter(q => q.type == 'videos').reverse();
                store.state.selectedVideos = videos && videos.length ? utils.cloneObject(videos[0].data) : [];
                break;
            }

            case 'videoPlayer': {
                const videoPlayers = this.store.slice(0, index).filter(q => q.type == 'videoPlayer').reverse();
                this.setVideoPlayerData(videoPlayers && videoPlayers.length ? videoPlayers[0].data : store.state.defaultVideoPlayer);

                break;
            }

            case 'canvas': {
                const changes = this.store.slice(0, index).filter(q => q.type == 'canvas').reverse();
                const allChanges = this.store.slice(0, index)
                    .filter(q => q.type == 'canvas' || q.type == 'videoPlayer' || q.type == 'all').reverse();

                const canvasChange = changes[0];
                const videoPlayerChange = allChanges[0];

                if (canvasChange && videoPlayerChange) {
                    await editor.importJSON(canvasChange.data.json);
                    const canvasIndex = this.store.findIndex(q => q._id == canvasChange._id);
                    const playerIndex = this.store.findIndex(q => q._id == videoPlayerChange._id);

                    if (playerIndex > canvasIndex) {
                        this.setVideoPlayerData(videoPlayerChange.type == 'videoPlayer'
                            ? videoPlayerChange.data : videoPlayerChange.data.videoPlayer);

                        if (videoPlayerChange.type == 'all') {
                            await editor.importJSON(canvasChange.data.json);
                            store.state.selectedVideos = utils.cloneObject(canvasChange.data.videos);
                        }
                    } else {
                        this.setVideoPlayerData(canvasChange.data.videoPlayer);
                    }
                } else if (canvasChange) {
                    await editor.importJSON(canvasChange.data.json);
                    this.setVideoPlayerData(canvasChange.data.videoPlayer);
                } else if (videoPlayerChange) {
                    this.setVideoPlayerData(videoPlayerChange.data);

                    if (videoPlayerChange.type == 'all') {
                        await editor.importJSON(canvasChange.data.json);
                        store.state.selectedVideos = utils.cloneObject(canvasChange.data.videos);
                    }
                } else {
                    this.setVideoPlayerData(store.state.defaultVideoPlayer);
                }

                if (!canvasChange) {
                    store.state.videoPlayer.canvasInit += 1;
                }

                break;
            }

            case 'all': {
                if (item.type == 'videoPlayer') {
                    this.setVideoPlayerData(item.data.videoPlayer);
                } else if (item.type == 'videos') {
                    store.state.selectedVideos = utils.cloneObject(item.data.videos);
                } else if (item.type == 'all') {
                    await editor.importJSON(item.data.json);
                    store.state.selectedVideos = utils.cloneObject(item.data.videos);
                    this.setVideoPlayerData(item.data.videoPlayer);
                } else if (item.type == 'canvas') {
                    await editor.importJSON(item.data.json);
                    this.setVideoPlayerData(item.data.videoPlayer);
                }

                break;
            }
        }

        this.currentItem = !item ? 'first' : item._id;
    }

    async redo() {
        const index = this.getCurrentIndex();

        const next = this.store[this.currentItem == 'first' ? 0 : index + 1];
        if (index >= this.store.length - 1 || !next) return;

        switch (next.type) {
            case 'videos': {
                store.state.selectedVideos = utils.cloneObject(next.data);
                break;
            }

            case 'videoPlayer': {
                this.setVideoPlayerData(next.data);
                break;
            }

            case 'canvas': {
                this.setVideoPlayerData(next.data.videoPlayer);
                editor.importJSON(next.data.json);
                break;
            }

            case 'all': {
                this.setVideoPlayerData(next.data.videoPlayer);
                store.state.selectedVideos = utils.cloneObject(next.data.videos);
                editor.importJSON(next.data.json);
                break;
            }
        }

        this.currentItem = next._id;
    }

    getCurrentIndex() {
        const index = this.store.findIndex(data => data._id == this.currentItem);
        if (this.currentItem == 'first') return 0;
        if (!this.currentItem) return this.store.length - 1;

        return index;
    }


    isUndo() {
        return this.getCurrentIndex() >= 0 && this.currentItem != 'first';
    }

    isRedo() {
        return this.getCurrentIndex() < this.store.length - 1;
    }

    // addFull(type = 'videos', event = '') {
    //     switch(type) {
    //         case 'videos': {
    //             return this.add(utils.cloneObject(store.state.selectedVideos));
    //         }

    //         case 'player': {
    //             return this.add(utils.cloneObject(store.state.videoPlayer));
    //         }

    //         case 'subtitles': {
    //             return this.add(utils.cloneObject(store.state.videoPlayer));
    //         }
    //     }
    // }    

    add(data) {
        //console.trace();
        if (this.store.length - 1 > this.getCurrentIndex()) {
            this.store = this.store.slice(0, this.getCurrentIndex() + 1);
        }

        if (!data.data) {
            switch (data.type) {
                case 'videos': {
                    data.data = utils.cloneObject(store.state.selectedVideos);
                    break;
                }

                case 'videoPlayer': {
                    data.data = utils.cloneObject(store.state.videoPlayer);
                    break;
                }

                case 'canvas': {
                    data.data = {
                        json: utils.cloneObject(editor.exportJSON()),
                        videoPlayer: utils.cloneObject(store.state.videoPlayer)
                    };

                    break;
                }

                case 'all': {
                    data.data = {
                        json: utils.cloneObject(editor.exportJSON()),
                        videos: utils.cloneObject(store.state.selectedVideos),
                        videoPlayer: utils.cloneObject(store.state.videoPlayer)
                    };

                    break;
                }

                default:
                    return;
            }
        }

        this.store.push({ ...data, _id: utils.generateUniqID(), time: Date.now() });
        this.currentItem = null;

        this.saveToLocaleStorage();
    }
};