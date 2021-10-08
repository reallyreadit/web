import * as React from 'react';
import {ClassValue} from "classnames/types";
import StickyNote from '../../../../common/components/StickyNote';

const FreeTrialNotice = (
	props: {
		className?: ClassValue
	}
) => (
	<StickyNote type="straight">
		{"0 views used" ?
		<>
			<strong>Welcome to Readup!</strong>
			<span>5 free article views remaining</span>
		</>
		: "1 view used" ?
		<>
			<strong>5 free article views remaining</strong>
			<span>Tweet about Readup to get 5 more.</span>
		</>
		: "tweeted" ?
		<>
			<strong>5 free article views remaining</strong>
			<span>Tweet about Readup to get 5 more.</span>
		</>
		:
		<>
			<strong>0 free article views remaining</strong>
			<span>Subscribe to continue reading</span>
		</>
		}
	</StickyNote>
);

export default FreeTrialNotice;


