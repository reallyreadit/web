import * as React from 'react';

export default (
	props: {
		onClick: () => void
	}
) => (
	<div className="apple-id-button_mrmms4">
		<div role="button" tabIndex={0} aria-label="Sign in with Apple" onClick={props.onClick}>
			<div>
				<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
					<g>
						<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="50%" y="25%" viewBox="0 -11 111.046875 14" fill="#fff">
							<text fontSize="12px" textLength="111.046875" fontFamily="SF Pro Text" direction="ltr"> Sign in with Apple</text>
						</svg>
					</g>
				</svg>
			</div>
			<div>
				<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
					<rect width="100%" height="100%" ry="15%" fill="#000" stroke="black" strokeWidth="1" strokeLinecap="round"></rect>
				</svg>
			</div>
		</div>
	</div>
);