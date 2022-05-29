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

export default (
	props: {
		onClose: () => void
	}
) => (
	<FormDialog
		className="markdown-dialog_1fmodc"
		closeButtonText="Ok"
		onClose={props.onClose}
		title="Formatting Guide"
	>
		<table>
			<thead>
				<tr>
					<th>Text entered as...</th>
					<th>Will display as...</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>*italics*</td>
					<td><em>italics</em></td>
				</tr>
				<tr>
					<td>**bold**</td>
					<td><strong>bold</strong></td>
				</tr>
				<tr>
					<td>[link](https://link.com)</td>
					<td><span className="link">link</span></td>
				</tr>
				<tr>
					<td>&gt; Quoted text</td>
					<td>
						<blockquote>Quoted text</blockquote>
					</td>
				</tr>
				<tr>
					<td>
						- List Item 1<br />
						- List Item 2
					</td>
					<td>
						<ul>
							<li>List Item 1</li>
							<li>List Item 2</li>
						</ul>
					</td>
				</tr>
			</tbody>
		</table>
	</FormDialog>
);