// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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