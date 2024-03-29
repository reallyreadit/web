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
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (props: {
	// TODO: probably I don't want children here, but rather some data props?
	// children: React.ReactNode,
	className?: ClassValue;
	// image on the right instead of the left
	imageRight?: boolean;
	noGoogleSnippet?: boolean;
	onCreateStaticContentUrl: (path: string) => string;
	heading: string;
	paragraph: string | JSX.Element;
	imageName: string;
	imageAlt: string;
	type: 'wide' | 'contained';
}) => (
	<div
		className={classNames(
			'image-and-text_54dk3j',
			props.imageRight ? 'image-and-text_54dk3j--image-right' : '',
			`image-and-text_54dk3j--${props.type}`,
			props.className
		)}
		data-nosnippet={props.noGoogleSnippet ? '' : null}
	>
		<img
			className="image-and-text_54dk3j__image"
			src={props.onCreateStaticContentUrl(
				`/app/images/home/${props.imageName}`
			)}
			alt={props.imageAlt}
		/>
		<div className="image-and-text_54dk3j__text">
			<h2
				className={classNames(
					'image-and-text_54dk3j__heading',
					'heading-small'
				)}
			>
				{props.heading}
			</h2>
			<p>{props.paragraph}</p>
		</div>
	</div>
);
