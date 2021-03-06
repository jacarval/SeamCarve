'use strict';

self.onmessage = function(e) {
	self.console.log(e.data); 

	let image = e.data.payload.image;
	let width = e.data.payload.width;
	let options = e.data.payload.options;
	// let height = e.data.payload.height;

	postMessage({action: 'alert', message: 'resizing'});

	let seamcarver = new SeamCarver(image, options);
	let result = seamcarver.resize(width);

	postMessage({action: 'update', payload: {image: result, width: width, height: image.height}});
	postMessage({action: 'alert', message: 'finished!'});
};


class SeamCarver {
	constructor(imageData, options) {
		this.data = imageData.data;
		this.width = imageData.width;
		this.height = imageData.height;
		this.showSeams = options.showSeams;
		this.showHeatMap = options.showHeatMap;
	}

	getPixelColor(x, y) {
		let base = (y * this.width + x) * 4;

		let	r = this.data[base + 0],
			g = this.data[base + 1],
			b = this.data[base + 2],
			a = this.data[base + 3];

		return new Color(r, g, b, a);
	}

	getPixelBrightness(x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
			return 0;
		}

		let pixel = this.getPixelColor(x, y);

		return (pixel.red + pixel.green + pixel.blue);
	}

	/*
		Pixels that are very different from their neighbors should have high importances,
		and pixels that are similar in color to their neighbors should have low importances.
	*/
	getPixelImportance(x, y) {
		let a, b, c,
			d, e, f,
			g, h, i;

		a = this.getPixelBrightness(x - 1, y - 1);
		b = this.getPixelBrightness(x, y - 1);
		c = this.getPixelBrightness(x + 1, y - 1);
		d = this.getPixelBrightness(x - 1, y);
		f = this.getPixelBrightness(x + 1, y);
		g = this.getPixelBrightness(x - 1, y + 1); 
		h = this.getPixelBrightness(x, y + 1);
		i = this.getPixelBrightness(x + 1, y + 1);

		let xenergy = a + 2 * d + g - c - 2 * f - i,
			yenergy = a + 2 * b + c - g - 2 * h - i;
		
		e = Math.sqrt(Math.pow(xenergy, 2) + Math.pow(yenergy, 2));

		return e;
	}

	getPixelImportanceArray() {
		let result = [];

		for (let row = 0; row < this.height; row++) {
			result[row] = [];

			for (let col = 0; col < this.width; col++) {
				result[row][col] = (this.getPixelImportance(col, row));
			}
		}
		if (this.showHeatMap) this.generateHeatMap(result);
		return result;
	}

	generateHeatMap(result) {	
		let newImage = new Uint8ClampedArray((this.width) * this.height * 4),
			offset = 0;

		result.forEach(function(row) {
			row.forEach(function(val) {
				let ratio = 2 * val / 2000;
				newImage[offset + 0] = Math.max(0, 255 * (ratio - 1)); // R
				newImage[offset + 1] = Math.max(0, 255 * (1 - ratio)); // B
				newImage[offset + 2] = 255; // G
				newImage[offset + 3] = 255; // Alpha
				offset = offset + 4;
			});
		});

		postMessage({action: 'update', payload: {image: newImage, width: this.width, height: this.height}});
	}

	/*
		[[3  6  8]		
		 [5  7  2]
		 [4  9  3]]
	*/

	findLowestCostSeam() {
		let vals = this.getPixelImportanceArray(),
			costs = [],
			dirs = [];

		costs[this.height - 1] = vals[this.height - 1];

		for (let row = this.height - 2; row >= 0; row--) {
			costs[row] = [];
			dirs[row] = [];
			for (let col = 0; col <= this.width - 1; col++) {
				let min = argmin([costs[row + 1][col - 1] || Infinity, costs[row + 1][col] || Infinity, costs[row + 1][col + 1] || Infinity]);
				costs[row][col] = vals[row][col] + min.value;
				dirs[row][col] = min.index - 1;
			}
		}
		
		let min_col = argmin(costs[0]).index,
			seam = [];

		seam[0] = min_col;

		for (let row = 0; row < this.height - 1; row++) {
			let prev = seam[row];
			seam[row + 1] = seam[row] + dirs[row][prev];
		}

		return seam;
	}

	resize(newWidth) {
		let newImage, deltaWidth = this.width - newWidth;
		
		for (let i = 0; i < deltaWidth; i++) {
			let seam = this.findLowestCostSeam(), 
				offset = 0;

			newImage = new Uint8ClampedArray((this.width - 1) * this.height * 4);

			for (let row = 0; row < this.height; row++) {
				for (let col = 0; col < this.width; col++) {
					if (col === seam[row]) {
						continue;
					}
					else {
						let pixel = this.getPixelColor(col, row);

						newImage[offset + 0] = pixel.red;
						newImage[offset + 1] = pixel.green;
						newImage[offset + 2] = pixel.blue;
						newImage[offset + 3] = pixel.alpha;

						offset = offset + 4;
					}
				}
			}
			this.data = newImage;
			this.width--;

			if (!this.showHeatMap && self.constructor.name != 'Window') postMessage({action: 'update', payload: {image: newImage, width: this.width, height: this.height}});
			if (this.showSeams) postMessage({action: 'seam', payload: {seam: seam}});
		}
		return newImage;
	}
}

function argmin(array) {
	let len = array.length,
		index = 0, 
		min = array[0];

	for (let i = 1; i < len; i++) {
		if (array[i] < min) {
			min = array[i];
			index = i;
		}
	}
	return {value: min, index: index};
}

class Color {
	constructor(r, g, b, a) {
		this.red = r;
		this.green = g;
		this.blue = b;
		this.alpha = a;
	}
}
