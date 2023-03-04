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
import ContentBox from '../../../../common/components/ContentBox';
import Icon, { IconName } from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { NavOptions, NavReference } from '../Root';

const SettingsLink = (props: {
	iconName: IconName;
	screenKey: ScreenKey;
	children: React.ReactNode;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
}) => {
	return (
		<ContentBox className="settings-link_knmy9p">
			<div
				className="wrapper"
				onClick={(_) => props.onNavTo({ key: props.screenKey })}
			>
				<div className="left-content">
					<Icon name={props.iconName} />
					<div className="content">{props.children}</div>
				</div>
				<Icon name='chevron-right' />
			</div>
		</ContentBox>
	);
};

export default SettingsLink;
