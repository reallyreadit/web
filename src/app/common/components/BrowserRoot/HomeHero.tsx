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
import { ClassValue } from 'classnames/types';
import HomePanel from './HomePanel';
import DownloadButton from './DownloadButton';
import classNames = require('classnames');

export default (props: {
	// children: React.ReactNode,
	className?: ClassValue;
	noGoogleSnippet?: boolean;
	title: string | React.ReactElement;
	description?: string | React.ReactElement;
	actionButton?: React.ReactElement<DownloadButton>;
}) => (
	<HomePanel className={classNames('home-hero_527aw5', props.className)}>
		<h1 className="heading-regular">{props.title}</h1>
		{props.description && <p className="">{props.description}</p>}
		{props.actionButton || null}
	</HomePanel>
);
