import * as React from 'react';
import Fetchable from '../serverApi/Fetchable';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import EmailSubscriptionsRequest from '../../../common/models/EmailSubscriptionsRequest';
import Button from '../../../common/components/Button';
import CallbackStore from '../CallbackStore';
import { parseQueryString } from '../../../common/routing/queryString';
import { Screen } from './Root';
import Location from '../../../common/routing/Location';

interface Props {
	onGetEmailSubscriptions: (token: string, callback: (request: Fetchable<EmailSubscriptionsRequest>) => void) => Fetchable<EmailSubscriptionsRequest>,
	onUpdateEmailSubscriptions: (token: string, subscriptions: EmailSubscriptions) => Promise<void>,
	token: string | null
}
export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onGetEmailSubscriptions: (token: string, callback: (request: Fetchable<EmailSubscriptionsRequest>) => void) => Fetchable<EmailSubscriptionsRequest>,
	onGetScreenState: (key: TScreenKey) => Screen,
	onUpdateEmailSubscriptions: (token: string, subscriptions: EmailSubscriptions) => Promise<void>
}) {
	return {
		create: (location: Location) => ({ key, location }),
		render: () => (
			<EmailSubscriptionPage
				onGetEmailSubscriptions={deps.onGetEmailSubscriptions}
				onUpdateEmailSubscriptions={deps.onUpdateEmailSubscriptions}
				token={
					decodeURIComponent(
						parseQueryString(deps.onGetScreenState(key).location.queryString)['token']
					)
				}
			/>
		)
	};
}
export default class EmailSubscriptionPage extends React.PureComponent<
	Props,
	{
		request: Fetchable<EmailSubscriptionsRequest>,
		values: EmailSubscriptions,
		isSubmitting: boolean,
		isUpdated: boolean
	}
> {
	private readonly _callbacks = new CallbackStore();
	private readonly _changeCommentReplyNotification = (e: React.ChangeEvent<HTMLInputElement>) =>
		this.setState({ values: { ...this.state.values, commentReplyNotifications: e.currentTarget.checked } });
	private readonly _changeWebsiteUpdates = (e: React.ChangeEvent<HTMLInputElement>) =>
		this.setState({ values: { ...this.state.values, websiteUpdates: e.currentTarget.checked } });
	private readonly _changeSuggestedReadings = (e: React.ChangeEvent<HTMLInputElement>) =>
		this.setState({ values: { ...this.state.values, suggestedReadings: e.currentTarget.checked } });
	private readonly _submit = () => {
		this.setState({ isSubmitting: true });
		this.props
			.onUpdateEmailSubscriptions(this._token, this.state.values)
			.then(() => {
				this.setState({
					request: {
						...this.state.request,
						value: {
							...this.state.request.value,
							subscriptions: this.state.values
						}
					},
					isSubmitting: false,
					isUpdated: true
				});
			});
	};
	private _token: string;
	constructor(props: Props) {
		super(props);
		if (props.token) {
			const
				token = props.token,
				request = props.onGetEmailSubscriptions(
					token,
					this._callbacks.add(
						request => this.setState({
							request,
							values: request.value.subscriptions
						})
					)
				);
			this._token = token;
			this.state = {
				request,
				values: !request.isLoading ?
					request.value.subscriptions :
					{
						commentReplyNotifications: false,
						websiteUpdates: false,
						suggestedReadings: false
					},
				isSubmitting: false,
				isUpdated: false
			};
		} else {
			this._token = null;
			this.state = {
				request: null,
				values: null,
				isSubmitting: false,
				isUpdated: false
			};
		}
	}
	private isFormChanged() {
		return (
			this.state.request &&
			this.state.request.value &&
			(
				this.state.request.value.subscriptions.commentReplyNotifications !== this.state.values.commentReplyNotifications ||
				this.state.request.value.subscriptions.websiteUpdates !== this.state.values.websiteUpdates ||
				this.state.request.value.subscriptions.suggestedReadings !== this.state.values.suggestedReadings
			)
		);
	}
	public render() {
		return (
			<div className="email-subscriptions-page">
				{this.state.request ?
					this.state.request.isLoading ?
						<span>Loading...</span> :
						this.state.request.value.isValid ?
							<div className="form">
								<h4>Email address: {this.state.request.value.emailAddress}</h4>
								<h5>Notifications</h5>
								<h6>Send me an email when:</h6>
								<label>
									<input
										type="checkbox"
										checked={this.state.values.commentReplyNotifications}
										disabled={this.state.isSubmitting}
										onChange={this._changeCommentReplyNotification}
									/>
									<span>Someone replies to my comment</span>
								</label>
								<h5>Contact Preferences</h5>
								<h6>Feel free to occasionally email me about the following:</h6>
								<label>
									<input
										type="checkbox"
										checked={this.state.values.websiteUpdates}
										disabled={this.state.isSubmitting}
										onChange={this._changeWebsiteUpdates}
									/>
									<span>Community updates</span>
								</label>
								<label>
									<input
										type="checkbox"
										checked={this.state.values.suggestedReadings}
										disabled={this.state.isSubmitting}
										onChange={this._changeSuggestedReadings}
									/>
									<span>Suggested readings</span>
								</label>
								{this.state.isUpdated && !this.state.isSubmitting ?
									<span className="update-message">Your subscriptions have been updated. Thank you!</span> :
									null}
								<Button
									iconLeft="checkmark"
									text="Update Subscriptions"
									style="preferred"
									state={this.state.isSubmitting ?
										'busy' :
										this.isFormChanged() ?
											'normal' :
											'disabled'}
									onClick={this._submit}
								/>
							</div> :
							<strong>Invalid token</strong> :
					<strong>Invalid token</strong>}
			</div>
		);
	}
}