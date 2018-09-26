import * as React from 'react';
import ActionLink from '../../../../common/components/ActionLink';

interface Props {
	onResend: () => Promise<void>
}
export default class extends React.PureComponent<
	Props,
	{ isSending: boolean }
> {
	private readonly _resend = () => {
		this.setState({ isSending: true });
		this.props
			.onResend()
			.then(() => {
				this.setState({ isSending: false });
			})
			.catch(() => {
				this.setState({ isSending: false });
			});
	};
	constructor(props: Props) {
		super(props);
		this.state = { isSending: false };
	}
	public render() {
		return (
			<ActionLink
				text="Resend confirmation email"
				iconLeft="refresh2"
				state={this.state.isSending ? 'busy' : 'normal'}
				onClick={this._resend}
			/>
		);
	}
}