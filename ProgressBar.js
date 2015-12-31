// ProgressBar.js - Renders a simple progress bar to a context
// Author: Ayodeji Oshinnaiye

function progressBar() {
	this.barWidth = 0;
	this.barHeight = 0;
	this.barPositionX = 0;
	this.barPositionY = 0;
	this.barInnerMargin = 3;
	this.barColor = "RGB(255, 255, 255)";
}

/**
 * Sets the size of the progress bar
 * @param width {number} Width of the progress bar (pixels)
 * @param height {number} Height of the progress bar (pixels)
 */
progressBar.prototype.setSize = function(width, height) {
	this.barWidth = Math.max(width, this.barInnerMargin * 2);
	this.barHeight = Math.max(height, this.barInnerMargin * 2);
}

/**
 * Sets the drawing location of the progress bar
 * @param coordX {number} X-coordinate of the upper-left corner
 * @param coordY {number} Y-coordinate of the upper-left corner
 */
progressBar.prototype.setPosition = function(coordX, coordY) {
	this.barPositionX = coordX;
	this.barPositionY = coordY;
}

/**
 * Draws the progress bar within a provided canvas context
 * @param progressFraction {number} Progress fraction to be represented
 *                                  (0.0 - 1.0, inclusive)
 * @param targetContext {CanvasRenderingContext2D} The context in which to draw the progress
 *                                                 bar
 */
progressBar.prototype.drawProgressBar = function(progressFraction, targetContext) {
	if (validateVar(progressFraction) && validateVar(targetContext)) {
		var workingProgressFraction = Math.min(Math.max(progressFraction, 0.0), 1.0);
		
		targetContext.save();
		
		targetContext.strokeStyle = this.barColor;
		targetContext.fillStyle = this.barColor;
		
		// Draw the progress bar within the provided context.
		targetContext.strokeRect(this.barPositionX, this.barPositionY, this.barWidth, this.barHeight);
		var maxBarInnerLength = this.barWidth - (2 * this.barInnerMargin);
		var barInnerLength = Math.round(maxBarInnerLength * workingProgressFraction);
		targetContext.fillRect((this.barPositionX + this.barInnerMargin), (this.barPositionY + this.barInnerMargin),
			barInnerLength, (this.barHeight - (2 * this.barInnerMargin)))
		
		targetContext.restore();
	}
}