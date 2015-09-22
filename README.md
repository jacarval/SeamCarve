# SeamCarve

JS implementation of the Seam Carve algorithm (http://perso.crans.org/frenoy/matlab2012/seamcarving.pdf). Performs content aware image scaling to shrink images while attempting to maintain the aspect ratio of important features. Uses webworkers to peform image manipulation in a separate thread so that the page header and canvas background can continue to animate without interruption.

http://jacarval.github.io/SeamCarve/
