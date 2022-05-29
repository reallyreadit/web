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
import FormDialog from '../../../../common/components/FormDialog';
import { DeviceType } from '../../../../common/DeviceType';
import ExtensionButtonImage from './ExtensionButtonImage';

export default (
	props: {
		deviceType: DeviceType,
		onCreateStaticContentUrl: (path: string) => string,
		onSubmit: () => Promise<void>
	}
) => (
	<FormDialog
		className="extension-reminder-dialog_i546dx"
		onSubmit={props.onSubmit}
		size="small"
		submitButtonText="Got it"
		textAlign="center"
		title="Don't Forget"
	>
		<p>Click the Readup button to turn on Reader-mode. Otherwise you won't get credit.</p>
		<ExtensionButtonImage
			deviceType={props.deviceType}
			onCreateStaticContentUrl={props.onCreateStaticContentUrl}
		/>
	</FormDialog>
);