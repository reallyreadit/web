import * as React from 'react';
import Context from './Context';
import contextTypes from './contextTypes';

export default class ContextComponent<P, S> extends React.Component<P, S> {
	static contextTypes = contextTypes;
	public context: Context;
	constructor(props: P, context: Context) {
		super(props);
		this.context = context;
		this.forceUpdate = this.forceUpdate.bind(this);
	}
	public forceUpdate() {
		super.forceUpdate();
	}
}