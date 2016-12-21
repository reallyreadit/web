import EventEmitter from './EventEmitter';

abstract class PageTitle extends EventEmitter<{ 'change': string }> {
	protected title: string;
	public set(title: string) {
		this.title = title;
		this.emitEvent('change', this.title);
	}
	public get() {
		return this.title;
	}
}
export default PageTitle;