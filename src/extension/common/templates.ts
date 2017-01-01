// overlay container
var overlayContainer = document.createElement('div');
overlayContainer.setAttribute('id', 'rrit-overlay-container');
overlayContainer.style.cssText = 'position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: 99999;';
// block overlay
var blockOverlay = document.createElement('div');
blockOverlay.setAttribute('class', 'rrit-block-overlay');
blockOverlay.style.cssText = 'position: absolute;outline: 1px dashed #999;';
// line overlay
var lineOverlay = document.createElement('div');
lineOverlay.setAttribute('class', 'rrit-line-overlay');
lineOverlay.style.cssText = 'position:absolute;width:100%;';
// blank text
var blankText = document.createElement('span');
blankText.style.cssText = 'position: absolute;visibility: hidden;';
blankText.innerHTML = '&nbsp;';

export default class templates {
    public static get overlayContainer() { return overlayContainer.cloneNode() as HTMLDivElement; }
    public static get blockOverlay() { return blockOverlay.cloneNode() as HTMLDivElement; }
    public static get lineOverlay() { return lineOverlay.cloneNode() as HTMLDivElement; }
    public static get blankText() { return blankText.cloneNode(true) as HTMLSpanElement; }
}