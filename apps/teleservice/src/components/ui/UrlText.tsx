import { isHttpUrl } from "~/forms/rules";

export function UrlText({ url }: { url: string }) {
	return isHttpUrl(url) ? <a href={url}>{url}</a> : url;
}
