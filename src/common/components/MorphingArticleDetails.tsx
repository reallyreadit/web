import * as classNames from "classnames";
import * as React from "react";
import ArticleDetails from "./ArticleDetails";
import ArticleDetailsDisplay, {ArticleDetailsDisplayProps} from "./ArticleDetailsDisplay";

export default (props: ArticleDetailsDisplayProps) => (
	<div className="morphing-article-details_izt93z">
		<ArticleDetailsDisplay
			{...{
				...props,
				className: classNames(props.className, "morphing-article-details_izt93z--desktop-display")
			}}
		/>
		<ArticleDetails
			{...{
				...props,
				className: classNames(props.className, "morphing-article-details_izt93z--mobile-standard")
			}}
		/>
	</div>
 )