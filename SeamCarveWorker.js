'use strict';

class SeamCarveWorker {
	constructor() {
		this.worker = new Worker('SeamCarve.js');
	}

	adjust(image, newWidth, callback) {
		this.worker.postMessage({
			action: 'adjust',
			payload: {
				image: image,
				width: newWidth
			}
		});

		this.worker.onmessage = function(e) {
			if (e.data.action === 'update') {
				callback(e.data);
			}

			if (e.data.action === 'error') {
				window.console.log('error');
			}
		};
	}
}