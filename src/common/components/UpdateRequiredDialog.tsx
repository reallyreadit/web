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
import FormDialog from './FormDialog';

export default (props: {
	message?: string;
	onClose: () => void;
	updateType: 'app' | 'ios';
	versionRequired: string;
}) => (
	<FormDialog
		className="update-required-dialog_v6ptk5"
		closeButtonText="Dismiss"
		onClose={props.onClose}
		size="small"
		textAlign="center"
		title={
			props.updateType === 'app' ? 'App Update Required' : 'iOS Update Required'
		}
	>
		{props.updateType === 'app' ? (
			<p>
				Readup must be updated in the App Store to version{' '}
				{props.versionRequired} or greater to use this feature.
			</p>
		) : (
			<p>
				iOS {props.versionRequired} or greater is required to use this feature.
			</p>
		)}
		{props.message ? <p>{props.message}</p> : null}
	</FormDialog>
);
