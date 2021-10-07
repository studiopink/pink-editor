import Vue from 'vue'
import Vuex from 'vuex'
import utils from '../libs/utils';
import API from '../providers/api';
import history from '../libs/history';

// $('.upper-canvas').on('contextmenu', function (e) {
//     e.preventDefault();
//     window.ctxTarget = editor.canvas.findTarget(e.originalEvent);
// });
Vue.use(Vuex)

const videoPlayer = {
    format: 'landscape',
    subtitlesText: '',
    time: 0,
    canvasInit: 0,
    volume: 1,
    timelines: [],
    rewind: {
        backward: 0,
        forward: 0
    },
    printTime: '00:00:00',
    timeLinePosition: 320,
    preload: false,
    texts: []
};

export default new Vuex.Store({
    state: {
        stepNumber: 1,
        mouse: {
            x: 0,
            y: 0
        },
        events: {
            clickElement: null
        },
        
        projectName: 'My Campaign Name',
        tutorialSteps: [{
            title: 'How to Step #1',
            youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            step: 1,
            preview: require('@/assets/img/right_step_item.jpg')
        }, {
            title: 'How to Step #2',
            youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            step: 2,
            preview: require('@/assets/img/right_step_item.jpg')
        }, {
            title: 'How to Step #3',
            youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            step: 3,
            preview: require('@/assets/img/right_step_item.jpg')
        }, {
            title: 'How to Step #4',
            youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            step: 4,
            preview: require('@/assets/img/right_step_item.jpg')
        }, {
            title: 'How to Step #5',
            youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            step: 5,
            preview: require('@/assets/img/right_step_item.jpg')
        }],

        defaultVideoPlayer: JSON.parse(JSON.stringify(videoPlayer)),
        messages: {
            waitingVideo: ['First you need to download or select from the list of video downloads!', '', 'warning']
        },

        selectedContextObject: null,
        keys: [],
        renderId: null,
        localStorageConfig: {
            files: 'files_data',
            subtitles: 'subtitles'
        },
        loader: {
            isActive: false,
            text: ''
        },

        historyChanges: [],
        modals: {
            export: 0
        },

        sizeWorkSpace: { width: 0, height: 0 },

        files: [],
        texts: [{
            text: 'HEADLINE TEXT',
            title: 'HEADLINE TEXT',
            fontFamily: 'Open Sans',
            fontWeight: 600
        }, {
            text: 'Regular Text',
            title: 'Regular Text',
            fontFamily: 'Open Sans',
        }, {
            text: 'Grand Hotel',
            title: 'Grand Hotel',
            fontFamily: `Grand Hotel`,
        }, {
            text: 'Hanalei',
            title: 'Hanalei',
            fontFamily: `Hanalei`,
        }, {
            text: 'Monoton',
            title: 'Monoton',
            fontFamily: `Monoton`,
        }, {
            text: 'Montserrat',
            title: 'Montserrat',
            fontFamily: `Montserrat`,
        }, {
            text: 'Reggae One',
            title: 'Reggae One',
            fontFamily: `Reggae One`,
        }],
        playUserAudio: false,
        selectedVideos: [],
        videoPlayer: JSON.parse(JSON.stringify(videoPlayer)),
        subtitles: [],
        editor: {
            subtitles: {},
            audio: {}
        },

        activeCropVideo: null
    },

    mutations: {},

    actions: {
        openSubtitlesEditor({ state }, { data }) {
            state.editor.subtitles = data;
        },

        async addSubtitle({ dispatch, state }, data) {
            const subs = await dispatch('getStorageFiles', 'subtitles');
            subs.push(data);

            localStorage.setItem(state.localStorageConfig.subtitles, JSON.stringify(subs));
            store.state.subtitles = subs;

            return subs;
        },

        async deleteVideoById({ state, dispatch }, videoId) {
            const videos = state.selectedVideos.filter(video => video._id != videoId);

            if (!videos.length) {
                if (confirm('Clean up the project?')) {
                    await dispatch('defaultVideoPlayer', true);
                }
            } else {
                state.selectedVideos = videos;

                history.add({ type: 'videos' });
            }
        },

        addVideo({ state }, { video, append }) {
            video = JSON.parse(JSON.stringify(video));

            video._step = video.meta.duration / video.thumbs.length;
            const videoId = utils.generateUniqID();
            video._id = videoId;

            if (video.isIntro) {
                const isIntro = state.selectedVideos.find(video => video.isIntro);
                console.log(isIntro, 'WTF');
                if (!isIntro) {
                    store.state.videoPlayer.timelines = store.state.videoPlayer.timelines.map(timeline => {
                        timeline.perTime += video.meta.duration;
                        return timeline;
                    });
                }

                state.selectedVideos = [video, ...state.selectedVideos.filter(video => !video.isIntro)];
            } else if (video.isOutro) {
                state.selectedVideos = [...state.selectedVideos.filter(video => !video.isOutro), video];
            } else {
                if (append) {
                    const autroVideos = state.selectedVideos.filter(q => q.isOutro);
                    if (autroVideos && autroVideos.length) {
                        state.selectedVideos = [
                            ...state.selectedVideos.filter(q => !q.isOutro),
                            video, ...autroVideos
                        ];
                    } else {
                        state.selectedVideos.push(video);
                    }
                } else {
                    state.selectedVideos = [video];
                }
            }

            history.add({ type: 'videos' });
        },

        defaultVideoPlayer({ state }, isResetAll = false) {
            state.videoPlayer = {
                ...JSON.parse(JSON.stringify(videoPlayer)),
                canvasInit: state.videoPlayer.canvasInit + 1
            };

            if (isResetAll) {
                store.state.selectedVideos = [];
                store.state.subtitles = [];

                history.clearHistory();
            } else {
                // TODO: in history
            }
        },

        async refreshStoreFiles({ dispatch, state }) {
            const localStorageFiles = await dispatch('getStorageFiles');
            const localStorageSubtitles = await dispatch('getStorageFiles', 'subtitles');

            state.files = localStorageFiles;
            state.subtitles = localStorageSubtitles;
        },

        getStorageFiles({ state }, storeName = 'files') {
            try {
                return JSON.parse(localStorage.getItem(state.localStorageConfig[storeName])) || [];
            } catch (err) { return state.files || []; }
        },

        async updateFileById({ state, dispatch }, data) {
            let localStorageFiles = await dispatch('getStorageFiles') || state.files;

            localStorageFiles = localStorageFiles.map(file => {
                if (file.id == data.id) {
                    file = { ...file, ...data.data };
                }

                return file;
            });

            localStorage.setItem(state.localStorageConfig.files, JSON.stringify(localStorageFiles));
            state.files = localStorageFiles;
        },

        async addFile({ state, dispatch }, file) {
            try {
                state.loader.isActive = true;
                state.loader.text = 'Uploading 0%';
                state.loader.cancel = () => {
                    if (confirm('Do you want to interrupt the video upload process?')) {
                        state.loader.cancel = false;
                        state.loader.isActive = false;
                    }
                };

                const result = await API.uploadFile(file, e => {
                    const proc = ((e.loaded / e.total) * 100);
                    if (proc >= 100) {
                        state.loader.text = `File processing...`;
                    } else {
                        state.loader.text = `Uploading ${proc.toFixed(2)}%`;
                    }
                });
                if (!result.success) {
                    state.loader.isActive = false;
                    state.loader.cancel = false;
                    return; // TODO: handle error
                }

                const files = await dispatch('getStorageFiles');
                files.push(result.data);
                localStorage.setItem(state.localStorageConfig.files, JSON.stringify(files));
                state.files = files;

                state.loader.isActive = false;
                state.loader.cancel = false;

                return result.data;
            } catch (err) {
                state.loader.isActive = false;
                state.loader.cancel = false;
                swal('An error has occurred', 'No video has been added', 'error');

                return null;
            }
        },

        async removeSubtitleFileById({ state, dispatch }, fileId) {
            let localStorageFiles = await dispatch('getStorageFiles', store.state.localStorageConfig.subtitles) || state.files;

            localStorageFiles = localStorageFiles.filter(file => file.file_id != fileId);
            localStorage.setItem(state.localStorageConfig.subtitles, JSON.stringify(localStorageFiles));
            store.state.subtitles = localStorageFiles;
        },

        async removeFileById({ state, dispatch }, fileId) {
            let localStorageFiles = await dispatch('getStorageFiles') || state.files;

            localStorageFiles = localStorageFiles.filter(file => file.id != fileId);
            localStorage.setItem(state.localStorageConfig.files, JSON.stringify(localStorageFiles));
            state.files = localStorageFiles;
        },

        loaderStatus({ state }, data = {}) {
            state.loader = data;
        }
    },

    modules: {}
})