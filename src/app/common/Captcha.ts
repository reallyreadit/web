export default abstract class {
	public abstract execute(action: string): Promise<string>;
	public abstract onReady(): Promise<this>;
}