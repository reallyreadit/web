type ArticleStatus = 'locked' | 'unlocked';
// drawing helpers
function drawText(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.fillStyle = 'rgb(50,50,50)';
	const y = ctx.canvas.height * 0.56;
	ctx.font = ctx.canvas.width * 0.45 + 'pt Adler';
	ctx.fillText('r', ctx.canvas.width * 0.13, y);
	ctx.fillText('r', ctx.canvas.width * 0.52, y);
	ctx.restore();
}
function setSpeechBubblePath(ctx: CanvasRenderingContext2D) {
	const width = ctx.canvas.width,
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
function drawProgressBar(percentComplete: number, articleStatus: ArticleStatus, ctx: CanvasRenderingContext2D) {
	const barHeight = Math.ceil((percentComplete * ctx.canvas.height) / 100);
	ctx.save();
	// clip to speech bubble
	setSpeechBubblePath(ctx);
	ctx.clip();
	// draw white background
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// draw progress bar
	ctx.fillStyle = articleStatus === 'locked' ? 'pink' : 'palegreen';
	ctx.fillRect(0, ctx.canvas.height - barHeight, ctx.canvas.width, barHeight);
	ctx.restore();
}
// contexts
const contexts = [16,32].map(size => {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	return canvas.getContext('2d');
});
export default function (accountStatus: 'signedIn' | 'signedOut', percentComplete: number, articleStatus: ArticleStatus) {
	chrome.browserAction.setIcon({
		imageData: contexts.reduce<{ [index: number]: ImageData }>((imageData, ctx) => {
			// get size
			const size = ctx.canvas.width;
			// clear
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			// set opacity
			ctx.globalAlpha = accountStatus === 'signedIn' ? 1 : 0.5;
			// draw progress bar
			drawProgressBar(percentComplete, articleStatus, ctx);
			// draw speech bubble
			drawSpeechBubble(ctx);
			// draw text
			drawText(ctx);
			// get data
			imageData[size] = ctx.getImageData(0, 0, size, size);
			return imageData;
		}, {})
	});
};