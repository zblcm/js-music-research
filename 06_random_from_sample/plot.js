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
		// data[i] = Math.pow(data[i], 0.1);
		// data[i] = Math.log(data[i]);
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

Plot.draw_grid = function(max) {
	var i = 1;
	while (i < max) {
		x = (i / max) * Plot.width;
		
		Plot.ctx.strokeStyle = "rgba(255, 0, 0, 1)";
		Plot.ctx.lineWidth = 1;
		Plot.ctx.beginPath();
		Plot.ctx.moveTo(x, 0);
		Plot.ctx.lineTo(x, Plot.height);
		Plot.ctx.stroke();
		
		i = i + 1;
	}
}

Plot.clean = function() {
	Plot.ctx.fillStyle = "rgba(255, 255, 255, 1)";
	Plot.ctx.fillRect(0, 0, Plot.width, Plot.height);
}