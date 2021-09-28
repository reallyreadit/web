import * as React from 'react';
import {State as SaveIndicatorState} from '../../common/components/SaveIndicator';
import ToggleSwitchExpandableInput from '../../common/components/ToggleSwitchExpandableInput';
import {ExtensionOptionKey, ExtensionOptions} from './ExtensionOptions';

const OptionsPage = (props: {
	options: ExtensionOptions,
	onChangeStarOnSave: (isEnabled: boolean) => void
}) => {
	return <ToggleSwitchExpandableInput
		isEnabled={props.options[ExtensionOptionKey.StarOnSave]}
		onChange={props.onChangeStarOnSave}
		saveIndicator={SaveIndicatorState.None}
		title="Auto-starring save"
		subtitle="Saving an article to Readup automatically Stars it."
	/>
}

export default OptionsPage;