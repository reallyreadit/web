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
import Dialog from '../../../common/components/Dialog';
// import { formatCurrency } from '../../../common/format';
// import Link from '../../../common/components/Lin';
import Icon, { IconName } from '../../../common/components/Icon';

interface Props {
	onClose: () => void;
}

// const blogPost = {
// 	slug: 'blogreadupcom_how-readup-pays-writers-when-you-read-their-articles',
// 	url: 'https://blog.readup.org/2021/06/08/how-readup-pays-writers-when-you-read-their-articles.html'
// };

const items = [
	{
		iconName: 'piggy-bank',
		status: 'Approaching minimum',
		description: 'The writer has not yet earned the minimum of 10$',
	},
	{
		iconName: 'hourglass',
		status: 'Not yet contacted',
		description: 'This writer will be contacted by us soon.',
	},
	{
		iconName: 'envelope',
		status: 'Contacted',
		description: 'Readup has contacted this writer about their earnings',
	},
	{
		iconName: 'money-pouch',
		status: 'Payed out',
		description:
			'This writer is receiving their earning in their bank account.',
	},
	{
		iconName: 'charity',
		status: 'Donated',
		// TODO: Learn why link
		description: 'We donated the money of this writer to the EFF.',
	},
];

export const EarningsStatusExplainerDialog: React.SFC<Props> = (props) => (
	<Dialog onClose={props.onClose} title="What are writer statuses?">
		<div className="earnings-status-explainer-dialog_l3pxm6">
			<ul>
				{items.map((item) => (
					<li key={item.status}>
						<Icon name={item.iconName as IconName}></Icon>
						<strong className="status-title">{item.status}</strong> -{' '}
						{item.description}
					</li>
				))}
			</ul>
		</div>
	</Dialog>
);
