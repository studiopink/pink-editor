const axios = require('axios');
const config = require('../../../config');
const utils = require('./utils');

const subStorage = require('../../io/subscribeStorage');

const URL = process.env.SHOTSTACK_API;
const API_KEY = process.env.SHOTSTACK_API_KEY;

module.exports = new class {
    async getStatusBuild(renderId) {
        const result = await this.send('/render/' + renderId, {}, 'GET');
        if(result.success && result.response && result.response.status == 'done') {
            return result.response;
        }
        
        return null;
    }

    emitRender(data) {
        const subscribe = subStorage.find(data.id);
        if(subscribe && global.io.engine.clients[subscribe.socketId]) {
            global.io.to(subscribe.socketId).emit('render_done', {
                id: data.id,
                url: data.url,
                poster: data.poster,
                thumbnail: data.thumbnail
            });

            subStorage.removeSubscribe(data.id);
        }
    }

    async render(data = {}) {
        try {
            data.canvas.objects = data.canvas.objects.reverse();

            const callback = `${config.domain}/api/hook/render`;
            const videosClips = utils.parseVideosToClips(data.videos);

            let subtitles = utils.parseSubtitles(data.timelines, {
                canvas: data.canvas,
                resolution: data.videoResolution,
                aspectRatio: data.output.aspectRatio
            });

            subtitles = subtitles && subtitles.length ? [{ clips: subtitles }] : [];
            const timelineClips = utils.parseTimeLinesToClips(data.timelines, data.canvas.objects, {
                canvas: data.canvas,
                resolution: data.videoResolution,
                aspectRatio: data.output.aspectRatio
            });

            const timelines =  (timelineClips.length ? timelineClips.reverse().map(timeLine => ({ clips: [timeLine] })) : []);
            const videoDuration = utils.getVideoStartTimeByVideoIndex(data.videos, data.videos.length);
            
            const build = {
                timeline: {
                    fonts: utils.loadFonts(data.canvas.objects),
                    background: data.output.backgroundColor || "#000000",
                    tracks: [
                        ...subtitles,
                        ...timelines,
                        { clips: [ ...videosClips ] }
                    ]
                },
                output: {
                    format: data.output.type,
                    resolution: data.output.resolution,
                    aspectRatio: data.output.aspectRatio,
                    fps: data.output.fps,
                    range: {
                        start: 0,
                        length: videoDuration
                    },
                    poster: {
                        capture: videoDuration * .2
                    },
                    thumbnail: {
                        capture: videoDuration / 2,
                        scale: 0.3
                    }
                }, callback
            };

            try {
                const result = await this.send('/render', build, 'POST');

                return { success: result.success, id: result.response.id };
            } catch(err) {
                if(err.response && err.response.data && err.response.data.response) {
                    return {
                        success: false,
                        error: 'Bad request',
                        data: err.response.data.response
                    };
                }

                console.log(err);

                return { success: false, error: 'Bad request' };
            }
        } catch (err) {
            if(err.message != 'debug') {
                console.error(err);
            }
            
            return { success: false, error: 'Some error' };
        }
    }

    async send(endpoint = '', data = {}, method = 'POST', payloadHeaders = {}) {
        const result = await axios({
            method, url: URL + endpoint, headers: {
                'x-api-key': API_KEY,
                ...payloadHeaders
            }, data
        });

        return result.data
    }
};