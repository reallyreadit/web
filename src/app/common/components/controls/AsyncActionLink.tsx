import * as React from 'react';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import ActionLink from '../../../../common/components/ActionLink';
import { IconName } from '../../../../common/components/Icon';

interface Props {
	icon?: IconName,
	onClick: () => Promise<void>,
	text: string
}
export default class extends React.PureComponent<
	Props,
	{ isBusy: boolean }
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _resend = () => {
		this.setState({
			isBusy: true
		});
		this._asyncTracker
			.addPromise(
				this.props.onClick()
			)
			.then(
				() => {
					this.setState({
						isBusy: false
					});
				}
			)
			.catch(
				reason => {
					if ((reason as CancellationToken)?.isCancelled) {
						return;
					}
					this.setState({
						isBusy: false
					});
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = { isBusy: false };
	}
	public render() {
		return (
			<ActionLink
				text={this.props.text}
				iconLeft={this.props.icon}
				state={this.state.isBusy ? 'busy' : 'normal'}
				onClick={this._resend}
			/>
		);
	}
}