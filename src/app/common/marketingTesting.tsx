import * as React from 'react';

export type MarketingVariant = {
	headline: React.ReactNode,
	subtext: React.ReactNode
}

export const variants: {
	[key: number]: MarketingVariant
} = {
	0: {
		headline: 'Readup is the world\'s best reading app.',
		subtext: 'Great articles, no ads. Get started today.'
	},
	1: {
		headline: 'We are a community of readers. Join us!',
		subtext: 'Readup is a social reading platform. No ads. No distractions. No liking or upvotes. We help you pay attention to what matters: reading.'
	}
};