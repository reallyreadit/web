import ReadState from './ReadState';

export default class Line {
    private _top: number;
    private _readState: ReadState;
    constructor(top: number, height: number, readState: ReadState) {
        // fields
        this._top = top;
        this._readState = readState;
    }
    public isRead() {
        return this._readState.isComplete();
    }
    public readWord() {
        const result = this._readState.readWord();
        return result;
    }
    public get readState() {
        return this._readState;
    }
    public get top() {
        return this._top;
    }
}