<template>
    <div class="home" :class="{ 'fullscreen_video': fullScreenState}">
		<!-- <ExampleTimeline/> -->
		<div class="hidden_block"></div>
		<DragModal class="transparent_bg"
			name="editor_tutorial"
			:height="405 + 48"
			:width="720 + 10"
			:title="selectedTutorial.title"
		>
			<template v-slot:body>
				<iframe id="ytplayer" type="text/html" width="720" height="405" :src="selectedTutorial.youtube" frameborder="0" allowfullscreen></iframe>
			</template>
		</DragModal>

		<span class="title_crop_video" :style="{
			display: `${cropVideo.dragging ? 'block' : 'none'}`, 
			left: `${cropVideo.posLeft - 10}px`, 
			top: `${cropVideo.posTop}px` }">{{ cropVideo.text }}
		</span>
		
		<span class="title_crop_video" :style="{
			display: `${cropVideo.dragging ? 'block' : 'none'}`, 
			left: `${cropVideo._posLeft - 10}px`, 
			top: `${cropVideo._posTop}px` }">{{ cropVideo._text }}
		</span>

		<ExportModal/>
		<vue-simple-context-menu
			:elementId="'trackRowMenu'"
			:options="[{
					name: 'Clone',
					id: 'clone'
				},{
					type: 'divider'
				}, {
					name: 'Delete',
					id: 'delete',
					class: 'red_text'
				}]"
			:ref="'trackRowMenu'"
			@option-clicked="timelineContextAction($event)"
		/>
		
		<vue-simple-context-menu
			:elementId="'videoTimelineRowMenu'"
			:options="getVideoLineMenu"
			:ref="'videoTimelineRowMenu'"
			@option-clicked="videoTimelineContextAction($event)"
		/>

		<vue-simple-context-menu
			:elementId="'videoContextMenu'"
			:options="contextMenus.video.options"
			:ref="'vueSimpleContextMenu'"
			@option-clicked="videoContext"
		/>

		<vue-simple-context-menu
			:elementId="'audioContextMenu'"
			:options="contextMenus.audio.options"
			:ref="'vueAudioContextMenu'"
			@option-clicked="audioContext"
		/>
		
		<vue-simple-context-menu
			:elementId="'imageContextMenu'"
			:options="contextMenus.image.options"
			:ref="'vueImageContextMenu'"
			@option-clicked="imageContext"
		/>

		<vue-simple-context-menu
			elementId="subtitlesContextMenu"
			:options="contextMenus.subtitles.options"
			ref="subtitlesContextMenu"
			@option-clicked="subtitleContext"
		/>

		<div class="loader" v-if="loader.isActive">
			<div class="justify" @click="resetLoader">
				<div class="content">
					<vue-loaders-ball-beat color="black" scale="1"></vue-loaders-ball-beat>
					<div class="text" v-if="loader.text" v-html="loader.text"></div>
				</div>
			</div>
		</div>
	
		<Header>
			<template v-slot:left>
				<Burger />
				<Logo src="img/logo.svg"/>
				<Headline>
					<input type="text" v-model="$store.state.projectName" ref="campaign_name"/>
					<img :src="require('@/assets/img/pencil.svg')" @click="$refs.campaign_name.focus()"/>
				</Headline>
			</template>
			
			<template v-slot:right>
				<div class="undo_redo_btns">
					<IconBtn icon="undo" @click="history.undo()" :class="{ disabled: !history.isUndo() }"/>
					<IconBtn icon="redo" @click="history.redo()" :class="{ disabled: !history.isRedo() }"/>
				</div>

				<HeaderUsers />
				<Pbutton :style="{ background: '#940505', 'margin-right': '10px' }" @click="sendReport">Report</Pbutton>
				<Pbutton icon="export"
					:class="{ disabled: !currentVideos || !currentVideos.length }"
					@click="$store.state.modals.export += 1"
				>Export</Pbutton>
			</template>
		</Header>	

		<Wrapper>
			<template v-slot:center>
				<Leftbars :stepNumber="stepNumber">
					<template v-slot:steps>
						<Step 
							:numb="index+1" 
							:active="index+1 < stepNumber" 
							:current="index+1 === stepNumber" 
							v-for="(item, index) in steps" 
							:key="index" 
							@click="stepChange(index+1)"
						>
							{{item}}
						</Step>
					</template>
					<template v-slot:files>
						<div class="search_files">
							<div class="head_search">
								<span>{{ stepNumber === 1 ? 'Overview & Brandkit' : 'Videos' }}</span>
								<img :src="require('@/assets/img/search_icon.svg')" draggable="false" @click="showSearchBar()"/>
							</div>

							<input type="text" @input="searchFiles" placeholder="Enter file name..."
								:value="stepNumber === 1 ? search_bl.overviewValue : search_bl.videosValue"
								v-show="stepNumber === 1 ? search_bl.overview : search_bl.videos" ref="searchInput">
						</div>

						<div class="left_sidebar_files_inner">
							<GrayLabel v-if="getFiles('logoFiles', true, undefined, search_bl.overviewValue) && stepNumber == 1">Your Logos:</GrayLabel>
							<div class="logos_items_wrpr" v-if="getFiles('logoFiles', true, undefined, search_bl.overviewValue)  && stepNumber == 1">
								<LogoFile :src="item.thumb || item.img" v-for="(item, index) in getFiles('logoFiles', false, undefined, search_bl.overviewValue)"
									:key="index"
									@contextmenu="handleContextClick($event, item, 'vueImageContextMenu')"
									@click="logoFileActivate(item.id)"
									:class="{'active': logoFileActive === item.id}" />
							</div>
							<GrayLabel v-if="getFiles('audioFiles', true, undefined, search_bl.overviewValue)  && stepNumber == 1">Your audio files:</GrayLabel>
							<div class="audio_files_wrpr" v-if="getFiles('audioFiles', true, undefined, search_bl.overviewValue)  && stepNumber == 1">
								<AudioFile v-for="(audio, index) in getFiles('audioFiles', false, undefined, search_bl.overviewValue)" :key="index"
									@contextmenu="handleContextClick($event, audio, 'vueAudioContextMenu')"
									:title="audio.title"
									:author="audio.author"
									:src="audio.src"
									:id="audio.id"
									:duration="audio.duration"
								/>
							</div>
							<GrayLabel v-if="getFiles('videoFiles', true, undefined, search_bl.overviewValue) && stepNumber == 1">Your video files:</GrayLabel>
							<div class="video_files_wrpr" v-if="getFiles('videoFiles', true, undefined, search_bl.overviewValue) && stepNumber == 1" v-click-outside="videoFileActivate">
								<VideoFile :placeholder="item.img" v-for="(item, index) in getFiles('videoFiles', false, undefined, search_bl.overviewValue)"
									@contextmenu="handleContextClick($event, item, 'vueSimpleContextMenu')"
									:title="item.title"
									:key="index" @click="videoFileActivate(item.id, true)"
									:class="{'active': videoFileActive === item.id}"
								/>
							</div>

							<GrayLabel v-if="getFiles('videoFiles', true, 'isIntro', search_bl.videosValue) && stepNumber == 2">Intro:</GrayLabel>
							<div class="video_files_wrpr" v-if="getFiles('videoFiles', true, 'isIntro', search_bl.videosValue) && stepNumber == 2">
								<VideoFile :placeholder="item.img" v-for="(item, index) in getFiles('videoFiles', false, 'isIntro', search_bl.videosValue)"
									@contextmenu="handleContextClick($event, item, 'vueSimpleContextMenu')"
									:title="item.title"
									:key="index" @click="videoFileActivate(item.id)"
									:class="{'active': videoFileActive === item.id}"
								/>
							</div>

							<GrayLabel v-if="getFiles('videoFiles', true, 'isOutro', search_bl.videosValue) && stepNumber == 2">Outro:</GrayLabel>
							<div class="video_files_wrpr" v-if="getFiles('videoFiles', true, 'isOutro', search_bl.videosValue) && stepNumber == 2">
								<VideoFile :placeholder="item.img" v-for="(item, index) in getFiles('videoFiles', false, 'isOutro', search_bl.videosValue)"
									@contextmenu="handleContextClick($event, item, 'vueSimpleContextMenu')"
									:title="item.title"
									:key="index" @click="videoFileActivate(item.id)"
									:class="{'active': videoFileActive === item.id}"
								/>
							</div>
						</div>
						<div class="upload_btns_wrpr" v-if="stepNumber == 2">
							<Bbutton pink icon="upload"
								style="border: 1px solid #89a951;"
								accept="video/*" fileBtn
								@changeFile="uploadFile($event, 'isIntro')">
								Upload intro
							</Bbutton>

							<Bbutton pink icon="upload"
								accept="video/*" fileBtn
								@changeFile="uploadFile($event, 'isOutro')">
								Upload outro
							</Bbutton>
						</div>

						<div class="upload_btns_wrpr" v-if="stepNumber == 1">
							<Bbutton pink icon="upload" accept="audio/*, video/*, image/*" fileBtn @changeFile="uploadFile($event)">Upload New Files</Bbutton>
						</div>
					</template>

					<template v-slot:active_image v-if="selectedContextObjectType == 'logo'">
						<ObjectPopup/>
					</template>

					<template v-slot:text_properties v-if="selectedContextObjectType == 'text'">
						<ObjectPopup/>
					</template>
					
					<template v-slot:video_properties v-if="selectedContextObjectType == 'video'">
						<ObjectPopup/>
					</template>
					
					<template v-slot:audio_properties v-if="$store.state.editor.audio && $store.state.editor.audio.src">
						<AudioSetting/>
					</template>
					
					<template v-slot:subtitles_properties v-if="$store.state.editor.subtitles && $store.state.editor.subtitles.data">
						<EditSubtitle/>
					</template>

					<template v-slot:subtitles>
						<div class="subtitles_top">
							<GrayLabel>Caption creator</GrayLabel>
							<SelectField placeholder="Headline"/>
							<SelectField placeholder="Call to Action"/>
							<TextareaField placeholder="Message"/>
							<SelectField placeholder="Log line"/>
							<div class="mt_a">
								<GrayLabel>Actions</GrayLabel>
								<Bbutton pink>Delete Subtitles</Bbutton>
							</div>
						</div>

						<div class="subtitles_bottom" v-if="$store.state.subtitles && $store.state.subtitles.length">
							<GrayLabel>Uploaded subtitles</GrayLabel>
							<button class="sub_button" v-for="(sub, index) in $store.state.subtitles"
								@contextmenu="handleContextClick($event, sub, 'subtitlesContextMenu')"
								:key="index" @click="addSubtitle(sub)">
								<!-- <svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 426.667 426.667' style='enable-background:new 0 0 426.667 426.667;' xml:space='preserve'><g><g><path d='M384,42.667H42.667C19.2,42.667,0,61.867,0,85.333v256C0,364.8,19.2,384,42.667,384H384	c23.467,0,42.667-19.2,42.667-42.667v-256C426.667,61.867,407.467,42.667,384,42.667z M42.667,213.333H128V256H42.667V213.333z M256,341.333H42.667v-42.667H256V341.333z M384,341.333h-85.333v-42.667H384V341.333z M384,256H170.667v-42.667H384V256z'/>	</g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg> -->
								{{ sub.title }}
							</button>
						</div>

						<div class="subtitles_bottom">
							<GrayLabel>Subtitle</GrayLabel>
							<SubtitleItem mainText="Auto Subtitles" subText="Automatically add subtitles to video" />
							<SubtitleItem @click="addManualSubtitles()" mainText="Manual Subtitles" subText="Add your subtitles manually to video" />
							<SubtitleItem mainText="Upload Subtitle file" :isFile="true" subText="Add subtitles from .srt, .ass, .vtt, .ssa files" />
						</div>
					</template>
					<template v-slot:elements>
						<div class="search_files">
							<div class="head_search">
								<span>Elements</span>
								<img :src="require('@/assets/img/search_icon.svg')" draggable="false" @click="showSearchBar('elements')"/>
							</div>

							<input type="text" @input="searchFiles" placeholder="Enter file name..."
								:value="search_bl.elements.value"
								v-show="search_bl.elements.show" ref="searchInputElements">
						</div>
						
						<div class="left_sidebar_elements_inner">
							<GrayLabel>Add Text:</GrayLabel>
							<div class="mb_15">
								<TextElement v-for="(textObject, index) in $store.state.texts" :key="index"
									:textObject="textObject" 
									@click="textElementAdd"
								/>
							</div>

							<GrayLabel>Shape Elements:</GrayLabel>
							<div class="logos_items_wrpr" v-click-outside="shapeElementActivate">
								<LogoFile :src="item.img" v-for="(item, index) in shapeElements" :key="index" @click="shapeElementActivate(item.id)" :class="{'active': shapeElementActive === item.id}" />
							</div>

							<GrayLabel>Textures:</GrayLabel>
							<div class="logos_items_wrpr" v-click-outside="textureElementActivate">
								<TextureElement :src="item.img" v-for="(item, index) in texturesElements" :key="index" @click="textureElementActivate(item.id)" :class="{'active': texturesElementActive === item.id}"/>
							</div>
						</div>
					</template>
					<template v-slot:brand v-if="storeTexts && storeTexts.length">
						<h3 class="m_title">Your Brand</h3>
						<GrayLabel>Your Colors:</GrayLabel>
						<ColorCirclesPicker/>

						<GrayLabel>Your Texts:</GrayLabel>

						<TextareaField v-for="(text, index) in storeTexts" :key="index"
							placeholder="Text"
							textareaBlock="true"
							:value="text.value"
							@input="changeText($event, text, false)"
							@change="changeText($event, text, true)"
						/>
						</template>
				</Leftbars>

				<Workspace>
					<div v-if="!currentVideos.length" class="drop_video" :class="{ 'active': dropOver }" @click="addVideoFile()"
						@drop.prevent="dropVideoFile"
						@dragenter.prevent="preventDragVideoFile"
						@dragover.prevent="preventDragVideoFile"
						@dragover="dropOver = true"
						@dragleave="dropOver = false"
					>
						<input type="file" ref="drop_file" @change="uploadVideoFile" accept="video/*" style="display: none;"/>
						<div class="center_drop">
							Select or drag video to edit
						</div>
					</div>

					<DMobToggle v-if="currentVideos.length" @dMobToggle="dMobToggle" :desktopMobileMode="desktopMobileMode" />

					<div v-if="currentVideos.length" class="editor_content_box"
						:style="getEditorContentBoxStyle"
						:class="['screen_mode_'+desktopMobileMode]">
						<div class="preview_top" v-show="previewMode" :style="{ transform: `scale(${prevMode.top || 1})` }">
							<div class="left_prev">
								<div><img class="preview_logo" :src="require('@/assets/img/instagram/pieroborgo.jpg')"/></div>
								<div class="preview_loc">
									<div>
										<b>pieroborgo</b><br>
										<span>Florence, italy</span>
									</div>
								</div>
							</div>

							<div class="right_prev">
								<svg fill="#262626" height="16" viewBox="0 0 48 48" width="16"><circle clip-rule="evenodd" cx="8" cy="24" fill-rule="evenodd" r="4.5"></circle><circle clip-rule="evenodd" cx="24" cy="24" fill-rule="evenodd" r="4.5"></circle><circle clip-rule="evenodd" cx="40" cy="24" fill-rule="evenodd" r="4.5"></circle></svg>
							</div>
						</div>
						<div class="video_wrpr_wrpr" :style="getVideoFormatStyles" :class="'video_format_1'+videoFormat" ref="videoWrprWrpr">
							<div class="video_wrpr" :style="{height: videoWrprSize,}">
								<!-- <div class="canvas_dash">
									<canvas id="stateCanvas"></canvas>
								</div> -->

								<AudioControls v-show="stepNumber === 5">
									<Bbutton icon="microfon" iconSize="12" v-if="!audioRecorder.isActive" fullred @click="recordAudio">Record Audio</Bbutton>
									<Bbutton icon="sm_plus" iconSize="12" v-if="!audioRecorder.isActive" accept="audio/*"
										@changeFile="uploadFile($event, true)" fileBtn>Add Audio</Bbutton>

									<div class="recording_menu" v-if="audioRecorder.isActive && !audioRecorder.stop">
										<Bbutton icon="stopRecord" iconSize="12" @click="stopRecording">
											Stop
										</Bbutton>

										<div class="volume"><span :style="`width: ${audioRecorder.volume * 100}%;`"></span></div>
										<div class="time_recording">{{ parseSeconds(audioRecorder.currentTime) }}</div>
									</div>

									<div class="recording_final" v-if="audioRecorder.isActive && audioRecorder.stop">
										<div class="player">
											<AudioPlayer :audioObject="audioRecorder.selectedRecord" :isColumn="true" :hiddenCrop="true"/>
										</div>
										<br>
										<Bbutton icon="plus" iconSize="18" @click="addRecordingAudio" style="border-color: green;" iconStyle="transform: scale(.8)">
											Add
										</Bbutton>

										<Bbutton icon="delete" @click="deleteRecorderAudio" fullred iconSize="12">
											Delete
										</Bbutton>
									</div>
								</AudioControls>
								
								<VideoEmbed v-if="currentVideos && currentVideos.length" :isPlay="embedVideo.isPlay"
									:videoTimeline="videoTimeline"
									@transformScale="scaleContent = $event"
									@timeUpdate="updateVideoCurrentTime"
									@pause="pauseVideoEmbed()"
									@play="playVideoEmbed()"

									@toDuration="toDurationVideoEmbed"
									:videoObjects="currentVideos"
									:volume="$store.state.videoPlayer.volume"
									:time="embedVideo.currentTime || 0"/>
								<img v-else :src="selectedTimeLineSrc || require('@/assets/img/main_video_img.jpg')">
							</div>
						</div>
						<div class="preview_bottom" v-show="previewMode" :style="{ transform: `scale(${prevMode.bottom || 1})` }">
							<div class="preview_fl">
								<div class="left_prev">
									<svg fill="#ed4956" height="24" viewBox="0 0 48 48" width="24"><path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>
									<svg fill="#262626" height="24" viewBox="0 0 48 48" width="24"><path clip-rule="evenodd" d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z" fill-rule="evenodd"></path></svg>
									<svg fill="#262626" height="24" viewBox="0 0 48 48" width="24"><path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"></path></svg>
								</div>
								<div class="right_prev">
									<svg fill="#262626" height="24" viewBox="0 0 48 48" width="24"><path d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"></path></svg>
								</div>
							</div>

							<div class="description_prev">
								<span class="icons_prev_like">
									<img class="preview_logo" :src="require('@/assets/img/instagram/1.jpg')"/>
									<img class="preview_logo" :src="require('@/assets/img/instagram/2.jpg')"/>
									<img class="preview_logo" :src="require('@/assets/img/instagram/3.jpg')"/>
								</span>
								<span>
									Liked by <b>leeviahq</b> and <b>others pieroborgo</b> Thanks for watching this preview
								
									<span class="tags_prev">
										#preview #instagram #preview
									</span>
								</span>
							</div>
						</div>
					</div>

					<VideoChat />
				</Workspace>

				<Rightbars>
					<StepRight v-for="(tutorial, index) in tutorialSteps"
						:title="tutorial.title" :key="index"
						:img="tutorial.preview" @click="openTutorial(tutorial)"
						:active="stepNumber == tutorial.step"/>
				</Rightbars>
			</template>

			<template v-slot:bottom>
				<Controlbar v-if="currentVideos && currentVideos.length" ref="control_bar">
					<template v-slot:left>
						<Tcontrol icon="reshoot" @click="resetAll()">Reshoot</Tcontrol>
						<!-- <Tcontrol icon="preview" :active="previewMode" @click="previewModeToggle">Preview Mode</Tcontrol> -->
						<Pbutton icon="next" :sm="true" @click="nextStep" v-if="stepNumber !== 5">Next Step</Pbutton>
						<Pbutton :sm="true" v-if="stepNumber === 5">Share</Pbutton>
					</template>
					<template v-slot:center>
						<Ccontrol :format="videoFormat" @formatChange="videoFormatChange"/>
						<Ccontrol icon="rev" @click="rewindVideo('backward')"/>
						<Ccontrol :icon="embedVideo.isPlay ? 'stop' : 'play'" @click="embedVideoPlay"/>
						<Ccontrol icon="ff" @click="rewindVideo('forward')"/>
						<Ccontrol :timer="true">{{ printTime }}</Ccontrol>
						<VolumeControl :value="$store.state.videoPlayer.volume * 100" @change="volumeChange"/>
						<Ccontrol :icon="!fullScreenState ? 'fullscreen' : 'unfullscreen'" @click="fullScreen" />
					</template>

				</Controlbar>
				<Timeline ref="timeline" v-dragscroll.noleft.noright.noback.noforward="true"
						@mousedown="changeLockAutoScrollTimeline(true)"
						@mouseup="changeLockAutoScrollTimeline()"
						@videoTrackScroll="videoTrackScroll"
						v-show="currentVideos && currentVideos.length"
					>
					<template v-slot:track-time>
						<TimelineHorizontal :left="timeLinePosition" @changeLeft="dragHorizontalLine"/>
						<!-- <VueDragResize axis="x"
							v-on:dragging="dragHorizontalLine"
							@dragstop="dragHorizontalLine($event, true)"
							:isResizable="false" :sticks="[]"
							:x="timeLinePosition" :w="14">
							<div class="horizontal_line" ref="horizontal_line" :style="{top: 0, left: 0}"></div>
						</VueDragResize> -->
						<Tracktime @timestamp="onTimestamp"/>
					</template>
					<template v-slot:tracks>
						<Trackrows @trackRowMenu="$refs.trackRowMenu.showMenu($event.event, $event.item)"/>
						<div class="video_frames_row" :style="framesStyle">
							<div class="frames_wrpr">
								<div class="crop_window" v-for="video in currentVideos"
									:class="{ shadow_frames: cropVideo.active == video._id }"
									@contextmenu="openContextMenuTimelineVideo($event, video)"
									:style="getStyleCropWindow(video)"  :key="video._id">
									
									<div class="video_effects" v-if="cropVideo.active != video._id && (video._effect || video._filter || video._transition_in || video._transition_out)">
										<svg version='1.1' title="Transition in" v-if="video._transition_in" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'	 viewBox='0 0 272.172 272.172' style='transform: rotate(-45deg); enable-background:new 0 0 272.172 272.172;' xml:space='preserve'><path d='M55,140.086H0v-140h140v55h-31.659C79.117,55.086,55,78.87,55,108.094V140.086z M116,206.086v-8.516	c0-44.664,37.154-81.484,81.817-81.484h8.516c1.68,0,3.667,0.552,4.667,0.653v-8.653c0-20.987-16.68-38-37.667-38h-65	c-20.987,0-38.333,17.013-38.333,38v65c0,20.987,17.346,38,38.333,38h8.653C116.885,209.431,116,207.766,116,206.086z	 M272.169,193.138c-0.048-0.723-0.093-1.448-0.165-2.164c-0.044-0.444-0.108-0.882-0.16-1.323c-0.076-0.636-0.148-1.274-0.242-1.904	c-0.071-0.474-0.16-0.941-0.24-1.411c-0.101-0.59-0.198-1.18-0.315-1.765c-0.097-0.487-0.211-0.969-0.319-1.452	c-0.125-0.557-0.246-1.115-0.385-1.667c-0.125-0.496-0.264-0.986-0.4-1.478c-0.146-0.529-0.29-1.058-0.449-1.581	c-0.152-0.502-0.318-0.998-0.481-1.495c-0.165-0.501-0.33-1.002-0.507-1.498c-0.181-0.507-0.373-1.008-0.566-1.509	c-0.182-0.473-0.365-0.945-0.557-1.413c-0.211-0.512-0.431-1.019-0.654-1.524c-0.195-0.443-0.393-0.885-0.598-1.323	c-0.242-0.516-0.492-1.028-0.746-1.536c-0.206-0.413-0.416-0.823-0.63-1.231c-0.275-0.521-0.556-1.038-0.845-1.552	c-0.213-0.379-0.43-0.756-0.65-1.13c-0.311-0.528-0.627-1.052-0.952-1.571c-0.215-0.343-0.434-0.682-0.654-1.021	c-0.349-0.536-0.704-1.068-1.068-1.593c-0.211-0.304-0.427-0.604-0.643-0.904c-0.392-0.545-0.789-1.088-1.197-1.62	c-0.199-0.26-0.404-0.516-0.607-0.773c-0.442-0.559-0.887-1.114-1.346-1.658c-0.177-0.21-0.359-0.415-0.539-0.622	c-0.5-0.577-1.005-1.151-1.524-1.711c-0.138-0.149-0.282-0.294-0.421-0.442c-0.573-0.606-1.152-1.207-1.748-1.791	c-0.072-0.071-0.147-0.139-0.219-0.209c-10.77-10.47-25.101-17.541-41.005-18.734c-1.653-0.124-3.317-0.45-5.002-0.45h-8.516	c-36.451,0-66.817,30.033-66.817,66.484v8.516c0,1.684,0.493,3.348,0.616,5c1.193,15.904,8.225,30.235,18.695,41.005	c0.071,0.073,0.242,0.149,0.314,0.222c0.584,0.596,1.236,1.175,1.843,1.748c0.147,0.139,0.317,0.282,0.466,0.42	c0.56,0.52,1.147,1.024,1.724,1.525c0.208,0.179,0.419,0.362,0.628,0.539c0.544,0.459,1.102,0.904,1.66,1.346	c0.257,0.203,0.515,0.409,0.775,0.608c0.532,0.408,1.074,0.804,1.619,1.196c0.301,0.217,0.602,0.433,0.907,0.645	c0.524,0.364,1.055,0.717,1.59,1.066c0.34,0.221,0.68,0.441,1.024,0.656c0.518,0.324,1.041,0.64,1.568,0.95	c0.375,0.22,0.752,0.438,1.132,0.651c0.512,0.288,1.028,0.569,1.549,0.843c0.409,0.215,0.82,0.425,1.234,0.632	c0.508,0.254,1.019,0.504,1.534,0.745c0.439,0.206,0.882,0.404,1.326,0.6c0.504,0.223,1.01,0.442,1.52,0.653	c0.468,0.192,0.941,0.375,1.414,0.558c0.501,0.193,1.002,0.385,1.509,0.566c0.495,0.177,0.995,0.341,1.495,0.506	c0.497,0.164,0.994,0.329,1.496,0.482c0.524,0.159,1.054,0.303,1.583,0.449c0.49,0.135,0.979,0.274,1.474,0.399	c0.553,0.139,1.112,0.261,1.67,0.385c0.483,0.108,0.964,0.222,1.45,0.319c0.586,0.117,1.179,0.215,1.77,0.316	c0.468,0.08,0.933,0.169,1.405,0.239c0.632,0.094,1.272,0.166,1.91,0.243c0.44,0.052,0.876,0.116,1.319,0.16	c0.717,0.071,1.441,0.116,2.164,0.165c0.372,0.025,0.74,0.062,1.113,0.081c1.1,0.055,2.206,0.084,3.32,0.084h8.516	c6.835,0,13.426-1.039,19.626-2.967c7.233-2.25,13.933-5.71,19.862-10.145c4.235-3.167,8.077-6.832,11.44-10.906	c2.69-3.26,5.073-6.782,7.105-10.522c2.032-3.741,3.713-7.7,4.999-11.833s2.009-8.441,2.46-12.878	c0.225-2.219,0.174-4.47,0.174-6.748v-8.516c0-1.113,0.137-2.22,0.083-3.32C272.064,193.877,272.193,193.51,272.169,193.138z'/><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
										<svg title="Effect" v-if="video._effect" enable-background="new 0 0 486.861 486.861" height="512" viewBox="0 0 486.861 486.861" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m481 431.5-339.97-339.96c-9.801-9.801-25.646-9.704-35.35 0l-14.14 14.14c-9.688 9.688-9.849 25.501 0 35.35l196.22 196.22c3.64 3.64 9.944 4.196 14.14 0 3.895-3.895 3.9-10.24 0-14.14l-136.472-136.472 21.21-21.21 280.221 280.212c-.01 0-21.22 21.21-21.22 21.21l-80.1-80.1c-4.185-4.185-10.586-3.554-14.141 0-3.9 3.9-3.899 10.25 0 14.14l80.102 80.11c7.944 7.944 20.605 7.685 28.29 0l21.21-21.21c7.943-7.943 7.685-20.604 0-28.29zm-329.715-259.005-45.605-45.605c-1.732-1.732-2.176-4.894 0-7.07l14.14-14.14c2.095-2.095 5.277-1.793 7.07 0l45.606 45.606zm185.36 189.502c0 5.521-4.476 9.996-9.996 9.996-5.521 0-9.996-4.476-9.996-9.996 0-5.521 4.476-9.997 9.996-9.997s9.996 4.476 9.996 9.997zm-284.645-228.997h-42c-5.523 0-10-4.477-10-10s4.477-10 10-10h42c5.523 0 10 4.477 10 10s-4.477 10-10 10zm61-81v-42c0-5.523 4.477-10 10-10s10 4.477 10 10v42c0 5.523-4.477 10-10 10s-10-4.477-10-10zm302.568 49.318c0-5.523 4.478-10 10-10h24.432c5.522 0 10 4.477 10 10s-4.478 10-10 10h-24.432c-5.522 0-10-4.477-10-10zm-379.542-51.15c-3.905-3.905-3.905-10.237 0-14.142s10.237-3.905 14.142 0l29.698 29.698c3.905 3.905 3.905 10.237 0 14.142s-10.237 3.905-14.142 0zm130.108 29.699c-3.905-3.905-3.905-10.237 0-14.142l29.698-29.698c3.905-3.905 10.237-3.905 14.142 0s3.905 10.237 0 14.142l-29.698 29.698c-3.906 3.905-10.237 3.905-14.142 0zm-86.267 86.267c3.905 3.905 3.905 10.237 0 14.142l-29.698 29.698c-3.905 3.905-10.237 3.905-14.142 0s-3.905-10.237 0-14.142l29.698-29.698c3.905-3.905 10.236-3.905 14.142 0zm309.247-104.981 7.549-23.236c1.706-5.252 7.348-8.127 12.601-6.421s8.127 7.348 6.421 12.601l-7.549 23.236c-1.706 5.252-7.348 8.127-12.601 6.421s-8.128-7.349-6.421-12.601zm-61.931-2.987c3.246-4.468 9.5-5.458 13.968-2.212l19.766 14.361c4.468 3.246 5.459 9.5 2.212 13.968-3.246 4.468-9.5 5.458-13.968 2.212l-19.766-14.361c-4.467-3.246-5.458-9.5-2.212-13.968zm80.954 77.143 7.55 23.236c1.707 5.252-1.168 10.894-6.42 12.601-5.253 1.707-10.894-1.168-12.601-6.42l-7.55-23.236c-1.707-5.252 1.168-10.894 6.42-12.601s10.894 1.168 12.601 6.42zm-80.96 9.166c-3.246-4.468-2.255-10.722 2.212-13.968l19.766-14.361c4.468-3.246 10.722-2.256 13.968 2.212s2.255 10.722-2.212 13.968l-19.766 14.361c-4.468 3.246-10.722 2.256-13.968-2.212zm-209.349 173.907-26.903-8.734c-5.252-1.708-8.125-7.351-6.416-12.603 1.708-5.252 7.351-8.125 12.603-6.416l26.903 8.734c5.252 1.708 8.125 7.351 6.416 12.603-1.708 5.252-7.351 8.125-12.603 6.416zm98.683 21.553c-1.708 5.252-7.351 8.125-12.603 6.416l-26.903-8.734c-5.252-1.708-8.125-7.351-6.416-12.603 1.708-5.252 7.351-8.125 12.603-6.416l26.903 8.734c5.252 1.709 8.124 7.351 6.416 12.603zm-38.14-74.843-8.734 26.903c-1.708 5.252-7.351 8.125-12.603 6.416s-8.125-7.351-6.416-12.603l8.734-26.903c1.708-5.252 7.351-8.125 12.603-6.416s8.125 7.351 6.416 12.603zm-27.969 86.08-8.734 26.903c-1.708 5.252-7.351 8.125-12.603 6.416s-8.125-7.351-6.416-12.603l8.734-26.903c1.708-5.252 7.351-8.125 12.603-6.416s8.125 7.35 6.416 12.603z"/></g></svg>
										<svg title="Filter" v-if="video._filter" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m420.633 185.843c4.134-94.372-71.543-172.101-164.633-172.101-93.235 0-168.731 77.875-164.635 172.048-55.726 27.769-91.365 84.929-91.365 147.56 0 131.629 147.34 209.665 256 137.201 108.645 72.453 256-5.547 256-137.201 0-64.501-37.252-120.456-91.367-147.507zm-93.534 118.81c-6.616-37.738-26.047-71.289-54.023-95.652 38.935-23.297 85.721-26.48 126.374-10.696-6.113 44.657-32.96 84.052-72.351 106.348zm-71.099 141.086c-33.067-26.883-53.28-67.237-53.592-111.314 36.857 12.519 74.655 11.233 107.184 0-.299 42.23-19.098 83.271-53.592 111.314zm-52.254-132.148c.598-4.368 1.334-8.461 2.353-12.869.009-.041.019-.081.029-.121 7.393-31.855 25.333-59.707 49.919-79.679 27.799 22.616 47.058 55.268 52.195 92.672-32.978 12.803-70.408 13.23-104.496-.003zm52.254-279.849c79.486 0 144.21 64.379 144.79 143.73-47.957-16.529-101.758-10.024-144.731 18.556-15.491-10.289-32.894-18.065-51.688-22.698-5.358-1.32-10.78 1.953-12.103 7.315-1.322 5.362 1.954 10.781 7.316 12.103 14.164 3.492 27.424 9.023 39.501 16.229-29.465 25.648-47.683 59.548-54.064 94.984-.042.23-.081.461-.122.692-38.228-21.639-66.062-60.391-72.354-106.384 3.685-1.426 7.434-2.704 11.209-3.818 5.296-1.564 8.322-7.127 6.758-12.423-1.564-5.297-7.125-8.317-12.423-6.759-2.305.681-4.597 1.435-6.879 2.22.571-79.36 65.298-143.747 144.79-143.747zm-236 299.608c0-52.521 28.53-100.654 73.695-126.15.043.245.085.491.129.736 9.445 52.448 43.446 95.609 88.737 118.177-2.119 48.64 17.19 97.29 56.448 131.536-95.434 57.188-219.009-11.474-219.009-124.299zm252.992 124.299c38.708-33.767 58.594-82.192 56.439-131.532 45.202-22.52 79.282-65.63 88.745-118.181.042-.23.081-.461.122-.692 43.962 24.885 73.702 72.085 73.702 126.106 0 112.856-123.606 181.468-219.008 124.299z"/><path d="m160.67 188.597c5.545 0 10-4.498 10-10 0-6.402-5.892-11.02-11.95-9.8-4.801.975-8.05 5.149-8.05 9.8 0 5.463 4.432 10 10 10z"/></g></svg>
										<svg version='1.1' title="Transition out" v-if="video._transition_out" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'	 viewBox='0 0 272.172 272.172' style='transform: rotate(135deg); enable-background:new 0 0 272.172 272.172;' xml:space='preserve'><path d='M55,140.086H0v-140h140v55h-31.659C79.117,55.086,55,78.87,55,108.094V140.086z M116,206.086v-8.516	c0-44.664,37.154-81.484,81.817-81.484h8.516c1.68,0,3.667,0.552,4.667,0.653v-8.653c0-20.987-16.68-38-37.667-38h-65	c-20.987,0-38.333,17.013-38.333,38v65c0,20.987,17.346,38,38.333,38h8.653C116.885,209.431,116,207.766,116,206.086z	 M272.169,193.138c-0.048-0.723-0.093-1.448-0.165-2.164c-0.044-0.444-0.108-0.882-0.16-1.323c-0.076-0.636-0.148-1.274-0.242-1.904	c-0.071-0.474-0.16-0.941-0.24-1.411c-0.101-0.59-0.198-1.18-0.315-1.765c-0.097-0.487-0.211-0.969-0.319-1.452	c-0.125-0.557-0.246-1.115-0.385-1.667c-0.125-0.496-0.264-0.986-0.4-1.478c-0.146-0.529-0.29-1.058-0.449-1.581	c-0.152-0.502-0.318-0.998-0.481-1.495c-0.165-0.501-0.33-1.002-0.507-1.498c-0.181-0.507-0.373-1.008-0.566-1.509	c-0.182-0.473-0.365-0.945-0.557-1.413c-0.211-0.512-0.431-1.019-0.654-1.524c-0.195-0.443-0.393-0.885-0.598-1.323	c-0.242-0.516-0.492-1.028-0.746-1.536c-0.206-0.413-0.416-0.823-0.63-1.231c-0.275-0.521-0.556-1.038-0.845-1.552	c-0.213-0.379-0.43-0.756-0.65-1.13c-0.311-0.528-0.627-1.052-0.952-1.571c-0.215-0.343-0.434-0.682-0.654-1.021	c-0.349-0.536-0.704-1.068-1.068-1.593c-0.211-0.304-0.427-0.604-0.643-0.904c-0.392-0.545-0.789-1.088-1.197-1.62	c-0.199-0.26-0.404-0.516-0.607-0.773c-0.442-0.559-0.887-1.114-1.346-1.658c-0.177-0.21-0.359-0.415-0.539-0.622	c-0.5-0.577-1.005-1.151-1.524-1.711c-0.138-0.149-0.282-0.294-0.421-0.442c-0.573-0.606-1.152-1.207-1.748-1.791	c-0.072-0.071-0.147-0.139-0.219-0.209c-10.77-10.47-25.101-17.541-41.005-18.734c-1.653-0.124-3.317-0.45-5.002-0.45h-8.516	c-36.451,0-66.817,30.033-66.817,66.484v8.516c0,1.684,0.493,3.348,0.616,5c1.193,15.904,8.225,30.235,18.695,41.005	c0.071,0.073,0.242,0.149,0.314,0.222c0.584,0.596,1.236,1.175,1.843,1.748c0.147,0.139,0.317,0.282,0.466,0.42	c0.56,0.52,1.147,1.024,1.724,1.525c0.208,0.179,0.419,0.362,0.628,0.539c0.544,0.459,1.102,0.904,1.66,1.346	c0.257,0.203,0.515,0.409,0.775,0.608c0.532,0.408,1.074,0.804,1.619,1.196c0.301,0.217,0.602,0.433,0.907,0.645	c0.524,0.364,1.055,0.717,1.59,1.066c0.34,0.221,0.68,0.441,1.024,0.656c0.518,0.324,1.041,0.64,1.568,0.95	c0.375,0.22,0.752,0.438,1.132,0.651c0.512,0.288,1.028,0.569,1.549,0.843c0.409,0.215,0.82,0.425,1.234,0.632	c0.508,0.254,1.019,0.504,1.534,0.745c0.439,0.206,0.882,0.404,1.326,0.6c0.504,0.223,1.01,0.442,1.52,0.653	c0.468,0.192,0.941,0.375,1.414,0.558c0.501,0.193,1.002,0.385,1.509,0.566c0.495,0.177,0.995,0.341,1.495,0.506	c0.497,0.164,0.994,0.329,1.496,0.482c0.524,0.159,1.054,0.303,1.583,0.449c0.49,0.135,0.979,0.274,1.474,0.399	c0.553,0.139,1.112,0.261,1.67,0.385c0.483,0.108,0.964,0.222,1.45,0.319c0.586,0.117,1.179,0.215,1.77,0.316	c0.468,0.08,0.933,0.169,1.405,0.239c0.632,0.094,1.272,0.166,1.91,0.243c0.44,0.052,0.876,0.116,1.319,0.16	c0.717,0.071,1.441,0.116,2.164,0.165c0.372,0.025,0.74,0.062,1.113,0.081c1.1,0.055,2.206,0.084,3.32,0.084h8.516	c6.835,0,13.426-1.039,19.626-2.967c7.233-2.25,13.933-5.71,19.862-10.145c4.235-3.167,8.077-6.832,11.44-10.906	c2.69-3.26,5.073-6.782,7.105-10.522c2.032-3.741,3.713-7.7,4.999-11.833s2.009-8.441,2.46-12.878	c0.225-2.219,0.174-4.47,0.174-6.748v-8.516c0-1.113,0.137-2.22,0.083-3.32C272.064,193.877,272.193,193.51,272.169,193.138z'/><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
									</div>							
									
									<div :style="{
											display: 'flex',
											position: 'relative',
											width: `${video.thumbs.length * 80}px`,
											left: (video.crop && video.crop.left && cropVideo.active != video._id) ? (`${video.crop.left * -1}px`) : '0px'
										}"
										:draggable="video.isIntro || video.isOutro ? false : true"
										class="frames_lock"
										@dragstart="dragFrame"
										@drop.prevent="preventDragFrames"
										@dragenter.prevent="preventDragFrames"
										@dragover.prevent="preventDragFrames"
										@dragover="preventDragFrames"
										@dragleave="preventDragFrames"
										@dragend="preventDragFrames"
										:id="`video_thumbs_${video._id}`"
										:ref="`video_ref_thumbs_${video._id}`"
										@click="activeCropModeVideo(video)"
										@keyup="$event.keyCode == 13 ? activeCropModeVideo(video, true) : ''"
										>
										<div class="crop_editor" v-if="cropVideo.active == video._id">
											<div class="left_overflow_crop" :style="{ width: `${cropVideo.left}px` }"></div>
											<div class="right_overflow_crop"
											:style="getCropVideoRight"></div>
											<VueDragResize       
												:parentLimitation="true"
												:isActive="true"
												:w="cropVideo.width"
												:h="47"
												:x="cropVideo.left"
												axis='x'
												:stickSize="47"
												@dragging="draggingCropFrame($event, video)"
												@resizing="draggingCropFrame($event, video)"
												@dragstop="dragCropFrameStop()"
												:preventActiveBehavior="true"
												@resizestop="dragCropFrameStop()"
												:sticks="['ml', 'mr']">
												<div class="">
													<div class="left_crop"></div>
													<div class="right_crop"></div>
												</div>
											</VueDragResize>
										</div>
										<div class="frame" v-for="(frame, index) in video.thumbs" :style="getFrameStyle(frame)" :key="index+video._id">
											<img draggable="false" @load="loadFrame(frame.src)" :src="frame.src" :alt="frame.src">
											<Preloader :scale=".5" v-if="!framesLoaded.find(fl => fl == frame.src)"/>
										</div>
									</div>
								</div>
							</div>
							
							<IconBtn class="plus_frames_btn" v-if="false" icon="plus" @change="uploadVideoFile" accept="video/*" :fileBtn="true"/>
						</div>
						<div class="outro_intro_wrpr" :style="{ height: `${videoTrackScrollHeight ? videoTrackScrollHeight + 'px' : '100%'}` }">
							<div class="intro_box"
								@dragenter.prevent="dragDropBox($event, 'intro_box')"
								@dragover.prevent="dragDropBox($event, 'intro_box')"
								@dragleave.prevent="dragDropBox($event, 'intro_box')"
								@drop="dragDropBox($event, 'intro_box')"
								:style="getIntroStyle">
								INTRO
							</div>
							
							<div class="outro_box"
								@dragenter.prevent="dragDropBox($event, 'outro_box')"
								@dragover.prevent="dragDropBox($event, 'outro_box')"
								@dragleave.prevent="dragDropBox($event, 'outro_box')"
								@drop="dragDropBox($event, 'outro_box')"
								:style="getOutroStyle">
								OUTRO
							</div>
						</div>
					</template>
				</Timeline>
			</template>
		</Wrapper>

    </div>
</template>

<script>

import utils from '../libs/utils';

window.utils = utils;
import Layouts from "@/components/layouts/";
import Base from "@/components/base/";
import VideoChat from "@/components/VideoChat";
import HeaderUsers from "@/components/HeaderUsers";
import VueDragResize from '../plugins/vue-drag-resize/src';
import editor from '../libs/editor';
import Modals from '../components/modals';
import AudioPlayer from '../components/AudioPlayer';
import ObjectPopup from '../components/modals/ObjectPopup';
import ExampleTimeline from '../components/base/ExampleTimeline';
import TimelineHorizontal from '../components/TimelineHorizontal';
import api from '../providers/api';
import history from '../libs/history';
import keyboard from '../libs/keyboard';

window._history = history;
export default {
	name: 'Home',
	components: { TimelineHorizontal, ExampleTimeline, ...Layouts, ...Modals, ...Base, VideoChat, HeaderUsers, VueDragResize, AudioPlayer, ObjectPopup },
	data() {
		const defaultSearchBl = {
			overview: false,
			videos: false,
			videosValue: '',
			overviewValue: '',
			elements: {
				value: '',
				show: false
			}
		};

		return {
			intervalScroll: null,
			dragFrameTarget: null,
			controls: {
				logo: false,
				text: false,
			},
			defaultSearchBl,
			search_bl: utils.cloneObject(defaultSearchBl),
			history, selectedTutorial: {},
			prevMode: {
				top: 1,
				bottom: 1
			},

			outroConfig: {
				leftOffset: 0,
			},
			scaleContent: 1,
			contextMenus: {
				subtitles: {
					options: [{
						name: 'Add subtitles',
						id: 'add',
					}, { type: 'divider' }, {
						name: 'Delete subtitles',
						class: 'red_text',
						id: 'delete'
					}]
				},
				video: {
					options: [{
						name: 'Add video',
						id: 'add_video',
					}, { type: 'divider' }, {
						name: 'Delete video',
						class: 'red_text',
						id: 'delete'
					}]
				},

				audio: {
					options: [{
						name: 'Add audio',
						id: 'add_audio'
					}, { type: 'divider' }, {
						name: 'Delete audio',
						class: 'red_text',
						id: 'delete'
					}]
				},

				image: {
					options: [{
						name: 'Add center',
						id: 'add'
					}, {
						 name: 'Contain',
						 id: 'contain'
					}, { type: 'divider' }, {
						name: 'Delete image',
						class: 'red_text',
						id: 'delete'
					}]
				}
			},

			timeline: {
				lockAutoScroll: false
			},

			line: {
				left: 0
			},
			selectedTimeLineSrc: '',
			currentTime: {
				m: '00',
				s: '00',
				c: '00',
			},
			previewMode: true,
			desktopMobileMode: 'mobile',
			steps: [
				'Overview & Brandkit', 'Add & Trim Intro / Outro', 'Captions / Subtitles', 'BRAND IT! / TEXT IT!', 'Check Audio & Video',
			],
			stepNumber: 1,
			audioFiles: [],
			frames: [],
			logoFiles: [],
			videoFiles: [],
			shapeElements: [],
			texturesElements: [],
			logoFileActive: null,
			videoFileActive: null,
			shapeElementActive: null,
			texturesElementActive: null,
			colorActive: null,
			grabTarget: null,
			volume: 80,
			fullScreenState: false,
			embedVideo: {
				currentTime: 0,
				isPlay: false,
				currentTimeLive: 0
			},

			videoTimeline: {
				left: 0,
				isEnd: false
			},

			search: {
				files: ''
			},
			dropOver: false,
			framesLoaded: [],

			audioRecorder: {
				recorder: {},
				isActive: false,
				currentTime: 0,
				volume: 0,
				selectedRecord: {
					meta: {}
				},
				stop: false
			},

			cropVideo: {
				left: 0,
				right: 0,
				width: 0,
				posTop: 0,
				_posTop: 0,
				posLeft: 0,
				_posLeft: 0,
				active: null,
				dragging: false,
				text: '', _text: ''
			},

			selectedVideoContextMenu: {},
			videoTrackScrollHeight: null,
		}
	},
	computed: {
		selectedVideo() {
			return this.cropVideo.active;
		},

		selectedContextObjectType() {
            return this.$store.state.selectedContextObject && this.$store.state.selectedContextObject.typeItem
                ? this.$store.state.selectedContextObject.typeItem : null;
        },

		storeStepNumber() {
			return this.$store.state.stepNumber;
		},

		changeStepNumber() {
			return this.stepNumber;
		},

		timelines() {
			return this.$store.state.videoPlayer.timelines;
		},

		clickElement() {
			return this.$store.state.events.clickElement;
		},

		tutorialSteps() {
			return this.$store.state.tutorialSteps;
		},
		
		getVideoLineMenu() {
			let values = [];
			const video = this.selectedVideoContextMenu;
			if(video && video._id) {
				if(video.isOutro || video.isIntro) {
					values.push({
						name: `Set as ${video.isIntro ? 'outro' : 'intro'}`,
						id: `change_position_${video.isIntro ? 'intro' : 'outro'}`
					});
				} else {
					values.push({ name: 'Clone video', id: 'clone' });
					// values.push({ name: `Set as intro`, id: 'change_position_intro' });
					// values.push({ name: `Set as outro`, id: 'change_position_outro' });

					// try {
					// 	const newVideos = JSON.parse(JSON.stringify(this.$store.state.selectedVideos))
					// 		.filter(vid => !vid.isOutro && !vid.isIntro);

					// 	const index = newVideos.findIndex(vid => vid._id == video._id);
					// 	console.log(index, newVideos);
					// 	if(index != -1) {
					// 		if(index > 0) {
					// 			values.push(...[{ type: 'divider' }, { name: `Move left`, id: 'move_left' }]);
					// 		}

					// 		if(index < newVideos.length - 1) {
					// 			values.push(...[{ type: 'divider' }, { name: `Move right`, id: 'move_right' }]);
					// 		}
					// 	}
					// } catch(err) {}
				}
			}

			//values.push({ type: 'divider' }, { name: 'Setting', id: 'setting' });
			return [...values, { type: 'divider' }, { name: 'Delete', id: 'delete', class: 'red_text' }];
		},

		getCropVideoRight() {
			const currentVideo = this.currentVideos.find(video => video._id == this.cropVideo.active);
			if(!currentVideo) return {};

			const newWidth = this.cropVideo.width + this.cropVideo.left;
			return { width: `${(currentVideo.thumbs.length * 80) - newWidth}px` };
		},

		getOutroStyle() {
			const outro = this.currentVideos.find(cv => cv.isOutro);
			// const intro = this.currentVideos.find(cv => cv.isIntro);

			// let margin = (this.outroConfig.introWidth - this.outroConfig.frameWidth) + 10;
			// if(!intro) { margin -= 330; }

			if(outro) {
				if(this.outroConfig.leftOffset) {
					const width = (outro.crop && this.cropVideo.active != outro._id ? outro.crop.width : outro.thumbs.length * 80);

					let el = this.$refs[`video_ref_thumbs_${outro._id}`];
					
					if(el && el[0]) {
						const scrollEl = document.getElementsByClassName('video_tracks_block_wrpr')[0];

						this.outroConfig.leftOffset = el[0].getBoundingClientRect().x + (scrollEl ? scrollEl.scrollLeft : 0);
					}
					
					//console.log(this.outroConfig.leftOffset);
					return {
						position: 'absolute', width: width + 'px',
						left: `${this.outroConfig.leftOffset + (outro.crop && this.cropVideo.active != outro._id ? outro.crop.left : 0)}px`
					};
				}

				// let result = { 'margin-right': `${margin}px` };

				// if(this.cropVideo.active == outro._id) {
				// 	result = { ...result, width: `${(outro.thumbs.length * 80)}px` };
				// } else {
				// 	const width = (outro.crop ? outro.crop.width : outro.thumbs.length * 80);
				// 	margin += (58 + 10)// + width;

				// 	console.log('WTF', width);
				// 	result = { ...result, width: width + 'px', 'margin-right': `${margin}px` };
				// }

				// return result;
			}

			return { 'margin-right': `${0}px` };
		},

		getIntroStyle() {
			const intro = this.currentVideos.find(cv => cv.isIntro);
			if(intro) {
				if(!intro.crop || this.cropVideo.active == intro._id)
					return { width: `${(intro.thumbs.length * 80) + 10}px` };
				
				return { width: intro.crop.width + 10 + 'px' };
			}

			return {  };
		},
		
		framesStyle() {
			if(this.currentVideos.find(cv => cv.isIntro)) {
				return {};
			} else {
				return { 'margin-left': '320px' };
			}
		},
		
		storeTexts() {
			return this.$store.state.videoPlayer.texts;
		},

		getVideoFormatStyles() {
			const { width, height } = this.$store.state.sizeWorkSpace;
			//console.log(width, height);

			let aspectRatio = 16/9;
			switch(this.$store.state.videoPlayer.format) {
				case 'story':
				case 'tiktok':
					aspectRatio = 9/16;
					break;
				case 'square':
					aspectRatio = 1/1;
					break;
				case 'tw-fb-portrait':
					aspectRatio = 4/5;
					break;
			}

			const sc = this.fullScreenState ? .85 : .90;
			const scHeight = this.fullScreenState ? .7 : .8;
			const mm = this.stepNumber == 5 ? 125 : 0;
			
			let max = Math.max((width * sc) - mm, height * scHeight);

			let widthCalc = 0;
			let heightCalc = 0;
			const paddingPreview = 20;
			if(this.desktopMobileMode == 'mobile' && this.previewMode) {
				max = 274;
				// const widthCalc = $('.preview_bottom').width() + paddingPreview;
				// const heightCalc = $('.preview_bottom').height() + $('.preview_top').height() + paddingPreview;

				// max = widthCalc;
			}

			let newHeight = (max / aspectRatio);
			if(newHeight > height * (!this.previewMode ? sc : scHeight)) {
				const scale = (height * (!this.previewMode ? sc : scHeight)) / newHeight;
				max *= scale;
				newHeight = max / aspectRatio;
			}

			if(max > width * sc) {
				const scale = (width * sc) / max;
				max = width * sc;
				newHeight *= scale;
			}

			if(this.previewMode) {
				const sc = this.fullScreenState ? .7 : .8;
				const scHeight = this.fullScreenState ? .5 : .7;

				const w = max;
				const h = newHeight;
				const topHeight = $('.preview_top').height();
				const bottomHeight = $('.preview_bottom').height();
				
				const sum = h + topHeight + bottomHeight;
				const toHeight = height * scHeight;

				const scale = toHeight / sum;
				max *= scale;
				newHeight *= scale;

				this.prevMode = { top: scale, bottom: scale };
			}

			return { width: `${max}px`, height: `${Math.ceil(newHeight)}px` }
		},

		videoFormat() {
			return this.$store.state.videoPlayer.format;
		},

		getEditorContentBoxStyle() {
			return {};

			let result = {};

			if(this.desktopMobileMode == 'desktop') {
				result = { transform: `scale(${this.scaleContent})` };
			}

			return result;
		},

		printTime() {
			return this.$store.state.videoPlayer.printTime;
		},

		timeLinePosition() {
			return this.$store.state.videoPlayer.timeLinePosition;
		},

		loader() {
			return this.$store.state.loader;
		},

		videoWrprSize(){
			// let height = this.$refs.videoWrprWrpr.$el.clientHeight + 'px';
			let height = '100%';
			return height;
		},

		getUploadedFiles() {
			return this.$store.state.files;
		},

		currentVideos() {
			return this.$store.state.selectedVideos;
		},

		updateTimeLive() {
			return this.embedVideo.currentTimeLive;
		}
	},

	watch: {
		selectedContextObjectType(typeItem) {
			if(typeItem != 'video' && this.cropVideo && this.cropVideo.active) {
				const video = this.currentVideos.find(vid => vid._id == this.cropVideo.active);
				if(video) { this.activeCropModeVideo(video, true); }
			}
		},

		selectedVideo(active) {
			keyboard.watchSelectedVideo(active);
		},

		storeStepNumber(num) {
			this.stepNumber = num;
		},

		changeStepNumber(number) {
			this.$store.state.stepNumber = number;
		},

		timelines(data = []) {
			if(!editor || !editor.canvas) return;
			const actives = data.filter(q => q.active);
			if(actives && actives.length == 1) {
				const active = actives[0];
				const obj = editor.canvas.getObjects().find(o => o._id == active._id);
				if(!obj) return;

				if(active.type == 'logo') {
					this.$store.state.selectedContextObject = obj ? { ...obj, timestamp: Date.now() } : undefined;
					//this.stepNumber = 1;
					this.controls.logo = true;
					return;
				}
				
				if(active.type == 'text') {
					this.$store.state.selectedContextObject = obj ? { ...obj, timestamp: Date.now() } : undefined;
					//this.stepNumber = 4;
					this.controls.text = true;
					return;
				}
			}

			this.controls = {
				logo: false,
				text: false
			}
		},
		
		clickElement(target) {
			if(target) {
				if(this.cropVideo && this.cropVideo.active && !$(target).closest('.frames_wrpr')[0]
					&& !$(target).closest('.video_properties_sidebar')[0]) {
					return this.activeCropModeVideo(this.currentVideos.find(vid => vid._id == this.cropVideo.active), true);
				}
			}
		},

		updateTimeLive(time) {
			this.currentTime = utils.parseSeconds(time);
		},

		currentVideos(videos) {
			this.embedVideo.isPlay = false;

			if(!videos.length) {
				this.stepNumber = 1;
			}
		},

		getUploadedFiles(files) {
			this.videoFiles = files.filter(file => file.type.includes('video')).map(video => ({
				...video,
				id: video.id, title: video.title,
				img: video.thumbs[0] ? video.thumbs[0].src : '',
			}));
			
			this.logoFiles = files.filter(file => file.type.includes('image')).map(img => ({ id: img.id, img: img.src, thumb: img.thumb }));
			this.audioFiles = files.filter(file => file.type.includes('audio')).map(audio => ({
				id: audio.id, src: audio.src, title: audio.title || 'Unnamed', author: audio.meta.author || 'Unnamed',
				duration: audio.meta.duration
			}));
		}
	},
	methods: {
		async sendReport() {
			const data = _history.generateHistoryToSave();
			if(data) {
				const description = prompt('Briefly describe the problem you are facing');

				this.$store.state.loader.text = 'Sending...';
				this.$store.state.loader.isActive = true;

				try {
					const response = await api.sendReport({ description, data });
					this.$swal(`Request sended!`, `Report ID: ${response._id}`);
				} catch(err) {
					this.$swal('Something went wrong, the request was not sent', '', 'error');
				}

				this.$store.state.loader.isActive = false;
			}
		},

		videoTrackScroll(ev) {
			const min = $('.video_tracks').height();
			const val = $('.track_rows').height() + $('.video_frames_row').height();

			this.videoTrackScrollHeight = val < min ? min : val;
		},

		getVideoIdByChildren(child) {
			if(!child) return;

			let element = child;
			if(!/^(frames_lock)/g.test(child.classList.toString())) {
				element = $(element).closest('.frames_lock')[0];
			}

			if(element) {
				return element.getAttribute('id').replace(/video_thumbs_/g, '');
			}

			return null;
		},

		dragFrame(event) {
			const crt = event.target.parentNode.cloneNode(true);
			crt.classList.add('dragging_test');

			crt.style.width = 'auto';
			crt.children[0].style.left = '0px';
			document.getElementsByClassName('hidden_block')[0].appendChild(crt);
			event.dataTransfer.setDragImage(crt, 0, 0);
			this.dragFrameTarget = this.getVideoIdByChildren(event.target);
			// $(ev.target).css({
			// 	position: 'absolute',
			// 	left: -1000,
			// 	bottom: -10001
			// });
		},

		preventDragFrames(ev) {
			ev.preventDefault();

			const dragTo = this.getVideoIdByChildren(ev.target);
			if(ev.type == 'dragover' && this.dragFrameTarget != dragTo) {
				const fromIndex = this.currentVideos.findIndex(cv => cv._id == this.dragFrameTarget);
				const toIndex = this.currentVideos.findIndex(cv => cv._id == dragTo);
				if(fromIndex == -1 || toIndex == -1 || this.currentVideos[toIndex].isIntro || this.currentVideos[toIndex].isOutro) {
					return;
				}
				
				$(`#video_thumbs_${dragTo}`).parent().addClass(`drag_position_${fromIndex > toIndex ? 'left' : 'right'}`);
			}

			if(ev.type == 'dragleave') {
				$(`#video_thumbs_${dragTo}`).parent().removeClass('drag_position_left');
				$(`#video_thumbs_${dragTo}`).parent().removeClass('drag_position_right');
			}

			if(ev.type == 'drop' && this.dragFrameTarget && this.dragFrameTarget != dragTo) {
				$(`#video_thumbs_${dragTo}`).parent().removeClass('drag_position_left');
				$(`#video_thumbs_${dragTo}`).parent().removeClass('drag_position_right');
				const toVideo = this.currentVideos.find(vid => vid._id == dragTo);
				if(toVideo.isIntro || toVideo.isOutro) {
					return;
				} else {
					const fromVideo = utils.cloneObject(this.currentVideos.find(cv => cv._id == this.dragFrameTarget));
					const toVideo = utils.cloneObject(this.currentVideos.find(cv => cv._id == dragTo));
					if(!fromVideo || !toVideo) return;

					let selected = false;
					const updateSelectedVideos = utils.cloneObject(this.currentVideos).reduce((result, vid) => {
						if(vid._id == this.dragFrameTarget) {
							selected = true;
						} else if(vid._id == dragTo) {
							if(selected) {
								result.push(...[vid, fromVideo]);
							} else {
								result.push(...[fromVideo, vid]);
							}
						} else {
							result.push(vid);
						}

						return result;
					}, []);

					this.$store.state.selectedVideos = updateSelectedVideos;

					history.add({ type: 'videos' });
					this.dragFrameTarget = false;
				}
			}

			$('.dragging_test').remove();
			////if(ev.type == 'drop' || ev.type == 'dragend') $('#dragging_test').remove();
		},

		changeText(ev, text, isUpdate = false) {
			editor.changeObjectParamsById({
				id: text._id,
				key: 'text',
				value: ev.target.innerText,
				isUpdate
			})
		},

		showSearchBar(key = '') {
			let isFocus = false;
			let ref = this.$refs.searchInput;

			if(key) {
				if(key == 'elements') {
					this.search_bl.elements.show = !this.search_bl.elements.show;
				}
			} else {
				if(this.stepNumber == 1) {
					this.search_bl.overview = !this.search_bl.overview;
					isFocus = this.search_bl.overview;
				} else {
					this.search_bl.videos = !this.search_bl.videos;
					isFocus = this.search_bl.videos;
				}
			}

			if(isFocus) {
				this.$nextTick(() => ref.focus());
			}
		},

		addManualSubtitles() {
			this.$store.state.editor.subtitles = {
				data: [{
					endTime: 1,
					id: 4,
					isNew: true,
					startTime: 0,
					text: "Manual subtitles",
				}],

				fileType: "application/x-subrip",
				perTime: 0,
				time: utils.getSelectedVideoDuration(),
				title: 'Manual subtitles',
				type: 'subtitle',
				_id: utils.generateUniqID()

			};

			this.$modal.show("subtitles_setting");
		},

		openTutorial(tutorial) {
			this.selectedTutorial = tutorial;
			this.stepNumber = tutorial.step;

			this.$modal.show('editor_tutorial');
		},

		resetLoader(ev) {
			if(ev.target.classList.toString() == 'justify') {
				const callback = this.$store.state.loader.cancel;
				if(callback) { callback(); }
			}
		},

		hideAllContextMenus() {
			for(const key in this.$refs) {
				try {
					this.$refs[key].hideContextMenu();
				} catch(err) {}
			}
		},

		openContextMenuTimelineVideo(event, video) {
			event.preventDefault();
			this.hideAllContextMenus();
			this.selectedVideoContextMenu = video;
			setTimeout(() => this.$refs.videoTimelineRowMenu.showMenu(event, video), 100);
		},

		getStyleCropWindow(video) {
			const frameWidth = video.thumbs.length * 80;

			if(video._id == this.cropVideo.active) {

			} else {
				const crop = video.crop;
				if(crop) {
					return {
						width: `${video.crop.width}px`
					};
				} else {
					return {
						width:  frameWidth + 'px'
					};
				}
			}
		},

		activeCropModeVideo(video, isClose = false) {
			if(!video) return;

			if(this.cropVideo.active && video._id == this.cropVideo.active) {
				if(isClose) {
					if(this.selectedContextObjectType == 'video') {
						this.$store.state.selectedContextObject = {};
					}
					
					this.$store.state.selectedVideos = this.$store.state.selectedVideos.map(vid => {
						if(vid._id == this.cropVideo.active) {
							const { startTime, endTime } = utils.calculateCropTimes(vid, this.cropVideo);
							const clone = JSON.parse(JSON.stringify(this.cropVideo));

							vid.crop = {
								left: clone.left,
								width: clone.width,
								startTime, endTime
							};
						}

						return vid;
					});
				}
				
				if(isClose) {
					history.add({ type: 'videos', data: utils.cloneObject(this.$store.state.selectedVideos) });
					this.cropVideo.active = false;
					this.$store.state.activeCropVideo = false;
				}
			} else {
				this.$store.state.selectedContextObject = {
					...JSON.parse(JSON.stringify(video)),
					typeItem: 'video'
				};

				const incr = video.meta.duration / video.thumbs.length;
				if(video.crop) {
					this.cropVideo = {
						...this.cropVideo,
						...JSON.parse(JSON.stringify(video.crop))
					};
				} else {
					this.cropVideo.left = 0;
					this.cropVideo.width = (video.thumbs.length * 80);
				}

				this.cropVideo.active = video._id;
				this.$store.state.activeCropVideo = video._id;
			}			
		},

		dragCropFrameStop() {
			this.cropVideo.dragging = false;
		},

		draggingCropFrame(ev, video) {
			this.cropVideo.left = ev.left;
			this.cropVideo.width = ev.width;

			const el = document.getElementById(`video_thumbs_${video._id}`);
			if(el) {
				const { x, y } = el.getBoundingClientRect();

				this.cropVideo.posLeft = x + ev.left;
				this.cropVideo._posLeft = x + ev.left + ev.width;

				this.cropVideo.posTop = y - 20;
				this.cropVideo._posTop = y - 20;
				
				this.cropVideo.dragging = true;

				const { startTime, endTime } = utils.calculateCropTimes(video, ev);

				this.cropVideo.text = `${utils.parseSeconds(startTime)}`;
				this.cropVideo._text = `${utils.parseSeconds(endTime)}`;
			}
		},

		async dragDropBox(ev, type) {
			ev.preventDefault();

			switch(type) {
				case 'intro_box':
				case 'outro_box': {
					if(ev.type == 'drop') {
						const file = ev.dataTransfer.files[0];
						ev.target.classList.remove('active');
						if(!file || !/^(video\/)/.test(file.type)) return;
						
						const fileData = await this.$store.dispatch('addFile', file);

						await this.$store.dispatch('updateFileById', {
							id: fileData.id,
							data: { [type == 'outro_box' ? 'isOutro' : 'isIntro']: true }
						});
						
						await this.videoFileActivate(fileData.id);
						return;
					} else if(ev.type == 'dragover') {
						const file = ev.dataTransfer.items[0];
						if(file && /^(video\/)/.test(file.type)) {
							ev.target.classList.add('active');
						}						
					} else if(ev.type == 'dragleave') {
						ev.target.classList.remove('active');
					}

					break;
				}
			}
		},

		async resetAll() {
			this.stepNumber = 1;
			await this.$store.dispatch('defaultVideoPlayer', true);
		},

		deleteRecorderAudio() {
			this.audioRecorder.stop = false;
			this.audioRecorder.isActive = false;
		},

		async addRecordingAudio() {
			this.deleteRecorderAudio();
			try {
				const data = await this.$store.dispatch('addFile', this.audioRecorder.selectedRecord.file);
				editor.addAudio(data);
			} catch(err) {
				this.$swal('Error', '', 'error');
			}
		},

		async stopRecording() {
			this.audioRecorder.stop = true;
			
			const data = await this.audioRecorder.recorder.stopRecording();
			this.audioRecorder.selectedRecord = {
				file: data.file,
				src: URL.createObjectURL(data.file),
				meta: { duration: data.duration }
			};
		},
		
		parseSeconds(time) {
			return utils.parseSeconds(time).toString();
		},

		async recordAudio() {
			this.audioRecorder.recorder = new utils.CustomRecorder();
			await this.audioRecorder.recorder.startRecording(({ currentTime, volume }) => {
				this.audioRecorder.currentTime = currentTime;
				this.audioRecorder.volume = volume;
			});

			this.audioRecorder.isActive = true;
		},

		 addSubtitle(subtitle) {
			const videos = this.$store.state.selectedVideos;
			if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

			editor.addSubtitle(subtitle);
		},

		async videoTimelineContextAction(data) {
			if(!data || !data.item || !data.option) return;

			switch(data.option.id) {
                case 'clone': {
					if(data.item.isOutro || data.item.isIntro) return;

					const _id = utils.generateUniqID();
                    const newItem = { ...JSON.parse(JSON.stringify(data.item)), _id };

					await this.$store.dispatch('addVideo', { video: newItem, append: true });
                    break;
                }

                case 'delete': {
                    await this.$store.dispatch('deleteVideoById', data.item._id);
                    break;
                }

				case 'change_position_intro':
				case 'change_position_outro': {
					const isIntro = /(intro)$/g.test(data.option.id);
					
					const _id = utils.generateUniqID();
                    const newItem = { ...JSON.parse(JSON.stringify(data.item)), _id };
					newItem[isIntro ? 'isIntro' : 'isOutro'] = false;
					newItem[isIntro ? 'isOutro' : 'isIntro'] = true;

					await this.$store.dispatch('addVideo', { video: newItem });
				}
            }
		},

		timelineContextAction(data) {
            if(!data || !data.item || !data.option) return;

            switch(data.option.id) {
                case 'clone': {
					const _id = utils.generateUniqID();
                    const newItem = { ...JSON.parse(JSON.stringify(data.item)), _id };

                    this.$store.state.videoPlayer.timelines.push(newItem);
					editor.cloneObjectById(data.item._id, _id);
                    break;
                }

                case 'delete': {      
					editor.deleteObjectById(data.item._id);
                    break;
                }
            }
        },

		async subtitleContext(data) {
			if(data.option && data.item && data.item.file_id) {
				const videos = this.$store.state.selectedVideos;

				switch(data.option.id) {
					case 'add': {
						if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

						this.addSubtitle(data.item);
						break;
					}

					case 'delete': {
						await this.$store.dispatch('removeSubtitleFileById', data.item.file_id);
						break;
					}
				}
			}
		},

		handleContextClick(event, item, refName = '') {
			event.preventDefault();
			this.hideAllContextMenus();
			
			this.$refs[refName].showMenu(event, item);
		},

		async imageContext(data) {
			if(data.option && data.item && data.item.id) {
				const videos = this.$store.state.selectedVideos;

				switch(data.option.id) {
					case 'add': {
						if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

						editor.addLogo(data.item);
						break;
					}

					case 'contain': {
						if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

						editor.addLogo(data.item, {}, 'contain');
						break;
					}
					
					case 'delete': {
						await this.$store.dispatch('removeFileById', data.item.id);
						break;
					}
				}
			}
		},

		async audioContext(data) {
			if(data.option && data.item && data.item.id) {
				const videos = this.$store.state.selectedVideos;

				switch(data.option.id) {
					case 'add_audio': {
						if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

						await editor.addAudio(this.getUploadedFiles.find(file => file.id == data.item.id));
						break;
					}

					case 'delete': {
						await this.$store.dispatch('removeFileById', data.item.id);
						break;
					}
				}
			}
		},
	
		async videoContext(data) {
			if(data.option && data.item && data.item.id) {
				switch(data.option.id) {
					case 'add_video': {
						await this.videoFileActivate(data.item.id, true);
						break;
					}

					case 'replace_video': {
						this.videoFileActivate(data.item.id);

						break;
					}

					case 'delete': {
						await this.$store.dispatch('removeFileById', data.item.id);
						break;
					}
				}
			}
		},

		preventDragVideoFile(e) {
			e.preventDefault();
		},

		async dropVideoFile(e) {
			e.preventDefault();
			const file = e.dataTransfer.files[0];
			if(file && /^(video)/g.test(file.type)) {
				const fileLocal = await this.$store.dispatch('addFile', file);
				this.videoFileActivate(fileLocal.id);
			}
		},

		async uploadVideoFile(event) {
			try {
				const file = event.target.files[0];
				event.target.value = '';
				const fileLocal = await this.$store.dispatch('addFile', file);
				console.log(fileLocal)
				this.videoFileActivate(fileLocal.id, true);
			} catch(err) {
				this.$swal('File upload error!', '', 'error');
				console.error(err);
			}
		},

		addVideoFile() {
			this.$refs.drop_file.click();
		},

		loadFrame(frameSrc) {
			this.framesLoaded.push(frameSrc);
		},

		showModal(modalName = '', isHide = false) {
            this.$modal[isHide ? 'hide' : 'show'](modalName);
        },

		searchFiles(event) {
			const val = event.target.value;

			if(this.stepNumber == 1) {
				this.search_bl.overviewValue = val;
			} else {
				this.search_bl.videosValue = val;
			}
		},

		getFiles(name, isBoolean = false, key, search = '') {
			let files = this[name].filter(file => `${file.name}, ${file.title}`.toLowerCase()
				.includes(search.toLowerCase()));
			
			if(key) {
				files = files.filter(file => file[key]);
			} else {
				files = files.filter(file => !file.isIntro && !file.isOutro);
			}

			return isBoolean ? files && files.length : files;
		},

		getFrameStyle(frame) {
			const scale = 80 / frame.width;
			const payload = {
				'max-width': '80px',
				position: 'relative',
				//height: `${frame.height * scale}px`
			};
			 
			const diff = frame.duration - parseInt(frame.duration);
			if(frame.isLast && diff > 0 && false) {
				return { ...payload, width: `${diff * 80}px` };
			} else {
				return payload;
			}
		},

		toDurationVideoEmbed(time) {
			this.embedVideo.currentTime = time;
		},
		
		dragHorizontalLine(data = {}, ignoreUpdate = false) {
			const end = data.isStop;
			this.videoTimeline = { ...data, isEnd: end };

			// clearInterval(this.intervalScroll);
			// const scrollLeft = $('.video_tracks_block_wrpr')[0].scrollLeft;
			// const isLeft = data.left - scrollLeft < this.$store.state.mouse.x;
			// const isRight = data.left - scrollLeft < this.$store.state.mouse.x;
			// if((isLeft || isRight) && !end) {
			// 	this.intervalScroll = setInterval(() => {
			// 		//console.log(Date.now());
			// 		this.dragHorizontalLine({ ...data, left: data.left - 1 });
			// 		this.$store.state.videoPlayer.timeLinePosition = data.left - 1;
			// 	}, 10);
			// }

			// try {
			// 	const incr = 40;
			// 	const left = data.left;
			// 	const scrollLeft = $('.video_tracks_block_wrpr')[0].scrollLeft;
			// 	const full_width = $('.video_tracks').width();
			// 	const visibleWidth = this.$refs.control_bar.$el.clientWidth;
				
			// 	const to = (scrollLeft + visibleWidth) - incr;
			// 	if(to < left) {
			// 		const scroll = scrollLeft + (left - to);
			// 		if(scroll >= full_width - incr) return;
			// 		$('.video_tracks_block_wrpr')[0].scrollTo(scrollLeft + (left - to), 0);
			// 	}

			// 	const diffLeft = left - scrollLeft;
			// 	if(diffLeft <= incr) {
			// 		$('.video_tracks_block_wrpr')[0].scrollTo(left - incr <= 0 ? 0 : left - incr, 0);
			// 	}
			// } catch(err) {
			// 	console.error(err);
			// }
			
			// return;
			this.$store.state.videoPlayer.timeLinePosition = data.left;

			// if(!ignoreUpdate) {
			// 	this.currentTime = utils.parseSeconds(data.left / 80);
			// 	this.embedVideo.currentTimeLive = data.left / 80;
			// 	this.embedVideo.currentTime = data.left / 80;
			// }
		},

		changeLockAutoScrollTimeline(isLock = false) {
			this.timeline.lockAutoScroll = isLock;
		},

		rewindVideo(to) {
			if(!this.currentVideos || !this.currentVideos.length) return;

			this.$store.state.videoPlayer.rewind[to] += 1;
			return;
			const maxDuration = utils.parseVideos(this.currentVideos).duration;

			if(to == 'forward') {
				this.embedVideo.currentTimeLive += 5
				if(this.embedVideo.currentTimeLive > maxDuration) {
					this.embedVideo.currentTimeLive = maxDuration;
				}

				this.embedVideo.currentTime = this.embedVideo.currentTimeLive;
			} else if(to == 'backward') {
				this.embedVideo.currentTimeLive -= 5;
				if(this.embedVideo.currentTimeLive < 0) {
					this.embedVideo.currentTimeLive = 0;
				}
				
				this.embedVideo.currentTime = this.embedVideo.currentTimeLive;
			}
		},
		
		pauseVideoEmbed() {
			this.embedVideo.isPlay = false;
		},
		
		playVideoEmbed() {
			this.embedVideo.isPlay = true;
		},

		embedVideoPlay() {
			this.embedVideo.isPlay = !this.embedVideo.isPlay;
		},

		updateVideoCurrentTime() {
			return;
			//this.embedVideo.currentTimeLive = time;
			//this.line.left = lineLeft; //(time * 80);
			//this.dragHorizontalLine(this.line, true);

			if(this.timeline.lockAutoScroll) return;
			const horizontalElem = this.$refs.horizontal_line;
			const timeLineElem = this.$refs.timeline.$el;

			const horizontalLeft = parseInt(horizontalElem.parentNode.style.left);
			const clientWidth = timeLineElem.clientWidth;
			const scrollLeft = timeLineElem.scrollLeft;

			if((horizontalLeft - scrollLeft) > clientWidth / 2) {
				const scrollX = horizontalLeft - clientWidth / 2;

				timeLineElem.scrollTo(scrollX, timeLineElem.scrollTop);
			}
		},

		async uploadFile(e, key) {
			const file = e.target.files[0];
			if(!file) return;

			const fileData = await this.$store.dispatch('addFile', file);

			if(key) {
				this.$store.dispatch('updateFileById', {
					id: fileData.id,
					data: { [key]: true }
				});
			}

			if(/^(audio\/)/g.test(fileData.type)) {
				await editor.addAudio(fileData);
			}

			e.target.value = '';
		},

		onTimestamp(ev) {
			this.line.left = ev.layerX;
			this.dragHorizontalLine({ left: ev.layerX, isPoint: true }, true);
			return ;
			//
			this.line.left = ev.layerX;
			this.dragHorizontalLine(this.line, true);
			const selectedVideos = this.$store.state.selectedVideos;
			if(selectedVideos && selectedVideos.length) {
				const currentTime = Number(ev.s) + (Number(ev.m) * 60) + (Number(ev.c) / 100);

				this.embedVideo.currentTime = currentTime;
			}
			
			// this.currentTime = {
			// 	m: ev.m,
			// 	s: ev.s,
			// 	c: ev.c
			// }
		},
		previewModeToggle(){
			this.previewMode = !this.previewMode;
			if(this.previewMode) this.desktopMobileMode = 'mobile';
		},

		dMobToggle(val) {
			this.previewMode = !(val === 'desktop');

			this.desktopMobileMode = val;
		},
		nextStep(){
			this.stepNumber += 1;
		},
		stepChange(val) {
			this.stepNumber = val;
			this.search_bl = utils.cloneObject(this.defaultSearchBl);
		},
		
		textElementAdd(type){
			const videos = this.$store.state.selectedVideos;
			if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);

			editor.addText(type);
		},
		
		logoFileActivate(id){
			if(id) {
				const videos = this.$store.state.selectedVideos;
				if(!videos || !videos.length) return this.$swal(...this.$store.state.messages.waitingVideo);
					
				//this.logoFileActive = id;
				editor.addLogo(this.getUploadedFiles.find(logo => logo.id == id), { /* TODO TIMELINE FOR HISTORY */ });
			} else {
				//this.logoFileActive = null;
			}
			
		},

		async videoFileActivate(id, append = false){
			if(id){				
				//this.videoFileActive = id;
				const video = this.getUploadedFiles.find(video => video.id == id);
				if(video) {
					await this.$store.dispatch('addVideo', { video, append });
					
					const thumbs = utils.parseVideos(this.$store.state.selectedVideos).thumbs.map(th => {
							const fr = this.frames.find(f => f.src == th.src);
							if(fr) {
								th.complete = fr.complete;
							}

							return th;
						});

					this.frames = thumbs;
					if(append || video.isIntro || video.isOutro) {
						this.selectedTimeLineSrc = thumbs[0].src;
					} else {
						this.framesLoaded = [];

						this.$store.state.videoPlayer.canvasInit += 1;
						this.$store.dispatch('defaultVideoPlayer');
						this.line.left = 0;
					}
					
					this.videoTime = (video.meta.duration * 1000);
				}
			} else {
				//this.videoFileActive = null;
			}
		},

		shapeElementActivate(id) {
			if(id) {
				this.shapeElementActive = id;
			} else {
				this.shapeElementActive = null;
			}
		},

		textureElementActivate(id) {
			if(id) {
				this.texturesElementActive = id;
			} else {
				this.texturesElementActive = null;
			}
		},

		colorChange(value) {
			this.colorActive = value;
		},

		videoFormatChange(value) {
			this.$store.state.videoPlayer.format = value;
		},
		
		volumeChange(value) {
			this.$store.state.videoPlayer.volume = value / 100;
			//this.volume = value;
		},

		fullScreen() {
			this.fullScreenState = !this.fullScreenState;
			if(this.fullScreenState) {
				document.documentElement.requestFullscreen();
			} else {
				if(document.fullscreenElement) {
					document.exitFullscreen();
				}
			}
		},
	},
	mounted() {
		const timelineEl = document.getElementsByClassName('bottom_section')[0];
		const framesWrprEl = document.getElementsByClassName('frames_wrpr')[0];
		const workSpace = $('.main_workflow_section');

		new ResizeObserver(ev => {
			this.$store.state.sizeWorkSpace = {
				width: workSpace.width(),
				height: workSpace.height()
			};
		}).observe(workSpace[0]);
		
		// new ResizeObserver(() => {
		// 	this.outroConfig = {
		// 		frameWidth: $('.frames_wrpr').width() + 320,
		// 		introWidth: $('.outro_intro_wrpr').width()
		// 	};
		// }).observe(timelineEl);
		
		new ResizeObserver(() => {
			const outro = this.currentVideos.find(cv => cv.isOutro);

			if(outro) {
				let el = this.$refs[`video_ref_thumbs_${outro._id}`];
				if(el && el[0]) {
					this.outroConfig = { ...this.outroConfig, leftOffset: el[0].getBoundingClientRect().x };
				}
			}
		}).observe(framesWrprEl);
	}
}
</script>

<style scoped>
.hidden_block {
	position: absolute;
	left: -1000000px;
	top: -1000000px;
}

.drag_position_left {
	border-left: 3px solid #C3E365;
}

.drag_position_right {
	border-right: 3px solid #C3E365;
}

.drag_position_left, .drag_position_right {
	transition: 0s !important;
}

.drag_position_left:hover, .drag_position_right:hover {
	transition: 0s;
}

.shadow_frames {
    z-index: 1;
    transition: .2s;
    box-shadow: 0 0 9px 6px #b9b9b9;
    box-shadow: 0 0 6px 1px #ffffff;
}

.search_files {
	border: 0;
    background: transparent;
    background-position: 100% center;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: #9BAFB3;
    margin-bottom: 5px;
    padding: 8px 0;
    display: block;
    width: 100%;
}

.search_files input {
	background: #142f34;
    border: none;
    border-radius: 30px;
    padding: 6px 6px 6px 10px;
    width: 100%;
    margin-top: 10px;
	color: #9BAFB3;
}

.search_files input::placeholder {
	color: #4a6367;
}

.head_search {
	display: flex;
	align-items: center;
}

.head_search span {
	flex: 1;
	user-select: none;
}

.head_search img {
	cursor: pointer;
}

.search_input {
	opacity: .5;
	transition: .4s;
	border-bottom: 1px solid #9BAFB3;
}

.search_input:focus {
	opacity: 1;
	transition: .4s;
}

/* .search_input::placeholder {
	color: #4d6569;
}

.search_input:focus::placeholder {
	color: #9BAFB3;
} */

.undo_redo_btns a.disabled {
	pointer-events: none;
}

.preview_loc {
	display: flex;
    justify-content: center;
    align-items: center;
}

.preview_loc > div {
	height: 34px;
}

.preview_bottom {
	transform-origin: top;
	height: 107px;
	display: flex;
	flex-direction: column;
	widows: 100%;
	user-select: none;
	pointer-events: none;
	cursor: pointer;
}

.left_prev svg {
	margin-left: 12px;
}

.left_prev svg:first-child {
	margin-left: 0;
}

.preview_fl {
	display: flex;
	flex-direction: row;
	margin-bottom: 10px;
}

.description_prev {
	font-size: 13px;
	line-height: 1.4;
}

.icons_prev_like {
	position: relative;
	display: inline-block;
	width: 36px;
	height: 12px;
}

.tags_prev {
	color: #4a75a4;
}

.icons_prev_like img {
	height: 16px;
	width: 16px;
	position: absolute;
	border: 1px solid #fff;
	z-index: 3;
}

.icons_prev_like img:nth-child(1) {
	left: 10px;
	z-index: 2;
}

.icons_prev_like img:nth-child(2) {
	left: 20px;
	z-index: 1;
}

.preview_top {
	transform-origin: bottom;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	width: 100%;
	user-select: none;
	pointer-events: none;
	cursor: pointer;
}

.preview_top > div:last-child {
	height: 100%;
	display: flex;
	align-items: center;
}

.left_prev {
	flex: 1;
	height: 100%;
	display: flex;
	flex-direction: row;
}

.left_prev > div {
	height: 100%;
	font-size: 12px;
	font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}

.left_prev > div:last-child {
	margin-left: 5px;
	line-height: 16px;
}

.preview_logo {
	border-radius: 50%;
	height: 52px;
}


.video_effects {
	position: absolute;
	z-index: 2;
	top: 3px;
	left: 5px;
	pointer-events: none;
}

.video_effects svg {
	display: inline-block;
	border-radius: 50% !important;
	padding: 3px;
	margin: 1px;
	background: #C3E365;
	border: 1px dashed #001B1F;
	height: 18px !important;
	width: 18px !important;
}

.video_effects svg path {
	fill: #001B1F;
}

.crop_window {
	overflow: hidden;
	position: relative;
}

.left_overflow_crop, .right_overflow_crop {
	width: 0px;
	background: rgba(0, 0, 0, .9);
	z-index: 99999;
	position: absolute;
	height: 100%;
}

.left_overflow_crop {
	left: 0;
}

.right_overflow_crop {
	right: 0;
}

.title_crop_video {
	position: absolute;
    color: #fff;
	z-index: 999;
}

.left_crop {
	background: red;
	height: 47px;
	width: 10px;
	position: absolute;
	left: 0;
}

.right_crop {
	right: 0;
	position: absolute;
	background: red;
	height: 47px;
	width: 10px;
}

.crop_editor {
    position: absolute;
    z-index: 99999;
	width: 100%;
	height: 47px;
}

.intro_box.active, .outro_box.active {
	color: #26535a;
	transition: .2s;
}

.intro_box {
	width: 330px;
	min-width: 0px;
}

.outro_box {
	width: 310px;
	min-width: 0px;
}

.recording_menu {
	display: flex;
    flex-direction: column;
	color: #fff;
}

.recording_menu .time_recording {
	width: 100%;
	padding: 3px;
	text-align: center;
}

.recording_menu .volume {
	height: 6px;
	width: calc(100% - 6px);
	background: #fff;
	margin: 10px 3px;
	border-radius: 3px;
	overflow: hidden;
}

.recording_menu .volume span {
	height: 100%;
	background: red;
	display: block;
}

.sub_button {
	background: #0F282C;
    border-radius: 5px;
    padding: 10px;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    color: #FFFFFF;
    margin-bottom: 5px;
    cursor: pointer;
    transition: 0.15s all ease-in-out;
	outline: none;
	border: none;
	text-align: left;
	word-break: break-all;
}

.sub_button:hover {
	opacity: 0.7;
}

.sub_button > svg {
	width: 13px;
    height: 13px;
    display: inline-block;
    margin: 3px;
    vertical-align: bottom;
}

.sub_button > svg path {
	fill: #fff;
}

.frames_wrpr > div {
	transition: .2s;
}

.frames_wrpr > div:hover {
	cursor: pointer;
	z-index: 1;
	/* background: #09292E; */
	transition: .2s;
	box-shadow: 0 0 9px 6px #b9b9b9;

	box-shadow: 0 0 6px 1px #ffffff;
	/* background: #fff; */
}

.video_wrpr {
	display: flex;
    justify-content: center;
}

.video_frames_row .frames_wrpr .frame img:last-child, .video_frames_row .frames_wrpr .frame img:first-child {
	border-radius: 0 !important
}

.crop_window .frame {
	overflow: hidden;
	height: 45px;
}

.crop_window .frame:last-child {
	border-radius: 0 7px 7px 0 !important;
	border-radius: 0 !important;
}

.crop_window .frame:first-child {
	border-radius: 7px 0 0 7px !important;
	border-radius: 0 !important;
}

.loader .text p{
	margin-top: 8px;
}

.loader {
	position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgb(49 49 49 / 50%);
    z-index: 9999999999;
}

.loader > .justify {
	position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loader > .justify > .content .text {
	margin-top: 15px;
}

.loader > .justify > .content {
	background: #fff;
    padding: 15px;
    border-radius: 10px;
    min-width: 150px;
    text-align: center;
}

.drop_video {
	cursor: pointer;
	width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed #9BAFB3;
    border-radius: 10px;
	transition: .1s;
}

.drop_video.active {
	border: 2px dashed #70ce8c;
	transition: .1s;
}

.drop_video.active .center_drop {
	color: #70ce8c;
	transition: .1s;
}

.drop_video:hover {
	border: 2px dashed #70bece;
	transition: .1s;
}

.drop_video:hover .center_drop {
	color: #70bece;
	transition: .1s;
}

.drop_video .center_drop {
	transition: .1s;
	font-size: 30px;
    color: #9BAFB3;
    text-align: center;
    padding: 20px;
}
</style>

<style>

.dragging_test {
	display: inline-block;
}

</style>

<style lang="scss">
	.desktop_mobile_toggle {
		background-color: #001b1f;
		z-index: 1;
	}
	.video_track_time {
		> .vdr {
			height: 100%!important;
			bottom: 0;
		}
	}
	.video_wrpr_wrpr {
		height: auto;
		/* overflow: hidden; */
		position: relative;
		width: 100%;
		&.video_format_original {
			img {
				width: 100%;
			}
		}
		&.video_format {
			&_square,
			&_youtube,
			&_landscape,
			&_tw-fb-portrait,
			&_tw-fb-landscape,
			&_story,
			&_tiktok,
			&_fb-cover,
			&_pinterest,
			&_linkedIn-landscape,
			&_linkedIn-portrait {
				.video_wrpr {
					position: absolute;
					height: 0;
					width: 100%;
					img {
						display: block;
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						width: 100%;
						height: 100%;
						object-fit: cover;
						object-position: center;
					}
				}
			}
		}

		&.video_format_square {
			padding-bottom: 100%;
			.video_wrpr {
				padding-bottom: 100%;
			}
		}
		&.video_format_youtube,
		&.video_format_landscape {
			padding-bottom: 55.6%;
			.video_wrpr {
				padding-bottom: 55.6%;
			}
		}
		&.video_format_tw-fb-portrait {
			padding-bottom: 125%;
			.video_wrpr {
				padding-bottom: 125%;
			}
		}
		&.video_format_tw-fb-landscape {
			padding-bottom: 80%;
			.video_wrpr {
				padding-bottom: 80%;
			}
		}
		&.video_format_story,
		&.video_format_tiktok {
			padding-bottom: 178%;
			.video_wrpr {
				padding-bottom: 178%;
			}
		}
		&.video_format_fb-cover {
			padding-bottom: 38%;
			.video_wrpr {
				padding-bottom: 38%;
			}
		}
		&.video_format_pinterest {
			padding-bottom: 150%;
			.video_wrpr {
				padding-bottom: 150%;
			}
		}
		&.video_format_linkedIn-landscape {
			padding-bottom: 42%;
			.video_wrpr {
				padding-bottom: 42%;
			}
		}
		&.video_format_linkedIn-portrait {
			padding-bottom: 240%;
			.video_wrpr {
				padding-bottom: 240%;
			}
		}
	}

	.canvas_dash {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.video_format_original {
		overflow: visible;
	}

	.crop_window .frame {
		pointer-events: none;
	}

	.crop_window .frame img {
		width: 80px !important;
		height: 100%;
		object-fit: cover;
	}
	
	.frame {
		width: 80px !important;
	}
</style>
