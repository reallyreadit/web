import * as React from 'react';
import { FetchFunction } from '../../serverApi/ServerApi';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import { formatCountable } from '../../../../common/format';

interface Props {
	onGetUserCount: FetchFunction<{ userCount: number }>
}
export default class CountdownBanner extends React.Component<
	Props,
	{
		userCount: Fetchable<{ userCount: number }>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	constructor(props: Props) {
		super(props);
		this.state = {
			userCount: props.onGetUserCount(
				this._asyncTracker.addCallback(
					userCount => {
						this.setState({ userCount });
					}
				)
			)
		};
	}
	public render() {
		if (this.state.userCount.value) {
			const remaining = 10000 - this.state.userCount.value.userCount;
			return (
				<div className="countdown-banner_yodmpa">
					<span>Heads up: We're making Readup free <em>for life</em> to the first 10k users.</span>
					<span>{remaining.toLocaleString()} {formatCountable(remaining, 'spot')} remaining!</span>
				</div>
			);
		}
		return null;
	}
}