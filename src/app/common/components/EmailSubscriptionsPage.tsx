import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import Fetchable from '../api/Fetchable';
import EmailSubscriptions from '../../../common/models/EmailSubscriptions';
import EmailSubscriptionsRequest from '../../../common/models/EmailSubscriptionsRequest';
import Button from '../../../common/components/Button';
import Page from './Page';
import { parseQueryString } from '../queryString';

type Props = RouteComponentProps<{}>;
const title = 'Email Subscriptions';
export default class extends React.PureComponent<
	Props,
	{
		request: Fetchable<EmailSubscriptionsRequest>,
		values: EmailSubscriptions,
		isSubmitting: boolean,
		isUpdated: boolean
	}
> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _changeCommentReplyNotification = (e: React.ChangeEvent<HTMLInputElement>) =>
		this.setState({ values: { ...this.state.values, commentReplyNotifications: e.currentTarget.checked } });
	private readonly _changeWebsiteUpdates = (e: React.ChangeEvent<HTMLInputElement>) =>
		this.setState({ values: { ...this.state.values, websiteUpdates: e.currentTarget.checked } });
	private readonly _changeSuggestedReadings = (e: React.ChangeEvent<HTMLInputElement>) =>
		this.setState({ values: { ...this.state.values, suggestedReadings: e.currentTarget.checked } });
	private readonly _submit = () => {
		this.setState({ isSubmitting: true });
		this.context.api
			.updateEmailSubscriptions(this._token, this.state.values)
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
				if (this.context.user.isSignedIn) {
					this.context.api.getUserAccount(result => this.context.user.update(result.value));
				}
			});
	};
	private _token: string;
	constructor(props: Props, context: Context) {
		super(props, context);
		const queryStringParams = parseQueryString(context.router.route.location.search);
		if (queryStringParams['token']) {
			const
				token = decodeURIComponent(queryStringParams['token']),
				request = context.api.getEmailSubscriptions(
					token,
					request => this.setState({
						request,
						values: request.value.subscriptions
					})
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
	public componentWillMount() {
		this.context.page.setTitle(title);
	}
	public render() {
		return (
			<Page className="email-subscriptions-page" title={title}>
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
			</Page>
		);
	}
}