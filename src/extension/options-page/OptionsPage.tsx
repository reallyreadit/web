// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import { State as SaveIndicatorState } from '../../common/components/SaveIndicator';
import ToggleSwitchExpandableInput from '../../common/components/ToggleSwitchExpandableInput';
import { ExtensionOptionKey, ExtensionOptions } from './ExtensionOptions';

const logoLightSrc = chrome.runtime.getURL(
	'/content-scripts/ui/images/logo.svg'
);

const OptionsPage = (props: {
	options: ExtensionOptions;
	onChangeStarOnSave: (isEnabled: boolean) => Promise<boolean>;
}) => {
	const [isStarOnSaveSaving, setStarOnSaveSaving] = React.useState(
		SaveIndicatorState.None
	);

	return (
		<div className="options-page_rzop97">
			<div className="heading">
				<img
					src={logoLightSrc}
					height="10"
					alt="Readup logo"
					className="logo-light"
				/>
				<h1>Options - Save to Readup</h1>
			</div>
			<ToggleSwitchExpandableInput
				isEnabled={props.options[ExtensionOptionKey.StarOnSave]}
				onChange={(next) => {
					setStarOnSaveSaving(SaveIndicatorState.Saving);
					props.onChangeStarOnSave(next).then(() => {
						setStarOnSaveSaving(SaveIndicatorState.Saved);
					});
				}}
				saveIndicator={isStarOnSaveSaving}
				title="Auto-starring save"
				subtitle="Saving an article to Readup automatically Stars it."
			/>
		</div>
	);
};

export default OptionsPage;
