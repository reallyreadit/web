interface Source {
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	size: number
}
// warning triangle
const
	warningTrianglePath = new Path2D('M 31.982422 2.03125 L 16.986328 28.982422 L 1.9902344 55.933594 L 31.982422 55.933594 L 61.976562 55.933594 L 46.980469 28.982422 L 31.982422 2.03125 z '),
	warningTriangleExclamationPath = new Path2D('M 31.982422 21.8125 C 29.292179 21.8125 27.947266 22.843117 27.947266 24.904297 C 27.947266 25.14521 27.967659 25.386033 28.007812 25.626953 L 30.478516 39.982422 L 33.488281 39.982422 L 35.958984 25.626953 C 35.999138 25.412806 36.019531 25.165839 36.019531 24.884766 C 36.019531 22.836972 34.672665 21.8125 31.982422 21.8125 z M 31.982422 42.933594 C 29.626786 42.933594 28.449219 44.111157 28.449219 46.466797 C 28.449219 48.82243 29.626786 50 31.982422 50 C 34.338057 50 35.517578 48.82243 35.517578 46.466797 C 35.517578 44.111157 34.338057 42.933594 31.982422 42.933594 z ');
// sources
const sources = Promise.all(
	[16, 32]
		.map(size => {
			const canvas = document.createElement('canvas');
			canvas.width = size;
			canvas.height = size;
			const image = new Image();
			image.src = `./images/icon-${size}.png`;
			return new Promise<Source>(resolve => {
				image.onload = () => {
					resolve({
						context: canvas.getContext('2d'),
						image,
						size
					});
				};
			});
		})
);
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
export default function (
	accountStatus: 'signedIn' | 'signedOut'
) {
	sources.then(sources => {
		chrome.browserAction.setIcon({
			imageData: sources.reduce<{ [size: number]: ImageData }>((imageData, source) => {
				// clear
				source.context.clearRect(0, 0, source.context.canvas.width, source.context.canvas.height);
				// set opacity
				source.context.globalAlpha = accountStatus === 'signedIn' ? 1 : 0.5;
				// draw logo
				source.context.drawImage(source.image, 0, 0);
				// draw warning triangle
				if (accountStatus === 'signedOut') {
					source.context.globalAlpha = 1;
					drawWarning(source.context);
				}
				// get data
				imageData[source.size] = source.context.getImageData(0, 0, source.context.canvas.width, source.context.canvas.height);
				return imageData;
			}, {})
		});
	});
};