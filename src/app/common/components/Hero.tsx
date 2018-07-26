import * as React from 'react';
import Icon from '../../../common/components/Icon';
import SpeechBubble from '../../../common/components/Logo/SpeechBubble';
import ReadCountIndicator from '../../../common/components/ReadCountIndicator';
import Button from '../../../common/components/Button';

const arrowRightSvg = `<svg
	xmlns: dc="http://purl.org/dc/elements/1.1/"
	xmlns: cc="http://creativecommons.org/ns#"
	xmlns: rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns: svg="http://www.w3.org/2000/svg"
	xmlns="http://www.w3.org/2000/svg"
	version="1.1"
	viewBox="0 0 19.84375 13.229167"
	height="50"
	width="75">
	<g
		transform="translate(0,-283.77081)"
		id="layer1">
		<g
			transform="matrix(1.0020399,0,0,0.93813428,-56.737638,210.33129)"
			id="g5261">
			<path
				style="fill:gray;stroke-width:0.26458332"
				d="m 57.431042,92.172448 c 0.860161,-1.598612 1.564482,-3.083718 2.811198,-4.445264 1.232959,-1.346464 2.6543,-2.505339 4.216665,-3.449108 1.4986,-0.905669 3.106737,-1.623748 4.788429,-2.113227 0.802746,-0.233627 1.620044,-0.4191 2.446602,-0.546629 0.77126,-0.118798 1.465263,0.02646 1.974056,-0.608807 0.140229,-0.174889 0.178859,-0.424391 0,-0.59637 -1.0287,-0.988219 -3.808412,0.03572 -5.010414,0.399256 -1.862138,0.563033 -3.647281,1.387475 -5.273675,2.454804 -1.621896,1.064154 -3.107796,2.348442 -4.362186,3.829844 -1.146968,1.354666 -2.423583,3.004872 -2.399241,4.856426 0.0053,0.417778 0.599546,0.607748 0.808566,0.219075 z"
				id="path158" />
			<g
				transform="matrix(0.26458333,0,0,0.26458333,2.436604,5.7539743)"
				id="g164">
				<path
					style="fill:gray"
					d="m 250.688,276.15 c 8.753,1.633 17.23,3.654 25.159,7.852 0,-1.446 0,-2.893 0,-4.338 -6.967,3.342 -13.659,8.575 -19.977,13.027 -3.152,2.221 -6.599,5.46 -3.998,9.456 0.697,1.071 2.037,0.973 2.752,0 2.909,-3.956 7.71,-6.562 11.665,-9.332 4.223,-2.957 8.839,-5.674 12.602,-9.206 1.512,-1.419 0.539,-3.53 -1.108,-4.199 -8.586,-3.483 -17.523,-5.787 -26.833,-5.193 -1.04,0.066 -1.418,1.718 -0.262,1.933 z"
					id="path162" />
			</g>
		</g>
	</g>
</svg>`

export default (props: {
	onDismiss?: () => void
}) => (
	<div className="hero">
		{props.onDismiss ?
			<div className="title-bar">
				<Icon name="cancel" onClick={props.onDismiss} />
			</div> :
			null}
		<strong className="title-text">reallyread.it is a social media platform powered by reading.</strong>
		<ol>
			<li>
				<div className="illustration">
					<div className="annotation">
						<span>Your reading progress</span>
						<div className="arrow" dangerouslySetInnerHTML={{ __html: arrowRightSvg }}></div>
					</div>
					<SpeechBubble percentComplete={42} renderLabel uuid="hero-speech-bubble" />
				</div>
				<div className="text">
					<strong>Track yourself.</strong>
					<span>Spend less time scrolling and more time reading.</span>
				</div>
			</li>
			<li>
				<div className="illustration">
					<ol>
						<li>
							<Icon name="checkmark" />
							<ReadCountIndicator readCount={26} />
						</li>
						<li>
							<Icon name="cancel" />
							<div className="group">
								<Icon name="sort" />
								<Icon name="thumbs-o-up" />
								<Icon name="heart" />
								<Icon name="retweet" />
							</div>
						</li>
					</ol>
				</div>
				<div className="text">
					<strong>Smarter curation.</strong>
					<span>We rank articles based on what people really read.</span>
				</div>
			</li>
			<li>
				<div className="illustration">
					<Button
						text="Post Comment"
						style="preferred"
						iconLeft="locked"
						state="disabled"
					/>
				</div>
				<div className="text">
					<strong>Better conversations.</strong>
					<span>Only users who really read an article are allowed to comment.</span>
				</div>
			</li>
		</ol>
	</div>
);