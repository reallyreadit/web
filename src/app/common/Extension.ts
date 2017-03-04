import EventEmitter from './EventEmitter';

abstract class Extension extends EventEmitter<{
	'change': boolean
}> {
	public abstract isInstalled(): boolean;
	public abstract isBrowserCompatible(): boolean;
}

export default Extension;