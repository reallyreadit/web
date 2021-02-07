import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (
	props: {
		// TODO: probably I don't want children here, but rather some data props?
		// children: React.ReactNode,
		className?: ClassValue,
		// image on the right instead of the left
		imageRight?: boolean,
		noGoogleSnippet?: boolean
	}
) => (
	<div
		// TODO: might need to use css-id here?
		className={classNames('image-text', props.className)}
		data-nosnippet={props.noGoogleSnippet ? '' : null}
	>
		<div className={classNames("image-text__wrapper", props.imageRight ? "image-text__wrapper--image-right" : "", "content", )}>
			<img className="image-text__image" src="/images/read-anything.png" alt=""/>
			<div className="image-text__text">
				<h2 className={classNames("image-text__heading", "heading-small")}>Value point header</h2>
				<p>Ad labore esse cillum nulla voluptate nulla et quis ut reprehenderit esse nisi. Ut aliquip consectetur dolor commodo ad nisi eiusmod. Non sunt anim eu sint tempor ad nisi duis cillum sunt ad. Labore aute ea id nulla aute dolore. Enim in excepteur deserunt ad.</p>
			</div>
		</div>
	</div>
);