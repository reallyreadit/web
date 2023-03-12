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
import * as classnames from 'classnames';
import Icon from './Icon';

interface Props {
	src: string;
	/** Always show the placeholder, even if an image is loaded.
	 * When true, this blocks the image from loading if any is provided.
	 * If this option is false, the placeholder will only show while the image is loading (default).
	 */
	alwaysShowPlaceholder?: boolean;
}

// based on https://stackoverflow.com/a/63836797/4973029
const useImageLoaded = (): [
	React.MutableRefObject<HTMLImageElement>,
	boolean,
	React.Dispatch<React.SetStateAction<boolean>>
] => {
	const [loaded, setLoaded] = React.useState(false);
	const ref = React.useRef<HTMLImageElement>();

	// check if the image is already loaded after the first render (in that case, onLoad will not fire)
	React.useEffect(() => {
		if (ref.current && ref.current.complete) {
			setLoaded(true);
		}
	}, []);

	return [ref, loaded, setLoaded];
};

const ImageComponent = ({ src, alwaysShowPlaceholder }: Props) => {
	// function component to prevent full ArticleDetails rerenders when the image loads
	const [ref, loaded, setLoaded] = useImageLoaded();

	return (
		<div className="image_1ctn9c">
			<div className="positioner">
				{/* A temporary placeholder / "skeleton" that shows until the image is loaded */}
				<div
					className={classnames('image', 'placeholder', {
						'always-show-placeholder': !!alwaysShowPlaceholder,
						loading: !alwaysShowPlaceholder && !loaded,
					})}
					style={{
						display: !!alwaysShowPlaceholder || !loaded ? 'flex' : 'none',
					}}
				>
					<Icon name="trophy" />
				</div>
				{!alwaysShowPlaceholder && (
					<img
						ref={ref}
						style={{ display: loaded ? 'block' : 'none' }}
						className="image"
						onLoad={() => setLoaded(true)}
						src={src}
						// 6mb file for testing
						// src="https://upload.wikimedia.org/wikipedia/commons/2/28/Dirt_jump_IMG_7609.jpg"
					/>
				)}
			</div>
		</div>
	);
};

export default ImageComponent;
