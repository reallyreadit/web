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
import Button from '../../../../common/components/Button';

interface Props {
	onContinue: () => void;
	onCreateStaticContentUrl: (path: string) => string;
}
export default class ImportStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="import-step_jg2xdw">
				<h1>Save articles.</h1>
				<img
					src={this.props.onCreateStaticContentUrl(
						'/app/images/import-screenshot.png'
					)}
					alt="Save Screenshot"
				/>
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