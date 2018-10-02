import * as React from 'react';
import logoText from '../../../../common/svg/logoText';
import SignInCard from './AppAuthScreen/SignInCard';
import Captcha from '../../Captcha';
import classNames from 'classnames';
import CreateAccountCard from './AppAuthScreen/CreateAccountCard';
import { Intent } from '../Toaster';

interface Props {
	captcha: Captcha,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>,
	onShowToast: (text: string, intent: Intent) => void,
	onSignIn: (email: string, password: string) => Promise<void>
}
enum Card { SignIn, CreateAccount }
export default class extends React.PureComponent<Props, {
	activeCard: Card
}> {
	private readonly _showCreateAccountCard = () => {
		this.setState({ activeCard: Card.CreateAccount });
	};
	private readonly _showSignInCard = () => {
		this.setState({ activeCard: Card.SignIn });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			activeCard: Card.SignIn
		};
	}
	public render() {
		return (
			<div className="app-auth-screen">
				<div className="content">
					<div className="logo" dangerouslySetInnerHTML={{ __html: logoText }}></div>
					<div className="flip-container">
						<div className={classNames('flipper', { 'flipped': this.state.activeCard === Card.CreateAccount })}>
							<div className="front">
								<SignInCard
									onShowCreateAccountCard={this._showCreateAccountCard}
									onSignIn={this.props.onSignIn}
								/>
							</div>
							<div className="back">
								<CreateAccountCard
									captcha={this.props.captcha}
									onCancel={this._showSignInCard}
									onCreateAccount={this.props.onCreateAccount}
									onShowToast={this.props.onShowToast}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}