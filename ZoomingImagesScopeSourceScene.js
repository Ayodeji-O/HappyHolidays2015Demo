// ZoomingImagesScopeSourceScene.js - Happy Holidays 2015 Kaleidoscope
//                                    source scene, consisting of
//                                    scaling/"zooming" image instances
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// - Utility.js


function zoomingImagesScopeSourceScene() {
	this.numImages = 40;
	this.minScaleSpeed = 80;
	this.maxScaleSpeed = 300;
}

zoomingImagesScopeSourceScene.prototype.initialize = function(sourceImage) {
	this.sourceImage = sourceImage;
	
	this.minImageX = -this.sourceImage.width;
	this.minImageY = -this.sourceImage.height;
	this.maxImageX = (Constants.defaultCanvasWidth / 2.0);
	this.maxImageY = (Constants.defaultCanvasHeight / 2.0);
	
	this.centerX = this.maxImageX / 2.0;
	this.centerY = this.maxImageY / 2.0;
	
	this.maxDistance = Math.sqrt(Math.pow(this.centerX, 2.0) + Math.pow(this.centerY, 2.0));
	
	// Clear/setup the initial image positions.
	this.positionDataCollection = [];

	for (initLoop = 0; initLoop < this.numImages; initLoop++) {
		var initialPositionData = this.generateImagePositionData();
		
		this.positionDataCollection.push(initialPositionData);
	}
}

/**
 * Computes the scaling factor, along a single axis, used during
 *  image position updates, based upon the position of the
 *  image. This factor is used to simulate depth-based perspective
 *  during image zooming
 * @param axisCoord Immediate position along an axis
 * @param centerCoord Center coordinate of the affected axis
 * @param maxAxisCoord Maximum position along the affected axis
 * @return A scaling factor that should be used when positioning
 *         along an axis in order to simulate depth
 */
zoomingImagesScopeSourceScene.prototype.computeCoordinateScaleFactor = function(axisCoord, centerCoord, maxAxisCoord) {
	
	var normalizedDistanceFromCenter = 0.0;
	
	if (validateVar(axisCoord) && validateVar(centerCoord) && validateVar(maxAxisCoord)) {

		normalizedDistanceFromCenter = (axisCoord - centerCoord) / (maxAxisCoord / 2.0);
	}
	
	return normalizedDistanceFromCenter;
}

/**
 * Updates the internal position of all images, using a time
 *  quantum in order to determine the image position update delta
 * @param timeQuantum {number} Time increment quantum, in milliseconds
 */
zoomingImagesScopeSourceScene.prototype.updatePositions = function(timeQuantum) {
	// Express position delta per unit time as units per second.
	var timeBasedScaleFactor = timeQuantum / Constants.millisecondsPerSecond;
	
	for (var currentPosDataIndex in this.positionDataCollection) {
		
		// Move each image along the X and Y axes, using the position-based
		// multiplier in order to simulate the effects of perspective
		// (the images will appear to be moving towards the viewer, so
		// the increment increases as the image moves towards the edge
		// of the screen).
		var distanceBasedScaleFactorX = this.computeCoordinateScaleFactor(
			this.positionDataCollection[currentPosDataIndex].positionX,
			this.centerX, this.maxImageX);
			
		var distanceBasedScaleFactorY = this.computeCoordinateScaleFactor(
			this.positionDataCollection[currentPosDataIndex].positionY,
			this.centerY, this.maxImageY);
		
		this.positionDataCollection[currentPosDataIndex].positionX +=
			this.positionDataCollection[currentPosDataIndex].scaleSpeed *
			distanceBasedScaleFactorX * timeBasedScaleFactor;
		this.positionDataCollection[currentPosDataIndex].positionY +=
			this.positionDataCollection[currentPosDataIndex].scaleSpeed *
			distanceBasedScaleFactorY * timeBasedScaleFactor;
			
		// Generate new position data if the image is no longer within the
		// screen boundaries...
		if ((this.positionDataCollection[currentPosDataIndex].positionX < 
			this.minImageX) ||
			(this.positionDataCollection[currentPosDataIndex].positionX > 
			this.maxImageX) ||
			(this.positionDataCollection[currentPosDataIndex].positionY < 
			this.minImageY) ||
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
 *                          {number} scaleSpeed
 */
zoomingImagesScopeSourceScene.prototype.generateImagePositionData = function() {
	var initialPositionData = null;
	
	if (validateVar(this.minImageX) && validateVar(this.minImageY) &&
		validateVar(this.maxImageX) && validateVar(this.maxImageY)) {
		
		// Create initial placement and scrolling speed data for a
		// single image.
		initialPositionData = {
			positionX : (this.maxImageX - this.minImageX) * Math.random() + this.minImageX,
			positionY : (this.maxImageY - this.minImageY) * Math.random() + this.minImageY,
			scaleSpeed : ((this.maxScaleSpeed - this.minScaleSpeed) * Math.random() + this.minScaleSpeed)
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
zoomingImagesScopeSourceScene.prototype.renderImageInstances = function(targetCanvasContext) {
	if (validateVar(targetCanvasContext) && validateVar(this.sourceImage) && validateVar(this.maxDistance)) {
		for (var currentPosDataIndex in this.positionDataCollection) {
			
			var distance = Math.sqrt(
				Math.pow(this.positionDataCollection[currentPosDataIndex].positionX - this.centerX, 2.0) +
				Math.pow(this.positionDataCollection[currentPosDataIndex].positionY - this.centerY, 2.0));
						
			var scaleFactor = distance/this.maxDistance;
			
			targetCanvasContext.drawImage(this.sourceImage,
				this.positionDataCollection[currentPosDataIndex].positionX,
				this.positionDataCollection[currentPosDataIndex].positionY,
				scaleFactor * this.sourceImage.width,
				scaleFactor * this.sourceImage.height);
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
zoomingImagesScopeSourceScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	
	this.renderImageInstances(targetCanvasContext);
	this.updatePositions(timeQuantum);
}