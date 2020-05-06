const
	thresholdDown = 15,
	thresholdUp = 45;
export default class ScrollService {
	private _isBarVisible = true;
	private _lastDirection = 0;
	private _lastDirectionChangeScrollY = 0;
	private _lastScrollY: number;
	private readonly _scrollElement: HTMLElement;
	private readonly _setBarVisibility: (isVisible: boolean) => void;
	constructor(
		{
			scrollElement,
			setBarVisibility
		} :
		{
			scrollElement: HTMLElement,
			setBarVisibility: (isVisible: boolean) => void
		}
	) {
		this._scrollElement = scrollElement;
		this._setBarVisibility = setBarVisibility;
		this._lastScrollY = this.getBoundedScrollY();
		scrollElement.addEventListener(
			'scroll',
			() => {
				// get current bounded scroll y
				const scrollY = this.getBoundedScrollY();
				// check change since last scroll event
				const delta = scrollY - this._lastScrollY;
				if (!delta) {
					return;
				}
				this._lastScrollY = scrollY;
				// check for direction change
				const direction = Math.sign(delta);
				if (direction !== this._lastDirection) {
					this._lastDirection = direction;
					this._lastDirectionChangeScrollY = scrollY;
				}
				// check threshold
				let changeVisibility = false;
				switch (direction) {
					case -1:
						changeVisibility = !this._isBarVisible && this._lastDirectionChangeScrollY - scrollY > thresholdUp;
						break;
					case 1:
						changeVisibility = this._isBarVisible && scrollY - this._lastDirectionChangeScrollY > thresholdDown;
						break;
				}
				if (changeVisibility) {
					this._setBarVisibility(this._isBarVisible = !this._isBarVisible);
				}
			}
		);
	}
	private getBoundedScrollY() {
		return Math.max(Math.min(this._scrollElement.scrollTop, this._scrollElement.scrollHeight - window.innerHeight), 0);
	}
	public setBarVisibility(isVisible: boolean) {
		this._isBarVisible = isVisible;
	}
}