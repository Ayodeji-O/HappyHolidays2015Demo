// ScrollingImagesScopeSourceScene.js - Happy Holidays 2015 Kaleidoscope
//                                      source scene, consisting of
//                                      scrolling image instances
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// - Utility.js

function scrollingImagesScopeSourceScene() {
	this.numImages = 20;
	this.minSpeedX = 20;
	this.maxSpeedX = 400;
	this.minSpeedY = 20;
	this.maxSpeedY = 400;

	this.positionDataCollection = new Array();
}


scrollingImagesScopeSourceScene.prototype.initialize = function(sourceImage) {
	this.sourceImage = sourceImage;
	
	// Compute the minimum/maximum image placement values, based on
	// a region that is a quarter of the size of the output canvas (images
	// may initially be situated at the edge of a canvas, not entirely
	// contained within the canvas).
	this.minImageX = - this.sourceImage.width;
	this.minImageY = - this.sourceImage.height;
	this.maxImageX = (Constants.defaultCanvasWidth / 2.0);
	this.maxImageY = (Constants.defaultCanvasHeight / 2.0);
	
	// Clear/setup the initial image positions.
	this.positionDataCollection = [];

	for (initLoop = 0; initLoop < this.numImages; initLoop++) {
		var initialPositionData = this.generateImagePositionData();
		
		this.positionDataCollection.push(initialPositionData);
	}
}

/**
 * Updates the internal position of all images, using a time
 *  quantum in order to determine the image position update delta
 * @param timeQuantum {number} Time increment quantum, in milliseconds
 */
scrollingImagesScopeSourceScene.prototype.updatePositions = function(timeQuantum) {
	// Express position delta per unit time as units per second.
	var timeBasedScaleFactor = timeQuantum / Constants.millisecondsPerSecond;

	for (var currentPosDataIndex in this.positionDataCollection) {
		// Scroll the image across the screen...
		this.positionDataCollection[currentPosDataIndex].positionX +=
			this.positionDataCollection[currentPosDataIndex].scrollSpeedX *			
			timeBasedScaleFactor;
		this.positionDataCollection[currentPosDataIndex].positionY +=
			this.positionDataCollection[currentPosDataIndex].scrollSpeedY *
			timeBasedScaleFactor;
			
		// Reset the position of the image if it has left the screen
		// boundaries
		if ((this.positionDataCollection[currentPosDataIndex].positionX > 
			this.maxImageX) ||
			(this.positionDataCollection[currentPosDataIndex].positionY > 
			this.maxImageY)) {
				
			this.positionDataCollection[currentPosDataIndex] = this.generateImagePositionData();
		}
	}
}

/**
 * Generates a single instance of an image position data object,
 *  containing the initial position for an image
 * @return {object literal} An instance of initial position data
 *                          used to position an image, containing the
 *                          following members:
 *                          {number} positionX
 *                          {number} positionY
 *                          {number} scrollSpeedX
 *                          {number} scrollSpeedY
 */
scrollingImagesScopeSourceScene.prototype.generateImagePositionData = function() {
	var initialPositionData = null;
	
	if (validateVar(this.minImageX) && validateVar(this.minImageY) &&
		validateVar(this.maxImageX) && validateVar(this.maxImageY)) {
			
		// Create initial placement and scrolling speed data for a
		// single image.
		initialPositionData = {
			positionX : (this.maxImageX - this.minImageX) * Math.random() + this.minImageX,
			positionY : (this.maxImageY - this.minImageY) * Math.random() + this.minImageY,
			scrollSpeedX : ((this.maxSpeedX - this.minSpeedX) * Math.random() + this.minSpeedX),
			scrollSpeedY : ((this.maxSpeedY - this.minSpeedY) * Math.random() + this.minSpeedY)
		}
	}
	
	return initialPositionData;
}

/**
 * Renders image instances into the output canvas, based upon
 *  internally-stored image positioning data
 * @param targetCanvasContext The canvas context to which the
 *                            image data will be rendered
 */
scrollingImagesScopeSourceScene.prototype.renderImageInstances = function(targetCanvasContext) {
	if (validateVar(targetCanvasContext) && validateVar(this.sourceImage)) {
		for (var currentPosDataIndex in this.positionDataCollection) {
			targetCanvasContext.drawImage(this.sourceImage,
				this.positionDataCollection[currentPosDataIndex].positionX,
				this.positionDataCollection[currentPosDataIndex].positionY);
		}
	}
}

/**
 * Executes a time-parameterized single sub-scene animation step
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
scrollingImagesScopeSourceScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	
	this.renderImageInstances(targetCanvasContext);
	this.updatePositions(timeQuantum);
}