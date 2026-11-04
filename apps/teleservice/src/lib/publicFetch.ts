import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { TRPCError } from "@trpc/server";

const BLOCKED_IPV4_SUBNETS = [
	["0.0.0.0", 8],
	["10.0.0.0", 8],
	["100.64.0.0", 10],
	["127.0.0.0", 8],
	["169.254.0.0", 16],
	["172.16.0.0", 12],
	["192.0.0.0", 24],
	["192.0.2.0", 24],
	["192.168.0.0", 16],
	["198.18.0.0", 15],
	["198.51.100.0", 24],
	["203.0.113.0", 24],
	["224.0.0.0", 4],
	["240.0.0.0", 4],
] as const;

// IPv4-mapped/compatible, NAT64, 6to4 and Teredo ranges embed an IPv4 address: blocked whole.
const BLOCKED_IPV6_SUBNETS = [
	["::", 96],
	["::ffff:0:0", 96],
	["64:ff9b::", 96],
	["64:ff9b:1::", 48],
	["100::", 64],
	["2001::", 32],
	["2001:db8::", 32],
	["2002::", 16],
	["fc00::", 7],
	["fe80::", 10],
	["fec0::", 10],
	["ff00::", 8],
] as const;

// One list per family: a BlockList matches IPv4 addresses against IPv6 rules through ::ffff:0:0/96.
const blockedIpv4 = new BlockList();
for (const [network, prefix] of BLOCKED_IPV4_SUBNETS)
	blockedIpv4.addSubnet(network, prefix, "ipv4");
const blockedIpv6 = new BlockList();
for (const [network, prefix] of BLOCKED_IPV6_SUBNETS)
	blockedIpv6.addSubnet(network, prefix, "ipv6");

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

const refuse = (message: string) =>
	new TRPCError({ code: "BAD_REQUEST", message });

/** True for any address that is not a routable public unicast address. */
export const isBlockedAddress = (address: string): boolean => {
	const family = isIP(address);
	if (family === 0) return true;
	return family === 4
		? blockedIpv4.check(address, "ipv4")
		: blockedIpv6.check(address, "ipv6");
};

/** Rejects non-http(s) URLs and hosts resolving to any private, loopback, link-local or metadata address. */
export const assertPublicUrl = async (url: URL): Promise<void> => {
	if (!ALLOWED_PROTOCOLS.has(url.protocol))
		throw refuse("Seules les adresses http(s) sont acceptées");

	const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");
	if (isIP(hostname)) {
		if (isBlockedAddress(hostname)) throw refuse("Adresse non autorisée");
		return;
	}

	let addresses: { address: string }[];
	try {
		addresses = await lookup(hostname, { all: true, verbatim: true });
	} catch {
		throw refuse("Adresse introuvable");
	}

	if (
		addresses.length === 0 ||
		addresses.some(({ address }) => isBlockedAddress(address))
	)
		throw refuse("Adresse non autorisée");
};

const readTextWithLimit = async (
	response: Response,
	maxBytes: number,
): Promise<string> => {
	if (!response.body) return "";

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let received = 0;
	let text = "";

	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		received += value.byteLength;
		if (received > maxBytes) {
			await reader.cancel();
			throw refuse("La page est trop volumineuse");
		}
		text += decoder.decode(value, { stream: true });
	}

	return text + decoder.decode();
};

/**
 * Fetches a user-supplied public URL as text. Every redirect hop is revalidated,
 * the whole exchange is time-bound and the decoded body is size-capped.
 */
export const fetchPublicText = async (
	rawUrl: string,
	{
		headers,
		timeoutMs = 10_000,
		maxBytes = 2 * 1024 * 1024,
		maxRedirects = 5,
	}: {
		headers?: HeadersInit;
		timeoutMs?: number;
		maxBytes?: number;
		maxRedirects?: number;
	} = {},
): Promise<string> => {
	const signal = AbortSignal.timeout(timeoutMs);
	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		throw refuse("Adresse invalide");
	}

	for (let redirects = 0; ; redirects++) {
		await assertPublicUrl(url);

		const response = await fetch(url, { headers, redirect: "manual", signal });

		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get("location");
			await response.body?.cancel();
			if (!location || redirects >= maxRedirects)
				throw refuse("Trop de redirections");
			url = new URL(location, url);
			continue;
		}

		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(`Failed to fetch URL: ${response.statusText}`);
		}

		return readTextWithLimit(response, maxBytes);
	}
};
