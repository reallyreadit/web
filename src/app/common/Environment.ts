import App from './App';
import Extension from './Extension';
import EventEmitter from './EventEmitter';
import UserArticle from '../../common/models/UserArticle';
import EnvironmentType from './EnvironmentType';
import ClientType from './ClientType';

export interface InitData {
	clientType: ClientType,
	extension: string
}
export default abstract class <TApp extends App, TExtension extends Extension> extends EventEmitter<{
	'articleUpdated': UserArticle
}> {
	protected readonly _type: EnvironmentType;
	protected readonly _clientType: ClientType;
	protected readonly _app: TApp;
	protected readonly _extension: TExtension;
	constructor(type: EnvironmentType, clientType: ClientType, app: TApp, extension: TExtension) {
		super();
		this._type = type;
		this._clientType = clientType;
		this._app = app;
		this._extension = extension;
	}
	public get type() {
		return this._type;
	}
	public get clientType() {
		return this._clientType;
	}
	public get app() {
		return this._app;
	}
	public get extension() {
		return this._extension;
	}
}