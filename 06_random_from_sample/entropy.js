function copy_array(array) {
	var new_array = [];
	for (var i in array) {
		new_array.push(array[i]);
	}
	return new_array;
}

function fit(a, b) {
	while (a >= b) {
		a = a - b;
	}
	while (a < 0) {
		a = a + b;
	}
	return a;
}

function log(base, num) {
	return Math.log(num) / Math.log(base);
}

function pdf_normal(mu, sigma, x) {
	var a = 1 / Math.sqrt(2 * Math.PI * sigma * sigma);
	var b = Math.pow((x - mu) / sigma, 2) * (-0.5);
	return a * Math.pow(Math.E, b);
}

function array_with_default_value(length, value) {
	var i = 0;
	var array = [];
	while (i < length) {
		array.push(value);
		i = i + 1;
	}
	return array;
}

var EntropyCalculator = {};
EntropyCalculator.SIGMA = 0.02;

EntropyCalculator.Node = function(a, b) {
	this.a = a;
	this.b = b;
	this.calc_value = function() {
		var n = this.a * this.b;
		
		if (n < 12) {
			n = 12;
		}
		
		// this.value = Math.sqrt(1 / n);
		this.value = 1 / n;
	}
	// Assume an element in array is 1.
	this.distribute_addon = function(x, sigma) {
		var answer = 0;
		answer = answer + pdf_normal(log(2, this.a / this.b), sigma, log(2, x));
		answer = answer + pdf_normal(log(2, this.b / this.a), sigma, log(2, x));
		return answer * this.value;
	}
}

EntropyCalculator.create_nodes = function(max_number, range) {
	var i;
	var j;
	var rationals = [];
	var node;
	var nodes = [];
	
	// console.log("Nodes: " + nodes.length);
	for (i = 1; i < max_number; i ++) {
		for (j = 1; j < max_number; j ++) {
			if ((i >= j && i / j <= range) || (j >= i && j / i <= range)) {
				node = new EntropyCalculator.Node(i, j);
				node.calc_value();
				nodes.push(node);
			}
		}
	}
	
	
	return nodes;
}
EntropyCalculator.get_raw_info = function(nodes, sigma, number) {
	var j;
	var answer = 0;
	for (j in nodes) {
		answer = answer + nodes[j].distribute_addon(number, sigma);
	}
	return answer;
}

EntropyCalculator.sample_data = function(nodes, resolution, sigma) {
	var arrangements = [];
	var i;
	var j;
	var temp;
	var value;
	
	var matrix = array_with_default_value(resolution, 0);
	for (i in matrix) {
		if (i % 100 == 0) {
			console.log(i + " / " + resolution);
		}
		matrix[i] = matrix[i] + EntropyCalculator.get_raw_info(nodes, sigma, Math.pow(2, (1 / (resolution - 1) * i)));
	}
	
	return matrix;
}

EntropyCalculator.sample_data_2 = function(nodes, resolution, sigma, array, min_x, max_x) {
	var arrangements = [];
	var i;
	var j;
	var value;
	var x;
	
	var matrix = array_with_default_value(resolution, 0);
	for (i in matrix) {
		if (i % 100 == 0) {
			// console.log(i + " / " + resolution);
		}
		x = Math.pow(2, ((i / resolution) * (log(2, max_x) - log(2, min_x))) + log(2, min_x));
		var value = 1;
		for (j in array) {
			value = value * Math.pow(EntropyCalculator.get_raw_info(nodes, sigma, x / array[j]), 1 / (array.length + 1));
			// value = value * Math.log(EntropyCalculator.get_raw_info(nodes, sigma, x / array[j]));
			// value = value * EntropyCalculator.get_raw_info(nodes, sigma, x / array[j]);
		}
		matrix[i] = value;
	}
	
	return matrix;
}

EntropyCalculator.get_local_maximums = function(matrix) {
	var i = 0;
	var Pinc;
	var Cint;
	var ans = [];
	while (i < matrix.length - 1) {
		Cinc = matrix[i + 1] > matrix[i];
		if ((i > 0) && (Pinc) && (!Cinc)) {
			ans.push(i);
		}
		Pinc = Cinc;
		i ++;
	}
	if ((matrix[1] < matrix[0]) && (matrix[matrix.length - 1] > matrix[matrix.length - 2])) {
		ans.push(matrix.length - 1);
	}
	return ans;
}

EntropyCalculator.distinct_random_variable = function(value, prob) {
	this.value = value;
	this.prob = prob;
	this.normalize = function() {
		var acc = 0;
		for (i in this.prob) {
			acc = acc + this.prob[i];
		}
		for (i in this.prob) {
			this.prob[i] = this.prob[i] / acc;
		}
	}
	this.get = function(p) {
		var acc = 0;
		for (i in this.prob) {
			acc = acc + this.prob[i];
			if (acc > p) {
				return this.value[i];
			}
		}
		return this.value[this.value.length - 1];
	}
	
}

EntropyCalculator.construct_sample_space = function(matrix, local_maximum, remove_array, remove_range) {
	var i;
	var j;
	var to_add;
	
	var index_value = [];
	var raw_prob = [];
	
	for (i in local_maximum) {
		to_add = true;
		for (j in remove_array) {
			if (Math.abs(remove_array[j] - matrix[local_maximum[i]]) < remove_range) {
				to_add = false;
			}
		}
		if (to_add) {
			index_value.push(local_maximum[i]);
			raw_prob.push(matrix[local_maximum[i]]);
		}
	}
	var sample_space = new EntropyCalculator.distinct_random_variable(index_value, raw_prob);
	sample_space.normalize();
	return sample_space;
}