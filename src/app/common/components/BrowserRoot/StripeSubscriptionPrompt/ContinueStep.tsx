import * as React from 'react';
import Button from '../../../../../common/components/Button';

interface Props {
	isReadingArticle: boolean,
	onContinue: () => void
}
const ContinueStep: React.SFC<Props> = (props: Props) => (
	<div className="continue-step_yedqha">
		<div className="message">You're all set.</div>
		{props.isReadingArticle ?
			<Button
				iconRight="chevron-right"
				onClick={props.onContinue}
				text="Continue to Article"
			/> :
			<Button
				onClick={props.onContinue}
				text="Ok"
			/>}
	</div>
);
export default ContinueStep;