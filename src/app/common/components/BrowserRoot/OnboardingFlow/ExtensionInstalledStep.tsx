import * as React from 'react';
import ExtensionButtonImage from '../ExtensionButtonImage';
import { DeviceType } from '../../../../../common/DeviceType';
import Button from '../../../../../common/components/Button';

export default (
	props: {
		deviceType: DeviceType,
		onContinue: () => void
	}
) => (
	<div className="extension-installed-step_k3sj2r">
		<h1>Great! You now have the Readup button!</h1>
		<h2>Whenever you see something you want to read, hit that button.</h2>
		<ExtensionButtonImage deviceType={props.deviceType} />
		<Button
			intent="loud"
			onClick={props.onContinue}
			size="large"
			text="Got It"
		/>
	</div>
);