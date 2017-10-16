var MusicPlayer = {};

MusicPlayer.make_table_exp = function(length) {
	var table = [];
	var i = 0;
	while (i < length) {
		table.push(Math.pow(2, i / length));
		i = i + 1;
	}
	return table;
}
MusicPlayer.context = new AudioContext();
MusicPlayer.table = MusicPlayer.make_table_exp(MusicPlayer.DEPTH);

MusicPlayer.Part = function(pitches) {
	this.pitches = pitches;
	this.play = function(index) 
	{	
		while (index >= this.pitches.length) {
			index = index - this.pitches.length;
		}
		if ((this.pitches[index] < 0) || ((index > 0) && (this.pitches[index] == this.pitches[index - 1]))) {
			return false;
		}
		var i = index;
		while ((i < this.pitches.length) && (this.pitches[i] == this.pitches[index])) {
			i ++;
		}
		var length = i - index;
		
		var g = MusicPlayer.context.createGain();
		g.connect(MusicPlayer.context.destination);
		g.gain.exponentialRampToValueAtTime(0.00001, MusicPlayer.context.currentTime + (length * MusicPlayer.DELAY * MusicPlayer.LENGTH));
		
		var o1 = MusicPlayer.context.createOscillator();
		o1.frequency.value = MusicPlayer.BASIC_FREQUENCY * Math.pow(2, pitches[index] / MusicPlayer.DEPTH);
		o1.connect(g);
		o1.start(0);
		
		var k = function (g, length) {
			return function() {
				setTimeout(function(){
					g.disconnect();
				}, length * MusicPlayer.DELAY * MusicPlayer.LENGTH * 1000);
			}
		}(g, length)();
	}
}

MusicPlayer.parts = [];
MusicPlayer.current = 0;
MusicPlayer.play_a_frame = function() {
	for (var part_index in MusicPlayer.parts) {
		MusicPlayer.parts[part_index].play(MusicPlayer.current);
	}
	MusicPlayer.current = MusicPlayer.current + 1;
	// MusicPlayer.LENGTH = MusicPlayer.LENGTH * 0.995;
	setTimeout(MusicPlayer.play_a_frame, MusicPlayer.LENGTH * 1000);
}

MusicPlayer.start = function() {
	setTimeout(MusicPlayer.play_a_frame, MusicPlayer.LENGTH * 1000);
}

MusicPlayer.init = function() {
	MusicPlayer.DEPTH = 5;
	MusicPlayer.LENGTH = 0.33; // measure in second.
	MusicPlayer.BASIC_FREQUENCY = 220;
	MusicPlayer.DELAY = 4;
	
	var melody;
	melody = [
		5, 5, 6, 6, 7, 6, 5, 5, 
		7, 7, 8, 8, 9, 8, 7, 7, 
		5, 7, 6, 8, 5, 7, 9, 6, 
		7, 8, 9, 6, 5, 5, 5, 5,
		5, 5, 6, 6, 7, 6, 5, 5, 
		7, 7, 8, 8, 9, 10, 9, 9,
		11, 8, 10, 7, 9, 6, 8, 5, 
		7, 6, 4, 4.5, 5, 5, 5, 5
	];
	MusicPlayer.parts.push(new MusicPlayer.Part(melody));
	melody = [
		0, 0, 0, 0, 0, 0, 0, 0, 
		2, 2, 2, 2, 2, 2, 2, 2, 
		0, 0, 1, 1, 1, 2, 3, 1, 
		4, 3, 2, 1, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 
		2, 2, 2, 2, 2, 2, 2, 2,
		0, 1, 2, 3, 1, 2, 3, 4, 
		2, 2, 1, 1, 0, 0, 0, 0
	];
	MusicPlayer.parts.push(new MusicPlayer.Part(melody));
}