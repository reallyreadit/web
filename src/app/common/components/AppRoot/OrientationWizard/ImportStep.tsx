import * as React from 'react';
import Button from '../../../../../common/components/Button';

interface Props {
	onContinue: () => void
}
export default class ImportStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="import-step_jg2xdw">
				<h1>Import articles.</h1>
				<h2>If you don't see the Readup button, tap "More" first to enable it.</h2>
				<img src="/images/import-screenshot.png" alt="Import Screenshot" />
				<Button
					intent="loud"
					onClick={this.props.onContinue}
					size="large"
					text="Got It"
				/>
			</div>
		);
	}
}