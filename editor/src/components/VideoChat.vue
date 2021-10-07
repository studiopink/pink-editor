<template>
    <div class="video_chat_widget" :class="{'hidden' : videoChatHide}">
        <div class="widget_header">
            <h3>Video Chat</h3>
            <a class="hide_btn" @click="videoChatToggle">
                <span></span>
            </a>
        </div>
        <div class="video_chat_widget_content" v-if="!videoChatHide">
            <div class="video_chat_item">
                <img :src="require('@/assets/img/video_chat_img_1.jpg')" >
            </div>
            <div class="video_chat_item">
                <img :src="require('@/assets/img/video_chat_img_2.jpg')" >
            </div>
            <div class="video_chat_item">
                <img :src="require('@/assets/img/video_chat_img_3.jpg')" >
            </div>
            <div class="video_chat_item">
                <img :src="require('@/assets/img/video_chat_img_4.jpg')" >
            </div>
        </div>
        <div class="widget_bottom_btns" v-if="!videoChatHide">
            <Bbutton>Invite to Chat</Bbutton>
            <Bbutton>Exit Chat</Bbutton>
        </div>
    </div>
</template>

<script>
import Bbutton from "@/components/base/Bbutton"
export default {
    name: 'VideoChat',
    components: {
        Bbutton,
    },
    data() {
		return {
            videoChatHide: false,
		}
	},
    methods: {
        videoChatToggle(){
            this.videoChatHide = !this.videoChatHide;
        }
    },
}
</script>