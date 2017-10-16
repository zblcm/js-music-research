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

function entropy(array) {
	var i;
	var sum = 0;
	array = copy_array(array);
	
	for (i in array) {
		sum = sum + array[i];
	}
	for (i in array) {
		array[i] = array[i] / sum;
	}
	sum = 0;
	for (i in array) {
		sum = sum + (array[i] * log(array.length, array[i]));
	}
	return sum * (-1);
}

function pdf_normal(mu, sigma, x) {
	var a = 1 / Math.sqrt(2 * Math.PI * sigma * sigma);
	var b = Math.pow((x - mu) / sigma, 2) * (-0.5);
	return a * Math.pow(Math.E, b);
}

function gcd(a, b) {
	if (a < b) {
		return gcd(b, a);
	}
	if (a % b == 0) {
		return b;
	}
	return gcd(b, a % b);
}
function array_gcd(array) {
	if (array.length < 1) {
		return 1;
	}
	var ans = array[0];
	var i = 1;
	while (i < array.length) {
		ans = gcd(ans, array[i]);
		i = i + 1;
	}
	return ans;
}

function swap_array(array, a, b) {
	var temp = array[a];
	array[a] = array[b];
	array[b] = temp;
}

function permutation(length) {
	if (length <= 0) {
		return [];
	}
	
	var i;
	var j;
	var k;
	var current = [];
	for (i = 0; i < length; i ++) {
		current.push(i);
	}
	var answer = [];
	answer.push(copy_array(current));
	while (true) {
		i = current.length - 1;
		while ((i > 0) && (current[i] < current[i - 1])) {
			i = i - 1;
		}
		if (i == 0) {
			return answer;
		}
		j = i;
		k = current.length - 1;
		while (j < k) {
			swap_array(current, j, k);
			j = j + 1;
			k = k - 1;
		}
		j = i;
		while (current[j] < current[i - 1]) {
			j = j + 1;
		}
		swap_array(current, j, i - 1);
		
		answer.push(copy_array(current));
	}
	return answer;
}
function matrix_with_default_value(dimension, current, value) {
	if (current == dimension.length) {
		return value;
	}
	var ans = [];
	var i = 0;
	while (i < dimension[current]) {
		ans.push(matrix_with_default_value(dimension, current + 1, value));
		i = i + 1;
	}
	return ans;
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

EntropyCalculator.permutation_cache = {};
EntropyCalculator.permutation = function(length) {
	if (!EntropyCalculator.permutation_cache[length]) {
		EntropyCalculator.permutation_cache[length] = permutation(length);
	} 
	return EntropyCalculator.permutation_cache[length];
}
EntropyCalculator.Node = function(array) {
	this.array = copy_array(array);
	this.subarrays;
	this.calc_entropy = function() {
		this.entropy = entropy(this.array);
	}
	this.calc_value = function() {
		var i;
		var n = 1;
		for (i in this.array) {
			n = n * this.array[i];
		}
		this.value = this.entropy / Math.pow(n, 1 / this.array.length);
	}
	this.calc_normalized_subarrays = function() {
		var i;
		var j;
		var subarray;
		var subarrays = [];
		for (i in this.array) {
			subarray = [];
			for (j in this.array) {
				if (i != j) {
					subarray.push(this.array[j] / this.array[i]);
				}
			}
			subarrays.push(subarray);
		}
		this.subarrays = subarrays;
	}
	// Assume an element in array is 1.
	this.distribute_addon = function(array, sigma) {
		var permutations = EntropyCalculator.permutation(array.length);
		var i;
		var j;
		var k;
		var subarray;
		var permutation;
		var answer = 0;
		for (i in this.subarrays) {
			subarray = this.subarrays[i];
			for (j in permutations) {
				permutation = permutations[j];
				for (k in permutation) {
					answer = answer + pdf_normal(log(2, subarray[k]), sigma, log(2, array[permutation[k]]));
				}
			}
		}
		return answer * this.value;
	}
}
EntropyCalculator.generate_arrangement_recursively = function(answer, current, dimension, max_number, min_number) {
	if (current.length == dimension) {
		answer.push(current);
		return;
	}
	
	var i;
	var next;
	i = min_number;
	while (i < max_number) {
		next = copy_array(current);
		next.push(i);
		EntropyCalculator.generate_arrangement_recursively(answer, next, dimension, max_number, min_number)
		i = i + 1;
	}
}
EntropyCalculator.generate_arrangement_recursively_ratiolimit = function(answer, current, dimension, max_number, min_number, ratiolimit) {
	if (current.length == dimension) {
		answer.push(current);
		return;
	}
	
	var min_limit;
	var max_limit;
	var i;
	if (current.length == 0) {
		min_limit = min_number;
		max_limit = max_number;
	}
	else {
		min_limit = current[0];
		max_limit = current[0];
		i = 1;
		while (i < current.length) {
			if (current[i] < max_limit) {
				max_limit = current[i];
			}
			if (current[i] > min_limit) {
				min_limit = current[i];
			}
			i = i + 1;
		}
	}
	min_limit = min_limit / ratiolimit;
	max_limit = max_limit * ratiolimit;
	var next;
	i = min_number;
	while (i < max_number) {
		if ((i >= min_limit) && (i <= max_limit)) {
			next = copy_array(current);
			next.push(i);
			EntropyCalculator.generate_arrangement_recursively_ratiolimit(answer, next, dimension, max_number, min_number, ratiolimit);
		}
		i = i + 1;
	}
}
EntropyCalculator.generate_rational_recursively = function(answer, current, dimension, max_number, min_number) {
	if (current.length == dimension) {
		if (array_gcd(current) == 1) {
			answer.push(current);
		}
		return;
	}
	
	var i;
	var next;
	if (current.length == 0) {
		i = min_number;
	}
	else {
		i = current[current.length - 1] + 1;
	}
	while (i < max_number) {
		next = copy_array(current);
		next.push(i);
		EntropyCalculator.generate_rational_recursively(answer, next, dimension, max_number, min_number)
		i = i + 1;
	}
}
EntropyCalculator.create_nodes = function(dimension, max_number) {
	var i;
	var rationals = [];
	var node;
	var nodes = [];
	// If GCD, use rational.
	EntropyCalculator.generate_arrangement_recursively_ratiolimit(rationals, [], dimension, max_number, 1, 4);
	console.log("Nodes: " + rationals.length);
	for (i in rationals) {
		node = new EntropyCalculator.Node(rationals[i]);
		node.calc_entropy();
		node.calc_value();
		node.calc_normalized_subarrays();
		nodes.push(node);
	}
	return nodes;
}
EntropyCalculator.sample_data = function(nodes, dimension, resolution, sigma) {
	var arrangements = [];
	var i;
	var j;
	var arrangement;
	var temp;
	var matrix = matrix_with_default_value(array_with_default_value(dimension - 1, resolution), 0, 0);
	var value;
	
	EntropyCalculator.generate_arrangement_recursively(arrangements, [], dimension - 1, resolution, 0);
	for (i in arrangements) {
		if (i % 100 == 0) {
			console.log(i + " / " + arrangements.length);
		}
		
		arrangement = arrangements[i];
		
		// Transfer resolution to log space.
		temp = [];
		for (j in arrangement) {
			// temp.push(Math.pow(2, (2 / (resolution - 1) * arrangement[j]) - 1));
			temp.push(Math.pow(2, (1 / (resolution - 1) * arrangement[j]) - 0));
		}
		
		// Calculate value based on distribution.
		value = 0;
		for (j in nodes) {
			value = value + nodes[j].distribute_addon(temp, sigma);
		}
		temp = matrix;
		j = 0;
		while (j < arrangement.length - 1) {
			temp = temp[arrangement[j]];
			j = j + 1;
		}
		temp[arrangement[arrangement.length - 1]] = temp[arrangement[arrangement.length - 1]] + value;
	}
	
	return matrix;
}
