(function () {
  "use strict";

  var scriptEl = document.getElementById("work-portfolio-json");
  var root = document.querySelector("[data-work-gallery]");
  if (!scriptEl || !root) return;

  var portfolio;
  try {
    portfolio = JSON.parse(scriptEl.textContent);
  } catch (e) {
    return;
  }

  var topics = portfolio.topics || [];
  var slides = [];
  topics.forEach(function (topic) {
    (topic.items || []).forEach(function (item) {
      slides.push({
        id: item.id,
        title: item.title,
        pdf_url: item.pdf_url,
        thumb_url: item.thumb_url,
        topic_label: topic.label,
        topic_slug: topic.slug,
      });
    });
  });

  var slidesEl = root.querySelector("[data-slides]");
  var emptyEl = root.querySelector("[data-deck-empty]");
  var liveEl = root.querySelector("[data-deck-live]");
  var openLink = root.querySelector("[data-open-pdf]");
  var topicRegions = root.querySelector("[data-topic-regions]");
  var reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!slides.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  var index = 0;
  var timer;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlides() {
    if (!slidesEl) return;
    slidesEl.innerHTML = slides
      .map(function (s, i) {
        var active = i === index ? " is-active" : "";
        return (
          '<article class="work-gallery__slide' +
          active +
          '" data-slide-index="' +
          i +
          '" aria-hidden="' +
          (i === index ? "false" : "true") +
          '">' +
          '<figure class="work-gallery__figure">' +
          '<img src="' +
          escapeHtml(s.thumb_url) +
          '" alt="" width="520" height="730" loading="' +
          (i === 0 ? "eager" : "lazy") +
          '" class="work-gallery__slide-img" />' +
          '<figcaption class="work-gallery__caption">' +
          '<span class="work-gallery__topic-pill">' +
          escapeHtml(s.topic_label) +
          "</span>" +
          "<strong>" +
          escapeHtml(s.title) +
          "</strong></figcaption></figure></article>"
        );
      })
      .join("");
  }

  function updateLive() {
    var s = slides[index];
    if (!s) return;
    if (liveEl) {
      liveEl.textContent =
        "Slide " + (index + 1) + " of " + slides.length + ": " + s.title;
    }
    if (openLink) {
      openLink.href = s.pdf_url;
    }
    var nodes = slidesEl ? slidesEl.querySelectorAll("[data-slide-index]") : [];
    nodes.forEach(function (node) {
      var i = parseInt(node.getAttribute("data-slide-index"), 10);
      var on = i === index;
      node.classList.toggle("is-active", on);
      node.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  function go(delta) {
    index = (index + delta + slides.length) % slides.length;
    updateLive();
    syncThumbs();
    resetAuto();
  }

  function goTo(i) {
    index = ((i % slides.length) + slides.length) % slides.length;
    updateLive();
    syncThumbs();
    resetAuto();
  }

  function syncThumbs() {
    var buttons = root.querySelectorAll("[data-go]");
    buttons.forEach(function (btn) {
      var i = parseInt(btn.getAttribute("data-go"), 10);
      var on = i === index;
      btn.classList.toggle("is-current", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  function resetAuto() {
    if (timer) clearInterval(timer);
    if (reducedMotion) return;
    timer = setInterval(function () {
      go(1);
    }, 9000);
  }

  function renderTopicWheels() {
    if (!topicRegions) return;
    topicRegions.innerHTML = topics
      .map(function (topic) {
        var items = topic.items || [];
        if (!items.length) return "";
        var n = items.length;
        var step = 360 / n;
        var thumbs = items
          .map(function (item, i) {
            var si = slides.findIndex(function (s) {
              return s.id === item.id;
            });
            return (
              '<li class="work-gallery__wheel-item" style="--i:' +
              i +
              ";--step:" +
              step +
              'deg;--n:' +
              n +
              '">' +
              '<button type="button" class="work-gallery__thumb" data-go="' +
              si +
              '" aria-label="' +
              escapeHtml(item.title) +
              '">' +
              '<img src="' +
              escapeHtml(item.thumb_url) +
              '" alt="" width="120" height="170" loading="lazy" />' +
              '<span class="work-gallery__thumb-label">' +
              escapeHtml(item.title) +
              "</span></button></li>"
            );
          })
          .join("");
        return (
          '<section class="work-gallery__topic-block" aria-labelledby="topic-' +
          escapeHtml(topic.slug) +
          '">' +
          '<h3 class="work-gallery__topic-title" id="topic-' +
          escapeHtml(topic.slug) +
          '">' +
          escapeHtml(topic.label) +
          "</h3>" +
          '<div class="work-gallery__wheel-scene">' +
          '<ul class="work-gallery__wheel' +
          (reducedMotion ? "" : " work-gallery__wheel--spin") +
          '" style="--wheel-n:' +
          n +
          '">' +
          thumbs +
          "</ul></div>" +
          '<div class="work-gallery__wheel-filmstrip" role="list">' +
          items
            .map(function (item) {
              var si = slides.findIndex(function (s) {
                return s.id === item.id;
              });
              return (
                '<button type="button" class="work-gallery__filmstrip-item" data-go="' +
                si +
                '">' +
                '<img src="' +
                escapeHtml(item.thumb_url) +
                '" alt="" width="72" height="102" loading="lazy" />' +
                "</button>"
              );
            })
            .join("") +
          "</div></section>"
        );
      })
      .join("");

    topicRegions.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        goTo(parseInt(btn.getAttribute("data-go"), 10));
      });
    });
  }

  root.querySelectorAll("[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var act = btn.getAttribute("data-action");
      if (act === "prev") go(-1);
      if (act === "next") go(1);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(slides.length - 1);
    }
  });

  renderSlides();
  renderTopicWheels();
  updateLive();
  syncThumbs();
  resetAuto();
})();
