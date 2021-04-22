import ShareData from './ShareData';

export interface ShareSelection {
	x: number,
	y: number,
	width: number,
	height: number
}

export interface ShareEvent extends ShareData {
	selection: ShareSelection
}

export function createRelativeShareSelection(selection: ShareSelection, window: Window) {
	return {
		x: selection.x / window.innerWidth,
		y: selection.y / window.innerHeight,
		width: selection.width / window.innerWidth,
		height: selection.height / window.innerHeight
	};
}