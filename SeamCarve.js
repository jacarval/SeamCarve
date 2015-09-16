'use strict';

self.onmessage = function(e) {
	self.console.log(e.data); 

	let image = e.data.payload.image;
	let width = e.data.payload.width;
	// let height = e.data.payload.height;

	postMessage({action: 'alert', message: 'resizing'});

	let seamcarver = new SeamCarver(image, true);
	let result = seamcarver.resize(width);

	postMessage({action: 'update', payload: {image: result, width: width, height: image.height}});
};

class SeamCarver {
	constructor(imageData, isWorker) {
		this.data = imageData.data;
		this.width = imageData.width;
		this.height = imageData.height;
		this.isWorker = isWorker;
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

	getPixelEnergy(x, y) {
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
		let result = new Array(this.height);

		for (let row = 0; row < this.height; row++) {
			result[row] = new Array(this.width);

			for (let col = 0; col < this.width; col++) {
				result[row][col] = (this.getPixelEnergy(col, row));
			}
		}
		if (this.isWorker) postMessage({action: 'pixelImportance', payload: {array: result}});
		return result;
	}

	findLowestCostSeam() {
		let vals = this.getPixelImportanceArray(),
			costs = new Array(this.height),
			dirs = new Array(this.height);

		costs[this.height - 1] = vals[this.height - 1];

		for (let row = this.height - 2; row >= 0; row--) {
			costs[row] = new Array(this.width);
			dirs[row] = new Array(this.width);
			for (let col = 0; col <= this.width - 1; col++) {
				let min = argmin([costs[row + 1][col - 1] || Infinity, costs[row + 1][col] || Infinity, costs[row + 1][col + 1] || Infinity]);
				costs[row][col] = vals[row][col] + min.value;
				dirs[row][col] = min.index - 1;
			}
		}
		
		let min_col = argmin(costs[0]).index,
			seam = new Array(this.height);

		seam[0] = min_col;

		for (let row = 0; row < this.height - 1; row++) {
			let prev = seam[row];
			seam[row + 1] = seam[row] + dirs[row][prev];
		}

		if (this.isWorker) postMessage({action: 'seam', payload: {seam: seam}});
		return seam;
	}

	// markSeam() {
	// 	let seam = this.findLowestCostSeam(), 
	// 		offset = 0;

	// 	let newImage = new Uint8ClampedArray(this.width * this.height * 4);

	// 	for (let row = 0; row < this.height; row++) {
	// 		for (let col = 0; col < this.width; col++) {
	// 			if (col === seam[row]) {
	// 				offset = offset + 4;
	// 			}
	// 			else {
	// 				let pixel = this.getPixelColor(col, row);

	// 				newImage[offset + 0] = pixel.red;
	// 				newImage[offset + 1] = pixel.green;
	// 				newImage[offset + 2] = pixel.blue;
	// 				newImage[offset + 3] = pixel.alpha;

	// 				offset = offset + 4;
	// 			}
	// 		}
	// 	}
	// 	return newImage; 
	// }

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
