'use strict';

class SeamCarveWorker {
	constructor() {
		this.worker = new Worker('SeamCarve.js');
	}

	adjust(image, newWidth, updateCb, edgeCb, seamCb) {
		this.worker.postMessage({
			action: 'adjust',
			payload: {
				image: image,
				width: newWidth
			}
		});

		this.worker.onmessage = function(e) {
			switch (e.data.action){
			
			case 'update':
				updateCb(e.data);
				break;

			case 'pixelImportance':
				edgeCb(e.data);
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