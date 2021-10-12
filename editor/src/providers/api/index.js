import config from '@/config/';
import axios from 'axios';

const API_URL = config.API_URL;

export default {

    async uploadFileSubtitles(file, processCallback = () => { }) {
        const b64 = await new Promise(resolve => {
            var reader = new FileReader();
            reader.readAsDataURL(file); 
            reader.onloadend = function() {
               resolve(reader.result);
            }
       });

        return await $.ajax({
            url: `${API_URL}/api/upload_subtitles`,
            method: 'post',
            data: {
                b64: b64.split(';base64,')[1],
                filename: file.name
            },
            
            dataType: 'json',
            //contentType: false,
            cache: false,
            // processData: false,
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', e => processCallback(e), false);
                }

                return myXhr;
            }
        });
    },

    async downloadVideo(videoURL = '', processCallback = () => { }) {
        return await $.ajax({
            url: videoURL,
            contentType: false,
            cache: false,
            processData: false,
            xhrFields:{ responseType: 'blob' },
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                myXhr.addEventListener('progress', e => processCallback(e), false);

                return myXhr;
            }
        })
    },

    async renderVideo(data) {
        return await $.ajax({
            method: 'post',
            data: JSON.stringify(data), url: `${API_URL}/api/render`,
            contentType: 'application/json',
        });
    },

    async uploadFile(file, processCallback = () => { }) {
        return await $.ajax({
            url: `${API_URL}/api/upload?filename=${file.name}`,
            method: 'post',
            data: file,
            contentType: false,
            cache: false,
            processData: false,
            headers: { 'content-type': file.type },
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', e => processCallback(e), false);
                }
                return myXhr;
            }
        });
    }
}