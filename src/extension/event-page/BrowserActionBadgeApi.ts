// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

enum Color {
	Default = '#555555'
}
type OptionalTabId = number | null;
interface LoadingAnimation {
	interval: number,
	tabId: OptionalTabId
}
function createLoadingAnimation(tabId: OptionalTabId) {
	let frameIndex = 0;
	let frameCount = 5;
	chrome.browserAction.setBadgeBackgroundColor(
		{
			color: Color.Default,
			tabId
		}
	);
	return {
		interval: window.setInterval(
			() => {
				let text = '';
				for (let i = 0; i < frameCount - 1; i++) {
					if (i === frameIndex) {
						text += '.';
					} else {
						// use punctuation space (U+2008) since Firefox trims regular space
						text += String.fromCharCode(0x2008);
					}
				}
				chrome.browserAction.setBadgeText({
					tabId,
					text
				});
				frameIndex = ++frameIndex % frameCount;
			},
			150
		),
		tabId
	};
}
export default class BrowserActionBadgeApi {
	private readonly _animations: LoadingAnimation[] = [];
	private cancelAnimation(tabId: OptionalTabId) {
		const animation = this.getAnimation(tabId);
		if (animation) {
			console.log(`[BrowserActionBadgeApi] cancelling loading animation for tab # ${tabId}`);
			clearInterval(animation.interval);
			this._animations.splice(
				this._animations.indexOf(animation),
				1
			);
		}
	}
	private getAnimation(tabId: OptionalTabId) {
		return this._animations.find(
			animation => animation.tabId === tabId
		);			
	}
	public setDefault(tabId: OptionalTabId = null) {
		this.cancelAnimation(tabId);
		chrome.browserAction.setBadgeBackgroundColor({
			color: Color.Default,
			tabId
		});
		chrome.browserAction.setBadgeText({
			tabId,
			text: ''
		});
	}
	public setLoading(tabId: OptionalTabId = null) {
		if (this.getAnimation(tabId)) {
			return;
		}
		console.log(`[BrowserActionBadgeApi] creating loading animation for tab # ${tabId}`);
		this._animations.push(
			createLoadingAnimation(tabId)
		);
	}
}