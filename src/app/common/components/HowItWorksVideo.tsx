import * as React from 'react';
import Link from '../../../common/components/Link';

export enum VideoMode {
	Embed,
	Link
}

export type Props = {
	mode: VideoMode.Embed
} | {
	mode: VideoMode.Link,
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (href: string) => void
};

const
	className = 'how-it-works-video_7wst2o',
	videoId = 'JwQOsdnywUs';

export const HowItWorksVideo: React.SFC<Props> = props => {
	switch (props.mode) {
		case VideoMode.Embed:
			return (
				<iframe
					className={className}
					width="560"
					height="315"
					src={`https://www.youtube-nocookie.com/embed/${videoId}`}
					title="YouTube video player"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				></iframe>
			);
		case VideoMode.Link:
			return (
				<Link
					className={className}
					href={`https://www.youtube.com/watch?v=${videoId}`}
					onClick={props.onNavTo}
				>
					<img
						alt="YouTube Video Thumbnail"
						src={props.onCreateStaticContentUrl('/app/images/how-it-works-video-thumbnail.png')}
					/>
				</Link>
			);
	}
};