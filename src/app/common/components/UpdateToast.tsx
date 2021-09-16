import * as React from 'react';
import Link from '../../../common/components/Link';
import { IconName } from '../../../common/components/Icon';

interface Props {
	onUpdate: () => void,
	updateAction: 'download' | 'reload'
}
export default class UpdateToast extends React.PureComponent<Props, { isReloading: boolean }> {
	private readonly _update = () => {
		if (this.props.updateAction === 'reload') {
			this.setState({ isReloading: true });
		}
		this.props.onUpdate();
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isReloading: false
		};
	}
	public render() {
		let
			linkText: string,
			iconLeft: IconName | undefined,
			iconRight: IconName | undefined;
		switch (this.props.updateAction) {
			case 'download':
				linkText = 'Download App';
				iconRight = 'arrow-right';
				break;
			case 'reload':
				linkText = 'Reload App';
				iconLeft = 'refresh2';
				break;
		}
		return (
			<>
				<p>A new version of Readup is available</p>
				<p>
					<Link
						iconLeft={iconLeft}
						iconRight={iconRight}
						onClick={this._update}
						state={this.state.isReloading ? 'busy' : 'normal'}
						text={this.state.isReloading ? 'Reloading' : linkText}
					/>
				</p>
			</>
		);
	}
}