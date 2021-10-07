import API from '../providers/api';

export default class CustomRecorder {
    constructor() {
        this.URL = window.URL || window.webkitURL;
        this.AudioContext = window.AudioContext || window.webkitAudioContext;
    }

    startRecording(recordingVolumecallback = () => {}) {
        return new Promise((resolve, reject) => {
            const constraints = { audio: true, video: false };
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                this.audioContext = new AudioContext();
                this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

                this.meter = createAudioMeter(this.audioContext, recordingVolumecallback);
                this.mediaStreamSource.connect(this.meter);
                
                this.gumStream = stream;
                this.input = this.audioContext.createMediaStreamSource(stream);
                this.rec = new Recorder(this.input, { numChannels: 1 });
                this.rec.record();

                resolve(this);
            }).catch(reject);
        });
    }

    pauseRecording() {
        if (this.rec.recording) {
            this.rec.stop();
        } else {
            this.rec.record();
        }
    }

    stopRecording() {
        return new Promise(resolve => {
            this.rec.stop();
            this.gumStream.getAudioTracks()[0].stop();
            this.meter.shutdown();
            const time = this.rec.context.currentTime;
            this.rec.exportWAV(async blob => {
                blob.name = `Record_${new Date().toISOString()}.wav`;
                // const data = await API.uploadFile(blob);

                resolve({ file: blob, duration: time });
            });
        });
    }

    createDownloadLink(blob) {
        console.log(blob);
        return;
        const url = this.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = new Date().toISOString() + '.wav';
        a.click();
    }
}