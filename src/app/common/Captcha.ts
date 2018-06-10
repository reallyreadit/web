export default abstract class {
	public abstract getResponse(id: number): string;
	public abstract onReady(): Promise<this>;
	public abstract render(container: HTMLElement, siteKey: string): number;
	public abstract reset(id: number): void;
}