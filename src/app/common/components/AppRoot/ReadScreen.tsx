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
import { NavReference, Screen } from '../Root';
import { SharedState } from '../Root';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes, { createArticleSlug } from '../../../../common/routing/routes';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { formatFetchable } from '../../../../common/format';
import produce from 'immer';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import LoadingOverlay from '../controls/LoadingOverlay';
import ScreenContainer from '../ScreenContainer';
import { DeviceType, isMobileDevice } from '../../../../common/DeviceType';
import Button from '../../../../common/components/Button';
import InfoBox from '../../../../common/components/InfoBox';
import ContentBox from '../../../../common/components/ContentBox';
import classNames = require('classnames');
import Icon from '../../../../common/components/Icon';

interface Props {
	article: Fetchable<UserArticle>;
	deviceType: DeviceType;
	location: RouteLocation;
	onCreateStaticContentUrl: (path: string) => string;
	onNavTo: (ref: NavReference) => void;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onReadArticle: (article: UserArticle) => void;
	user: UserAccount | null;
}
class ReadScreen extends React.PureComponent<Props> {
	private readonly _readArticle = () => {
		this.props.onReadArticle(this.props.article.value);
	};

	private readonly _navToExternal = (
		ev?: React.MouseEvent<HTMLAnchorElement>
	) => {
		ev?.preventDefault();
		this.props.onNavTo(this.props.article.value.url);
	};

	public render() {
		return this.props.article.isLoading ? (
			<ScreenContainer className="read-screen_rfbmah">
				<LoadingOverlay position="absolute" />
			</ScreenContainer>
		) : !this.props.article.value ? (
			<ScreenContainer className="read-screen_rfbmah">
				<InfoBox position="absolute" style="normal">
					<p>Article not found.</p>
				</InfoBox>
			</ScreenContainer>
		) : (
			<>
				{/* <ScreenContainer className="read-screen_rfbmah article-screen-container">
							{this.renderArticle()}
						</ScreenContainer> */}
				<ScreenContainer className="read-screen_rfbmah">
					<div className="spacer" />
					<div className="read-question">
						{/* NOTE: trialing the subscription here means that the reader is out of free views,
									because they should only be landing on this screen within the app if they're out of free views
								*/}
						How would you like to read the article?
					</div>
					<div className="spacer" />
					<div
						className={classNames('choice-container', {
							mobile: isMobileDevice(this.props.deviceType),
						})}
					>
						<ContentBox className="choice--readup choice">
							<>
								<img
									className="choice__image"
									src={this.props.onCreateStaticContentUrl(
										`/app/images/read-screen/` +
											(isMobileDevice(this.props.deviceType)
												? `clean-mobile.svg`
												: `clean-desktop.svg`)
									)}
								/>
								<div className="choice__details">
									<div>
										{/* <p className="info">Join {this.props.article.value.firstPoster} and {this.props.article.value.readCount - 1} other readers.  */}
										<>
											<h2>
												Read it on Readup,
												<br /> the app for reading.
											</h2>
											<ul className="info dashed">
												<li>Better reading</li>
												<li>100% ad-free</li>
											</ul>
										</>
									</div>
									<Button
										intent="loud"
										onClick={this._readArticle}
										size="large"
										align="center"
										text="Read Article"
									/>
								</div>
							</>
						</ContentBox>
						<div className="divider">or</div>
						<div className="choice--direct choice">
							<img
								className="choice__image"
								src={this.props.onCreateStaticContentUrl(
									`/app/images/read-screen/` +
										(isMobileDevice(this.props.deviceType)
											? `distraction-mobile.svg`
											: `distraction-desktop.svg`)
								)}
							/>
							<div className="choice__details">
								<p className="info">
									Read{' '}
									<a
										href={this.props.article.value.url}
										onClick={this._navToExternal}
									>
										on the web
									</a>
									<Icon name='arrow-ne' className="outlink"></Icon>
								</p>
							</div>
						</div>
					</div>
				</ScreenContainer>
			</>
		);
	}
}
export default function createReadScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'article' | 'location' | 'user'>> & {
		onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>;
		onSetScreenState: (
			id: number,
			getNextState: (
				currentState: Readonly<Screen<Fetchable<UserArticle>>>
			) => Partial<Screen<Fetchable<UserArticle>>>
		) => void;
	}
) {
	return {
		create: (id: number, location: RouteLocation) => {
			const article = deps.onGetArticle(
				{
					slug: createArticleSlug(
						findRouteByLocation(
							routes,
							location,
							unroutableQueryStringKeys
						).getPathParams(location.path)
					),
				},
				(article) => {
					deps.onSetScreenState(
						id,
						produce((currentState: Screen<Fetchable<UserArticle>>) => {
							currentState.componentState = article;
							if (article.value) {
								currentState.title = article.value.title;
							} else {
								currentState.title = 'Article not found';
							}
						})
					);
				}
			);
			return {
				id,
				componentState: article,
				key,
				location,
				title: formatFetchable(
					article,
					(article) => article.title,
					'Loading...',
					'Article not found.'
				),
			};
		},
		render: (
			screenState: Screen<Fetchable<UserArticle>>,
			sharedState: SharedState
		) => {
			return (
				<ReadScreen
					{...{
						...deps,
						article: screenState.componentState,
						location: screenState.location,
						user: sharedState.user,
					}}
				/>
			);
		},
	};
}
