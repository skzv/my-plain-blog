# Run after a production build: bundle exec ruby script/check_seo.rb
require 'nokogiri'
require 'json'
require 'uri'
require 'time'
require 'pathname'
require 'yaml'

root = Pathname.new(ARGV.fetch(0, '_site'))
origin = ARGV.fetch(1, 'https://blog.skz.dev')
locales = YAML.load_file('_data/locales.yml')
locale_by_tag = locales.to_h { |l| [l['tag'], l] }
errors = []
check = ->(condition, message) { errors << message unless condition }
pages = root.glob('**/*.html').to_h { |path| [path, Nokogiri::HTML(path.read)] }
check.call(!pages.empty?, 'No built HTML found; run jekyll build first')

canonicals = []
descriptions = []
posts = {}
posts_by_locale = Hash.new { |h, k| h[k] = [] }
hreflang_map = {}

pages.each do |path, doc|
  label = path.relative_path_from(root).to_s
  html_lang = doc.at_css('html')&.[]('lang').to_s
  loc = locale_by_tag[html_lang]
  check.call(!loc.nil?, "#{label}: unrecognized html[lang]=#{html_lang.inspect}")
  check.call(doc.css('title').length == 1, "#{label}: expected one title")
  check.call(doc.css('h1').length == 1, "#{label}: expected one main heading")

  metadata = doc.css('head meta').group_by { |tag| tag['name'] || tag['property'] }
  %w[description og:title og:description og:url og:type og:locale og:image og:image:type og:image:width og:image:height twitter:card twitter:description twitter:image twitter:site twitter:creator].each do |key|
    tags = metadata.fetch(key, [])
    check.call(tags.length == 1 && !tags.first['content'].to_s.empty?, "#{label}: missing or duplicate #{key}")
  end
  check.call(metadata.dig('twitter:card', 0)&.[]('content') == 'summary_large_image', "#{label}: incorrect Twitter card")
  check.call(metadata.dig('twitter:site', 0)&.[]('content') == '@_skzv', "#{label}: twitter:site must be @_skzv")
  check.call(metadata.dig('twitter:creator', 0)&.[]('content') == '@_skzv', "#{label}: twitter:creator must be @_skzv")
  og_width = metadata.dig('og:image:width', 0)&.[]('content').to_i
  check.call(og_width >= 1200, "#{label}: og:image:width (#{og_width}) must be >= 1200 for Discover/social cards")
  if loc
    check.call(metadata.dig('og:locale', 0)&.[]('content') == loc['og'], "#{label}: og:locale mismatch (expected #{loc['og']})")
  end

  description = metadata.dig('description', 0)&.[]('content')
  descriptions << description
  canonical_tags = doc.css('link[rel="canonical"]')
  canonical = canonical_tags.first&.[]('href').to_s
  check.call(canonical_tags.length == 1 && canonical.start_with?(origin + '/'), "#{label}: invalid canonical URL")
  check.call(metadata.dig('og:url', 0)&.[]('content') == canonical, "#{label}: social URL differs from canonical")

  robots_content = metadata.dig('robots', 0)&.[]('content').to_s
  unless robots_content.include?('noindex')
    check.call(robots_content.include?('max-image-preview:large'), "#{label}: missing max-image-preview:large")
    canonicals << canonical
    alt_links = doc.css('head link[rel="alternate"][hreflang]').to_h { |n| [n['hreflang'], n['href']] }
    expected_tags = locales.map { |l| l['tag'] } + ['x-default']
    check.call(alt_links.keys.sort == expected_tags.sort, "#{label}: incomplete hreflang links (got #{alt_links.keys.sort.inspect})")
    check.call(alt_links[html_lang] == canonical, "#{label}: self hreflang differs from canonical")
    hreflang_map[canonical] = { lang: html_lang, links: alt_links }

    if loc
      alt_og = metadata.fetch('og:locale:alternate', []).map { |n| n['content'] }.sort
      expected_alt_og = locales.reject { |l| l['code'] == loc['code'] }.map { |l| l['og'] }.sort
      check.call(alt_og == expected_alt_og, "#{label}: og:locale:alternate mismatch")
    end
    check.call(doc.css('details[data-language-picker] a[aria-current="page"]').length == 1, "#{label}: missing active language switcher link")
  end

  rss_links = doc.css('head link[rel="alternate"][type="application/rss+xml"]')
  check.call(rss_links.length == 1, "#{label}: missing or duplicate RSS alternate link")
  check.call(doc.css('footer.footer').length == 1, "#{label}: expected semantic footer.footer")
  check.call(!doc.css('footer a[href="https://skz.dev"]').empty?, "#{label}: footer must link back to https://skz.dev")

  # Prevent CLS and render-blocking external scripts
  doc.css('main img').each do |img|
    check.call(img['width'].to_i > 0 && img['height'].to_i > 0, "#{label}: image missing integer width/height: #{img['src']}")
  end
  doc.css('main video').each do |vid|
    check.call(vid['width'].to_i > 0 && vid['height'].to_i > 0, "#{label}: video missing integer width/height")
  end
  doc.css('script[src]').each do |sc|
    next if sc['async'] || sc['defer'] || sc['type'] == 'module'
    errors << "#{label}: render-blocking script #{sc['src']}"
  end

  schemas = doc.css('script[type="application/ld+json"]')
  check.call(schemas.length == 1, "#{label}: expected one JSON-LD block")
  begin
    payload = JSON.parse(schemas.first&.text.to_s)
    graph = payload.fetch('@graph')
    blog_node = graph.find { |n| n['@type'] == 'Blog' }
    person_node = graph.find { |n| n['@type'] == 'Person' }
    check.call(blog_node && blog_node['@id'] == "#{origin}/#blog", "#{label}: missing Blog node in JSON-LD")
    check.call(person_node && person_node['@id'] == 'https://skz.dev/#person', "#{label}: Person node must use @id https://skz.dev/#person")
    check.call(person_node&.fetch('sameAs', [])&.include?('https://twitter.com/_skzv'), "#{label}: Person sameAs must include https://twitter.com/_skzv")
    page_node = graph.find { |n| %w[BlogPosting AboutPage CollectionPage WebPage].include?(n['@type']) }
    check.call(!page_node.nil?, "#{label}: missing page-level schema node")
    image = metadata.dig('og:image', 0)&.[]('content')
    check.call(page_node['url'] == canonical, "#{label}: JSON-LD URL differs from canonical")
    check.call(page_node['image'] == image, "#{label}: JSON-LD image differs from social preview")
    check.call(page_node['description'] == description, "#{label}: inconsistent description")
    check.call(page_node['inLanguage'] == html_lang, "#{label}: JSON-LD inLanguage mismatch")
    if page_node['@type'] == 'BlogPosting'
      published = Time.iso8601(page_node.fetch('datePublished'))
      modified = Time.iso8601(page_node.fetch('dateModified'))
      check.call(modified >= published, "#{label}: modification precedes publication")
      check.call(metadata.dig('article:modified_time', 0)&.[]('content') == page_node['dateModified'], "#{label}: inconsistent modification date")
      check.call(page_node.dig('author', '@id') == 'https://skz.dev/#person', "#{label}: BlogPosting author must reference https://skz.dev/#person")
      check.call(page_node.dig('publisher', '@id') == 'https://skz.dev/#person', "#{label}: BlogPosting publisher must reference https://skz.dev/#person")
      check.call(graph.any? { |n| n['@type'] == 'BreadcrumbList' }, "#{label}: missing BreadcrumbList on post")
      check.call(!doc.css('a[rel="author"]').empty?, "#{label}: missing visible author link")
      posts[canonical] = page_node
      posts_by_locale[loc['code']] << canonical if loc
    end
  rescue JSON::ParserError, KeyError, ArgumentError => e
    errors << "#{label}: invalid structured data: #{e.message}"
  end

  # Validate local assets and crawlable links using the page's canonical URL.
  references = doc.css('a[href], link[href], img[src], script[src], source[src]').map { |node| node['href'] || node['src'] }
  references.concat(doc.css('video[poster]').map { |node| node['poster'] })
  references << metadata.dig('og:image', 0)&.[]('content')
  references.compact.each do |reference|
    next if reference.start_with?('#', 'mailto:', 'tel:', 'chrome:', 'data:')
    begin
      uri = URI.join(canonical, reference)
      next unless uri.host == URI(origin).host
      relative = URI::DEFAULT_PARSER.unescape(uri.path).sub(%r{\A/}, '')
      target = root.join(relative)
      candidates = [target, Pathname.new("#{target}.html"), target.join('index.html')]
      check.call(candidates.any?(&:file?), "#{label}: broken local reference #{reference}")
    rescue URI::InvalidURIError => e
      errors << "#{label}: invalid URL #{reference}: #{e.message}"
    end
  end
end

# Verify reciprocal hreflang symmetry across all localized pages.
hreflang_map.each do |url, info|
  info[:links].each do |tag, target_url|
    next if tag == 'x-default'
    target_info = hreflang_map[target_url]
    check.call(!target_info.nil?, "hreflang target not indexed: #{url} -> #{target_url}")
    if target_info
      check.call(target_info[:links][info[:lang]] == url, "Non-reciprocal hreflang: #{url} <-> #{target_url}")
    end
  end
end

check.call(descriptions.uniq.length == descriptions.length, 'Duplicate page descriptions')
check.call(canonicals.uniq.length == canonicals.length, 'Duplicate canonical URLs')

sitemap = Nokogiri::XML(root.join('sitemap.xml').read) { |config| config.strict }
sitemap.remove_namespaces!
entries = sitemap.xpath('//url').to_h { |node| [node.at_xpath('loc').text, node.at_xpath('lastmod')&.text] }
check.call(entries.keys.sort == canonicals.sort, 'Sitemap must contain exactly the indexable canonical pages')
posts.each { |url, schema| check.call(entries[url] == schema['dateModified'], "#{url}: sitemap modification date differs from JSON-LD") }

# Verify all 9 localized RSS feeds.
locales.each do |loc|
  code = loc['code']
  feed_rel = code == 'en' ? 'feed.xml' : "#{code}/feed.xml"
  feed_path = root.join(feed_rel)
  check.call(feed_path.file?, "Missing RSS feed: #{feed_rel}")
  next unless feed_path.file?

  feed = Nokogiri::XML(feed_path.read) { |config| config.strict }
  items = feed.xpath('/rss/channel/item')
  check.call(items.map { |item| item.at_xpath('link').text }.sort == posts_by_locale[code].sort, "#{feed_rel}: must contain every published post for #{code}")
  check.call(feed.at_xpath('/rss/channel/language')&.text == loc['tag'], "#{feed_rel}: wrong RSS language")
  items.each do |item|
    begin
      Time.rfc2822(item.at_xpath('pubDate').text)
    rescue ArgumentError
      errors << "#{feed_rel}: invalid publication date for #{item.at_xpath('link').text}"
    end
  end
end

check.call(root.join('robots.txt').read.include?("Sitemap: #{origin}/sitemap.xml"), 'robots.txt has no correct sitemap declaration')
check.call(root.join('favicon.ico').size < 32_768, 'favicon.ico is too large')
%w[CLAUDE.md AGENTS.md package.json Gemfile.lock tests docs node_modules].each do |name|
  check.call(!root.join(name).exist?, "Development file published: #{name}")
end
abort errors.join("\n") unless errors.empty?
puts "SEO checks passed: #{pages.length} pages (#{locales.length} languages), #{posts.length} posts, entity graph, hreflang symmetry, CLS/media, sitemap, and #{locales.length} RSS feeds."
