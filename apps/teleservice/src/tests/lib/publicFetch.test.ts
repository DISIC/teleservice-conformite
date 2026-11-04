import { afterEach, describe, expect, it, vi } from "vitest";
import {
	assertPublicUrl,
	fetchPublicText,
	isBlockedAddress,
} from "~/lib/publicFetch";

const PUBLIC_IP_URL = "https://93.184.215.14/accessibilite";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("isBlockedAddress", () => {
	it.each([
		"127.0.0.1",
		"10.1.2.3",
		"172.20.0.1",
		"192.168.1.1",
		"169.254.169.254",
		"100.100.100.200",
		"0.0.0.0",
		"::1",
		"::",
		"::ffff:127.0.0.1",
		"::ffff:a9fe:a9fe",
		"fd00:ec2::254",
		"fe80::1",
		"not-an-ip",
	])("blocks %s", (address) => {
		expect(isBlockedAddress(address)).toBe(true);
	});

	it.each(["93.184.215.14", "2a00:1450:4007:80e::200e"])(
		"allows %s",
		(address) => {
			expect(isBlockedAddress(address)).toBe(false);
		},
	);
});

describe("assertPublicUrl", () => {
	it.each([
		"ftp://example.fr/",
		"file:///etc/passwd",
		"http://127.0.0.1:3000/",
		"http://0x7f.1/",
		"http://2130706433/",
		"http://[::1]/",
		"http://[::ffff:169.254.169.254]/",
		"http://169.254.169.254/latest/meta-data/",
		"http://localhost/",
	])("refuses %s", async (url) => {
		await expect(assertPublicUrl(new URL(url))).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
	});

	it("accepts a public IP literal", async () => {
		await expect(
			assertPublicUrl(new URL(PUBLIC_IP_URL)),
		).resolves.toBeUndefined();
	});
});

describe("fetchPublicText", () => {
	it("revalidates redirect targets", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(null, {
					status: 302,
					headers: { location: "http://169.254.169.254/latest/meta-data/" },
				}),
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(fetchPublicText(PUBLIC_IP_URL)).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("follows a redirect to another public address", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(null, {
					status: 301,
					headers: { location: "/declaration" },
				}),
			)
			.mockResolvedValueOnce(new Response("<main>ok</main>"));
		vi.stubGlobal("fetch", fetchMock);

		await expect(fetchPublicText(PUBLIC_IP_URL)).resolves.toBe(
			"<main>ok</main>",
		);
		expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
			"https://93.184.215.14/declaration",
		);
	});

	it("stops after too many redirects", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response(null, { status: 302, headers: { location: "/loop" } }),
			),
		);

		await expect(
			fetchPublicText(PUBLIC_IP_URL, { maxRedirects: 2 }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("caps the response size", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("x".repeat(2048))),
		);

		await expect(
			fetchPublicText(PUBLIC_IP_URL, { maxBytes: 1024 }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});
});
