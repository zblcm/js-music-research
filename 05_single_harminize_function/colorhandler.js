var Color = function(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
	
	this.to_style = function() {
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
	}
	this.to_style_transp = function(a) {
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + a + ")";
	}
	this.delta = function(color) {
		return Math.abs(this.r - color.r) + Math.abs(this.g - color.g) + Math.abs(this.b - color.b);
	}
	this.clone = function() {
		return new Color(this.r, this.g, this.b, this.a);
	}
	this.transp = function(ratio) {
		return new Color(this.r, this.g, this.b, this.a * ratio);
	}
	this.linear_plugin = function(color, ratio) {
		var r = Math.round((this.r * (1 - ratio)) + (color.r * (ratio)));
		var g = Math.round((this.g * (1 - ratio)) + (color.g * (ratio)));
		var b = Math.round((this.b * (1 - ratio)) + (color.b * (ratio)));
		var a = Math.round((this.a * (1 - ratio)) + (color.a * (ratio)));
		return new Color(r, g, b, a);
	}
	this.str = function() {
		return "(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
	}
	this.add = function(color) {
		return new Color(this.r + color.r, this.g + color.g, this.b + color.b, this.a + color.a);
	}
	this.scale = function(n) {
		return new Color(Math.round(this.r * n), Math.round(this.g * n), Math.round(this.b * n), Math.round(this.a * n));
	}
}

var ColorHandler = {};

ColorHandler.COLOR_STAFF_BLACK = new Color(0, 0, 0, 1);
ColorHandler.COLOR_STAFF_GRAY = new Color(0, 0, 0, 0.25);
ColorHandler.COLOR_BACKGROUND = new Color(255, 255, 191, 1);

ColorHandler.COLOR_LIGHT = new Color(255, 255, 255, 1);

ColorHandler.average = function(colors) {
	var index;
	var color = new Color(0, 0, 0, 0);
	for (index in colors) {
		color = color.add(colors[index]);
	}
	if (colors.length) {
		color = color.scale(1 / colors.length);
	}
	return color;
}

ColorHandler.ratio_to_color = function(ratio, color_table, ratio_table) {
	var i = 0;
	while (ratio > ratio_table[i]) {
		i = i + 1;
	}
	// Ratio is between ratio_table[i] and ratio_table[i - 1].
	if (i == 0) {
		return color_table[0];
	}
	if (i == ratio_table.length) {
		return color_table[ratio_table.length - 1];
	}
	var c1 = color_table[i - 1];
	var c2 = color_table[i];
	return c1.linear_plugin(c2, (ratio - ratio_table[i - 1]) / (ratio_table[i] - ratio_table[i - 1]));
}
