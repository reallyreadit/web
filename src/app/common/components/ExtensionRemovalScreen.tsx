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
import ScreenContainer from './ScreenContainer';
import Button from '../../../common/components/Button';
import RouteLocation from '../../../common/routing/RouteLocation';
import { parseQueryString } from '../../../common/routing/queryString';
import { Screen } from './Root';

interface Props {
	installationId: string | null;
	onLogExtensionRemovalFeedback: (data: {
		installationId: string;
		reason: string;
	}) => Promise<void>;
}
class ExtensionRemovalScreen extends React.PureComponent<
	Props,
	{
		formSubmissionStatus: 'unsubmitted' | 'submitting' | 'submitted';
		formValue: string;
	}
> {
	private readonly _changeFormvalue = (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		this.setState({ formValue: event.target.value });
	};
	private readonly _submit = () => {
		this.setState({ formSubmissionStatus: 'submitting' });
		this.props
			.onLogExtensionRemovalFeedback({
				installationId: this.props.installationId,
				reason: this.state.formValue,
			})
			.then(() => {
				this.setState({ formSubmissionStatus: 'submitted' });
			});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			formSubmissionStatus: 'unsubmitted',
			formValue: '',
		};
	}
	public render() {
		return (
			<ScreenContainer className="extension-removal-screen_6csgkd">
				{!this.props.installationId ||
				this.state.formSubmissionStatus === 'submitted' ? (
					<strong>Thank you for your feedback.</strong>
				) : (
					<>
						<strong>We're sorry to see you go.</strong>
						<span>Please let us know why you're leaving.</span>
						<textarea
							onChange={this._changeFormvalue}
							value={this.state.formValue}
						/>
						<Button
							onClick={this._submit}
							state={
								this.state.formSubmissionStatus === 'submitting'
									? 'busy'
									: this.state.formValue.trim() !== ''
									? 'normal'
									: 'disabled'
							}
							style="preferred"
							text="Submit"
						/>
					</>
				)}
			</ScreenContainer>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'installationId'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Extension Removal Feedback',
		}),
		render: (state: Screen) => (
			<ExtensionRemovalScreen
				installationId={
					parseQueryString(state.location.queryString)['installationId']
				}
				onLogExtensionRemovalFeedback={deps.onLogExtensionRemovalFeedback}
			/>
		),
	};
}
