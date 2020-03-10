declare namespace chrome.cookies {
    /** A cookie's 'SameSite' state (https://tools.ietf.org/html/draft-west-first-party-cookies). 'no_restriction' corresponds to a cookie set with 'SameSite=None', 'lax' to 'SameSite=Lax', and 'strict' to 'SameSite=Strict'. 'unspecified' corresponds to a cookie set without the SameSite attribute. **/
    export type SameSiteStatus = 'unspecified' | 'no_restriction' | 'lax' | 'strict';

    /** Represents information about an HTTP cookie. */
    export interface Cookie {
        /** The domain of the cookie (e.g. "www.google.com", "example.com"). */
        domain: string;
        /** The name of the cookie. */
        name: string;
        /** The ID of the cookie store containing this cookie, as provided in getAllCookieStores(). */
        storeId: string;
        /** The value of the cookie. */
        value: string;
        /** True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date. */
        session: boolean;
        /** True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie). */
        hostOnly: boolean;
        /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.  */
        expirationDate?: number;
        /** The path of the cookie. */
        path: string;
        /** True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts). */
        httpOnly: boolean;
        /** True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS). */
        secure: boolean;
        /** The cookie's same-site status (i.e. whether the cookie is sent with cross-site requests). **/
        sameSite: SameSiteStatus
    }

    export interface SetDetails {
        /** Optional. The domain of the cookie. If omitted, the cookie becomes a host-only cookie.  */
        domain?: string;
        /** Optional. The name of the cookie. Empty by default if omitted.  */
        name?: string;
        /** The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie. If host permissions for this URL are not specified in the manifest file, the API call will fail. */
        url: string;
        /** Optional. The ID of the cookie store in which to set the cookie. By default, the cookie is set in the current execution context's cookie store.  */
        storeId?: string;
        /** Optional. The value of the cookie. Empty by default if omitted.  */
        value?: string;
        /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.  */
        expirationDate?: number;
        /** Optional. The path of the cookie. Defaults to the path portion of the url parameter.  */
        path?: string;
        /** Optional. Whether the cookie should be marked as HttpOnly. Defaults to false.  */
        httpOnly?: boolean;
        /** Optional. Whether the cookie should be marked as Secure. Defaults to false.  */
        secure?: boolean;
        /** Optional. The cookie's same-site status. Defaults to "unspecified", i.e., if omitted, the cookie is set without specifying a SameSite attribute. **/
        sameSite?: SameSiteStatus
    }
}