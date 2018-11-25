import * as React from 'react';
import AsyncActionLink from './AsyncActionLink';

export default (props: { onResend: () => Promise<void> }) => (
	<AsyncActionLink
		icon="refresh2"
		onClick={props.onResend}
		text="Resend confirmation email"
	/>
);