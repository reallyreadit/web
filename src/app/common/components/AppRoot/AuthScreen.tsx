import * as React from 'react';
import SignInCard from './AuthScreen/SignInCard';
import Captcha from '../../Captcha';
import classNames from 'classnames';
import CreateAccountCard from './AuthScreen/CreateAccountCard';
import { Intent } from '../../../../common/components/Toaster';
import Button from './AuthScreen/Button';

interface Props {
	captcha: Captcha,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>,
	onOpenRequestPasswordResetDialog: () => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSignIn: (email: string, password: string) => Promise<void>
}
enum Card { SignIn, CreateAccount }
export default class extends React.PureComponent<Props, {
	activeCard: Card | null,
	isFlippingBack: boolean
}> {
	private readonly _cancel = () => {
		this.setState({ isFlippingBack: true });
	};
	private readonly _handleFlipperAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'auth-screen_gnq77a-flip-back') {
			this.setState({
				activeCard: null,
				isFlippingBack: false
			});
		}
	};
	private readonly _showCreateAccountCard = () => {
		this.setState({ activeCard: Card.CreateAccount });
	};
	private readonly _showSignInCard = () => {
		this.setState({ activeCard: Card.SignIn });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			activeCard: null,
			isFlippingBack: false
		};
	}
	public render() {
		let activeCard: React.ReactNode | null;
		switch (this.state.activeCard) {
			case Card.CreateAccount:
				activeCard = (
					<CreateAccountCard
						captcha={this.props.captcha}
						onCancel={this._cancel}
						onCreateAccount={this.props.onCreateAccount}
						onShowToast={this.props.onShowToast}
					/>
				);
				break;
			case Card.SignIn:
				activeCard = (
					<SignInCard
						onCancel={this._cancel}
						onOpenRequestPasswordResetDialog={this.props.onOpenRequestPasswordResetDialog}
						onSignIn={this.props.onSignIn}
					/>
				);
				break;
		}
		return (
			<div className="auth-screen_gnq77a">
				<div className="content">
					<div className="logo">
						<img
							alt="logo"
							src="/images/logo.svg"
						/>
						<h1>Make yourself a better reader.</h1>
					</div>
					<div className="flip-container">
						<div
							className={classNames(
								'flipper',
								this.state.isFlippingBack ?
									'backwards' :
									this.state.activeCard != null ?
										'flipped' :
										null
							)}
							onAnimationEnd={this._handleFlipperAnimationEnd}
						>
							<div className="front">
								<div className="carousel-wrapper"></div>
								<Button
									onClick={this._showCreateAccountCard}
									style="loud"
									text="Sign Up"
								/>
								<Button
									onClick={this._showSignInCard}
									text="Login"
								/>
							</div>
							<div className="back">
								{activeCard}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}