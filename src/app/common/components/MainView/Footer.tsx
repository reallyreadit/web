import * as React from 'react';
import Separator from '../../../../common/components/Separator';
import { Link } from 'react-router-dom';

export default () => (
	<footer>
		<a href="https://blog.reallyread.it">Blog</a>
		<Separator />
		<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
		<Separator />
		<Link to="/privacy">Privacy Policy</Link>
		<Separator />
		<a href="mailto:support@reallyread.it">support@reallyread.it</a>
	</footer>
);