'use strict';

if (!window.Worker) {
	alert('unsupported browser');
	throw new Error('unsupported browser');
}

function init() {
	let ctx = document.getElementById('canvas').getContext('2d'),
		input = document.getElementById('width'),
		img = new Image(),
		seamcarver = new SeamCarveWorker(),
		imageData = null;

	img.src = document.getElementById('source').src;
	
	img.onload = function() {
		// copy the image to the canvas
		ctx.canvas.height = img.height;
		ctx.canvas.width = img.width;
		ctx.drawImage(img, 0, 0);

		// set the value of the resizer to the current image width
		document.getElementById('width').value = img.width;	

		// get the imagedata from the canvas
		imageData = ctx.getImageData(0, 0, img.width, img.height);
	};

	input.onchange = function(e){
		if (e.target.value > img.width) { alert('invalid width'); throw new Error('invalid width'); }

		seamcarver.adjust(imageData, e.target.value, function(payload){	
			imageData = new ImageData(payload.image, payload.width, payload.height);

			ctx.canvas.width = payload.width;
			ctx.putImageData(imageData, 0, 0);
		});
	};
}

init();