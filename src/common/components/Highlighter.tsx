// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import AsyncTracker from '../AsyncTracker';

interface Props {
	children: React.ReactNode;
	className?: ClassValue;
	highlight: boolean;
}
export default class Highlighter extends React.PureComponent<
	Props,
	{ fadeHighlight: boolean }
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _elementRef: React.RefObject<HTMLDivElement>;
	private _intersectionObserver: IntersectionObserver;
	constructor(props: Props) {
		super(props);
		this.state = {
			fadeHighlight: false,
		};
		if (props.highlight) {
			this._elementRef = React.createRef();
		}
	}
	public componentDidMount() {
		if (this.props.highlight) {
			this._asyncTracker.addTimeout(
				window.setTimeout(() => {
					// iOS 11 WKWebView doesn't support IntersectionObserver
					if ('IntersectionObserver' in window) {
						this._intersectionObserver = new IntersectionObserver((entries) => {
							const entry = entries[0];
							if (entry && entry.isIntersecting) {
								this.setState({ fadeHighlight: true });
								this._intersectionObserver.unobserve(entry.target);
							}
						});
						this._intersectionObserver.observe(this._elementRef.current);
					}
					const rect = this._elementRef.current.getBoundingClientRect();
					if (rect.top < 0 || rect.bottom > window.innerHeight) {
						this._elementRef.current.scrollIntoView({
							behavior: 'smooth',
							block: 'start',
						});
					}
				}, 100)
			);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
		if (this._intersectionObserver) {
			this._intersectionObserver.disconnect();
		}
	}
	public render() {
		return (
			<div
				className={classNames('highlighter_trojkf', this.props.className, {
					'fade-highlight': this.state.fadeHighlight,
					highlight: this.props.highlight,
				})}
				ref={this._elementRef}
			>
				{this.props.children}
			</div>
		);
	}
}
