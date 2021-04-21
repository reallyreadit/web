import * as React from 'react';
import Link from '../../../common/components/Link';

interface Props {
	onReloadWindow: () => void
}
export default class UpdateToast extends React.PureComponent<Props, { isReloading: boolean }> {
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
			<>
				<p>A new version of Readup is available</p>
				<p>
					<Link
						iconLeft="refresh2"
						onClick={this._reload}
						state={this.state.isReloading ? 'busy' : 'normal'}
						text={this.state.isReloading ? 'Reloading' : 'Reload App'}
					/>
				</p>
			</>
		);
	}
}