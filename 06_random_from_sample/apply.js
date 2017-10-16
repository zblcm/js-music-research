var Generator = {};

Generator.index_to_freq = function(index, resolution, min_freq, max_freq) {
	var ratio = index / (resolution - 1);
	var max_power = log(2, max_freq / min_freq);
	var cur_power = ratio * max_power;
	return min_freq * Math.pow(2, cur_power);
}
Generator.freq_to_index = function(freq, resolution, min_freq, max_freq) {
	var max_power = log(2, max_freq / min_freq);
	var cur_power = log(2, freq / min_freq);
	var ratio = cur_power / max_power;
	return ratio * (resolution - 1);
}

Generator.random = function(freq_table, resolution, min_freq, max_freq) {

	// var sigma = 0.001;
	var sigma = 0.02;
	var overharmony_range = 25; // should based on resolution
	var nodes = EntropyCalculator.create_nodes(20, 4);
	
	var freq_indexs = [];
	var i;
	for (i in freq_table) {
		freq_indexs.push(Generator.freq_to_index(freq_table[i], resolution, min_freq, max_freq));
	}
	
	var data = EntropyCalculator.sample_data_2(nodes, resolution, sigma, freq_table, min_freq, max_freq);
	var sample_space = EntropyCalculator.construct_sample_space(data, EntropyCalculator.get_local_maximums(data), freq_indexs, overharmony_range);
	var index = sample_space.get(Math.random());
	if (!index) {
		return 0;
	}
	return Generator.index_to_freq(index, resolution, min_freq, max_freq);
}

Generator.play_loop = function(instrument, interval, array, generator) {
	var i;
	for (i in array) {
		instrument.play(array[i], interval * 2, interval * 2);
		/*
		var t = function (freq, time) {
			return function() {
				setTimeout(function(){
					instrument.play(array[i], interval * 2, interval * 2);
				}, time * 1000);
			}
		}
		t(array[i], (array.length - i - 1) / array.length * interval)();
		*/
	}
	setTimeout(function(){
		Generator.play_loop(instrument, interval, array, generator);
	}, interval * 1000);
	array = generator(array);
	console.log(array);
}

Generator.main = function() {
	var MB = 246.942;
	var MC = 261.626;
	var MD = 293.665;
	var ME = 329.628;
	var MF = 349.228;
	var MG = 391.995;
	SoundMaker.create_sine_instrument();
	
	/*
	var generate_function = function(array) { // suppose this array have 4 parts: S A T B.
		var PS = array[0];
		var PA = array[1];
		var PT = array[2];
		var PB = array[3];
		var NS = Generator.random([PS, PB * 4], 601, 400, 800);
		var NB = Generator.random([NS / 4, PB], 601, 100, 200);
		var NA = Generator.random([NS / 2, NB * 2, PA], 601, 200, 400);
		var NT = Generator.random([NS / 2, NB * 2, NA], 601, 200, 400);
		// NA = Generator.random([NS / 2, NB * 2, NT], 601, 200, 800);
		return [NS, NA, NT, NB];
	}
	*/
	
	
	var generate_function = function(array) { // suppose this array have 4 parts: S A T B.
		var PS = array[0];
		var PA = array[1];
		var PB = array[2];
		var NS = Generator.random([PB * 4, PS], 601, 400, 800);
		if (NS == 0) {
			NS = 400 * (Math.random() + 1);
		}
		var NB = Generator.random([NS / 4, PB], 601, 100, 200);
		if (NB == 0) {
			NB = 100 * (Math.random() + 1);
		}
		var NA = Generator.random([NS / 2, NB * 2], 601, 200, 400);
		if (NA == 0) {
			NA = 200 * (Math.random() + 1);
		}
		return [NS, NA, NB];
	}
	
	
	/*
	var generate_function = function(array) { // suppose this array have 4 parts: S A T B.
		var PS = array[0];
		var PB = array[1];
		var NS = Generator.random([PS, PB * 2], 601, 200, 400);
		if (NS == 0) {
			NS = 200 * (Math.random() + 1);
		}
		var NB = Generator.random([NS / 2, PB], 601, 100, 200);
		if (NB == 0) {
			NB = 100 * (Math.random() + 1);
		}
		return [NS, NB];
	}
	*/
	var instrument_callback = function(buffer) {
		var channel_0 = buffer.getChannelData(0);
		var instrument = SoundMaker.analyze_instrument(channel_0, 440, buffer.sampleRate, 20000, Math.floor(buffer.sampleRate * 10 / 440), 20);
		// Generator.play_loop(SoundMaker.sine_instrument, 1, [600, 300, 150], generate_function);
		Generator.play_loop(instrument, 1, [600, 300, 150], generate_function);
	}
	
	SoundMaker.load("A4piano.wav", instrument_callback);
}