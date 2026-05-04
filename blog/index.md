---
layout: default
title: Writing
permalink: /blog/
description: "Articles on cryptography, software verification, machine learning, and the supporting math."
---
<div class="container container--reading">
  <header class="page-header">
    <span class="eyebrow page-header__eyebrow">Writing</span>
    <h1 class="page-header__title">Articles, notes, and lecture follow-ups.</h1>
    <p class="lede page-header__lede">{{ page.description }}</p>
    <div class="page-header__meta">
      <span class="page-header__meta-item">{{ site.posts | size }} posts</span>
      <span class="page-header__meta-item"><a href="{{ '/feed.xml' | relative_url }}">Subscribe via RSS</a></span>
    </div>
  </header>

  {%- assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" -%}
  {%- for year_group in posts_by_year %}
  <section style="margin-bottom: 64px;">
    <div class="section-rule"><span class="section-rule__label">{{ year_group.name }}</span></div>
    <div class="post-list">
      {%- for post in year_group.items %}
      <article class="post-list__item">
        <time class="post-list__date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d" }}</time>
        <div class="post-list__body">
          <h2 class="post-list__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          {%- if post.description or post.excerpt %}
          <p class="post-list__excerpt">{{ post.description | default: post.excerpt | strip_html | truncate: 220 }}</p>
          {%- endif %}
          {%- if post.tags and post.tags.size > 0 %}
          <div class="post-list__tags">
            {%- for tag in post.tags limit: 5 %}<span class="tag">{{ tag }}</span>{% endfor -%}
          </div>
          {%- endif %}
        </div>
      </article>
      {%- endfor %}
    </div>
  </section>
  {%- endfor %}
</div>
