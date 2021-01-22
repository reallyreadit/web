import * as React from 'react';
import Button from '../../../../../common/components/Button';

interface Props {
	onContinue: () => void
}
const ContinueStep: React.SFC<Props> = (props: Props) => (
	<div className="continue-step_yedqha">
		<div className="message">You're all set.</div>
		<Button
			iconRight="chevron-right"
			onClick={props.onContinue}
			text="Continue to Article"
		/>
	</div>
);
export default ContinueStep;