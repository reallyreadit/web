// get canvas contexts
var contexts = Array.from(document.getElementsByTagName('canvas')).map(function (canvas) {
	return canvas.getContext('2d');
});
// set the badge background color
chrome.browserAction.setBadgeBackgroundColor({ color: '#555555' });
// drawing helpers
function drawText(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.fillStyle = 'rgb(50,50,50)';
	var y = ctx.canvas.height * 0.56;
	ctx.font = ctx.canvas.width * 0.45 + 'pt Adler';
	ctx.fillText('r', ctx.canvas.width * 0.13, y);
	ctx.fillText('r', ctx.canvas.width * 0.52, y);
	ctx.restore();
}
function setSpeechBubblePath(ctx: CanvasRenderingContext2D) {
	var width = ctx.canvas.width,
		height = ctx.canvas.height,
		padding = 0.5,
		bubbleWidth = width - (padding * 2),
		bubbleHeight = (height - padding * 2) * 0.78,
		cornerRadius = bubbleWidth * 0.11,
		tailHeight = height - (padding * 2) - bubbleHeight;
	ctx.beginPath();
	ctx.moveTo(padding + cornerRadius, padding);
	ctx.lineTo(padding + bubbleWidth - cornerRadius, padding);
	ctx.quadraticCurveTo(padding + bubbleWidth, padding, padding + bubbleWidth, padding + cornerRadius);
	ctx.lineTo(padding + bubbleWidth, padding + bubbleHeight - cornerRadius);
	ctx.quadraticCurveTo(padding + bubbleWidth, padding + bubbleHeight, padding + bubbleWidth - cornerRadius, padding + bubbleHeight);
	ctx.lineTo(padding + (bubbleWidth * 0.49), padding + bubbleHeight);
	ctx.quadraticCurveTo(padding + (bubbleWidth * 0.33), padding + bubbleHeight + (tailHeight * 0.875), padding, padding + bubbleHeight + tailHeight);
	ctx.quadraticCurveTo(padding + (bubbleWidth * 0.19), padding + bubbleHeight + (tailHeight * 0.625), padding + (bubbleWidth * 0.19), padding + bubbleHeight);
	ctx.lineTo(padding + cornerRadius, padding + bubbleHeight);
	ctx.quadraticCurveTo(padding, padding + bubbleHeight, padding, padding + bubbleHeight - cornerRadius);
	ctx.lineTo(padding, padding + cornerRadius);
	ctx.quadraticCurveTo(padding, padding, padding + cornerRadius, padding);
	ctx.closePath();
}
function drawSpeechBubble(ctx: CanvasRenderingContext2D) {
	ctx.save();
	setSpeechBubblePath(ctx);
	ctx.strokeStyle = 'rgb(80,80,80)';
	ctx.stroke();
	ctx.restore();
}
function drawProgressBar(ctx: CanvasRenderingContext2D, params: { percentComplete?: number, state?: 'locked' | 'unlocked' }) {
	var percentComplete = params.percentComplete || 0,
		state = params.state || 'locked',
		barHeight = Math.ceil((percentComplete * ctx.canvas.height) / 100);
	ctx.save();
	// clip to speech bubble
	setSpeechBubblePath(ctx);
	ctx.clip();
	// draw white background
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// draw progress bar
	ctx.fillStyle = state === 'locked' ? 'rgba(255,0,0,0.35)' : 'rgba(0,255,0,0.35)';
	ctx.fillRect(0, ctx.canvas.height - barHeight, ctx.canvas.width, barHeight);
	ctx.restore();
}
export default {
	drawText: drawText,
	setSpeechBubblePath: setSpeechBubblePath,
	drawSpeechBubble: drawSpeechBubble,
	drawProgressBar: drawProgressBar,
	setIcon: function (params: { percentComplete?: number, state?: 'locked' | 'unlocked' }) {
		contexts.forEach(function (ctx) {
			// clear
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			// draw progress bar
			drawProgressBar(ctx, params);
			// draw speech bubble
			drawSpeechBubble(ctx);
			// draw text
			drawText(ctx);
		});
		// set icon
		chrome.browserAction.setIcon({
			imageData: [19, 38].reduce<{ [index: number]: ImageData }>(function (imageData, size) {
				imageData[size] = contexts.filter(function (ctx) {
					return ctx.canvas.width === size;
				})[0].getImageData(0, 0, size, size);
				return imageData;
			}, {})
		});
	}
};