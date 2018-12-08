export default abstract class {
	public abstract execute(action: string): Promise<string>;
	public abstract hideBadge(): void;
	public abstract showBadge(): void;
}