import * as React from 'react';
import * as classNames from 'classnames';
import Icon from '../../../../../common/components/Icon';
import { ClassValue } from 'classnames/types';

interface Props {
	className: ClassValue,
	contentHeight: number,
	contentRef: React.RefObject<HTMLDivElement>,
	hideSubtitleWhenOpen?: boolean,
	onSetContentHeight: (height: number) => void,
	subtitle: string,
	title: string
}
export function measureAutoHeight(contentRef: React.RefObject<HTMLDivElement>) {
	const clone = contentRef.current.cloneNode(true) as HTMLDivElement;
	clone.classList.add('measuring');
	clone.style.height = '';
	contentRef.current.insertAdjacentElement('beforebegin', clone);
	const height = clone.offsetHeight;
	clone.remove();
	return height;
}
export default class Filter extends React.Component<Props> {
	private readonly _toggle = () => {
		let nextContentHeight: number;
		if (this.props.contentHeight === 0) {
			nextContentHeight = measureAutoHeight(this.props.contentRef);
		} else {
			nextContentHeight = 0;
		}
		this.props.onSetContentHeight(nextContentHeight);
	};
	public render() {
		const isOpen = this.props.contentHeight > 0;
		return (
			<div className={classNames('filter_45a9os', this.props.className)}>
				<div
					className="header"
					onClick={this._toggle}
				>
					<div className="title">
						<div className="text">
							{this.props.title}
						</div>
						<Icon
							name={
								isOpen ?
									'chevron-up' :
									'chevron-down'
							}
						/>
					</div>	
					<div
						className={
							classNames(
								'subtitle',
								{
									'hidden': this.props.hideSubtitleWhenOpen ?
										isOpen :
										!isOpen && !this.props.subtitle
								}
							)
						}
					>
						{!this.props.hideSubtitleWhenOpen && isOpen && !this.props.subtitle ?
							<>&nbsp;</> :
							this.props.subtitle}
					</div>
				</div>
				<div
					className="content"
					ref={this.props.contentRef}
					style={{
						height: this.props.contentHeight > 0 ?
							this.props.contentHeight + 'px' :
							null
					}}
				>
					{this.props.children}
				</div>
			</div>
		);
	}
}