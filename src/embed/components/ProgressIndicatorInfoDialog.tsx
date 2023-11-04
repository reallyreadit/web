import * as React from 'react';
import Dialog from '../../common/components/Dialog';

export default (
	props: {
		onClose: () => void,
		showLearnMoreLink: boolean
	}
) => (
	<Dialog
		title="Reading Progress Indicator"
		onClose={props.onClose}
	>
		<div className="progress-indicator-info-dialog_903i4">
			<p>The reading progress indicator displays the amount of time it will take to read this article and what percentage of this article you've read so far.</p>
			<p>We display this information because on Readup people are only allowed to comment on an article after reading it to completion.</p>
			{props.showLearnMoreLink ?
				<p>Learn more about how our read tracker works: <a href="https://blog.readup.org/2020/11/02/how-readup-knows-whether-or-not-youve-read-an-article.html">How Readup Knows Whether or Not You've Read an Article</a>.</p> :
				null}
		</div>
	</Dialog>
);
