import * as React from 'react';
import logoText from '../../../../common/svg/logoText';
import SignInForm from './AppAuthScreen/SignInForm';

export default class extends React.Component {
	public render() {
		return (
			<div className="app-auth-screen">
				<div className="logo" dangerouslySetInnerHTML={{ __html: logoText }}></div>
				<strong>Log In</strong>
				<SignInForm />
			</div>
		);
	}
}