const fs = require('fs');
const ObjectId = require('bson-objectid');
const mime = require('mime');
const config = require('../../../config');
const exif = require('exiftool');
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const { getVideoDurationInSeconds } = require('get-video-duration');
const child_process = require('child_process');
const imageThumbnail = require('image-thumbnail');

module.exports = {
    async uploadSubtitles(req) {
        const filename = req.body.filename;

        const validType = [{
            ext: '.srt',
            mime: 'application/x-subrip',
            regexp: /(\.srt)$/g
        }];

        const dataBuffer = Buffer.from(req.body.b64, 'base64');
        const fileType = validType.find(vtype => vtype.regexp.test(filename));
        if (fileType) {
            const DIR = `${process.cwd()}/public/storage/subtitles`;
            const FILE_ID = `${ObjectId()}`;
            const FILE_NAME = `${FILE_ID}.${fileType.ext}`;

            if (!fs.existsSync(DIR)) {
                fs.mkdirSync(DIR);
            }

            fs.writeFileSync(`${DIR}/${FILE_NAME}`, dataBuffer);
            return {
                success: true,
                data: {
                    url: `${config.domain}/storage/subtitles/${FILE_NAME}`,
                    file_id: FILE_ID
                }
            };
        } else {
            return { success: false, message: 'File type not allowed!' };
        }
    },

    async uploadFile(req = {}) {
        let result = { success: true };

        try {
            const fileType = req.headers['content-type'];
            const sufix = '.' + mime.getExtension(fileType);
            const store = `${process.cwd()}/public/storage/video`;

            if (!fs.existsSync(store)) {
                fs.mkdirSync(store);
            }

            const id = ObjectId();

            const filename = `${id}${sufix}`;
            const filePath = `${store}/${filename}`;
            await new Promise(resolve => fs.writeFile(filePath, req.body, 'utf-8', () => resolve()));
            const fileDir = `${store}/file_data_${id}`;
            fs.mkdirSync(fileDir);

            const metaFile = `${fileDir}/metadata.txt`;
            await new Promise((resolve, reject) => child_process.exec(`exiftool ${filePath} > ${metaFile}`, (err, res) => {
                if (err) return reject(err);

                resolve(res);
            }));

            const meta = readMetadata(metaFile);/* await new Promise((resolve, reject) => exif.metadata(req.body, [], (err, data) => {
                if(err) return reject(err);

                resolve(data);
            })); */

            if (config.production) { fs.unlinkSync(metaFile); }
            const duration = await execDurationFile(filePath, fileType);

            result.data = {
                title: req.query.filename,
                meta: Object.assign({}, meta, { duration }),
                src: `${config.domain}/storage/video/${filename}`,
                filename, type: fileType, id
            };

            if (fileType.includes('video')) {
                const scaleSize = (Math.min(300 / meta.imageWidth, 300 / meta.imageHeight)) || 1;
                const width = parseInt((meta.imageWidth || 300) * scaleSize);
                const height = parseInt((meta.imageHeight || 300) * scaleSize);

                const posterFilename = (await new Promise((resolve, reject) => {
                    new ffmpeg(filePath).takeScreenshots({
                        timestamps: ['0%'], filename: 'poster.png',
                        size: `${Number(meta.imageWidth)}x${Number(meta.imageHeight)}`
                    }, fileDir, reject).on('filenames', names => {
                        filenames = names;
                    }).on('end', () => resolve(filenames[0]));
                }));

                result.data.poster = `${config.domain}/storage/video/file_data_${id}/${posterFilename}`;
                const thumbs = await new Promise((resolve, reject) => {
                    let filenames = [];

                    const durationCount = Math.ceil(duration) > 100 ? 100 : Math.ceil(duration);

                    new ffmpeg(filePath).takeScreenshots({
                        count: durationCount,
                        filename: 'thumbnail-at-%s-seconds.png',
                        size: `${width}x${height}`
                    }, fileDir, reject).on('filenames', names => {
                        filenames = names;
                    }).on('end', () => resolve(filenames));
                });

                result.data.thumbs = thumbs.map(th => ({
                    time: Number(th.replace('thumbnail-at-', '').replace('-seconds.png', '')),
                    width, height,
                    src: `${config.domain}/storage/video/file_data_${id}/${th}`
                }));
            }

            if (/^(image\/)/g.test(fileType)) {
                try {
                    const scaleSize = (Math.min(90 / meta.imageWidth, 90 / meta.imageHeight)) || 1;
                    const width = parseInt((meta.imageWidth || 90) * scaleSize);
                    const height = parseInt((meta.imageHeight || 90) * scaleSize);

                    const thumb = await imageThumbnail(filePath, {
                        width, height, responseType: 'buffer'
                    });
                
                    const name = `th_${width}_${height}.jpeg`;
                    fs.writeFileSync(`${fileDir}/${name}`, thumb);

                    result.data.thumb = `${config.domain}/storage/video/file_data_${id}/${name}`;
                } catch (err) {
                    console.error(err);
                    result.data.thumb = result.data.src;
                }
            }
        } catch (err) {
            console.error(err);
            result.success = false;
        }

        return result;
    }
};

function readMetadata(filePath) {
    const parseKeys = ['duration', 'fileTypeExtension', 'fileSize', 'fileType', 'mIMEType', 'imageWidth', 'imageHeight', 'audioFormat', 'mediaDuration', 'artist', 'title', 'imageSize', 'avgBitrate'];

    return fs.readFileSync(filePath, 'utf-8').split('\n').filter(q => q).map(p => p.split(' : ').map(q => q.trim())).reduce((result, item) => {
        const key = (() => {
            const key = item[0].replace(/ /g, '');
            return key[0].toLowerCase() + key.substr(1);
        })();

        if (!parseKeys.find(l => l == key)) return result;

        result[key] = item[1];

        if (key == 'duration') {
            result.duration_time = item[1];
            result[key] = item[1].split(':').reduce((acc, time) => (60 * acc) + +time);
        }

        return result;
    }, {});
}

async function execDurationFile(filePath, fileType) {
    if (fileType.includes('audio') || fileType.includes('video')) {
        return await getVideoDurationInSeconds(filePath);
    } else {
        return 0;
    }

    return new Promise(function (resolve, reject) {
        var cmd = ['ffprobe',
            '-v', 'error', '-show_entries',
            'format=duration', '-of', 'csv="p=0"',
            filename
        ];

        exec(cmd.join(' '), (error, stdout, stderr) => {
            if (error) {
                reject('Not valid inout file or ffprobe not installed');
            }
            resolve(parseFloat(stdout));
        });
    });
}