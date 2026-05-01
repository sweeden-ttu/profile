# frozen_string_literal: true

require "json"
require "securerandom"

module DebugEmergingTech
  LOG_PATH = "/Users/sweeden/profile/.cursor/debug-91470e.log"
  SESSION_ID = "91470e"

  module_function

  def write_log(payload)
    base = {
      sessionId: SESSION_ID,
      runId: "pre-fix",
      id: "log_#{Time.now.to_i}_#{SecureRandom.hex(4)}",
      timestamp: (Time.now.to_f * 1000).to_i
    }
    File.open(LOG_PATH, "a") { |f| f.puts(base.merge(payload).to_json) }
  rescue StandardError
    nil
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  # region agent log
  DebugEmergingTech.write_log(
    location: "_plugins/debug_emerging_tech.rb:26",
    hypothesisId: "H1",
    message: "Source file presence for emerging-tech variants",
    data: {
      has_html_source: File.exist?(File.join(site.source, "emerging-tech.html")),
      has_md_source: File.exist?(File.join(site.source, "emerging-tech.md"))
    }
  )
  # endregion
end

Jekyll::Hooks.register :pages, :pre_render do |page, _payload|
  next unless page.url == "/emerging-tech/"

  # region agent log
  DebugEmergingTech.write_log(
    location: "_plugins/debug_emerging_tech.rb:42",
    hypothesisId: "H2",
    message: "Pre-render page metadata for /emerging-tech/",
    data: {
      path: page.path,
      name: page.name,
      ext: page.ext,
      layout: page.data["layout"],
      permalink: page.data["permalink"]
    }
  )
  # endregion
end

Jekyll::Hooks.register :pages, :post_render do |page|
  next unless page.url == "/emerging-tech/"

  # region agent log
  DebugEmergingTech.write_log(
    location: "_plugins/debug_emerging_tech.rb:61",
    hypothesisId: "H3",
    message: "Post-render output metadata for /emerging-tech/",
    data: {
      output_ext: page.output_ext,
      output_bytes: page.output.to_s.bytesize,
      contains_etr_wrapper: page.output.to_s.include?("<div class=\"etr\">")
    }
  )
  # endregion
end

Jekyll::Hooks.register :site, :post_write do |site|
  built_path = File.join(site.dest, "emerging-tech", "index.html")
  html = File.exist?(built_path) ? File.read(built_path) : ""
  root_href_count = html.scan(/href="\/(?!\/)[^"]+"/).size
  root_src_count = html.scan(/src="\/(?!\/)[^"]+"/).size
  baseurl = (site.config["baseurl"] || "").to_s
  bare_href_count = if baseurl.empty?
                      nil
                    else
                      prefix = baseurl.sub(%r{\A/+}, "").sub(%r{/+\z}, "")
                      html.scan(/href="\/(?!\/)(?!#{Regexp.escape(prefix)}\/)[^"]+"/).size
                    end

  # region agent log
  DebugEmergingTech.write_log(
    location: "_plugins/debug_emerging_tech.rb:80",
    hypothesisId: "H4",
    message: "Built artifact checks for /emerging-tech/index.html",
    data: {
      built_file_exists: File.exist?(built_path),
      has_inline_script: html.include?("(function () {"),
      has_bento_section: html.include?("id=\"bento\"")
    }
  )
  # endregion

  # region agent log
  DebugEmergingTech.write_log(
    location: "_plugins/debug_emerging_tech.rb:95",
    hypothesisId: "H6",
    message: "Base URL compatibility checks for /emerging-tech/",
    data: {
      configured_baseurl: site.config["baseurl"],
      root_relative_href_count: root_href_count,
      root_relative_src_count: root_src_count,
      bare_href_without_baseurl_prefix_count: bare_href_count
    }
  )
  # endregion
end
