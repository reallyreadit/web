import * as React from 'react';
import AsyncTracker, { CancellationToken } from '../../../../../common/AsyncTracker';
import * as classNames from 'classnames';
import SpinnerIcon from '../../../../../common/components/SpinnerIcon';

interface Props {
	onClick: () => Promise<void>
}
interface State {
	isBusy: boolean
}

export class ConnectWithStripeButton extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _click = () => {
		this.setState(
			prevState => {
				if (prevState.isBusy) {
					return null;
				}
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
				return {
					isBusy: true
				};
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isBusy: false
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<button
				className={
					classNames(
						'connect-with-stripe-button_fn5k7h',
						{
							'busy': this.state.isBusy
						}
					)
				}
				onClick={this._click}
			>
				{this.state.isBusy ?
					<SpinnerIcon /> :
					null}
			</button>
		);
	}
}