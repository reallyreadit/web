export function isIosDevice(userAgent: string) {
	return /(iPhone|iPad)/i.test(userAgent);
}