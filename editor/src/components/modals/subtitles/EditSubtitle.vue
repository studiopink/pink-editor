<template>
    <div class="sidebar_subtitles">
		<h3>Properties</h3>

		<div class="global_config_subt">
			<label>
				<span>Title</span>
				<input type="string" :value="selectedEditSubtitle.title" @input="selectedEditSubtitle.title = $event.target.value">
			</label>

			<label>
				<span>Start time subtitles</span>
				<input type="number" :value="toFixed(selectedEditSubtitle.perTime)" step=".01" @change="changeStartTime">
			</label>

			<label>
				<span>Duration</span>
				<input type="number" :value="toFixed(selectedEditSubtitle.time)" step=".01" @change="changeDuration">
			</label>
		</div>

		<h3>Subtitles</h3>
		<div class="subtitles_editor">
			<!-- <div class="time" v-for="(sub, index) in (selectedEditSubtitle.data || [])" :key="index"
				:id="`time_subtitles_${sub.id}`">
				<div class="time_menu" :class="{ new_subtitle: sub.isNew }">
					<label>
						<span>Start time</span>
						<input type="string" :value="parseTime(sub.startTime)"
							@input="inputTimeSubtitle($event)"
							@change="updateTimeSubtitle(sub, $event, 'startTime')"
						/>
					</label>

					<label>
						<span>End time</span>
						<input type="string"
							@change="updateTimeSubtitle(sub, $event, 'endTime')"
							:value="parseTime(sub.endTime)"
							@input="inputTimeSubtitle($event)"
						/>
					</label>
				</div>

				<textarea :value="sub.text" style="resize: none" @input="writeText(sub, $event)"></textarea>

				<input type="checkbox" v-model="sub.active"/>
			</div> -->
			<SelectField placeholder="Select subtitles"
				:value="selectedSubtitle.id"
				:options="selectedEditSubtitle.data.map(q => ({ text: minifyText(q.text), value: q.id }))"
				@change="changeSubtitles"
			/>
			
			<TextareaField placeholder="Message" :value="selectedSubtitle.text" @input="printTextSubtitle"/>

			<div class="time_menu" :class="{ new_subtitle: selectedSubtitle.isNew }">
				<label>
					<span>Start time</span>
					<input type="string" :value="parseTime(selectedSubtitle.startTime)"
						@input="inputTimeSubtitle($event)"
						@change="updateTimeSubtitle(selectedSubtitle, $event, 'startTime')"
					/>
				</label>

				<label>
					<span>End time</span>
					<input type="string"
						@change="updateTimeSubtitle(selectedSubtitle, $event, 'endTime')"
						:value="parseTime(selectedSubtitle.endTime)"
						@input="inputTimeSubtitle($event)"
					/>
				</label>
			</div>
		</div>

		<div class="panel">
			<a class="brdr_btn delete"
				@click="deleteSelectedSubtitles()">
				Delete
			</a>

			<a class="brdr_btn add_subtitles" @click="addNewSubtitle()">
				<svg height="448pt" viewBox="0 0 448 448" width="448pt" xmlns="http://www.w3.org/2000/svg"><path d="m408 184h-136c-4.417969 0-8-3.582031-8-8v-136c0-22.089844-17.910156-40-40-40s-40 17.910156-40 40v136c0 4.417969-3.582031 8-8 8h-136c-22.089844 0-40 17.910156-40 40s17.910156 40 40 40h136c4.417969 0 8 3.582031 8 8v136c0 22.089844 17.910156 40 40 40s40-17.910156 40-40v-136c0-4.417969 3.582031-8 8-8h136c22.089844 0 40-17.910156 40-40s-17.910156-40-40-40zm0 0"/></svg>
				Add subtitles
			</a>

			<a class="brdr_btn" @click="updateSubtitles()">Save</a>
		</div>
	</div>
</template>

<script>

import DragModal from '../DragModal';
import utils from '../../../libs/utils';
import history from '../../../libs/history';
import Base from "@/components/base/";

export default {
  name: "EditSubtitle",
  components: { DragModal, ...Base },
  props: {},
  data: () => {
	  return {
		  selectedSubtitle: {}
	  };
  },

  methods: {
	changeSubtitles(ev) {
		const id = ev.target.value;
		this.selectedSubtitle = this.selectedEditSubtitle.data.find(sub => sub.id == id);
	},

	printTextSubtitle(ev) {
		const text = ev.target.value;
		this.selectedSubtitle.text = text;
	},

	minifyText(text) {
		if(text.length > 28) {
			return text.slice(0, 28) + '...';
		}

		return text;
	},
	
	toFixed(num) {
		return !num ? 0 : Number(num.toFixed(2));
	},

	changeStartTime(ev) {
		const value = Number(ev.target.value);
		if((!value && value != 0) || value < 0) {
			return this.$swal('Invalid value, please enter a number greater than zero!', '', 'warning');
		}

		this.$store.state.editor.subtitles.perTime = value;
	},

	changeDuration(ev) {
		const value = Number(ev.target.value);
		if(!value || value <= 0) {
			return this.$swal('Invalid value, please enter a number greater than zero!', '', 'warning');
		}

		this.$store.state.editor.subtitles.time = value;
	},

	writeText(sub, ev) {
		this.$store.state.editor.subtitles.data = this.$store.state.editor.subtitles.data.map(item => {
			if(item.id == sub.id) {
				item.text = ev.target.value;
			}

			return item;
		});
	},

	updateSubtitles() {
		const indexSubtitle = this.$store.state.videoPlayer.timelines
			.findIndex(timeline => timeline._id == this.selectedEditSubtitle._id);

		const updateSubtitles =  {
			...this.selectedEditSubtitle,
			data: this.selectedEditSubtitle.data.map(subtitle => {
				delete subtitle.isNew;
				delete subtitle.active;

				return subtitle;
			})
		};

		if(indexSubtitle != -1) {
			this.$store.state.videoPlayer.timelines[indexSubtitle] = JSON.parse(JSON.stringify(updateSubtitles));
		} else {
			this.$store.state.videoPlayer.timelines.push(updateSubtitles);
		}

		this.$store.state.videoPlayer.timelines = JSON.parse(JSON.stringify(this.$store.state.videoPlayer.timelines));

		history.add({ type: 'videoPlayer' });
		this.$modal.hide('subtitles_setting');
	},

	sortByTimeStart() {
		this.$store.state.editor.subtitles.data = (this.selectedEditSubtitle.data || [])
			.sort((a, b) => a.startTime == b.startTime ? 0 : (a.startTime > b.startTime ? 1 : -1));
	},
	
	addNewSubtitle() {
		const data = this.selectedEditSubtitle.data || [];
		const newId = data.reduce((res, item) => {
			if(Number(item.id) >= res) {
				res = Number(item.id) + 1;
			}   

			return res;
		}, 1);

		const sub = {
			id: newId, startTime: 0, endTime: 1,
			text: "New text", isNew: true
		};

		this.$store.state.editor.subtitles.data.push(sub);
		this.sortByTimeStart();

		this.selectedSubtitle = sub;
	},

    parseTime(time) {
        return utils.parseSeconds(time).toString();
    },

    inputTimeSubtitle(ev) {
        ev.target.classList.remove('input_invalid');
    },

    setErrorSubsribeInput(ev, text) {
        ev.target.classList.add('input_invalid');
        this.$swal(text, '', 'warning');
        ev.target.focus();
    },

	updateTimeSubtitle(sub, ev, to) {
        const time = ev.target.value;
		const regexpTime = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm;
		const isCorrectTime = regexpTime.test(time);

        if(!isCorrectTime) { // !(regexpTime.test(time))
            return this.setErrorSubsribeInput(ev, 'Bad time!<br>Write in format: mm:ss:ms');
        }

        const newTime = time.split(':').reduce((acc,time, index) => {
            const tt = Math.abs(Number(time));

            return acc + (index == 0 ? tt * 60 : (index == 1 ? tt : tt / 100));
        }, 0);
        
        if(to != 'startTime' && to != 'endTime') return;
        if(to == 'startTime') {
            if(newTime >= sub.endTime) {
                return this.setErrorSubsribeInput(ev, 'The start time cannot be equal to or greater than the end time!'); 
            }				
        } else if(to == 'endTime') {
            if(newTime <= sub.startTime) {
                return this.setErrorSubsribeInput(ev, 'The end time cannot be equal or less than the start time!'); 
            }
        }

        this.$store.state.editor.subtitles.data = (this.selectedEditSubtitle.data || []).map(item => {
            if(item.id == sub.id) {
                item[to] = newTime;
            }

            return item;
        });

		this.sortByTimeStart();
    },

    deleteSelectedSubtitles() {
		this.$store.state.editor.subtitles.data = (this.selectedEditSubtitle.data || [])
			.filter(sub => sub.id != this.selectedSubtitle.id);

		this.selectedSubtitle = this.selectedEditSubtitle.data[0] || {};
    },
  },

  computed: {
    selectedEditSubtitle() {
        return this.$store.state.editor.subtitles;
    },
  },

  mounted() {
	  this.selectedSubtitle = this.selectedEditSubtitle.data[0];
  }
}

</script>

<style scoped>
.sidebar_subtitles {
	color: #9BAFB3;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.sidebar_subtitles > h3 {
	text-align: center;
}

.sidebar_subtitles .global_config_subt {
	height: 185px;
}

.sidebar_subtitles .subtitles_editor {
	height: 100%;
	overflow: hidden auto;
	margin-bottom: 8px;
}

.sidebar_subtitles > .panel {
	height: 114px;
}

.global_config_subt {
	display: flex;
	flex-direction: column;
	padding-bottom: 3px;
}

.global_config_subt label {
	flex: 1;
}

.global_config_subt label {
	display: flex;
	flex-direction: column;
}

.global_config_subt label > span {
	margin-bottom: 5px;
}

.global_config_subt label input {
	color: #688286;
    background: #0F282C;
    border: 0;
    appearance: none;
    outline: none;
    width: calc(100%);
    margin-bottom: 5px;
    padding: 10px 11px;
    border-radius: 5px;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
}

.global_config_subt label input[type="number"] {
	text-align: center;
}

.time_menu.new_subtitle {
	border-left: 2px solid #316325;
    padding-left: 10px;
}

.time_menu {
	border-left: 2px solid rgba(0, 0, 0, 0);
    padding-left: 10px;
}

.input_invalid {
	background: #ff0000;
    color: #fff;
}

.sidebar_subtitles .panel {
	display: flex;
    justify-content: center;
	flex-direction: column;
	width: 100%;
	position: relative;
	right: 0;
	bottom: 0;
}

.sidebar_subtitles .panel .add_subtitles {
	border: 1px solid #024801;
}

.sidebar_subtitles .panel .add_subtitles svg {
	width: 13px;
    height: 13px;
}

.sidebar_subtitles .panel .add_subtitles svg path {
	fill: #9BAFB3;
}

.sidebar_subtitles .panel .brdr_btn {
	flex: 1;
	margin: 5px 0 0 0;
	user-select: none;
}

.sidebar_subtitles .panel .brdr_btn.delete {
	border-color: #f00;
}

.sidebar_subtitles .panel .brdr_btn.delete.disabled {
	opacity: .5;
	cursor: auto;
	pointer-events: none;
}

.subtitles_editor {
	margin-top: 3px;
	max-height: 582px;
    overflow: hidden auto;
}

.subtitles_editor > .time {
	align-items: center;
	display: flex;
    flex-direction: row;
    width: 100%;
	margin: 5px 0;
    padding-bottom: 6px;
}

.subtitles_editor > .time textarea {
	height: 70px;
}

.subtitles_editor > .time input[type="checkbox"] {
	width: 70px;
    height: 70px;
}

.subtitles_editor .time:last-child {
	border: none;
    padding-bottom: 0;
}

.subtitles_editor > .time > textarea {
	flex: 2;
}

.subtitles_editor > .time > div {
	display: flex;
	justify-content: center;
	flex-direction: column;
}

.subtitles_editor > .time input {
	text-align: center;
	padding: 8px;
}

.subtitles_editor > .time label {
	display: flex;
	align-items: center;
	font-size: 16px;
}

.subtitles_editor > .time label span, .subtitles_editor > .time label input {
	flex: 1;
	margin: 0 3px;
	vertical-align: middle;
}

.time_menu {
	padding: 0;
	margin: 0;
	color: #9BAFB3;
	display: flex;
	flex-direction: column;
}

.time_menu label {
	margin-bottom: 5px;
	width: 100%;
	display: flex;
	flex-direction: column;
}

.time_menu label:last-child {
	margin-bottom: 0;
}

.time_menu label span {
	margin-bottom: 5px;
}

.time_menu label input {
	color: #688286;
    background: #0F282C;
    border: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: none;
    width: calc(100%);
    padding: 10px 11px;
    border-radius: 5px;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    margin: 0;
}

.global_config_subt input::-webkit-outer-spin-button,
.global_config_subt input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.global_config_subt input {
  -moz-appearance: textfield !important;
}

</style>