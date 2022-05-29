// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

const
	thresholdDown = 15,
	thresholdUp = 45;
export default class ScrollService {
	private _isBarVisible = true;
	private _lastDirection = 0;
	private _lastDirectionChangeScrollY = 0;
	private _lastScrollY: number;
	private readonly _getScrollTop: () => number;
	private readonly _getScrollHeight: () => number;
	private readonly _setBarVisibility: (isVisible: boolean) => void;
	constructor(
		{
			scrollContainer,
			setBarVisibility
		} :
		{
			scrollContainer: HTMLElement | Window,
			setBarVisibility: (isVisible: boolean) => void
		}
	) {
		if (scrollContainer instanceof Window) {
			this._getScrollTop = () => scrollContainer.scrollY;
			this._getScrollHeight = () => scrollContainer.document.body.scrollHeight;
		} else {
			this._getScrollTop = () => scrollContainer.scrollTop;
			this._getScrollHeight = () => scrollContainer.scrollHeight;
		}
		this._setBarVisibility = setBarVisibility;
		this._lastScrollY = this.getBoundedScrollY();
		scrollContainer.addEventListener(
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
		return Math.max(Math.min(this._getScrollTop(), this._getScrollHeight() - window.innerHeight), 0);
	}
	public setBarVisibility(isVisible: boolean) {
		this._isBarVisible = isVisible;
	}
}