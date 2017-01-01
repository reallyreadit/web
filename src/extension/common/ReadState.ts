export default class ReadState {
    private _state: number[];
    private _wordCount: number;
    private _wordsRead: number;
    constructor(data: number[] | ReadState[]) {
        if (data[0] instanceof ReadState) {
            const readStates = data as ReadState[];
            this._state = readStates[0]._state.slice();
            for (var i = 1; i < readStates.length; i++) {
                if (Math.sign(readStates[i]._state[0]) === Math.sign(this._state[this._state.length - 1])) {
                    this._state[this._state.length - 1] += readStates[i]._state[0];
                    if (readStates[i]._state.length > 1) {
                        this._state = this._state.concat(readStates[i]._state.slice(1));
                    }
                } else {
                    this._state = this._state.concat(readStates[i]._state);
                }
            }
        } else {
            this._state = data as number[];
        }
        this._updateCountCache();
    }
    private _updateCountCache() {
        this._wordCount = 0;
        this._wordsRead = 0;
        for (var i = 0; i < this._state.length; i++) {
            this._wordCount += Math.abs(this._state[i]);
            if (this._state[i] > 0) {
                this._wordsRead += this._state[i];
            }
        }
    }
    public getPercentComplete() {
        return (this._wordsRead * 100) / this._wordCount; 
    }
    public isComplete() {
        return this._wordsRead === this._wordCount;
    }
    public readWord() {
        if (!this.isComplete()) {
            // update state
            if (this._state[0] === -1) {
                this._state.splice(0, 1);
                this._state[0]++;
            } else {
                if (this._state[0] > 0) {
                    this._state[0]++;
                } else {
                    this._state.unshift(1);
                }
                if (this._state[1] === -1) {
                    this._state.splice(1, 1);
                    if (this._state.length >= 2) {
                        this._state[0] += this._state.splice(1, 1)[0];
                    }
                } else {
                    this._state[1]++;
                }
            }
            // update words read
            this._wordsRead++;
        }
    }
    public slice(startIndex: number, count: number) {
        var index = 0,
            skipCount = 0,
            takeCount = 0,
            state = [],
            segAbsVal,
            segSign;
        while (skipCount + Math.abs(this._state[index]) <= startIndex) {
            skipCount += Math.abs(this._state[index++]);
        }
        while (takeCount !== count) {
            segAbsVal = Math.min(Math.abs(this._state[index]) - (startIndex - skipCount), count - takeCount);
            segSign = Math.sign(this._state[index]);
            if (segSign === Math.sign(state[state.length - 1])) {
                state[state.length - 1] += segSign * segAbsVal;
            } else {
                state.push(segSign * segAbsVal);
            }
            skipCount += (startIndex - skipCount);
            takeCount += segAbsVal;
            index++;
        }
        return new ReadState(state);
    }
    public get wordCount() {
        return this._wordCount;
    }
    public get readStateArray() {
        return this._state;
    }
}