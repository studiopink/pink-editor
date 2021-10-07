const config = require('../../../config');

module.exports = new class {
    loadFonts(objects) {
        const localFonts = [
            { name: 'Grand Hotel', src: 'Grand-Hotel.ttf' },
            { name: 'Open Sans', src: 'OpenSans-Regular.ttf' },
            { name: 'Ballet', src: 'Ballet.ttf' },
            { name: 'Hanalei', src: 'Hanalei.ttf' },
            { name: 'Monoton', src: 'Monoton.ttf' },
            { name: 'Montserrat', src: 'Montserrat.ttf' },
            { name: 'Reggae One', src: 'Reggae-One.ttf' }
        ];

        const texts = objects.filter(obj => obj.type == 'textbox');
        const uniqFonts = texts.reduce((fonts, text) => {
            if (!fonts.find(font => font == text.fontFamily)) {
                fonts.push(text.fontFamily);
            }

            return fonts;
        }, []);

        return uniqFonts.map(font => localFonts.find(f => f.name.toLowerCase() == (font || '').toLowerCase()))
            .filter(f => f).map(font => ({ src: `${config.domain}/fonts/${font.src}` }));
    }

    generateSubtitles() {
        clip = {
            start: q.perTime,
            length: q.time,
            asset: {
                type: 'title',
                style: 'subtitle',
                text: 'Test subtitle\nnext subtitle',
                color: '#ffffff',
                background: '#000000',
                position: 'bottom'
            },
        };
    }

    parseVideosToClips(videos = []) {
        return videos.reduce((result, video, index) => {
            result.push({
                asset: {
                    type: 'video',
                    src: video.src,
                    volume: 1,
                    trim: video.crop ? video.crop.startTime : 0,
                },

                ...this.payloadTransition(video),
                start: this.getVideoStartTimeByVideoIndex(videos, index),
                length: video.crop ? (video.crop.endTime - video.crop.startTime) : video.meta.duration,
                position: 'center'
            });

            return result;
        }, []);
    }

    getVideoStartTimeByVideoIndex(videos = [], indexVideo) {
        return videos.reduce((result, video, index) => {
            if (index < indexVideo) {
                if(video.crop) {
                    result += (video.crop.endTime - video.crop.startTime);
                } else {
                    result += video.meta.duration;
                }
            }

            return result;
        }, 0);
    }

    parseSubtitles(timelines, opts) {
        const subtitles = timelines.filter(sub => sub.type == 'subtitle');
        if (!subtitles) return [];
        const result = [];

        for (const sub of subtitles) {
            for (const item of sub.data) {
                const { realVideoWidth, realVideoHeight } = this.getVideoSize(opts, true);
                const scale = Math.min(
                    opts.canvas.width / realVideoWidth,
                    opts.canvas.height / realVideoHeight
                );

                const fontSize = 10 / (300 / (realVideoHeight));

                const textSplited = item.text.split('\n');
                
                const w = realVideoWidth * .8;
                const h = (textSplited.reduce(result => {
                    if(!result) {
                        return fontSize + (fontSize * .16) * 2;
                    } else {
                        result += fontSize + (fontSize * .16) * 2;
                    }

                    return result;
                }, null) || fontSize) + 6;

                //console.log(fontSize, realVideoWidth * .8,);
                //throw Error();
                result.push({
                    asset: {
                        type: 'html',
                        html: `<div class="content">
                            <span class="sp">${textSplited.join('<br>')}</span>
                        </div>`,
                        css: `.content {
                            text-align: center;
                            color: #ffffff;
                            padding: 3px;
                            display: inline-block;
                            position: absolute;
                            font-size: ${parseInt(fontSize)}px;
                        }
                        
                        .sp {
                            background: #000000;
                        }`,
                        width: realVideoWidth * .8,
                        position: 'bottom',
                    },
                    start: sub.perTime + item.startTime,
                    length: (item.endTime - item.startTime),
                    offset: {
                        x: 0,
                        y: 0
                    }
                });
            }
        }

        return result;
    }

    parseTimeLinesToClips(timelines = [], objects = [], opts = {}) {
        return timelines.map(q => {
            let clip = false;
            let opacity = Number(q.opacity);
            
            const obj = objects.find(o => o._id == q._id);
            if(obj) opacity = Number(obj.opacity);

            opacity = opacity == 0 || opacity ? opacity : 1;

            if (/^(audio)/g.test(q.fileType)) {
                q.volume = Number(q.volume);

                clip = {
                    asset: {
                        type: 'audio',
                        src: q.src,
                        volume: (q.volume || q.volume == 0 ? q.volume : 1),
                        trim: (q.crop ? (q.crop.min || 0) : 0)
                    },
                    start: q.perTime,
                    length: q.time
                };
            }

            if (/^(image)/g.test(q.fileType)) {
                clip = {
                    asset: {
                        type: 'image',
                        src: q.src,
                    },
                    start: q.perTime,
                    length: q.time,
                    position: 'topLeft',
                    opacity,
                    ...this.payloadTransition(obj),
                    ...this.getSizeImageById(q._id, objects, opts)
                };
            }

            if (/^(text)/g.test(q.fileType)) {
                clip = {
                    ...this.generateTextAsset(q, objects, opts),
                    opacity, ...this.payloadTransition(obj),
                };
            }


            return clip;
        }).filter(q => q);
    }

    payloadTransition(obj) {
        if(!obj) return {};
        const result = {};

        if(obj._effect) result.effect = obj._effect;
        if(obj._filter) result.filter = obj._filter;

        if(obj._transition_in || obj._transition_out) {
            result.transition = {};

            if(obj._transition_in) result.transition.in = obj._transition_in;
            if(obj._transition_out) result.transition.out = obj._transition_out;
        }

        return result;
    }

    generateTextAsset(q, objects, opts) {
        const obj = objects.find(o => o._id == q._id);
        if (!obj) return {};

        const { realVideoWidth, realVideoHeight } = this.getVideoSize(opts, true);
        const scale = Math.min(
            opts.canvas.width / realVideoWidth,
            opts.canvas.height / realVideoHeight
        );

        const fontSize = parseInt((obj.fontSize * obj.scaleX) / scale);
        const w = (obj.width * obj.scaleX) / scale;
        const h = (obj.height * obj.scaleX) / scale;

        const result = {
            asset: {
                // background: '#ffff00',
                type: 'html',
                html: `<p>${obj.textLines.join('<br>')}</p>`,
                //width: w,
                // height: h,
                width: realVideoWidth, height: h,
                css: `p {
                    display: block;
                    font-size: ${fontSize}px;
                    text-align: left;
                    font-weight: ${obj.fontWeight || 'normal'};
                    color: ${obj.fill};
                    font-family: ${obj.fontFamily};
                }`
            },
            start: q.perTime,
            length: q.time,
            position: 'topLeft',
            scale: 1,
            offset: {
                x: obj.left / opts.canvas.width,
                y: (obj.top / opts.canvas.height) * -1
            }
        };

        //throw Error('debug');
        return result;
    }

    getVideoSize(opts, isAspect) {
        const isOriginalSize = opts.aspectRatio == '16:9';

        let realVideoWidth = opts.resolution.w;
        let realVideoHeight = opts.resolution.h;

        const aspc = opts.aspectRatio.split(':');
        const scaleAspect = Number(aspc[0]) / Number(aspc[1]);

        if (!isOriginalSize && isAspect) {
            realVideoWidth = opts.resolution.h;
            realVideoHeight = opts.resolution.h / scaleAspect;
        }

        return { realVideoWidth, realVideoHeight };
    }

    getSizeImageById(id, objects = [], opts = {}) {
        const obj = objects.find(o => o._id == id);
        if (!obj) return {};

        return (function () {
            const w = opts.canvas.width;
            const h = opts.canvas.height;

            return {
                scale: Math.min((obj.width * obj.scaleX) / w, (obj.height * obj.scaleY) / h),
                offset: {
                    x: obj.left / w,
                    y: (obj.top / h) * -1
                }
            };
        })();
    }
};