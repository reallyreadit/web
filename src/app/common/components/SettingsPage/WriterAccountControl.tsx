import * as React from 'react';
import Button from '../../../../common/components/Button';
import { Intent } from '../../../../common/components/Toaster';
import { SharedState } from '../Root';
import { TwitterVerificationDialog } from './WriterAccountControl/TwitterVerificationDialog';
import AuthorProfile from '../../../../common/models/authors/AuthorProfile';
import { formatCurrency, getPromiseErrorMessage } from '../../../../common/format';
import { EmailVerificationDialog } from './WriterAccountControl/EmailVerificationDialog';
import { AuthorEmailVerificationRequest } from '../../../../common/models/userAccounts/AuthorEmailVerificationRequest';
import { TweetWebIntentParams } from '../../../../common/sharing/twitter';
import { ConnectWithStripeButton } from './WriterAccountControl/ConnectWithStripeButton';
import ContentBox from '../../../../common/components/ContentBox';
import { PayoutAccountOnboardingLinkRequestResponse, PayoutAccountOnboardingLinkRequestResponseType, PayoutAccount } from '../../../../common/models/subscriptions/PayoutAccount';
import Icon from '../../../../common/components/Icon';
import AsyncLink from '../controls/AsyncLink';

interface Props {
	authorProfile: AuthorProfile | null,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onOpenDialog: (renderer: (sharedState: SharedState) => React.ReactNode) => void,
	onOpenTweetComposer: (params: TweetWebIntentParams) => void,
	onRequestPayoutAccountLogin: () => Promise<void>,
	onRequestPayoutAccountOnboarding: () => Promise<PayoutAccountOnboardingLinkRequestResponse>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSubmitAuthorEmailVerificationRequest: (request: AuthorEmailVerificationRequest) => Promise<void>,
	payoutAccount: PayoutAccount | null
}

export class WriterAccountControl extends React.Component<Props> {
	private readonly _openEmailVerificationDialog = () => {
		this.props.onOpenDialog(
			() => (
				<EmailVerificationDialog
					onCloseDialog={this.props.onCloseDialog}
					onShowToast={this.props.onShowToast}
					onSubmitRequest={this.props.onSubmitAuthorEmailVerificationRequest}
				/>
			)
		);
	};
	private readonly _openTwitterVerificationDialog = () => {
		this.props.onOpenDialog(
			sharedState => (
				<TwitterVerificationDialog
					onClose={this.props.onCloseDialog}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onOpenTweetComposer={this.props.onOpenTweetComposer}
					onUseEmailVerification={this._openEmailVerificationDialog}
					user={sharedState.user}
				/>
			)
		);
	};
	private readonly _requestStripeLogin = () => this.props
		.onRequestPayoutAccountLogin()
		.catch(
			reason => {
				this.props.onShowToast(
					getPromiseErrorMessage(reason),
					Intent.Danger
				);
				throw reason;
			}
		);
	private readonly _requestStripeOnboardingUrl = () => this.props
		.onRequestPayoutAccountOnboarding()
		.then(
			response => {
				if (response.type === PayoutAccountOnboardingLinkRequestResponseType.OnboardingCompleted) {
					if (response.payoutAccount?.payoutsEnabled) {
						this.props.onShowToast('Payout account enabled.', Intent.Success);
					} else {
						this.props.onShowToast('Payout account incomplete.', Intent.Neutral);
					}
				}
			}
		)
		.catch(
			reason => {
				this.props.onShowToast(
					getPromiseErrorMessage(reason),
					Intent.Danger
				);
				throw reason;
			}
		);
	public render() {
		return (
			<div className="writer-account-control_yerlvh">
				{this.props.authorProfile ?
					<ContentBox>
						<p><strong>{this.props.authorProfile.name}</strong></p>
						{this.props.payoutAccount?.payoutsEnabled ?
							<>
								<table>
									<tbody>
										<tr>
											<th>Total Earnings</th>
											<td>{formatCurrency(this.props.authorProfile.totalEarnings)}</td>
										</tr>
										<tr>
											<th>Total Payouts</th>
											<td>{formatCurrency(this.props.authorProfile.totalPayouts)}</td>
										</tr>
									</tbody>
									<tfoot>
										<tr>
											<th>Current Balance</th>
											<td>{formatCurrency(this.props.authorProfile.totalEarnings - this.props.authorProfile.totalPayouts)}</td>
										</tr>
									</tfoot>
								</table>
								<p className="account-status">
									<Icon name="checkmark" /> Payouts Enabled
								</p>
								<p>You'll receive automatic payouts on the 1st of the month if your balance is $10 or higher.</p>
								<p>
									<AsyncLink onClick={this._requestStripeLogin} text="Manage your Stripe account." />
								</p>
							</> :
							<>
								<table>
									<tbody>
										<tr>
											<th>Total Earnings</th>
											<td>{formatCurrency(this.props.authorProfile.totalEarnings)}</td>
										</tr>
									</tbody>
								</table>
								<p>Connect your bank account with Stripe to receive automatic payouts.</p>
								<ConnectWithStripeButton onClick={this._requestStripeOnboardingUrl} />
							</>}
					</ContentBox> :
					<>
						<p>Are you a writer? Get paid whenever someone reads your articles.</p>
						<Button
							intent="loud"
							onClick={this._openTwitterVerificationDialog}
							style="preferred"
							text="Get Verified"
						/>
					</>}
			</div>
		);
	}
}