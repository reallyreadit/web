import Environment, { InitData } from '../common/Environment';
import EnvironmentType from '../common/EnvironmentType';
import BrowserExtension from './BrowserExtension';
import BrowserApp from './BrowserApp';

export default class extends Environment<BrowserApp, BrowserExtension> {
	constructor(initData: InitData) {
		super(
			EnvironmentType.Client,
			initData.clientType,
			new BrowserApp(initData.clientType),
			new BrowserExtension(initData.extension)
		);
	}
}