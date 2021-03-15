import * as React from 'react';
import { SubscriptionStatusResponse } from '../../../../common/models/subscriptions/SubscriptionStatusResponse';
import { FetchFunction } from '../../serverApi/ServerApi';
import Fetchable from '../../../../common/Fetchable';
import DialogSpinner from '../../../../common/components/Dialog/DialogSpinner';
import { SubscriptionStatus } from '../../../../common/models/subscriptions/SubscriptionStatus';
import AsyncTracker from '../../../../common/AsyncTracker';

interface Props {
	onGetSubscriptionStatus: FetchFunction<SubscriptionStatusResponse>,
	onSubscriptionStatusCheckCompleted: (status: SubscriptionStatus) => void
}
interface State {
	subscriptionStatus: Fetchable<SubscriptionStatusResponse>,
}
export default class StatusCheckStep extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			subscriptionStatus: props.onGetSubscriptionStatus(
				this._asyncTracker.addCallback(
					subscriptionStatus => {
						if (subscriptionStatus.value) {
							props.onSubscriptionStatusCheckCompleted(subscriptionStatus.value.status);
						} else if (subscriptionStatus.errors) {
							this.setState({
								subscriptionStatus
							});
						}
					}
				)
			)
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="status-check-step_r8kntr">
				{this.state.subscriptionStatus.errors ?
					<span>Error checking subscription status: {this.state.subscriptionStatus.errors[0]}</span> :
					<DialogSpinner message="Checking subscription status." />}
			</div>
		);
	};
}