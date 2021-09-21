import * as React from 'react';
import Button from '../../../../common/components/Button';
import Dialog from '../../../../common/components/Dialog';
import {DeviceType, getStoreUrl } from '../../../../common/DeviceType';
import {NavOptions, NavReference} from '../Root';

/* Note: this reuses the InstallExtensionStep scss from:
 * src/app/common/components/BrowserRoot/OnboardingFlow/InstallExtensionStep.scss
 */

interface Props {
	onClose: () => void,
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean
}

export const SafariExtensionDialog: React.FunctionComponent<Props> = props => (
	<Dialog
		onClose={props.onClose}
		title={"\"Save to Readup\" in Safari"}
	>
		<div className="install-extension-step_gudkmn">
				<h3>Step 1: Install the Readup macOS App (includes Safari Extension)</h3>
				<Button
					intent="loud"
					onClick={(event: React.MouseEvent) => {
						props.onNavTo(getStoreUrl(DeviceType.DesktopSafari))
					}}
					size="large"
					text="View in App Store"
				/>
				<h3>Step 2: Enable the Safari Extension</h3>
				<p>In Safari click on the "Safari" menu, select "Preferences...", select the "Extensions" tab and then check the box next to Readup.</p>
				<img
					alt="Enable Readup Extension Screenshot"
					src={props.onCreateStaticContentUrl('/app/images/safari-enable-extension-screenshot.png')}
				/>
			</div>
	</Dialog>
);