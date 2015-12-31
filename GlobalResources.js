// GlobalResources.js - Contains resources that are accessible
//                      from all areas of the demo
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js

function globalResources() {
	this.progressFunction = null;
}

/**
 * Relative pathname list of all image
 *  resources
 */
globalResources.imageNameList = [
	"images/CandyCaneWithBow.png",
	"images/HappyRudolphAnimated.gif",
	"images/GingerBreadMan.png",
	"images/SnowMan.png",
	"images/ChristmasBell.gif",
	"images/SnowFlake.png",
	"images/Candles.png",
	"images/Ornaments-Holly-Poinsettias.gif",
	"images/Gift.png",
	"images/HolidayCookies.png",
	"images/Wreath.png",
	"images/Ornaments.png",
	"images/ChistmasTree.png"
];

globalResources.images = [];

/**
 * Loads all internally-listed image resources
 * @param setLoadCompletionFunction {function} Function that will be
 *                                             invoked upon completion
 *                                             of loading the entire
 *                                             image resource set
 */
globalResources.loadImageResources = function(setLoadCompletionFunction) {
	if (this.imageNameList.length > 0) {
		this.loadIndexedResourceSet(0, setLoadCompletionFunction);
	}
}

/**
 * Sets a progress function, which receives loading progress
 *  updates
 * @param progressFunction {function} Function that receives a
 *                                    loading completion fraction
 *                                    value (0.0 - 1.0, inclusive)
 *
 */
globalResources.setProgressFunction = function(progressFunction) {
	this.progressFunction = progressFunction;
}

/**
 * Sends progress notifications to the progress function
 * @param progressFraction {number} Loading completion fraction
 *                                  (0.0 - 1.0, inclusive)
 *
 */
globalResources.notifyProgress = function(progressFraction) {
	if (validateVar(progressFraction) && (typeof progressFraction === "number") &&
		(progressFraction >= 0.0) && (progressFraction <= 1.0)) {
		
		if (typeof this.progressFunction === "function") {
			this.progressFunction(progressFraction);
		}
	}
}

/**
 * Loads a set of images that can be accessed globallay
 * @param startingResourceIndex {number} The index at which to
 *                                       start loading images
 * @param setLoadCompletionFunction {function} (Can be null)
 */
globalResources.loadIndexedResourceSet = function(startingResourceIndex, setLoadCompletionFunction) {
	if (validateVar(startingResourceIndex) && (typeof startingResourceIndex === "number")) {
		if ((startingResourceIndex >= 0) &&
			(startingResourceIndex < globalResources.imageNameList.length)) {

			/**
			 * Function that will be used to load the next
			 *  indexed resource in the set of resources
			 *  after the current image has been loaded.
			 */
			function loadNextImageCompletionFunction() {
				globalResources.notifyProgress((startingResourceIndex + 1) / globalResources.imageNameList.length);
				globalResources.loadIndexedResourceSet(startingResourceIndex + 1, setLoadCompletionFunction);
			}
			
			var newImage = new Image();
			if (startingResourceIndex < (globalResources.imageNameList.length - 1)) {
				// If the image is not the last image in the set,
				// attempt to load the next image.
				newImage.onload = loadNextImageCompletionFunction;
			}
			else if ((setLoadCompletionFunction != null) &&
				(typeof setLoadCompletionFunction === "function")) {
				
				// The image is the last image in the set -
				// after the image has been loaded, execute
				// a completion function that is designated
				// to be executed at the completion of the
				// set loading.
				newImage.onload = setLoadCompletionFunction;
			}
			
			this.images.splice(startingResourceIndex, 0, newImage);
			newImage.src = globalResources.imageNameList[startingResourceIndex];
		}
	}
}

/**
 * Sets the "main" canvas context used for drawing data to the
 *  browser window
 * @param mainCanvasContext {CanvasRenderingContext2D} The canvas context the
 *                          will be retrieved for drawing data to the browser
 *                          window
 */
globalResources.setMainCanvasContext = function(mainCanvasContext) {
	this.mainCanvasContext = mainCanvasContext;
}

/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D} The canvas context used for
 *         drawing data to the browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Initializes the global resources, loading
 *  any resources that require pre-loading
 * @param completionFuction {function} Completion function executed
 *                                     upon completion of all global
 *                                     resource loading
 */
globalResources.initialize = function(completionFunction) {
	this.mainCanvasContext
	this.loadImageResources(completionFunction);
}

