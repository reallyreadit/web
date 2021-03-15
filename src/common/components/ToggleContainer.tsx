import * as React from 'react';
import * as classNames from 'classnames';

type Props = (
		{
			isHidden: boolean
		} | {
			isVisible: boolean
		}
	) & {
		unmount: boolean
	};
export default class ToggleContainer extends React.PureComponent<Props> {
	public render() {
		let isEnabled: boolean;
		if ('isHidden' in this.props) {
			isEnabled = !this.props.isHidden;
		} else {
			isEnabled = this.props.isVisible;
		}
		return (
			<div
				className={
					classNames(
						'toggle-container_3u7fd7',
						{
							'hidden': !this.props.unmount && !isEnabled
						}
					)
				}
			>
				{!this.props.unmount || isEnabled ?
					this.props.children :
					null}
			</div>
		);
	}
}