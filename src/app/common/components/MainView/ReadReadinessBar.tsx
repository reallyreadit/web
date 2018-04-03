import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import Environment from '../../Environment';

export default class extends React.PureComponent<{}, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
	public componentDidMount() {
		this.context.extension.addListener('change', this._forceUpdate);
	}
	public render() {
		return (
			this.context.environment === Environment.Browser ?
				this.context.extension.isInstalled() === false ?
					<div className="read-readiness-bar">
						<div className="content">
							{this.context.extension.isBrowserCompatible() ?
								<span>Click <a onClick={this._installExtension}>here</a> to add the Chrome extension.</span> :
								<span>You must use Chrome (on Mac or PC) to get credit for really reading.</span>}
						</div>
					</div> :
					null :
				null
		);
	}
}