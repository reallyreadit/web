// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import UserArticle from '../UserArticle';

export interface AuthorsEarningsReportRequest {
	minAmountEarned: number,
	maxAmountEarned: number
}
export interface AuthorEarningsReport {
	authorName: string,
	authorSlug: string,
	userAccountName: string | null,
	donationRecipientName: string | null,
	minutesRead: number,
	amountEarned: number,
	status: AuthorEarningsReportStatus,
	topArticle: UserArticle
}
export enum AuthorEarningsReportStatus {
	ApproachingMinimum = 1,
	NotYetContacted = 2,
	Contacted = 3,
	AuthorPaidOut = 4,
	DonationPaidOut = 5
}
export interface AuthorsEarningsReportResponse {
	lineItems: AuthorEarningsReport[]
}