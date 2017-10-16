function fit(n, m) {
	while (n >= m) {
		n = n - m;
	}
	while (n < 0) {
		n = n + m;
	}
	return n;
}
/*
var Complex = function(r, i) {
	this.r = r;
	this.i = i;
	this.add = function(c) {
		return new Complex(this.r + c.r, this.i + c.i);
	}
	this.sub = function(c) {
		return new Complex(this.r - c.r, this.i - c.i);
	}
	this.scale = function(n) {
		return new Complex(this.r * n, this.c * n);
	}
	this.mul = function(c) {
		return new Complex((this.r * c.r) - (this.i * c.i), (this.r * c.i) + (this.i * c.r));
	}
	this.dot = function(c) {
		return (this.r * c.r) + (this.i * c.i);
	}
	this.angle = function() {
		return Math.atan2(this.i / this.r);
	}
	this.length = function() {
		return Math.pow(this.dot(this), 0.5);
	}
	this.unit = function() {
		var len = this.length();
		if (len == 0) {
			return new Complex(0, 0);
		}
		return this.scale(1 / len);
	}
	this.rotate = function(radius) {
		return new Complex(this.r * Math.cos(radius) - this.c * Math.sin(radius), this.c * Math.cos(radius) + this.r * Math.sin(radius));
	}
}
*/

var AudioAnalysis = {};

AudioAnalysis.init = function() {
	AudioAnalysis.context = new AudioContext();
}

AudioAnalysis.load = function(src, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', src, true);
	request.responseType = 'arraybuffer';

	request.onload = function() {
		AudioAnalysis.context.decodeAudioData(request.response, function(buffer) {
			callback(buffer);
		});
	}
	request.send();
}

AudioAnalysis.analyze = function(buffer) {
	var offset = 20000;
	
	setTimeout(function() {
		channel_0 = buffer.getChannelData(0);
		channel_1 = buffer.getChannelData(0);
		new_channel_0 = new Float32Array(channel_0.length - offset);
		new_channel_1 = new Float32Array(channel_1.length - offset);
		var i;
		
		i = 0;
		while (i < new_channel_0.length) {
			new_channel_0[i] = channel_0[i + offset];
			i = i + 1;
		}
		i = 0;
		while (i < new_channel_1.length) {
			new_channel_1[i] = channel_1[i + offset];
			i = i + 1;
		}
		
		var new_buffer = AudioAnalysis.context.createBuffer(2, buffer.length - offset, buffer.sampleRate);
		new_buffer.copyToChannel(new_channel_0, 0);
		new_buffer.copyToChannel(new_channel_1, 1);
		
		var source = AudioAnalysis.context.createBufferSource();
		source.buffer = new_buffer;
		source.connect(AudioAnalysis.context.destination);
		source.start(0);
	}, 2000);
	
	var channel_0 = buffer.getChannelData(0);
	var channel_0_data = AudioAnalysis.analyze_instrument(channel_0, 440, buffer.sampleRate, offset, Math.floor(buffer.sampleRate * 10 / 440));
}

AudioAnalysis.instrument_data = function(period) {
	this.period = period;
	this.nodes = [];
	this.insert = function(time, amplitude) {
		var node = new AudioAnalysis.instrument_node(this, fit(time, this.period), amplitude);
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
			// d = (e_amp - s_amp) / t;
			
			// var t2 = fit(this.nodes[fit(ct - 1, this.nodes.length)].time - this.nodes[fit(ct + 2, this.nodes.length)].time, this.period);
			// d = (this.nodes[fit(ct - 1, this.nodes.length)].amplitude - this.nodes[fit(ct + 2, this.nodes.length)].amplitude) / t2;
			
			n = 0;
			while ((n < maximum) && (t > 0)) {
				// an[n] = an[n] + (d * (Math.cos(p2p * n * e_time) - Math.cos(p2p * n * s_time))) - (p2p * n * ((e_amp * Math.sin(p2p * n * e_time)) - (s_amp * Math.sin(p2p * n * s_time))));
				// bn[n] = bn[n] + (d * (Math.sin(p2p * n * e_time) - Math.sin(p2p * n * s_time))) + (p2p * n * ((e_amp * Math.cos(p2p * n * e_time)) - (s_amp * Math.cos(p2p * n * s_time))));
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
		
		console.log(an);
		console.log(bn);
		AudioAnalysis.play(an, bn, 440, 1, 4);
	}
}
AudioAnalysis.instrument_node = function(instrument, time, amplitude) {
	this.instrument = instrument
	this.time = time;
	this.amplitude = amplitude;
}

AudioAnalysis.analyze_instrument = function(channel, frequency, sample_rate, start_position, duration) {
	var p_sample = 1 / sample_rate;
	var instrument = new AudioAnalysis.instrument_data(1 / frequency);
	var t_sample = 0;
	var count = start_position;
	
	while (count < start_position + duration) {
		instrument.insert(t_sample, channel[count]);
		t_sample = t_sample + p_sample;
		count = count + 1;
	}
	instrument.analyze(1100);
}

AudioAnalysis.play = function(real_r, imag_r, freq, duration, fade) {
	var g = AudioAnalysis
	g = AudioAnalysis.context.createGain();
	g.connect(AudioAnalysis.context.destination);
	g.gain.exponentialRampToValueAtTime(0.0000001, AudioAnalysis.context.currentTime + fade);
	
	var o1 = AudioAnalysis.context.createOscillator();
	var real = new Float32Array(real_r.length);
	var imag = new Float32Array(imag_r.length);
	var i;
	for (i in real_r) {
		real[i] = real_r[i];
	}
	for (i in imag_r) {
		imag[i] = imag_r[i];
	}
	
	var wave = AudioAnalysis.context.createPeriodicWave(real, imag, {disableNormalization: true});
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