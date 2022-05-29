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
import Icon from '../../../../../common/components/Icon';
import Button from '../../../../../common/components/Button';
import Link from '../../../../../common/components/Link';

interface Props {
	onShare: (event: React.MouseEvent<HTMLElement>) => void,
	onSkip: () => void
}
export default class ShareStep extends React.PureComponent<Props> {
	public render() {
		return (
			<div className="share-step_okemw2">
				<h1>Spread the word.</h1>
				<h2>Help us grow. Tell others why you're excited about Readup.</h2>
				<Icon name="megaphone" />
				<Button
					intent="loud"
					onClick={this.props.onShare}
					size="large"
					text="Share"
				/>
				<Link
					onClick={this.props.onSkip}
					text="Maybe Later"
				/>
			</div>
		);
	}
}