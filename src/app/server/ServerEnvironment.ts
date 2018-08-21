import Environment from '../common/Environment';
import EnvironmentType from '../common/EnvironmentType';
import ServerApp from './ServerApp';
import ServerExtension from './ServerExtension';
import ClientType from '../common/ClientType';

export default class extends Environment<ServerApp, ServerExtension> {
	constructor(clientType: ClientType, app: ServerApp, extension: ServerExtension) {
		super(EnvironmentType.Server, clientType, app, extension);
	}
	public getInitData() {
		return {
			clientType: this.clientType,
			extension: this._extension.getInitData()
		};
	}
}