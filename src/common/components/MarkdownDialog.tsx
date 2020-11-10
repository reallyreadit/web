import * as React from 'react';
import Dialog from './Dialog';

export default (
	props: {
		onClose: () => void
	}
) => (
	<Dialog
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
					<td>[link](http://link.com)</td>
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
	</Dialog>
);