import PageTitle from '../common/PageTitle';

export default class ServerPageTitle extends PageTitle {
	private isInitialized = false;
	public set(title: string) {
		if (!this.isInitialized) {
			super.set(title);
		}
	}
	public initialize() {
		this.isInitialized = true;
	}
}