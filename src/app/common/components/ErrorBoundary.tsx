import * as React from 'react';

interface Props {
	children: React.ReactNode,
	errorElement: React.ReactNode
}
export default class ErrorBoundary extends React.PureComponent<Props, { hasError: boolean }> {
	public static getDerivedStateFromError() {
		return { hasError: true };
	}
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false
		};
	}
	public render() {
		if (this.state.hasError) {
			return this.props.errorElement;
		}
		return this.props.children;
	}
}