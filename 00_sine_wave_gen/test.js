var MusicTester = {};

MusicTester.init = function() {
	MusicTester.context = new AudioContext();
}

/*
MusicTester.init = function() {
	MusicTester.context = new AudioContext();
	
	var real = new Float32Array(16);
	var imag = new Float32Array(16);
	var osc = MusicTester.context.createOscillator();
	osc.frequency.value = 80;
	
	real[7] = 6/6;
	real[11] = 6/10;
	real[16] = 6/15;

	var wave = MusicTester.context.createPeriodicWave(real, imag, {disableNormalization: true});

	osc.setPeriodicWave(wave);

	osc.connect(MusicTester.context.destination);

	osc.start();
	osc.stop(2);
}
*/

/*
// 随机声音
MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 2);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	var o3 = MusicTester.context.createOscillator();
	o1.frequency.value = Math.random() * 1000;
	o2.frequency.value = Math.random() * 1000;
	o3.frequency.value = Math.random() * 1000;
	o1.connect(MusicTester.g);
	o2.connect(MusicTester.g);
	o3.connect(MusicTester.g);
	o1.start(0);
	o2.start(0);
	o3.start(0);
	console.log(MusicTester.context);
}
*/

// 傅里叶创建和声
/*
MusicTester.array_generator = function(len, max) {
	
	var gcd = function(a, b) {
		if (b > a) {
			return gcd(b, a);
		}
		if (a % b == 0) {
			return b;
		}
		return gcd(b, a % b);
	}
	
	var array_n = [];
	var array_p = [];
	var c1;
	var c2;
	var g;
	for (c1 = 0; c1 < len; c1 ++) {
		array_n.push(1 + Math.floor(Math.random() * max));
	}
	for (c1 = 0; c1 < len; c1 ++) {
		for (c2 = c1 + 1; c2 < len; c2 ++) {
			array_p.push(array_n[c1] * array_n[c2] / gcd(array_n[c1], array_n[c2]));
			// array_p.push(array_n[c1] * array_n[c2]);
		}
	}
	
	return [array_n, array_p];
}

MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	// MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 1);
	var o1 = MusicTester.context.createOscillator();
	var i;
	
	var find_min_max = function(array) {
		var max = -1;
		var min = -1;
		for (var i = 0; i < array.length; i ++) {
			if ((max < 0) || (max < array[i])) {
				max = array[i];
			}
			if ((min < 0) || (min > array[i])) {
				min = array[i];
			}
		}
		return [min, max];
	}
	var np_array = MusicTester.array_generator(3, 12)
	var n_array = np_array[0];
	var p_array = np_array[1];
	var min_max = find_min_max(p_array);
	var min = min_max[0];
	var max = min_max[1];
	
	
	var real = new Float32Array(max + 1);
	var imag = new Float32Array(max + 1);
	for (i in p_array) {
		real[p_array[i]] = min / p_array[i];
	}
	var general_freq = (500) / max;
	
	var log_n = "";
	var log_p = "";
	for (i in n_array) {
		log_n = log_n + " " + (n_array[i] * general_freq);
	}
	for (i in p_array) {
		log_p = log_p + " " + (p_array[i] * general_freq);
	}
	console.log("freq: " + general_freq + " => " + log_n);
	console.log(log_p);
	
	// console.log("freq: " + general_freq + " => " + p1 + " " + p2 + " " + p3);
	
	var wave = MusicTester.context.createPeriodicWave(real, imag, {disableNormalization: true});
	o1.setPeriodicWave(wave);
	
	o1.frequency.value = general_freq;
	o1.connect(MusicTester.g);
	o1.start(0);
}
*/

// 创造最佳和声
/*
var n1 = 1;
var n2 = 1;
var base_freq = 440;

MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	
	
	// MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 1);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	
	o1.frequency.value = base_freq;
	o1.connect(MusicTester.g);
	o1.start(0);
	o2.frequency.value = base_freq * n2 / n1;
	o2.connect(MusicTester.g);
	o2.start(0);
	
	n2 = n2 + 2;
	if (n2 > n1 * 2) {
		n1 = n1 * 2;
	}
}
*/

// 生成和声表
/*
MusicTester.make_table = function(depth) {
	var n1 = 1;
	var n2 = 1;
	var ct = 0;
	
	var array = [];
	
	while (ct < depth) {
		array.push(n2 / n1);
		n2 = n2 + 2;
		if (n2 > n1 * 2) {
			n1 = n1 * 2;
			ct = ct + 1;
		}
	}
	
	return array.sort();
}

var table = MusicTester.make_table(4);
var i = 0;
var base_freq = 440;

MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	
	
	// MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 1);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	
	o1.frequency.value = base_freq;
	o1.connect(MusicTester.g);
	o1.start(0);
	o2.frequency.value = base_freq * table[i];
	o2.connect(MusicTester.g);
	o2.start(0);
	
	i = i + 1;
	if (i >= table.length) {
		i = 0;
	}
}
*/

// P5循环
/*
var base_freq = 220;
var prev_freq = 220;
var new_freq = 330;

MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	
	
	// MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 1);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	o1.frequency.value = new_freq;
	o2.frequency.value = prev_freq;
	
	console.log(prev_freq + "," + new_freq);
	o1.connect(MusicTester.g);
	o2.connect(MusicTester.g);
	o1.start(0);
	o2.start(0);
	
	prev_freq = new_freq;
	new_freq = new_freq * 3 / 2;
	if (new_freq > base_freq * 2) {
		new_freq = new_freq / 2;
	}
}
*/


// 寻找循环
/*
MusicTester.make_table = function(odd, power, length) {
	var table = [];
	var value = 1;
	var i = 0;
	while (i < length) {
		table.push(value);
		value = value * odd / power;
		if (value > 2) {
			value = value / 2;
		}
		if (value < 1) {
			value = value * 2;
		}
		i = i + 1;
	}
	
	return table;
}
MusicTester.find_table = function(odd, power, length) {
	var table = MusicTester.make_table(odd, power, length);
	var new_table = [];
	var i;
	for (i = 0; i < table.length; i ++) {
		new_table.push([i, table[i]]);
	}
	new_table.sort(function(a, b) {
		return a[1] - b[1];
	});
	
	for (i = 0; i < new_table.length; i ++) {
		console.log(new_table[i][0] + " :" + new_table[i][1]);
	}
	
	return new_table;
}
MusicTester.find_table(7, 4, 20);
*/

// 播放7/4循环
/*
var base_freq = 200;
var prev_freq = 200;
var new_freq = 200 * (7 / 4);

MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	
	
	// MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 1);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	o1.frequency.value = new_freq;
	o2.frequency.value = prev_freq;
	
	console.log(prev_freq + "," + new_freq);
	o1.connect(MusicTester.g);
	o2.connect(MusicTester.g);
	o1.start(0);
	o2.start(0);
	
	prev_freq = new_freq;
	new_freq = new_freq * (7 / 4);
	if (new_freq > base_freq * 2) {
		new_freq = new_freq / 2;
	}
}
*/



// 用指数生成table
var DEPTH = 5;
MusicTester.make_table_exp = function(length) {
	var table = [];
	var i = 0;
	while (i < length) {
		table.push(Math.pow(2, i / length));
		i = i + 1;
	}
	return table;
}
var test_table = MusicTester.make_table_exp(DEPTH);
var base_freq = 220;

// 并随机播放
/*
MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	
	
	MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 2);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	var n1 = Math.floor(Math.random() * DEPTH);
	var n2 = (n1 + 1 + Math.floor(Math.random() * (DEPTH - 1))) % DEPTH;
	o1.frequency.value = base_freq * test_table[n1];
	o2.frequency.value = base_freq * test_table[n2];
	
	console.log(n1 + "," + n2);
	o1.connect(MusicTester.g);
	o2.connect(MusicTester.g);
	o1.start(0);
	o2.start(0);
}
*/

/*
var n1 = 0;
var n2 = 1;
// 并循环播放
MusicTester.test = function() {
	if (MusicTester.g) {
		MusicTester.g.disconnect();
	}
	MusicTester.g = MusicTester.context.createGain();
	MusicTester.g.connect(MusicTester.context.destination);
	
	
	MusicTester.g.gain.exponentialRampToValueAtTime(0.00001, MusicTester.context.currentTime + 2);
	var o1 = MusicTester.context.createOscillator();
	var o2 = MusicTester.context.createOscillator();
	
	o1.frequency.value = base_freq * test_table[n1];
	o2.frequency.value = base_freq * test_table[n2];
	
	console.log(n1 + " " + n2);
	o1.connect(MusicTester.g);
	o2.connect(MusicTester.g);
	o1.start(0);
	o2.start(0);
	
	n2 = n2 + 1;
	if (n2 >= DEPTH) {
		n2 = 0;
	}
	if (n2 == n1) {
		n1 = n1 + 1;
		if (n1 >= DEPTH) {
			n1 = 0;
		}
		n2 = n1 + 1;
		if (n2 >= DEPTH) {
			n2 = 0;
		}
	}
}
*/











