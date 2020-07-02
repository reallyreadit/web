import * as React from 'react';

export const variants: {
	[key: number]: {
		headline: React.ReactNode,
		subtext: React.ReactNode
	}
} = {
	9: {
		headline: 'Deep reading is screen time well spent.',
		subtext: (
			<>
				Readup offers distraction-free reading and noise-cancelled comments, built <em>by</em> and <em>for</em> readers. The future is focus. The future is slow. Join us.
			</>
		)
	},
	10: {
		headline: 'Stop feeding. Start reading.',
		subtext: 'Readup helps you spend more of your time and attention on deep, focused reading. We are a community of readers, writers and free-thinkers. Join us today!'
	},
	11: {
		headline: 'We are a community of readers. Join us!',
		subtext: 'Readup is a social reading platform. No ads. No distractions. No liking or upvotes. We help you pay attention to what matters: reading.'
	}
};