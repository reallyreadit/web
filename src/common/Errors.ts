// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export enum AppStoreErrorType {
	PaymentsDisallowed = 'https://docs.readup.org/errors/app-store/payments-disallowed',
	ProductNotFound = 'https://docs.readup.org/errors/app-store/product-not-found',
	PurchaseCancelled = 'https://docs.readup.org/errors/app-store/purchase-cancelled',
	ReceiptNotFound = 'https://docs.readup.org/errors/app-store/receipt-not-found',
	ReceiptRequestFailed = 'https://docs.readup.org/errors/app-store/receipt-request-failed',
}
export enum BrowserExtensionAppErrorType {
	MessageParsingFailed = 'https://docs.readup.org/errors/browser-extension-app/message-parsing-failed',
	ReadupProtocolFailed = 'https://docs.readup.org/errors/browser-extension-app/readup-protocol-failed',
	UnexpectedMessageType = 'https://docs.readup.org/errors/browser-extension-app/unexpected-message-type',
}
export enum SubscriptionsErrorType {
	FreeTrialCreditLimitExceeded = 'https://docs.readup.org/errors/subscriptions/free-trial-credit-limit-exceeded',
	ReceiptValidationFailed = 'https://docs.readup.org/errors/subscriptions/receipt-validation-failed',
}
