import * as React from "react";
import Icon from "../../../../common/components/Icon";

interface Props {
	showButton?: boolean,
}

const SubscribePitchElement = (props: Props) => {
	return (
		<div className="subscribe-pitch-element_5mjzry">
			<ul className="value-points">
				<li><Icon name="checkmark"/>Unlimited, ad-free reading</li>
				<li><Icon name="checkmark"/>Watch your money get pledged to the writers you read</li>
				<li><Icon name="checkmark"/>Choose your contribution level. Starting from $5/month.</li>
			</ul>
		</div>
	)
}

export default SubscribePitchElement;