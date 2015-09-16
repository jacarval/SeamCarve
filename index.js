'use strict';

if (!window.Worker) {
	alert('unsupported browser');
	throw new Error('unsupported browser');
}

function init() {
	let ctx = document.getElementById('canvas').getContext('2d'),
		range = document.getElementById('range'),
		checkbox = document.getElementById('checkbox'),
		widthlabel = document.getElementById('width'),
		img = new Image(),
		worker = new SeamCarveWorker(),
		imageData = null;

	img.src = document.getElementById('source').src;
	
	img.onload = function() {
		// copy the image to the canvas
		ctx.canvas.height = img.height;
		ctx.canvas.width = img.width;
		ctx.drawImage(img, 0, 0);

		// set the value of the resizers to the current image width
		range.max = img.width;
		range.min = 1;
		range.value = img.width;
		widthlabel.textContent = 'Width: ' + img.width;

		// get the imagedata from the canvas
		imageData = ctx.getImageData(0, 0, img.width, img.height);
	};

	range.onchange = function(e){
		let newWidth = Number(e.target.value);

		if (newWidth > img.width || isNaN(newWidth)) { 
			alert('invalid width'); 
			throw new Error('invalid width'); 
		}

		// reset to original image if value has been reset
		if (newWidth === img.width) {
			ctx.canvas.width = img.width;
			ctx.putImageData(imageData, 0, 0); 
			return; 
		}

		if (checkbox.checked) {
			worker.adjust(imageData, newWidth, function(data){
				window.console.log(data);

				let newImageData = new ImageData(data.payload.image, data.payload.width, data.payload.height);

				ctx.canvas.width = data.payload.width;
				ctx.putImageData(newImageData, 0, 0);
			});
		}
		else {
			let seamcarver = new SeamCarver(imageData);
			let data = seamcarver.resize(e.target.value);
			let newImageData = new ImageData(data, e.target.value, img.height);

			ctx.canvas.width = e.target.value;
			ctx.putImageData(newImageData, 0, 0);
		}
	};

	range.oninput = function(e) {
		let newWidth = Number(e.target.value);
		widthlabel.textContent = 'Width: ' + newWidth;
	};
}

function changeSrc(e) {
	document.getElementById('source').src = e.src;
	init();
}

init();