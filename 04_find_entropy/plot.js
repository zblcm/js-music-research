var Plot = {};

Plot.init = function(canvas) {
	Plot.canvas = canvas;
	Plot.ctx = canvas.getContext("2d");
	Plot.width = canvas.width;
	Plot.height = canvas.height;
}

Plot.draw_2d = function(data) {
	var i;
	for (i in data) {
		// data[i] = Math.pow(data[i], 0.75);
	}
	var min = data[0];
	var max = data[0];
	
	i = 1;
	while (i < data.length) {
		if (data[i] < min) {
			min = data[i];
		}
		if (data[i] > max) {
			max = data[i];
		}
		i = i + 1;
	}
	
	function calc_x(i, max_i) {
		return Plot.width / (max_i - 1) * i;
	}
	function calc_y(v, min_v, max_v, min_y, max_y) {
		var ratio = (v - min_v) / (max_v - min_v);
		return min_y + (ratio * (max_y - min_y));
	}
	
	Plot.ctx.fillStyle = "rgba(255, 255, 255, 1)";
	Plot.ctx.fillRect(0, 0, Plot.width, Plot.height);
	Plot.ctx.strokeStyle = "rgba(0, 0, 0, 1)";
	Plot.ctx.lineWidth = 2;
	Plot.ctx.beginPath();
	
	Plot.ctx.moveTo(0, calc_y(data[0], min, max, 0, Plot.height));
	i = 1;
	while (i < data.length) {
		Plot.ctx.lineTo(calc_x(i, data.length), calc_y(data[i], min, max, 0, Plot.height));
		i = i + 1;
	}
	Plot.ctx.stroke();
}


Plot.draw_3d = function(data) {
	var i;
	var j;
	for (i in data) {
		for (j in data) {
			data[i][j] = Math.log(data[i][j]);
		}
	}
	var min = data[0][0];
	var max = data[0][0];
	
	for (i in data) {
		for (j in data) {
			if (data[i][j] < min) {
				min = data[i][j];
			}
			if (data[i][j] > max) {
				max = data[i][j];
			}
		}
	}
	
	function calc_y(v, min_v, max_v, min_y, max_y) {
		var ratio = (v - min_v) / (max_v - min_v);
		return min_y + (ratio * (max_y - min_y));
	}
	
	Plot.ctx.fillStyle = "rgba(255, 255, 255, 1)";
	Plot.ctx.fillRect(0, 0, Plot.width, Plot.height);
	
	var x_size;
	var x_pos;
	var y_size;
	var y_pos;
	var color;
	/*
	var color_table = [
		new Color(0, 0, 0, 1),
		new Color(255, 0, 0, 1),
		new Color(255, 255, 0, 1),
		new Color(0, 255, 0, 1),
		new Color(0, 255, 255, 1),
		new Color(0, 0, 255, 1),
		new Color(255, 0, 255, 1)
	];
	var ratio_table = [
		0,
		0.6,
		0.625,
		0.65,
		0.675,
		0.7,
		1
	];
	*/
	var color_table = [
		new Color(0, 0, 0, 1),
		new Color(0, 0, 0, 1),
		new Color(255, 255, 255, 1)
	];
	var ratio_table = [
		0,
		0.6,
		1
	];
	for (i in data) {
		x_size = Plot.width / ((data.length) - 1);
		x_pos = i * x_size;
		for (j in data[i]) {
			y_size = Plot.height / ((data[i].length) - 1);
			y_pos = j * y_size;
			color = ColorHandler.ratio_to_color((data[i][j] - min) / (max - min), color_table, ratio_table);
			Plot.ctx.fillStyle = color.to_style();
			Plot.ctx.fillRect(x_pos - (x_size / 2), y_pos - (y_size / 2), x_size, y_size);
		}
	}
}