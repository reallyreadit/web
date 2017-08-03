type ArticleStatus = 'locked' | 'unlocked';
// drawing helpers
const padding = 0.5;
const leftRPath = new Path2D('m 62.873597,35.891202 q -0.4608,0.9984 -0.9216,3.84 -0.384,2.7648 -1.0752,3.84 -1.0752,1.6896 -3.6096,1.6896 -0.4608,0.1536 -0.9216,0.1536 -2.304,0 -3.9936,-2.8416 -2.1504,-3.5328 -2.5344,-3.84 1.92,-0.6912 1.9968,-0.6912 1.152,-0.4608 1.7664,-1.152 -1.152,-1.152 -2.688,-1.152 -1.7664,0 -4.454399,1.7664 -2.0736,1.536 -4.1472,3.072 -4.6848,2.7648 -4.6848,8.5248 0,0.6912 0.0768,2.2272 0.0768,1.459199 0.0768,2.227199 0,3.3792 -1.0752,5.76 0.1536,4.9152 5.8368,4.9152 0.9984,0 3.1488,-0.1536 2.2272,-0.1536 3.302399,-0.1536 2.9952,0 4.608,0.9984 l -1.92,3.763199 q -3.763199,0.0768 -11.827199,0.9984 -7.68,0.9216 -11.827199,0.9216 -4.9152,0 -9.1392,-0.9984 -0.9216,-0.2304 -0.9984,-2.457599 0.0768,-1.536 0.0768,-3.1488 1.3056,0.9984 2.6112,0.9984 1.2288,0 3.5328,-1.152 2.3808,-1.2288 3.84,-1.2288 1.0752,0 2.2272,0.4608 0.6912,-0.768 0.9216,-1.9968 0.1536,-0.768 0,-2.3808 -0.0768,-1.6128 0,-2.1504 -1.152,-1.152 -1.92,-0.9984 1.6128,-1.6128 1.6128,-3.7632 0,-2.150399 -1.6128,-3.686399 1.92,-0.768 1.92,-2.5344 0,-1.0752 -0.9984,-3.456 -0.9216,-2.3808 -0.9216,-3.3792 h -1.8432 q -0.8448,-1.92 -2.5344,-1.92 -0.8448,0 -2.9184,0.6912 -1.9968,0.6144 -3.1488,0.6144 -0.9216,0 -1.6896,-0.3072 v -6.604799 q 2.4576,-0.6912 5.76,-0.9216 2.1504,-0.1536 6.0672,0 4.300799,0.0768 5.990399,0 -0.2304,0.4608 -0.2304,0.9216 0,0.9216 1.2288,1.92 1.536,1.3824 1.7664,1.843199 0.5376,-0.691199 2.9184,-0.998399 1.9968,-0.3072 1.9968,-1.6128 0,-0.4608 -0.2304,-1.152 5.2992,-1.0752 8.447999,-1.0752 7.5264,0 12.1344,5.759999 z' as any);
const rightRPath = new Path2D('m 112.79359,35.891202 q -0.4608,0.9984 -0.9216,3.84 -0.384,2.7648 -1.0752,3.84 -1.0752,1.6896 -3.60959,1.6896 -0.4608,0.1536 -0.9216,0.1536 -2.304,0 -3.9936,-2.8416 -2.1504,-3.5328 -2.534404,-3.84 1.920004,-0.6912 1.996804,-0.6912 1.152,-0.4608 1.7664,-1.152 -1.152,-1.152 -2.688,-1.152 -1.766404,0 -4.454404,1.7664 -2.0736,1.536 -4.1472,3.072 -4.6848,2.7648 -4.6848,8.5248 0,0.6912 0.0768,2.2272 0.0768,1.459199 0.0768,2.227199 0,3.3792 -1.0752,5.76 0.1536,4.9152 5.8368,4.9152 0.9984,0 3.1488,-0.1536 2.2272,-0.1536 3.3024,-0.1536 2.995204,0 4.608004,0.9984 l -1.92,3.763199 q -3.763204,0.0768 -11.827204,0.9984 -7.679999,0.9216 -11.827199,0.9216 -4.9152,0 -9.1392,-0.9984 -0.9216,-0.2304 -0.9984,-2.457599 0.0768,-1.536 0.0768,-3.1488 1.3056,0.9984 2.6112,0.9984 1.2288,0 3.5328,-1.152 2.3808,-1.2288 3.84,-1.2288 1.0752,0 2.2272,0.4608 0.6912,-0.768 0.9216,-1.9968 0.1536,-0.768 0,-2.3808 -0.0768,-1.6128 0,-2.1504 -1.152,-1.152 -1.92,-0.9984 1.6128,-1.6128 1.6128,-3.7632 0,-2.150399 -1.6128,-3.686399 1.92,-0.768 1.92,-2.5344 0,-1.0752 -0.9984,-3.456 -0.9216,-2.3808 -0.9216,-3.3792 h -1.8432 q -0.8448,-1.92 -2.5344,-1.92 -0.8448,0 -2.9184,0.6912 -1.9968,0.6144 -3.1488,0.6144 -0.9216,0 -1.689599,-0.3072 v -6.604799 q 2.457599,-0.6912 5.759999,-0.9216 2.1504,-0.1536 6.0672,0 4.3008,0.0768 5.990399,0 -0.2304,0.4608 -0.2304,0.9216 0,0.9216 1.2288,1.92 1.536,1.3824 1.7664,1.843199 0.5376,-0.691199 2.9184,-0.998399 1.9968,-0.3072 1.9968,-1.6128 0,-0.4608 -0.2304,-1.152 5.2992,-1.0752 8.448004,-1.0752 7.5264,0 12.13439,5.759999 z' as any);
const warningTrianglePath = new Path2D('M 31.982422 2.03125 L 16.986328 28.982422 L 1.9902344 55.933594 L 31.982422 55.933594 L 61.976562 55.933594 L 46.980469 28.982422 L 31.982422 2.03125 z ' as any);
const warningTriangleExclamationPath = new Path2D('M 31.982422 21.8125 C 29.292179 21.8125 27.947266 22.843117 27.947266 24.904297 C 27.947266 25.14521 27.967659 25.386033 28.007812 25.626953 L 30.478516 39.982422 L 33.488281 39.982422 L 35.958984 25.626953 C 35.999138 25.412806 36.019531 25.165839 36.019531 24.884766 C 36.019531 22.836972 34.672665 21.8125 31.982422 21.8125 z M 31.982422 42.933594 C 29.626786 42.933594 28.449219 44.111157 28.449219 46.466797 C 28.449219 48.82243 29.626786 50 31.982422 50 C 34.338057 50 35.517578 48.82243 35.517578 46.466797 C 35.517578 44.111157 34.338057 42.933594 31.982422 42.933594 z ' as any);
function drawWarning(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.scale(ctx.canvas.width / 74, ctx.canvas.height / 74);
	ctx.translate(10, 16);
	ctx.fillStyle = 'rgb(255,255,0)';
	ctx.fill(warningTrianglePath as any);
	ctx.strokeStyle = 'rgb(0,0,0)';
	ctx.lineWidth = 3;
	ctx.lineJoin = 'round';
	ctx.stroke(warningTrianglePath);
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fill(warningTriangleExclamationPath as any);
	ctx.restore();
}
function drawText(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.scale(ctx.canvas.width / 128, ctx.canvas.height / 128);
	ctx.fillStyle = 'rgb(50,50,50)';
	ctx.fill(leftRPath as any);
	ctx.fill(rightRPath as any);
	ctx.restore();
}
function setSpeechBubblePath(ctx: CanvasRenderingContext2D) {
	const width = ctx.canvas.width,
		  height = ctx.canvas.height,
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
function drawNewReplyIndicator(ctx: CanvasRenderingContext2D) {
	const width = ctx.canvas.width,
		indicatorSize = (width - (padding * 2)) * 0.45;
	ctx.save();
	// clip to speech bubble path
	setSpeechBubblePath(ctx);
	ctx.clip();
	// draw indicator path
	ctx.beginPath();
	ctx.moveTo(width - padding - indicatorSize, padding);
	ctx.lineTo(width - padding, padding);
	ctx.lineTo(width - padding, padding + indicatorSize);
	ctx.closePath();
	// fill indicator path
	ctx.fillStyle = 'red';
	ctx.fill();
	ctx.restore();
}
// contexts
const contexts = [16,32].map(size => {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	return canvas.getContext('2d');
});
export default function (accountStatus: 'signedIn' | 'signedOut', percentComplete: number, articleStatus: ArticleStatus, showNewReplyIndicator: boolean) {
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
			// draw new reply indicator
			if (showNewReplyIndicator) {
				drawNewReplyIndicator(ctx);
			}
			// draw warning triangle
			if (accountStatus === 'signedOut') {
				ctx.globalAlpha = 1;
				drawWarning(ctx);
			}
			// get data
			imageData[size] = ctx.getImageData(0, 0, size, size);
			return imageData;
		}, {})
	});
};