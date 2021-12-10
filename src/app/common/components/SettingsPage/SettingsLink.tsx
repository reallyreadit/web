
import * as React from "react";
import ContentBox from "../../../../common/components/ContentBox";
import Icon, {IconName} from "../../../../common/components/Icon";
import ScreenKey from "../../../../common/routing/ScreenKey";
import {NavOptions, NavReference} from "../Root";

const SettingsLink =  (props: {
	iconName: IconName,
	screenKey: ScreenKey,
	children: React.ReactNode
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
}) => {
return (<ContentBox className="settings-link_knmy9p">
		<div className="wrapper" onClick={(_) => props.onNavTo({key: props.screenKey})}>
			<div className="left-content">
				<Icon name={props.iconName} />
				<div className="content">{props.children}</div>
			</div>
			<Icon name='chevron-right' />
		</div>
	</ContentBox>);
}

export default SettingsLink;