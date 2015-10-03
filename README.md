SeamCarve
=========

JS implementation of the Seam Carve algorithm (http://perso.crans.org/frenoy/matlab2012/seamcarving.pdf). Performs content aware image scaling to shrink images while attempting to maintain the aspect ratio of important features. Uses webworkers to peform image manipulation in a separate thread so that the page header and canvas background can continue to animate without interruption.

## How Web Workers Work
Web workers let you run javascript in background threads. This lets you perform processor intesive tasks without interfering with the user interface. The input and output of a web worker are transfered by passing messages to event handlers.

### In the main thread
```javascript
// Create a new instance of worker and pass in the path to your script
let myWorker = new Worker('worker.js');

// To send data to the worker use the its postMessage method
myWorker.postMessage('a message');

// To handle messages from the worker set its onmessage handler
myWorker.onmessage = function(e) {
  console.log(e.data); // e.data will contain your message
}

// To handle errors from the worker set its onerror handler
myWorker.onerror = function(error) {
  console.log(error);
}

// To terminate a worker mid operation use the terminate method
myWorker.terminate();
```
### In the worker
```javascript
// To send data from the worker to the main thread use postMessage
postMessage('a message');

// To handle messages from the main thread in the worker set the event handler
onmessage = function(e) {
  console.log(e.data);
}

// Workers can import scripts from the same domain into their scope
importScripts('myScript1.js', 'myScript2.js');
```

## How SeamCarve Works



## How to use it

http://jacarval.github.io/SeamCarve/
