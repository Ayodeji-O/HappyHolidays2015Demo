// RotatingImagesScopeSourceScene.js - Happy Holidays 2015 Kaleidoscope
//                                     source scene, consisting of
//                                     rotating/"zooming" image instances
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// - Utility.js


function rotatingImagesScopeSourceScene() {
	this.minRows = 2;
	this.maxRows = 5;
	this.minColumns = 3;
	this.maxColumns = 8;
	
	
	/**
	 * Maximum/minimum angle increments for individual
     *  image instances (degrees/millisecond)
	 */
	this.minAngleIncrement = 1.0 / Constants.millisecondsPerSecond;
	this.maxAngleIncrement = 8.0 / Constants.millisecondsPerSecond;
	
	this.minScaleFactor = 0.7;
	this.maxScaleFactor = 3.0;
	this.totalExecutionTime = 0.0;
	
	/**
	 * Sine function rate multiplier - (degrees/millisecond)
	 */
	this.sinRateMultiplierScaleMin = 0.1;
	this.sinRateMultiplierScaleMax = 0.8;

	// Perform an first-time random factor initialization -
	// this initialization ensures that usable initial
	// values exist.
	this.initializeRandomFactors();
}

/**
 * Initializes factors that are randomly generated
 */
rotatingImagesScopeSourceScene.prototype.initializeRandomFactors = function() {
	this.scalingMultiplier = (this.maxScaleFactor - this.minScaleFactor) * Math.random() +  this.minScaleFactor;
	this.sinRateMultiplier = 2 * Math.PI / Constants.millisecondsPerSecond *
		((this.sinRateMultiplierScaleMax - this.sinRateMultiplierScaleMin) * Math.random() +
		this.sinRateMultiplierScaleMin);	
}

/**
 * Initializes the sub-scene
 * @param sourceImage Image to use to construct the array of
 *                    rotated images
 */
rotatingImagesScopeSourceScene.prototype.initialize = function(sourceImage) {	
	this.sourceImage = sourceImage;
	
	this.initializeRandomFactors();
	
	this.drawingAreaWidth = (Constants.defaultCanvasWidth / 2.0);
	this.drawingAreaHeight = (Constants.defaultCanvasHeight / 2.0);
	
	// Clear/setup the initial image positions and rotation orientations.
	this.orientationDataCollection = [];
	
	// Determine the number of rows and columns that will exist for images.
	this.numImageRows = Math.round(Math.random() * (this.maxRows - this.minRows) + this.minRows);
	this.numImageColumns = Math.round(Math.random() * (this.maxColumns - this.minColumns) + this.minColumns);
	
	for (initLoop = 0; initLoop < (this.numImageRows * this.numImageColumns); initLoop++) {
		
		var currentColumnIndex = initLoop % this.numImageColumns;
		var currentRowIndex = Math.floor(initLoop / this.numImageColumns);
		
		var initialPositionData = this.generateImageOrientationData(currentRowIndex,  currentColumnIndex);
		
		this.orientationDataCollection.push(initialPositionData);
	}
}

/**
 * Updates the internal position of all images, using a time
 *  quantum in order to determine the image position update delta
 * @param timeQuantum {number} Time increment quantum, in milliseconds
 */
rotatingImagesScopeSourceScene.prototype.updateOrientations = function(timeQuantum) {
	for (var currentOrientationDataIndex in this.orientationDataCollection) {
		
		this.orientationDataCollection[currentOrientationDataIndex].rotationAngle =
			(this.orientationDataCollection[currentOrientationDataIndex].rotationAngle +
			(this.orientationDataCollection[currentOrientationDataIndex].rotationAngleIncrement * timeQuantum)) %
			Constants.maxAngleDegrees;
	}
}

/**
 * Generates the initial orientations of images to be
 *  rotated
 * @param rowIndex {number} Index of the row in which the image to
 *        be roteated resides
 * @param columnIndex {number} Index of the column in which the image
 *                             to be rotated resides
 *
 */
rotatingImagesScopeSourceScene.prototype.generateImageOrientationData = function(rowIndex, columnIndex) {
	var initialOrientationData = null;
	
	
	var distanceBetweenColumns = this.drawingAreaWidth / this.numImageColumns;
	var distanceBetweenRows = this.drawingAreaHeight / this.numImageRows;
	
	if (validateVar(rowIndex) && validateVar(columnIndex) &&
		validateVar(this.numImageColumns) && validateVar(this.numImageRows)) {
		
		// Compute the initial position (spaced at regular intervals)
		// rotation angle, and rotation angle increment per unit time.
		initialOrientationData = {
			positionX : (distanceBetweenColumns * columnIndex) + (distanceBetweenColumns / 2.0),
			positionY : (distanceBetweenRows * rowIndex) + (distanceBetweenRows / 2.0),
			rotationAngle : Math.random() * Math.PI * 2.0,
			rotationAngleIncrement : (Math.random() * (this.maxAngleIncrement - this.minAngleIncrement)) + this.minAngleIncrement,
		}
	}
	
	
	return initialOrientationData;
}


/**
 * Renders image instances into the output canvas, based upon
 *  internally-stored image orientation data
 * @param targetCanvasContext The canvas context to which the
 *                            image data will be rendered
 */
rotatingImagesScopeSourceScene.prototype.renderImageInstances = function(targetCanvasContext) {
	if (validateVar(targetCanvasContext) && validateVar(this.sourceImage)) {
		
		
		var timeBasedScalingMultiplier = ((this.scalingMultiplier - this.minScaleFactor) *
			((Math.sin(this.totalExecutionTime * this.sinRateMultiplier) + 1.0) / 2.0)) + this.minScaleFactor;
		
		var targetImageWidth = Math.max((this.drawingAreaWidth / this.numImageColumns) *
			timeBasedScalingMultiplier, 0.0);
		var targetImageHeight = Math.max((this.drawingAreaHeight / this.numImageColumns) *
			timeBasedScalingMultiplier, 0.0);
		
		// Iterate through the collection of images, rendering each image,
		// using the per-image orientation data during the rendering process.
		for (var currentOrientationDataIndex in this.orientationDataCollection) {			
			var topLeftX = this.orientationDataCollection[currentOrientationDataIndex].positionX - (targetImageWidth / 2.0);
			var topLeftY = this.orientationDataCollection[currentOrientationDataIndex].positionY - (targetImageHeight / 2.0);
						
			targetCanvasContext.save();

			// Translate the origin in order to ensure that the rotation occurs at the
			// center of the image...
			targetCanvasContext.translate(this.orientationDataCollection[currentOrientationDataIndex].positionX,
				this.orientationDataCollection[currentOrientationDataIndex].positionY);
			
			// Rotate and draw the image.
			targetCanvasContext.rotate(this.orientationDataCollection[currentOrientationDataIndex].rotationAngle);
				
			targetCanvasContext.drawImage(this.sourceImage, -(targetImageWidth / 2.0), -(targetImageHeight / 2.0), targetImageWidth,
				targetImageHeight);
				
			targetCanvasContext.restore();
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
rotatingImagesScopeSourceScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	this.updateOrientations(timeQuantum);
	this.renderImageInstances(targetCanvasContext);
	this.totalExecutionTime += timeQuantum;
}