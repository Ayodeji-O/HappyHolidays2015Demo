// Katie-Ayo_HappyHolidays2015Main.js - Happy Holidays 2015 demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -InternalConstants.js
//  -SceneExecution.js
//  -GlobalResources.js
//  -TextScroller.js
//  -HolidaScopeScene.js
//  -ProgressBar.js

/**
 * Completion function to be used with
 *  globalResources.setProgressFunction() - updates/draws
 *  a progress bar to be used during loading of image
 *  resources
 * @param progressFraction {number} Progress completion fraction
 *                                  (0.0 - 1.0, inclusive)
 * @see globalResources.setProgressFunction
 */
function updateProgressBar(progressFraction) {
	var mainCanvasContext = globalResources.getMainCanvasContext();
	if (mainCanvasContext != null) {
		clearContext(mainCanvasContext, "RGB(0, 0, 0)");
	
		var progressBarWidth = 300;	
		var progressBarHeight = 40;

		var progressBarPositionX = (mainCanvasContext.canvas.width - progressBarWidth) / 2.0;
		var progressBarPositionY = mainCanvasContext.canvas.height - (progressBarHeight * 4);
		
		// Create and position the progress bar...
		var loadingProgressBar = new progressBar();
		loadingProgressBar.setPosition(progressBarPositionX, progressBarPositionY);
		loadingProgressBar.setSize(progressBarWidth, progressBarHeight);
		
		// Draw the progress bar, indicating the current loading progress
		loadingProgressBar.drawProgressBar(progressFraction, mainCanvasContext);
	}
}

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction {function} Function to be invoked after the
 *                                      DOM resource initialization has
 *                                      been completed.
 */
function initDomResources(completionFunction) {
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");
	
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);		
	var mainCanvas = document.createElement("canvas");

    if (validateVar(mainCanvas) && (typeof mainCanvas.getContext === 'function')) {
		mainCanvas.width = Constants.defaultCanvasWidth;
		mainCanvas.height = Constants.defaultCanvasHeight;
	
        // Store the two-dimensional context that is
        // required to write data to the canvas.
        mainCanvasContext = mainCanvas.getContext('2d');
    
		if (validateVar(mainCanvasContext)) {
			// Add the canvas object to the DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);
			
			globalResources.setMainCanvasContext(mainCanvasContext);
		}
	}
	
	// Set a function that will permit a progress bar to be
	// drawng during loading, in order to convey loading
	// progress.
	globalResources.setProgressFunction(updateProgressBar);
	
	// Initialize DOM resources - upon completion of the
	// resource initialization, execute the provided
	// completion function.
	globalResources.initialize(completionFunction);
}

/**
 * Completion function to be used with globalResources.initialize() -
 *  executes the HolidaScope scene immediately after all image
 *  data has been loaded
 * @see globalResources.initialize
 */
executeMainScene = function() {
	// Create the main Kaleidoscope scene, and ultimately
	// invoke the start of the demo.
	var kaleidoScopeScene = new holidaScopeScene();
	sceneExecution(kaleidoScopeScene);
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
onLoadHandler = function() {
	// Initalize the DOM resources, immediately
	// executing the demo after completion of
	// initialization.
	initDomResources(executeMainScene);
}