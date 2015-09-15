'use strict';

if (!window.Worker) {
	alert('unsupported browser');
	throw new Error('unsupported browser');
}

function init() {
	let ctx = document.getElementById('canvas').getContext('2d'),
		inputwrkr = document.getElementById('worker'),
		inputnon = document.getElementById('nonwrkr'),
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
		inputwrkr.max = img.width;
		inputwrkr.min = 1;
		inputwrkr.value = img.width;	

		inputnon.max = img.width;	
		inputnon.min = 1;
		inputnon.value = img.width;

		widthlabel.textContent = 'Width: ' + img.width;

		// get the imagedata from the canvas
		imageData = ctx.getImageData(0, 0, img.width, img.height);
	};

	inputwrkr.onchange = function(e){
		let newWidth = Number(e.target.value);

		widthlabel.textContent = 'Width: ' + newWidth;

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

		worker.adjust(imageData, newWidth, function(payload){
			window.console.log(payload);

			let newImageData = new ImageData(payload.image, payload.width, payload.height);

			ctx.canvas.width = payload.width;
			ctx.putImageData(newImageData, 0, 0);
		});
	};

	inputnon.onchange = function(e){
		let newWidth = Number(e.target.value);
		widthlabel.textContent = 'Width: ' + newWidth;

		let seamcarver = new SeamCarver(imageData);

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

		let data = seamcarver.resize(e.target.value);
		let newImageData = new ImageData(data, e.target.value, img.height);

		ctx.canvas.width = e.target.value;
		ctx.putImageData(newImageData, 0, 0);
	};
}

function changeSrc(e) {
	document.getElementById('source').src = e.src;
	init();
}

init();