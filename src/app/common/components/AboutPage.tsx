import * as React from 'react';
import Hero from './Hero';

export default () => (
	<div className="about-page">
		<Hero />
		<div className="copy">
			<strong className="heading">We're on a mission to get people reading on the internet.</strong>
			<p>Reading makes you smarter. It's exercise for your brain. Just like running or lifting weights, the more you do it the better you get. And if you want to stay informed about what's going on in the world, reading - really reading - isn't optional.</p>
			<p>Reading is the backbone of our community. Together we're improving our online reading habits and we're talking about the top stories of the day. Conversations on reallyread.it are better than anywhere else because we don't allow people to comment on things they haven't really read.</p>
			<p>
				<img src="/images/bill-and-jeff.jpg" />
				<strong>About Us</strong>
				We're Bill and Jeff, co-founders of reallyread.it. We were born and raised on the Jersey Shore and we've been friends since preschool. Bill (CEO) was an English major at Stanford and worked at several tech startups. Jeff (CTO) is a self-taught full stack developer. We love pizza, reading, and technology, in that order.
					</p>
		</div>
	</div>
);