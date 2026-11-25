# Blog SEO

Every published post has a descriptive title, a unique summary, a `>= 1200px` wide preview image,
publication and modification dates, topical `tags`, and a visible author link. Existing permalink
slugs stay unchanged when titles or content are edited. The homepage names the
blog with topical keywords and links to every post with summaries; post pages include
topically related posts and article-title prev/next navigation.

`jekyll-seo-tag` generates descriptions, canonical URLs, and Open Graph/Twitter tags (`@_skzv`),
while `_includes/structured-data.html` replaces its anonymous JSON-LD with a unified `@graph`
(`Blog`, `Person` anchored to `https://skz.dev/#person`, `BlogPosting` + `BreadcrumbList` on posts,
`AboutPage` on `/about`, and `CollectionPage` on `/`). `_includes/head.html` supplies concise
`<title>` tags (`· skz.dev` suffix, with optional `seo_title` overrides for long headlines),
`max-image-preview:large`, `twitter:description`, `og:image:type`, dimensions/alt text,
modification time, preconnected Google Fonts, and the RSS link.

Use these fields for a new post (replace the example values):

```yaml
title: "A clear title describing the project or explanation"
seo_title: "Optional concise SERP title under ~55 chars"
description: "A specific, readable summary of what this post covers."
last_modified_at: 2026-09-08 00:00
image: /assets/img/my-project/preview.png
image_width: 1200
image_height: 630
image_alt: "Describe what the preview actually shows"
tags: [machine-learning, systems]
toc: true # optional for long-form posts with multiple H2 sections
mathjax: false
```

The filename supplies the publication date and slug. Set `last_modified_at` to the
actual content revision date, never earlier than publication; do not refresh it
on each build. `image_width` and `image_height` must match the asset (`image_width >= 1200`
for Discover and `summary_large_image` cards). All content `<img>` and `<video>` elements must
include integer `width` and `height` attributes, with `loading="lazy"` on below-the-fold media
and `fetchpriority="high"` (without `loading="lazy"`) reserved for the primary above-the-fold visual.
Set `mathjax: true` on posts that use equations. Plotly and mathjs must use `defer` and be loaded
only in posts that use those libraries for interactive demos.

Note on trailing slashes: GitHub Pages serves extensionless permalinks (`/:title`) cleanly without
redirecting, and creating `/slug/index.html` stubs would cause GitHub Pages to override `/slug`
with `/slug/`. Instead, `404.md` provides client-side trailing-slash recovery without altering
canonical URLs.

The sitemap reads the same modification dates as article structured data. The
404 page is marked `noindex` and excluded from the sitemap. RSS keeps its existing
`/feed.xml` address, full post content, stable GUIDs, and RFC 822 publication dates.
Development files are excluded from the public build. Local configuration changes
only the host so previews retain the production SEO plugins and templates.

## Verification

Run `bash script/cibuild.sh` from the repository root. It builds the site, runs
`script/check_seo.rb`, and checks HTML links and images with HTML-Proofer. The
latter is configured for extensionless URLs and intentionally empty decorative
image alt text. The SEO check verifies all generated HTML pages, unique metadata,
matching canonical/social/schema URLs, article dates and authors, preview assets,
sitemap membership and dates, RSS coverage, and local links.

These checks do not measure search rankings, external link availability, or
Google's indexing state. Review the homepage and changed posts in a browser too.

## References

- [Google: page-specific descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [Google: article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: descriptive link text](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
