'use strict';

if (!window.Worker) {
	alert('unsupported browser');
	throw new Error('unsupported browser');
}

init();

function init() {

	let canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		img = new Image(),
		widthInput = document.getElementById('width'),
		seamcarver = new Worker('SeamCarve.js');

	img.src = document.getElementById('source').src;
	img.onload = function() {
		window.console.log('image loaded!');
	};

	canvas.height = img.height;
	canvas.width = img.width;
	widthInput.value = img.width;

	ctx.drawImage(img, 0, 0);

	let imageData = ctx.getImageData(0, 0, img.width, img.height);

	widthInput.onchange = function(e){
		seamcarver.postMessage({
			action: 'adjust',
			payload: {
				image: imageData,
				width: e.target.value
			}
		});
	};

	seamcarver.onmessage = function(e) {
		switch (e.data.action) {

		case 'update':
			window.console.log('new image:', e.data); 

			canvas.width = e.data.payload.width;
			imageData = new ImageData(e.data.payload.image, e.data.payload.width, e.data.payload.height);
			ctx.putImageData(imageData, 0, 0);
			break;

		case 'alert':
			window.console.log('alert:', e.data); 
			break;

		default:
			window.console.log('default:', e.data); 
			break;
		}
	};
}