const siteKeys = {
	createAccount: '6LcxOV4UAAAAAGZTappGq7UwQ7EXSBUxAGMJNLQM',
	forgotPassword: '6LeSR14UAAAAAHLt_KcHJTjOIZiy2txFnXf4UmUr',
	shareArticle: '6LegNF4UAAAAAMLjq6Q-L7-hvfP7kKaTIdMUtg9h'
};

export default abstract class {
	public abstract getResponse(id: number): string;
	public abstract onReady(): Promise<this>;
	public abstract render(container: HTMLElement, siteKey: string): number;
	public abstract reset(id: number): void;
	public get siteKeys() {
		return siteKeys;
	}
}