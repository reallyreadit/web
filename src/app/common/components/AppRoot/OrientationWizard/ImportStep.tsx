import * as React from 'react';
import Button from '../../../../../common/components/Button';

interface Props {
	onContinue: () => void
	onCreateStaticContentUrl: (path: string) => string
}
export default class ImportStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="import-step_jg2xdw">
				<h1>Save articles.</h1>
				<img src={this.props.onCreateStaticContentUrl('/app/images/import-screenshot.png')} alt="Save Screenshot" />
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