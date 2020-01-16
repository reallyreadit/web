import * as React from 'react';
import AppleIdButton from '../../../common/components/AppleIdButton';

export default (
	props: {
		onSignInWithApple: () => void
	}
) => (
	<div className="auth-service-dialog-footer_xr7co1">
		<div className="rule">or</div>
		<AppleIdButton onClick={props.onSignInWithApple} />
	</div>
)