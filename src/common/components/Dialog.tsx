import * as React from 'react';
import Icon from './Icon';

interface Props {
	onClose?: () => void,
	title: string
}
export default class Dialog extends React.Component<Props> {
	public render() {
		return (
			<div className="dialog_1wfm87">
				<div className="titlebar">
					<div className="icon-right">
						{this.props.onClose ?
							<Icon
								display="block"
								name="cancel"
								onClick={this.props.onClose}
							/> :
							null}
					</div>
				</div>
				<div className="content">
					<h1>{this.props.title}</h1>
					<div>
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}