function createAudioMeter(audioContext, volumeCallback = () => {}) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = function (event) {
		var buf = event.inputBuffer.getChannelData(0);
		var bufLength = buf.length;
		var sum = 0;
		var x;

		for (var i = 0; i < bufLength; i++) {
			x = buf[i];
			if (Math.abs(x) >= this.clipLevel) {
				this.clipping = true;
				this.lastClip = window.performance.now();
			}
			sum += x * x;
		}

		var rms = Math.sqrt(sum / bufLength);
		this.volume = Math.max(rms, this.volume * this.averaging);

		volumeCallback({ currentTime: this.context.currentTime, volume: this.volume });
	};

	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = 0.98;
	processor.averaging = 0.95;
	processor.clipLag = 750;

	processor.connect(audioContext.destination);

	processor.checkClipping = function () {
		if (!this.clipping)
			return false;
		if ((this.lastClip + this.clipLag) < window.performance.now())
			this.clipping = false;
		return this.clipping;
	};

	processor.shutdown = function () {
		this.disconnect();
		this.onaudioprocess = null;
	};

	return processor;
}