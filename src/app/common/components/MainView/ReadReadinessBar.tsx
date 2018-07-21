import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import ClientType from '../../ClientType';
import EnvironmentType from '../../EnvironmentType';

export default class extends React.PureComponent<{}, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
	public componentDidMount() {
		this.context.environment.extension.addListener('change', this._forceUpdate);
		this.context.user.addListener('authChange', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.environment.extension.removeListener('change', this._forceUpdate);
		this.context.user.removeListener('authChange', this._forceUpdate);
	}
	public render() {
		return (
			(
				this.context.environment.type === EnvironmentType.Client &&
				this.context.environment.clientType === ClientType.Browser
			) ?
				this.context.environment.extension.isInstalled() === false &&
				this.context.user.isSignedIn ?
					<div className="read-readiness-bar">
						<div className="content">
							{this.context.environment.extension.isBrowserCompatible() ?
								<span>Click <a onClick={this._installExtension}>here</a> to add the Chrome extension.</span> :
								<span>You must use Chrome (on Mac or PC) to track your reading.</span>}
						</div>
					</div> :
					null :
				null
		);
	}
}