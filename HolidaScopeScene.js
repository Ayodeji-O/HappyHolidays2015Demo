// HolidaScopeScene.js - Happy Holidays 2015 Kaleidoscope scene
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// - Utility.js
// - ScrollingImagesScopeSourceScene.js
// - ZoomingImagesScopeSourceScene.js
// - RotatingImagesScopeSourceScene.js

function holidaScopeScene() {

	// Maximum durations of a "sub-scene" (kaleidoscope source
	// scene) in milliseconds;
	this.maxSubSceneDurationMs = 10000.0;
	
	// Currently active "sub-scene"
	this.currentlyActiveSubScene = null;
	
	// The amount of time that the current scene has
	// be executing, in milliseconds
	this.currentSubSceneRunTimeMs = 0.0;
	
	
	this.kaleidoSliceAngleRadians = Math.PI / 16;
	
	this.kaleidoTransformLookupTable = [[]];
	
	this.kaleidoSourceCanvas = document.createElement("canvas");
	this.kaleidoSourceCanvas.width = Constants.defaultCanvasWidth / 2.0;
	this.kaleidoSourceCanvas.height = Constants.defaultCanvasHeight / 2.0;
	
	this.kaleidoTransformTargetCanvas = document.createElement("canvas");
	this.kaleidoTransformTargetCanvas.width = Constants.defaultCanvasWidth / 2.0;
	this.kaleidoTransformTargetCanvas.height = Constants.defaultCanvasHeight / 2.0;
	
	this.kaleidoSourceContext = this.kaleidoSourceCanvas.getContext("2d");
	clearContext(this.kaleidoSourceContext, "RGB(0, 0, 0)");
	this.kaleidoTransformCanvasContext = this.kaleidoTransformTargetCanvas.getContext("2d");
	clearContext(this.kaleidoTransformCanvasContext, "RGB(0, 0, 0)");
	
	// Imagedata buffer that will be used as the target of the kaleidoscope
	// transformation.
	this.targetImageData = null;
	
	// Collection of scenes that will be used as the kaleidoscope
	// source image data.
	this.kaleidoSourceScenes = [
		new scrollingImagesScopeSourceScene(),
		new zoomingImagesScopeSourceScene(),
		new rotatingImagesScopeSourceScene()
	];
	
	// Position at which the scroller should be displayed.
	this.constScrollerOffsetFromBottom = 100;
	this.scrollerCoordX = 0;
	this.scrollerCoordY = Constants.defaultCanvasHeight - this.constScrollerOffsetFromBottom;
	
	this.scrollerBackgroundColor = new rgbColor(
		Constants.scrollerBackgroundUnitIntensity,
		Constants.scrollerBackgroundUnitIntensity,
		Constants.scrollerBackgroundUnitIntensity,		
		Constants.scrollerBackgroundUnitAlpha);
	
	this.messageScroller = new textScroller(Constants.scrollerFontSizePx, Constants.scrollerFont, Constants.scrollerFontStyle);
	this.messageScroller.setSourceString(Constants.messageText);
	
	// Scroller states - lead-in in is the delay before any of the scroller is displayed,
	// fade in is the period where the background fades-in in, and the text display
	// phase indicates the phase where the scroller is actually operating.
	this.constScrollerStateLeadIn = 0;
	this.constScrollerStateFadeIn = 1;
	this.constScrollerStateDisplayText = 2;
	
	// Stores the current scroller state
	this.currentScrollerState = this.constScrollerStateLeadIn;
	
	// Tracks the time in the present scroller state.
	this.currentScrollerStateTime = 0;
	
	// Scroller lead-in time (milliseconds)
	this.constScrollerStateLeadInTime = 3000;
	
	// Scroller fade-in time (milliseconds)
	this.constScrollerStateFadeInTime = 2000;
}

/**
 * Performs tasks such as switching scenes/choosing a new random
 *  scene
 * @param {number} timeQuantum Time, in milliseconds, since the last
 *                             method invocation.
 */
holidaScopeScene.prototype.performSubSceneMaintenance = function(timeQuantum) {
	if (validateVar(timeQuantum) && validateVar(this.kaleidoSourceScenes) &&
		(this.kaleidoSourceScenes.length > 0)) {
		this.currentSubSceneRunTimeMs += timeQuantum;
		if ((this.currentSubSceneRunTimeMs >= this.maxSubSceneDurationMs) ||
			(this.currentlyActiveSubScene === null)) {
			// The current scene run-time limit has been exceeded,
			// or a scene has not been set-up - set-up a new scene.
		
			this.currentlyActiveSubScene = this.kaleidoSourceScenes[(Math.round(Math.random() * (this.kaleidoSourceScenes.length - 1)))];
			
			if (globalResources.images.length > 0)
			{
				// Choose a random sub-scene, and a random image to be used
				// with the sub-scene.
				var newImageIndex = Math.round(Math.random() * (globalResources.images.length - 1));
				this.currentlyActiveSubScene.initialize(globalResources.images[newImageIndex]);
				this.currentSubSceneRunTimeMs = 0.0;
			}
		}
		else {
			this.currentSubSceneRunTimeMs += timeQuantum;
		}
	}
}

/**
 * Standard scene method - performs a one-time initialization of
 *  scene resources
 */
holidaScopeScene.prototype.initialize = function() {
	// Generate the look-up table used for the kaleidoscope transformation.
	this.precomputeKaleidoLookUpTable();
}

/**
 * Renders a single quandrant of the kaleidoscope, performing
 *  the appropriate reverse transformation.
 * @param sourceCanvasContext {CanvasRenderingContext2D} Canvas context that contains the
 *                                                       source image data
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context in which the data is
 *                                                       to be rendered
 */
holidaScopeScene.prototype.renderSingleKaleidoQuadrant = function(sourceCanvasContext, targetCanvasContext) {

	var horizontalStep = 2;

	if (validateVar(sourceCanvasContext) && validateVar(targetCanvasContext)) {
	
		var sourceImageData = sourceCanvasContext.getImageData(0, 0, sourceCanvasContext.canvas.width,
			sourceCanvasContext.canvas.height);
			
		if (this.targetImageData === null)
		{
			this.targetImageData = targetCanvasContext.createImageData(sourceImageData);
		}
		
		var bytesPerPixel = 4;
		var outputAlpha = 255;
		
		// Iterate through the rows of pixels in the first quandrant of the
		// target context, using the look-up table to acquire the appropriate
		// source pixel in the source context.
		for (var loopY = 0; loopY < sourceCanvasContext.canvas.height; loopY++) {
			for (var loopX = 0; loopX < sourceCanvasContext.canvas.width; loopX = loopX + horizontalStep) {
									
				var targetPoint = this.kaleidoTransformLookupTable[loopY][loopX];
				var sourceOffset = (targetPoint.getY() * bytesPerPixel * sourceCanvasContext.canvas.width) +
					(targetPoint.getX() * bytesPerPixel);
				var targetOffset = (loopY * bytesPerPixel * sourceCanvasContext.canvas.width) +
					(loopX * bytesPerPixel);
					
				// Read only the RGB components (skip the alpha component in order to reduce
				// the number of image reading operations).
				var colorCompA = sourceImageData.data[sourceOffset];
				var colorCompB = sourceImageData.data[sourceOffset + 1];
				var colorCompC = sourceImageData.data[sourceOffset + 2];
				for (var pixelCopyLoop = 0; pixelCopyLoop < horizontalStep; pixelCopyLoop++) {
					this.targetImageData.data[targetOffset + (pixelCopyLoop * bytesPerPixel)] = colorCompA;
					this.targetImageData.data[targetOffset + (pixelCopyLoop * bytesPerPixel) + 1] = colorCompB;
					this.targetImageData.data[targetOffset + (pixelCopyLoop * bytesPerPixel) + 2] = colorCompC;
					this.targetImageData.data[targetOffset + (pixelCopyLoop * bytesPerPixel) + 3] = outputAlpha;
				}
			}
		}
	
	
		targetCanvasContext.putImageData(this.targetImageData, 0, 0);
	}
}

/**
 * Mirrors an canvas into a target canvas buffer,
 *  duplicating theimage in separate quadrants,
 *  translating/mirroring the image along the
 *  X and Y axis for each quadrant
 * @param sourceCanvas {canvas} The canvas that is to
 *                              be rendered into the target
 *                              canvas
 * @param targetCanvas {canvas} The canvas into which the source
 *                              canvas will be rendered (must
 *                              be at least twice as large as the
 *                              source canvas along the X and Y
 *                              axis)
 */
holidaScopeScene.prototype.drawKaleidoImageDataIntoQuadrants = function(sourceCanvasContext, targetCanvasContext) {
	var inversionScaleFactor = -1.0;

	if (validateVar(sourceCanvasContext) && validateVar(targetCanvasContext)) {
	
		// The target canvas must be large enough to contain copies
		// of the source canvas, arranged in a 2 x 2 pattern.
		if ((targetCanvasContext.canvas.width >= (2.0 * sourceCanvasContext.canvas.width)) &&
			(targetCanvasContext.canvas.height >= (2.0 * sourceCanvasContext.canvas.height))) {


		
			var targetAreaTotalWidth = 2 * sourceCanvasContext.canvas.width;
			var targetAreaTotalHeight = 2 * sourceCanvasContext.canvas.height;
		
			// Top-left quadrant
			targetCanvasContext.save();
			targetCanvasContext.scale(1.0, 1.0);
			targetCanvasContext.translate(0.0, 0.0);
			targetCanvasContext.drawImage(sourceCanvasContext.canvas, 0, 0);
			targetCanvasContext.restore();
			
			// Top-right quadrant
			targetCanvasContext.save();
			targetCanvasContext.translate(targetAreaTotalWidth, 0.0);
			targetCanvasContext.scale(inversionScaleFactor, 1.0);
			targetCanvasContext.drawImage(sourceCanvasContext.canvas, 0, 0);
			targetCanvasContext.restore();
			
			// Bottom-left quadrant
			targetCanvasContext.save();
			targetCanvasContext.scale(1.0, 1.0);
			targetCanvasContext.translate(0.0, targetAreaTotalHeight);
			targetCanvasContext.scale(1.0, inversionScaleFactor);
			targetCanvasContext.drawImage(sourceCanvasContext.canvas, 0, 0);
			targetCanvasContext.restore();
			
			// Bottom-right quandrant
			targetCanvasContext.save();
			targetCanvasContext.scale(1.0, 1.0);
			targetCanvasContext.translate(targetAreaTotalWidth, targetAreaTotalHeight);
			targetCanvasContext.scale(inversionScaleFactor, inversionScaleFactor);
			targetCanvasContext.drawImage(sourceCanvasContext.canvas, 0, 0);
			targetCanvasContext.restore();
		}
	}
}

/**
 * Pre-computes the look-up table used to render a single
 *  quandrant of the kaleidoscope transformation (reverse-
 *  transformation table).
 */
holidaScopeScene.prototype.precomputeKaleidoLookUpTable = function() {
	
	// The kaleidoscope source "slice" is mirrored around the reference
	// vector, which runs diagonally across the kaleidoscope canvas. 
	// Construct the slices assuming that the source will be the top-left
	// screen quadrant.
	var vectorHeadX = (this.kaleidoTransformCanvasContext.canvas.width - 1);
	var vectorHeadY = (this.kaleidoTransformCanvasContext.canvas.height - 1);
	var referenceVector = new vector(-vectorHeadX, -vectorHeadY);
		
	var centerPoint = new point(this.kaleidoTransformCanvasContext.canvas.width - 1,
		this.kaleidoTransformCanvasContext.canvas.height - 1)
	
	for (var loopY = 0; loopY < this.kaleidoTransformCanvasContext.canvas.height; loopY++) {
		
		this.kaleidoTransformLookupTable[loopY] = [];
		for (var loopX = 0; loopX < this.kaleidoTransformCanvasContext.canvas.width; loopX++) {
			var currentVector = new vector(loopX - vectorHeadX, loopY - vectorHeadY);
			
			var dotProduct = referenceVector.dotProduct(currentVector);
			
			if ((currentVector.magnitude() > 0) && (referenceVector.magnitude() > 0)) {
				// Determine the angle between the reference vector and the
				// current vector described by the location within the canvas and
				// the slice origin.
				var angleBetweenVectors = Math.acos(dotProduct / (referenceVector.magnitude() * currentVector.magnitude()));
			
				// Structure the look-up table such that the pixels are never read
				// outside of the slice - instead, use the current angle to compute
				// an angle that oscillates between the edges of the slice.
				var angleMultiplier = Math.pow (-1.0, Math.floor(Math.abs(angleBetweenVectors / this.kaleidoSliceAngleRadians)));
				var angleModulus = angleBetweenVectors % this.kaleidoSliceAngleRadians;
				var derivedAngle = angleModulus * angleMultiplier + (angleMultiplier > 0 ? 0.0 : this.kaleidoSliceAngleRadians);

				// Compute the look-up point for the reverse transformation, based
				// upon the computed angle.
				var currentMagnitudeAlongRefVecX = referenceVector.getXComponent() * currentVector.magnitude() / referenceVector.magnitude();
				var currentMagnitudeAlongRefVecY = referenceVector.getYComponent() * currentVector.magnitude() / referenceVector.magnitude();
				var sourcePointUnrotated = new point(currentMagnitudeAlongRefVecX + vectorHeadX, currentMagnitudeAlongRefVecY + vectorHeadY);
				var finalSourcePoint = sourcePointUnrotated.rotatePointCopy(centerPoint, -derivedAngle);
			
				this.kaleidoTransformLookupTable[loopY][loopX] = new point(Math.max(Math.round(finalSourcePoint.getX()), 0),
					Math.max(Math.round(finalSourcePoint.getY()), 0));
			}
			else {
				this.kaleidoTransformLookupTable[loopY][loopX] = new point(0.0, 0.0);
			}
		}
	}
}

/**
 * Renders the text scroller output to a specified canvas context
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} The output canvas context
 *                                                       to which the text scroller
 *                                                       will be rendered
 */
holidaScopeScene.prototype.renderScrollerSection = function(timeQuantum, targetCanvasContext) {
	if (validateVar(targetCanvasContext) && (this.currentScrollerState !== this.constScrollerStateLeadIn)) {
	
		// Draw a background strip in order to enhance scroller readability.
		targetCanvasContext.save();
		targetCanvasContext.fillStyle = this.scrollerBackgroundColor.getRgbaIntValueAsStandardString();
		
		// Set the alpha for the scroller background (the alpha is variable as the scroller background
		// fades-in).
		targetCanvasContext.globalAlpha = (this.currentScrollerState === this.constScrollerStateFadeIn) ?
			Constants.scrollerBackgroundUnitAlpha * (this.currentScrollerStateTime / this.constScrollerStateFadeInTime) :
			Constants.scrollerBackgroundUnitAlpha;
		targetCanvasContext.fillRect(this.scrollerCoordX, this.scrollerCoordY,
			targetCanvasContext.canvas.width, this.messageScroller.getTextAreaHeight());
		targetCanvasContext.restore();
		
		// Display the scroller text.
		if (this.currentScrollerState === this.constScrollerStateDisplayText) {
			this.messageScroller.renderScroller(targetCanvasContext, this.scrollerCoordX, this.scrollerCoordY);
			this.messageScroller.advanceScroller();
		}
	}
	
	this.updateScrollerState(timeQuantum);
}

/**
 * Updates the display state of the scroller, depending upon the
 *  amount of total time that has elapsed in the scene execution
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
holidaScopeScene.prototype.updateScrollerState = function(timeQuantum) {
	this.currentScrollerStateTime += timeQuantum;

	if ((this.currentScrollerState === this.constScrollerStateLeadIn) &&
		(this.currentScrollerStateTime >= this.constScrollerStateLeadInTime)) {
		
		// Lead-in time has been completed - advance the scroller to the
		// fade-in phase.
		this.currentScrollerState = this.constScrollerStateFadeIn;
		this.currentScrollerStateTime = 0;
	}
	else if ((this.currentScrollerState === this.constScrollerStateFadeIn) &&
		(this.currentScrollerStateTime >= this.constScrollerStateFadeInTime)) {
	
		// The scroller fade-in phase has been completed - display the scroller
		// text.
		this.currentScrollerState = this.constScrollerStateDisplayText;
		this.currentScrollerStateTime = 0;	
	}
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
holidaScopeScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	// Initialize a new sub-scene as necessary...
	this.performSubSceneMaintenance(timeQuantum);
	
	// Generate/update data to be used as a source for the kaleidoscope
	// scene.
	if (this.currentlyActiveSubScene !== null) {
		clearContext(this.kaleidoSourceContext, "RGB(0, 0, 0)");
		this.currentlyActiveSubScene.executeStep(timeQuantum, this.kaleidoSourceContext);
	}
	
	this.renderSingleKaleidoQuadrant(this.kaleidoSourceContext, this.kaleidoTransformCanvasContext);
	this.drawKaleidoImageDataIntoQuadrants(this.kaleidoTransformCanvasContext, targetCanvasContext);
	this.renderScrollerSection(timeQuantum, targetCanvasContext);
}