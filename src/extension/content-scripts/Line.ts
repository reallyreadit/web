import ReadState from './ReadState';

export default class Line {
    private _top: number;
    private _overlay: HTMLElement;
    private _readState: ReadState;
    constructor(top: number, height: number, overlay: HTMLElement, readState: ReadState) {
        // fields
        this._top = top;
        this._overlay = overlay;
        this._readState = readState;
        // init overlay
        overlay.style.top = top + 'px';
        overlay.style.height = height + 'px';
        this._setOverlayProgress();
    }
    private _setOverlayProgress() {
        var percentComplete = this._readState.getPercentComplete();
        this._overlay.style.backgroundImage = 'linear-gradient(to right, rgba(255,0,0,0.2) ' + percentComplete + '%, transparent ' + percentComplete + '%)';
    }
    public remove() {
        this._overlay.remove();	
    }
    public isRead() {
        return this._readState.isComplete();
    }
    public readWord() {
        // read word
        const result = this._readState.readWord();
        // update overlay background
        this._setOverlayProgress();
        return result;
    }
    public get readState() {
        return this._readState;
    }
    public get top() {
        return this._top;
    }
}