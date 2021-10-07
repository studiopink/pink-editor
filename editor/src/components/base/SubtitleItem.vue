<template>
    <a class="subtitle_item" @click="selectFile($event)">
        <h3>{{mainText}}</h3>
        <p>{{subText}}</p>

        <input type="file" v-if="isFile"
            @change="selectSubtitlesFile($event)"
            accept=".srt" style="display: none;"
            ref="fileInput"
        />
    </a>
</template>
<script>

import API from '../../providers/api';

export default {
    name: 'SubtitleItem',
    props: {
        mainText: String,
        subText: String,
        isFile: {
            type: Boolean,
            default: () => false
        }
    },
    
    methods: {
        selectFile(event) {
            if(this.isFile) {
                this.$refs.fileInput.click();
            } else {
                this.$emit('click', event);
            }
        },

        async selectSubtitlesFile(ev) {
            try {
                const file = ev.target.files[0];
                //console.log(file);
                const response = await API.uploadFileSubtitles(file, e => {
                    this.$store.dispatch("loaderStatus", { isActive: true, text: `Uploading...` });
                });

                await this.$store.dispatch("loaderStatus", { isActive: true, text: 'Uploaded!' });

                if(response.success) {
                    await this.$store.dispatch('addSubtitle', {
                        title: file.name,
                        fileSize: file.size,
                        type: file.type,
                        ...response.data
                    });
                    
                    await this.$store.dispatch("loaderStatus", { isActive: false });
                    return;
                }

                this.$swal('File not loaded!', '', 'warning');
                this.$store.dispatch("loaderStatus", { isActive: false });
            } catch(err) {
                await this.$store.dispatch("loaderStatus", { isActive: false });
                this.$refs.fileInput.value = '';
                console.error(err);
                this.$swal('Something wrong', '', 'error');
            }
        }
    }
}
</script>