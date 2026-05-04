---
layout: default
title: Writing
permalink: /blog/
description: "Articles on cryptography, software verification, machine learning, and the supporting math."
hide_page_header: true
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

  {%- comment -%} Build topic counts from post.course frontmatter {%- endcomment -%}
  {%- assign all_posts = site.posts -%}
  {%- assign by_topic = all_posts | group_by: "course" -%}

  <section class="writing-controls" aria-label="Filter and search articles">
    <div class="writing-search">
      <label for="writing-search-input" class="visually-hidden">Search articles</label>
      <svg class="writing-search__icon" aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg>
      <input
        type="search"
        id="writing-search-input"
        class="writing-search__input"
        placeholder="Search by title, summary, or tag…"
        autocomplete="off"
        spellcheck="false"
        data-writing-search>
      <button type="button" class="writing-search__clear" data-writing-clear hidden aria-label="Clear search">×</button>
    </div>

    <div class="writing-topics" role="group" aria-label="Filter by topic">
      <button type="button" class="writing-topic is-active" data-writing-topic="" aria-pressed="true">All <span class="writing-topic__count">{{ all_posts | size }}</span></button>
      {%- for topic in by_topic -%}
        {%- if topic.name and topic.name != "" -%}
        <button type="button" class="writing-topic" data-writing-topic="{{ topic.name | escape }}" aria-pressed="false">{{ topic.name }} <span class="writing-topic__count">{{ topic.items | size }}</span></button>
        {%- endif -%}
      {%- endfor -%}
    </div>
  </section>

  <p class="writing-status" data-writing-status aria-live="polite">Loading articles…</p>

  <div class="post-list" data-writing-list>
    {%- for post in all_posts %}
    {%- assign post_topic = post.course | default: "Other" -%}
    {%- assign post_excerpt = post.description | default: post.excerpt | strip_html | strip_newlines -%}
    {%- assign post_tags = post.tags | join: " " -%}
    <article
      class="post-list__item"
      data-writing-item
      data-topic="{{ post_topic | escape }}"
      data-haystack="{{ post.title | append: ' ' | append: post_excerpt | append: ' ' | append: post_tags | downcase | escape }}">
      <time class="post-list__date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time>
      <div class="post-list__body">
        <p class="post-list__topic">{{ post_topic }}</p>
        <h2 class="post-list__title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
        {%- if post_excerpt and post_excerpt != "" %}
        <p class="post-list__excerpt">{{ post_excerpt | truncate: 220 }}</p>
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

  <div class="writing-empty" data-writing-empty hidden>
    <p>No articles match your search.</p>
    <button type="button" class="btn btn--secondary" data-writing-reset>Reset filters</button>
  </div>

  <nav class="writing-pagination" data-writing-pagination aria-label="Pagination" hidden>
    <button type="button" class="writing-page-btn" data-writing-prev disabled>‹ Prev</button>
    <ol class="writing-page-list" data-writing-pages></ol>
    <button type="button" class="writing-page-btn" data-writing-next>Next ›</button>
  </nav>
</div>

<script>
(function() {
  const PAGE_SIZE = 10;
  const list = document.querySelector('[data-writing-list]');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('[data-writing-item]'));
  const search = document.querySelector('[data-writing-search]');
  const clearBtn = document.querySelector('[data-writing-clear]');
  const topics = Array.from(document.querySelectorAll('[data-writing-topic]'));
  const status = document.querySelector('[data-writing-status]');
  const empty = document.querySelector('[data-writing-empty]');
  const reset = document.querySelector('[data-writing-reset]');
  const pag = document.querySelector('[data-writing-pagination]');
  const pages = document.querySelector('[data-writing-pages]');
  const prevBtn = document.querySelector('[data-writing-prev]');
  const nextBtn = document.querySelector('[data-writing-next]');

  let state = { q: '', topic: '', page: 1 };
  let filtered = items;

  function readHash() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    state.q = (params.get('q') || '').trim();
    state.topic = params.get('topic') || '';
    state.page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  }

  function writeHash() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.topic) params.set('topic', state.topic);
    if (state.page > 1) params.set('page', String(state.page));
    const hash = params.toString();
    const target = hash ? '#' + hash : location.pathname;
    history.replaceState(null, '', target);
  }

  function applyFilter() {
    const q = state.q.toLowerCase();
    const topic = state.topic;
    filtered = items.filter(el => {
      if (topic && el.dataset.topic !== topic) return false;
      if (q && !el.dataset.haystack.includes(q)) return false;
      return true;
    });
  }

  function render() {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const visible = new Set(filtered.slice(start, end));
    items.forEach(el => { el.hidden = !visible.has(el); });

    if (total === 0) {
      empty.hidden = false;
      status.textContent = 'No articles match.';
      pag.hidden = true;
      return;
    }
    empty.hidden = true;

    const shownStart = start + 1;
    const shownEnd = Math.min(end, total);
    const filteredSuffix = total === items.length ? '' : ' (filtered from ' + items.length + ')';
    status.textContent = total <= PAGE_SIZE
      ? 'Showing ' + total + ' article' + (total === 1 ? '' : 's') + filteredSuffix + '.'
      : 'Showing ' + shownStart + '–' + shownEnd + ' of ' + total + filteredSuffix + '.';

    pag.hidden = totalPages <= 1;
    prevBtn.disabled = state.page <= 1;
    nextBtn.disabled = state.page >= totalPages;
    renderPageList(totalPages);
  }

  function renderPageList(totalPages) {
    pages.innerHTML = '';
    const window_ = 1;
    const nums = new Set([1, totalPages, state.page]);
    for (let i = state.page - window_; i <= state.page + window_; i++) {
      if (i >= 1 && i <= totalPages) nums.add(i);
    }
    const sorted = Array.from(nums).sort((a, b) => a - b);
    let prev = 0;
    sorted.forEach(n => {
      if (n - prev > 1) {
        const li = document.createElement('li');
        li.className = 'writing-page-list__gap';
        li.textContent = '…';
        pages.appendChild(li);
      }
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'writing-page-num';
      if (n === state.page) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'page');
      }
      btn.textContent = String(n);
      btn.addEventListener('click', () => { state.page = n; writeHash(); render(); scrollToList(); });
      li.appendChild(btn);
      pages.appendChild(li);
      prev = n;
    });
  }

  function scrollToList() {
    const top = list.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function syncControls() {
    search.value = state.q;
    clearBtn.hidden = !state.q;
    topics.forEach(btn => {
      const active = (btn.dataset.writingTopic || '') === state.topic;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  let searchTimer;
  search.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = e.target.value.trim();
      state.page = 1;
      clearBtn.hidden = !state.q;
      applyFilter(); writeHash(); render();
    }, 120);
  });

  clearBtn.addEventListener('click', () => {
    state.q = ''; state.page = 1; search.value = '';
    clearBtn.hidden = true;
    applyFilter(); writeHash(); render(); search.focus();
  });

  topics.forEach(btn => {
    btn.addEventListener('click', () => {
      state.topic = btn.dataset.writingTopic || '';
      state.page = 1;
      syncControls(); applyFilter(); writeHash(); render();
    });
  });

  prevBtn.addEventListener('click', () => {
    if (state.page > 1) { state.page--; writeHash(); render(); scrollToList(); }
  });
  nextBtn.addEventListener('click', () => {
    state.page++; writeHash(); render(); scrollToList();
  });

  reset.addEventListener('click', () => {
    state = { q: '', topic: '', page: 1 };
    search.value = '';
    syncControls(); applyFilter(); writeHash(); render();
  });

  window.addEventListener('hashchange', () => {
    readHash(); syncControls(); applyFilter(); render();
  });

  readHash();
  syncControls();
  applyFilter();
  render();
})();
</script>
