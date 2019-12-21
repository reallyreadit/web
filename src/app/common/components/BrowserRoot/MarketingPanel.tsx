import * as React from 'react';
import { variants } from '../../marketingTesting';
import Button from '../../../../common/components/Button';
import Panel from './Panel';
import AppleDownloadButton from './AppleDownloadButton';

export default (
	props: {
		isIosDevice: boolean | null,
		onCopyAppReferrerTextToClipboard: () => void,
		onOpenCreateAccountDialog: () => void,
		variant: number
	}
) => {
	let button: React.ReactNode;
	if (props.isIosDevice) {
		button = (
			<AppleDownloadButton
				onCopyAppReferrerTextToClipboard={props.onCopyAppReferrerTextToClipboard}
			/>
		);
	} else if (props.isIosDevice === false) {
		button = (
			<Button
				size="x-large"
				intent="loud"
				text="Get Started"
				onClick={props.onOpenCreateAccountDialog}
			/>
		);
	}
	return (
		<Panel className="marketing-panel_2bp7iu">
			<h1>{variants[props.variant].headline}</h1>
			<p>
				{variants[props.variant].description}
			</p>
			<div className="buttons">
				{button}
			</div>
		</Panel>
	);
}