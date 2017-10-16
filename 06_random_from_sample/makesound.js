var SoundMaker = {};

SoundMaker.init = function() {
	SoundMaker.context = new AudioContext();
}

SoundMaker.load = function(src, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', src, true);
	request.responseType = 'arraybuffer';

	request.onload = function() {
		SoundMaker.context.decodeAudioData(request.response, function(buffer) {
			callback(buffer);
		});
	}
	request.send();
}

SoundMaker.analyze = function(buffer) {
	var offset = 20000;
	var channel_0 = buffer.getChannelData(0);
	var channel_0_data = SoundMaker.analyze_instrument(channel_0, 440, buffer.sampleRate, offset, Math.floor(buffer.sampleRate * 10 / 440));
}

SoundMaker.instrument_data = function(period) {
	this.period = period;
	this.nodes = [];
	this.insert = function(time, amplitude) {
		var node = new SoundMaker.instrument_node(this, fit(time, this.period), amplitude);
		this.nodes.push(node);
	}
	this.analyze = function(maximum) {
		this.nodes.sort(function(a, b) {
			return a.time - b.time;
		});
		
		// Prebuild array
		var an = [];
		var bn = [];
		var n = 0;
		while (n < maximum) {
			an.push(0);
			bn.push(0);
			n = n + 1;
		}
		
		// Analyse fourier
		var s_time;
		var e_time;
		var s_amp;
		var e_amp;
		var d;
		var t;
		var p2p = Math.PI * 2 / this.period;
		
		ct = 0;
		while (ct < this.nodes.length) {
			s_amp = this.nodes[ct].amplitude;
			s_time = this.nodes[ct].time;
			if (ct + 1 == this.nodes.length) {
				e_amp = this.nodes[0].amplitude;
				e_time = this.period;
			}
			else {
				e_amp = this.nodes[ct + 1].amplitude;
				e_time = this.nodes[ct + 1].time;
			}
			t = e_time - s_time;
			
			n = 0;
			while ((n < maximum) && (t > 0)) {
				an[n] = an[n] + (((s_amp * Math.cos(p2p * n * s_time)) + (e_amp * Math.cos(p2p * n * e_time))) * t / 2);
				bn[n] = bn[n] + (((s_amp * Math.sin(p2p * n * s_time)) + (e_amp * Math.sin(p2p * n * e_time))) * t / 2);
				n = n + 1;
			}
			ct = ct + 1;
		}
		
		var n = 1;
		while (n < maximum) {
			an[n] = an[n] * (2 / this.period);
			bn[n] = bn[n] * (2 / this.period);
			n = n + 1;
		}
		
		this.real = new Float32Array(an.length);
		this.imag = new Float32Array(bn.length);
		var i;
		for (i in an) {
			this.real[i] = an[i];
		}
		for (i in bn) {
			this.imag[i] = bn[i];
		}
	}
	
	this.play = function(freq, duration, fade) {
		var g = SoundMaker
		g = SoundMaker.context.createGain();
		g.connect(SoundMaker.context.destination);
		g.gain.value = 0.1;
		g.gain.exponentialRampToValueAtTime(0.0000001, SoundMaker.context.currentTime + fade);
		
		var o1 = SoundMaker.context.createOscillator();
		var wave = SoundMaker.context.createPeriodicWave(this.real, this.imag, {disableNormalization: false});
		o1.setPeriodicWave(wave);
		
		o1.frequency.value = freq;
		o1.connect(g);
		o1.start(0);
		
		var k = function (g, duration) {
			return function() {
				setTimeout(function(){
					g.disconnect();
				}, duration * 1000);
			}
		}(g, duration)();
	}
}
SoundMaker.instrument_node = function(instrument, time, amplitude) {
	this.instrument = instrument
	this.time = time;
	this.amplitude = amplitude;
}

SoundMaker.analyze_instrument = function(channel, frequency, sample_rate, start_position, duration, fourier_depth) {
	var p_sample = 1 / sample_rate;
	var instrument = new SoundMaker.instrument_data(1 / frequency);
	var t_sample = 0;
	var count = start_position;
	
	while (count < start_position + duration) {
		instrument.insert(t_sample, channel[count]);
		t_sample = t_sample + p_sample;
		count = count + 1;
	}
	instrument.analyze(fourier_depth);
	return instrument;
}

SoundMaker.create_sine_instrument = function() {
	SoundMaker.sine_instrument = {};
	SoundMaker.sine_instrument.play = function(freq, duration, fade) {
		var g = SoundMaker
		g = SoundMaker.context.createGain();
		g.connect(SoundMaker.context.destination);
		g.gain.value = 0.1;
		g.gain.exponentialRampToValueAtTime(0.0000001, SoundMaker.context.currentTime + fade);
		var o1 = SoundMaker.context.createOscillator();
		
		o1.frequency.value = freq;
		o1.connect(g);
		o1.start(0);
		
		var k = function (g, duration) {
			return function() {
				setTimeout(function(){
					g.disconnect();
				}, duration * 1000);
			}
		}(g, duration)();
	}
}
