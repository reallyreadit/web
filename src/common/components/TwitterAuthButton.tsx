import * as React from 'react';
import AsyncTracker from '../AsyncTracker';
import SpinnerIcon from './SpinnerIcon';

interface Props {
	onClick: () => Promise<{}>
}
interface State {
	isSubmitting: boolean
}
export default class TwitterAuthButton extends React.PureComponent<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _submit = () => {
		this.setState(
			prevState => {
				if (prevState.isSubmitting) {
					return null;
				}
				this._asyncTracker.addPromise(
					this.props
						.onClick()
						.then(this._stopSubmitting)
						.catch(this._stopSubmitting)
				);
				return {
					isSubmitting: true
				};
			}
		);
	};
	private readonly _stopSubmitting = () => {
		this.setState({
			isSubmitting: false
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isSubmitting: false
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div
				className="twitter-auth-button_h10z4a"
				onClick={this._submit}
			>
				{this.state.isSubmitting ?
					<SpinnerIcon /> :
					<>
						<img alt="Twitter Logo" src="/images/Twitter_Logo_White.svg" /> Sign in with Twitter
					</>}
			</div>
		);
	}
}