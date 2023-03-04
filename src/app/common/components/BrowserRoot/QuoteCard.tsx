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
import Card from './Card';
import { Quote } from './MarketingScreen';
import { NavReference } from '../Root';
import Link from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';

export default (props: {
	quote: Quote;
	onNavTo: (ref: NavReference) => void;
}) => (
	<Card className="quote-card_xa1vt">
		<Link
			className="quote-card_xa1vt__quote"
			screen={ScreenKey.Comments}
			params={{
				sourceSlug: props.quote.sourceSlug,
				articleSlug: props.quote.articleSlug,
				commentId: props.quote.commentId,
			}}
			onClick={props.onNavTo}
		>
			<div
				className="quote-card_xa1vt__inner"
				style={{
					fontSize: `${
						1 + ((150 - props.quote.quote.length - 29) / (150 - 29)) * 0.4
					}em`,
				}}
			>
				{props.quote.quote}
				<div className="quote-card_xa1vt__reader">
					—{' '}
					<span className="quote-card_xa1vt__reader__name">
						{props.quote.reader}
					</span>
				</div>
			</div>
		</Link>
	</Card>
);
