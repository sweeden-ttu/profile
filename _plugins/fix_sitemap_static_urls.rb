# frozen_string_literal: true

# PDFs-and-static files under `_assignments/` deploy to `/assignments/...`.
# jekyll-sitemap emits `/_assignments/...` for those static_files, producing 404s in sitemap.xml.
# Normalize after the sitemap generator runs (post_write).
Jekyll::Hooks.register :site, :post_write do |site|
  path = File.join(site.dest, "sitemap.xml")
  next unless File.file?(path)

  base = (site.config["url"] || "").sub(%r{/+\z}, "")
  next if base.empty?

  xml = File.read(path)
  fixed = xml.gsub("#{base}/_assignments/", "#{base}/assignments/")
  File.write(path, fixed) if fixed != xml
end
