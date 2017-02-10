import PageTitle from '../common/PageTitle';

export default class BrowserPageTitle extends PageTitle {
	private isInitialized = false;
	constructor(title: string) {
		super();
		this.title = title;
	}
	public set(title: string) {
		if (this.isInitialized) {
			super.set(title);
			document.title = title;
		}
	}
	public initialize() {
		this.isInitialized = true;
	}
} 