import * as React from 'react';
import Separator from '../../../../common/components/Separator';

export default (props: {
	onViewPrivacyPolicy: () => void
}) => (
	<footer className="footer">
		<a href="https://blog.reallyread.it">Blog</a>
		<Separator />
		<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
		<Separator />
		<span onClick={props.onViewPrivacyPolicy}>Privacy Policy</span>
		<Separator />
		<a href="mailto:support@reallyread.it">support@reallyread.it</a>
	</footer>
);