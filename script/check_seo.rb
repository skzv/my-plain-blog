# Run after a production build: bundle exec ruby script/check_seo.rb
require 'nokogiri'
require 'json'
require 'uri'
require 'time'
require 'pathname'

root = Pathname.new(ARGV.fetch(0, '_site'))
origin = ARGV.fetch(1, 'https://blog.skz.dev')
errors = []
check = ->(condition, message) { errors << message unless condition }
pages = root.glob('**/*.html').to_h { |path| [path, Nokogiri::HTML(path.read)] }
check.call(!pages.empty?, 'No built HTML found; run jekyll build first')
canonicals = []
descriptions = []
posts = {}

pages.each do |path, doc|
  label = path.relative_path_from(root).to_s
  check.call(doc.css('title').length == 1, "#{label}: expected one title")
  check.call(doc.css('h1').length == 1, "#{label}: expected one main heading")
  metadata = doc.css('head meta').group_by { |tag| tag['name'] || tag['property'] }
  %w[description og:title og:description og:url og:type og:image og:image:type og:image:width og:image:height twitter:card twitter:description twitter:image twitter:site twitter:creator].each do |key|
    tags = metadata.fetch(key, [])
    check.call(tags.length == 1 && !tags.first['content'].to_s.empty?, "#{label}: missing or duplicate #{key}")
  end
  check.call(metadata.dig('twitter:card', 0)&.[]('content') == 'summary_large_image', "#{label}: incorrect Twitter card")
  check.call(metadata.dig('twitter:site', 0)&.[]('content') == '@_skzv', "#{label}: twitter:site must be @_skzv")
  check.call(metadata.dig('twitter:creator', 0)&.[]('content') == '@_skzv', "#{label}: twitter:creator must be @_skzv")
  og_width = metadata.dig('og:image:width', 0)&.[]('content').to_i
  check.call(og_width >= 1200, "#{label}: og:image:width (#{og_width}) must be >= 1200 for Discover/social cards")
  description = metadata.dig('description', 0)&.[]('content')
  descriptions << description
  canonical_tags = doc.css('link[rel="canonical"]')
  canonical = canonical_tags.first&.[]('href').to_s
  check.call(canonical_tags.length == 1 && canonical.start_with?(origin + '/'), "#{label}: invalid canonical URL")
  check.call(metadata.dig('og:url', 0)&.[]('content') == canonical, "#{label}: social URL differs from canonical")
  robots_content = metadata.dig('robots', 0)&.[]('content').to_s
  if robots_content.include?('noindex')
    # Excluded from sitemap
  else
    check.call(robots_content.include?('max-image-preview:large'), "#{label}: missing max-image-preview:large")
    canonicals << canonical
  end
  check.call(doc.at_css('link[rel="alternate"]')&.[]('type') == 'application/rss+xml', "#{label}: incorrect feed MIME type")
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

check.call(descriptions.uniq.length == descriptions.length, 'Duplicate page descriptions')
check.call(canonicals.uniq.length == canonicals.length, 'Duplicate canonical URLs')

sitemap = Nokogiri::XML(root.join('sitemap.xml').read) { |config| config.strict }
sitemap.remove_namespaces!
entries = sitemap.xpath('//url').to_h { |node| [node.at_xpath('loc').text, node.at_xpath('lastmod')&.text] }
check.call(entries.keys.sort == canonicals.sort, 'Sitemap must contain exactly the indexable canonical pages')
posts.each { |url, schema| check.call(entries[url] == schema['dateModified'], "#{url}: sitemap modification date differs from JSON-LD") }

feed = Nokogiri::XML(root.join('feed.xml').read) { |config| config.strict }
items = feed.xpath('/rss/channel/item')
check.call(items.map { |item| item.at_xpath('link').text }.sort == posts.keys.sort, 'RSS feed must contain every published post')
items.each do |item|
  begin
    Time.rfc2822(item.at_xpath('pubDate').text)
  rescue ArgumentError
    errors << "RSS: invalid publication date for #{item.at_xpath('link').text}"
  end
end
check.call(root.join('robots.txt').read.include?("Sitemap: #{origin}/sitemap.xml"), 'robots.txt has no correct sitemap declaration')
check.call(root.join('favicon.ico').size < 32_768, 'favicon.ico is too large')
%w[CLAUDE.md AGENTS.md package.json Gemfile.lock tests docs node_modules].each do |name|
  check.call(!root.join(name).exist?, "Development file published: #{name}")
end
abort errors.join("\n") unless errors.empty?
puts "SEO checks passed: #{pages.length} pages, #{posts.length} posts, metadata, structured data, local links/assets, sitemap, and RSS."
