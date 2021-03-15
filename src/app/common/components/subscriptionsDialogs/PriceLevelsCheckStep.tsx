import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import { SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse } from '../../../../common/models/subscriptions/SubscriptionPriceLevels';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import { StandardSubscriptionPriceLevel } from '../../../../common/models/subscriptions/SubscriptionPrice';
import DialogSpinner from '../../../../common/components/Dialog/DialogSpinner';

interface Props {
	onGetSubscriptionPriceLevels: FetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>,
	onSubscriptionPriceLevelsLoaded: (priceLevels: StandardSubscriptionPriceLevel[]) => void,
	provider: SubscriptionProvider
}
interface State {
	priceLevels: Fetchable<SubscriptionPriceLevelsResponse>
}
export default class PriceLevelsCheckStep extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this.state = {
			priceLevels: props.onGetSubscriptionPriceLevels(
				{
					provider: props.provider
				},
				this._asyncTracker.addCallback(
					priceLevels => {
						if (priceLevels.value) {
							props.onSubscriptionPriceLevelsLoaded(priceLevels.value.prices);
						} else {
							this.setState({
								priceLevels
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
			<div className="price-levels-check-step_y7luz9">
				{this.state.priceLevels.errors ?
					<span>Error loading subscription options: {this.state.priceLevels.errors[0]}</span> :
					<DialogSpinner message="Loading subscription options." />}
			</div>
		);
	}
}