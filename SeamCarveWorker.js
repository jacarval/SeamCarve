'use strict';

class SeamCarveWorker {
	constructor() {
		this.worker = new Worker('SeamCarve.js');
	}

	adjust(image, newWidth, options, updateCb, seamCb) {
		this.worker.postMessage({
			action: 'adjust',
			payload: {
				image: image,
				width: newWidth,
				options: options
			}
		});

		this.worker.onmessage = function(e) {
			switch (e.data.action){
			
			case 'update':
				updateCb(e.data);
				break;

			case 'seam':
				seamCb(e.data);
				break;

			default:
				window.console.log(e.data);
			}
		};
	}
}