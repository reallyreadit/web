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
import Icon from './Icon';

interface Props {
	onClose?: () => void,
	title?: string
}
export default class Dialog extends React.Component<Props> {
	public render() {
		return (
			<div className="dialog_1wfm87">
				<div className="titlebar">
					<div className="icon-right">
						{this.props.onClose ?
							<Icon
								display="block"
								name="cancel"
								onClick={this.props.onClose}
							/> :
							null}
					</div>
				</div>
				<div className="content">
					{this.props.title ?
						<h1>{this.props.title}</h1> :
						null}
					<div>
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}