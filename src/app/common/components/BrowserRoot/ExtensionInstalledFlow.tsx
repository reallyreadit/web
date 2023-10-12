import * as React from 'react';
import Flow, { BaseProps } from '../../../../common/components/Flow';import ExtensionInstalledStep from './ExtensionInstalledFlow/ExtensionInstalledStep';
import ButtonTutorialStep from './ExtensionInstalledFlow/ButtonTutorialStep';
import UserAccount from '../../../../common/models/UserAccount';
import { DeviceType } from '../../../../common/DeviceType';

enum Step {
	ExtensionInstalled,
	ButtonTutorial
}

interface Props extends BaseProps {
	deviceType: DeviceType;
	onCreateStaticContentUrl: (path: string) => string;
}

export default class ExtensionInstalledFlow extends Flow<Props> {
	private readonly _goToButtonTutorialStep = () => {
		this.goToStep(Step.ButtonTutorial);
	};
	private readonly _stepMap = {
		[Step.ExtensionInstalled]: (_: UserAccount) => (
			<ExtensionInstalledStep
				deviceType={this.props.deviceType}
				onContinue={this._goToButtonTutorialStep}
				onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
			/>
		),
		[Step.ButtonTutorial]: (_: UserAccount) => (
			<ButtonTutorialStep onContinue={this._complete} />
		),
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			...this.state,
			step: Step.ExtensionInstalled
		};
	}
	protected getStepRenderer(step: Step) {
		return this._stepMap[step];
	}
}
