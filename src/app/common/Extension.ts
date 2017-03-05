import EventEmitter from './EventEmitter';

abstract class Extension extends EventEmitter<{
	'change': boolean
}> {
	public abstract isInstalled(): boolean;
	public abstract isBrowserCompatible(): boolean;
	public abstract getExtensionId(): string;
}

export default Extension;