import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import InfoBox from '../../../common/components/InfoBox';
import Link from '../../../common/components/Link';

interface Props {
	children: React.ReactNode,
	onReloadWindow: () => void
}
export default class RootErrorBoundary extends React.PureComponent<Props, { isReloading: boolean }> {
	private readonly _reload = () => {
		this.setState({ isReloading: true });
		this.props.onReloadWindow();
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isReloading: false
		};
	}
	public render() {
		return (
			<ErrorBoundary
				errorElement={
					<InfoBox
						position="absolute"
						style="warning"
					>
						<p>An error occurred and caused the app to crash.</p>
						<p>If this keeps happening please <a href="mailto:support@readup.com?subject=App%20Crash">let us know.</a></p>
						<p>
							<Link
								iconLeft="refresh2"
								onClick={this._reload}
								state={this.state.isReloading ? 'busy' : 'normal'}
								text={this.state.isReloading ? 'Reloading' : 'Reload App'}
							/>
						</p>
					</InfoBox>
				}
			>
				{this.props.children}
			</ErrorBoundary>
		);
	}
}