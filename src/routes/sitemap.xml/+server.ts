import { SITE_URL, LAST_MOD_DATE } from '$lib/consts';
import { dateToString } from '$lib/utils';

function createEntry(
	path: string,
	lastmod: Date | string | null = null,
	changefreq:
		| 'always'
		| 'hourly'
		| 'daily'
		| 'weekly'
		| 'monthly'
		| 'yearly'
		| 'never'
		| null = null,
	priority: number | null = null
) {
	const changefreqValue = changefreq ? changefreq : 'monthly';
	const priorityValue = (priority && priority <= 1.0 && priority >= 0.0 ? priority : 1.0).toFixed(
		1
	);
	const lastmodValue = dateToString(lastmod ? lastmod : LAST_MOD_DATE);
	return `<url>
    <loc>${new URL(path, SITE_URL).href}</loc>
    <lastmod>${lastmodValue}</lastmod>
    <changefreq>${changefreqValue}</changefreq>
    <priority>${priorityValue}</priority>
  </url>`;
}

export async function GET() {
	return new Response(
		`
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			${createEntry('/')}
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'max-age=0, s-maxage=3600'
			}
		}
	);
}
