'use strict';

if (!window.Worker) {
	alert('unsupported browser');
	throw new Error('unsupported browser');
}

function init() {
	let ctx = document.getElementById('canvas').getContext('2d'),
		range = document.getElementById('range'),
		useWorker = document.getElementById('workrbox'),
		showHeatMap = document.getElementById('heatbox'),
		showSeams = document.getElementById('seamsbox'),
		widthlabel = document.getElementById('width'),
		img = new Image(),
		imageData = null;

	window.seamcarver = new SeamCarveWorker();

	let paintUpdatedImage = function(data) {
		let newImageData = new ImageData(data.payload.image, data.payload.width, data.payload.height);

		ctx.canvas.width = data.payload.width;
		ctx.putImageData(newImageData, 0, 0);
	};

	let drawSeam = function(data) {
		let id = ctx.createImageData(2,2);
		let d  = id.data;
		d[0] = 0;
		d[1] = 0;
		d[2] = 0;
		d[3] = 0;
		data.payload.seam.forEach(function(col, row) {
			ctx.putImageData(id, col, row);
		});
	};

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
		console.log(imageData)
	};

	range.onchange = function(e){
		let newWidth = Number(e.target.value);

		if (newWidth > img.width || isNaN(newWidth)) { 
			alert('invalid width'); 
			throw new Error('invalid width'); 
		}

		// reset to original image if value has been reset
		ctx.canvas.width = img.width;
		ctx.putImageData(imageData, 0, 0); 

		if (useWorker.checked) {       
			let options = {showSeams: showSeams.checked, showHeatMap: showHeatMap.checked};

			window.seamcarver.adjust(imageData, newWidth, options, paintUpdatedImage, drawSeam);
		} else {
			let options = {showSeams: false, showHeatMap: false};
			let seamcarver = new SeamCarver(imageData, options);
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

function stopWorker() {
	window.seamcarver.worker.terminate();
	window.seamcarver = new SeamCarveWorker();
}

init();