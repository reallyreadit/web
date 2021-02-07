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
		heading: string,
		paragraph: string,
		imageName: string,
		imageAlt: string
	}
) => (
	<div
		// TODO: might need to use css-id here?
		className={classNames('image-and-text_54dk3j', props.imageRight ? "image-and-text_54dk3j--image-right" : "", props.className)}
		data-nosnippet={props.noGoogleSnippet ? '' : null}
	>
		<img className="image-and-text_54dk3j__image" src={`/images/${props.imageName}`} alt={props.imageAlt}/>
		<div className="image-and-text_54dk3j__text">
			<h2 className={classNames("image-and-text_54dk3j__heading", "heading-small")}>{props.heading}</h2>
			<p>{props.paragraph}</p>
		</div>
	</div>
);