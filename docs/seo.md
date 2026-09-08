# Blog SEO

Every published post has a descriptive title, a unique summary, a preview image,
publication and modification dates, and a visible author link. Existing permalink
slugs stay unchanged when titles or content are edited. The homepage names the
blog and links to every post; post navigation uses article titles as anchor text.

`jekyll-seo-tag` generates descriptions, canonical URLs, social metadata, and one
JSON-LD block. `_includes/head.html` supplies the escaped page title, non-article
Open Graph type, image dimensions and alt text, modification time, and RSS link.
Keep `image` as a URL string: the pinned SEO plugin emits the incorrectly cased
`imageObject` schema type when passed an image hash. A URL is valid for the schema
image property and avoids that bug without changing dependencies.

Use these fields for a new post (replace the example values):

```yaml
title: "A clear title describing the project or explanation"
description: "A specific, readable summary of what this post covers."
last_modified_at: 2026-09-08 00:00
image: /assets/img/my-project/preview.png
image_width: 1200
image_height: 630
image_alt: "Describe what the preview actually shows"
mathjax: false
```

The filename supplies the publication date and slug. Set `last_modified_at` to the
actual content revision date, never earlier than publication; do not refresh it
on each build. `image_width` and `image_height` must match the asset. `imgpath` and
`previewurl` remain in existing posts for compatibility with their image includes.
Set `mathjax: true` on posts that use equations. Plotly and mathjs should be loaded
only in posts that use those libraries for interactive demos.

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
