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

export type MarketingVariant = {
	headline: React.ReactNode;
	subtext: React.ReactNode;
};

export const variants: {
	[key: number]: MarketingVariant;
} = {
	0: {
		headline: "Readup is the world's best reading app.",
		subtext: 'Great articles, no ads. Get started for free.',
	},
	1: {
		headline: 'We are a community of readers. Join us!',
		subtext:
			'Readup is a social reading platform. No ads. No distractions. No liking or upvotes. We help you pay attention to what matters: reading.',
	},
};
