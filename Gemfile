source "https://rubygems.org"

# Jekyll
gem "jekyll", "~> 4.3"
gem "jekyll-sass-converter", "~> 3.0"
gem "csv"
gem "logger"
gem "base64"

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-remote-theme"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-feed"
  gem "jekyll-paginate"
  gem "jemoji"
end

# Math rendering support
gem "kramdown-math-katex"

# Development and testing tools
group :development, :test do
  gem "html-proofer", "~> 5.2"
  gem "webrick", "~> 1.8"
end

# Windows and JRuby compatibility
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance booster for watching directories
gem "wdm", "~> 0.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
