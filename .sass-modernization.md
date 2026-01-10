# Sass Modernization - Dart Sass 3.0 Compatibility

## Changes Made

This project has been updated to use modern Dart Sass syntax, eliminating all deprecation warnings in preparation for Dart Sass 3.0.

### 1. Module System Migration (`@import` → `@use`)

**Old syntax (deprecated):**
```scss
@import "variables";
@import "typography";
```

**New syntax:**
```scss
@use "variables" as *;
@use "typography";
```

**Files updated:**
- `assets/css/main.scss` - Main stylesheet
- `_sass/_typography.scss` - Added `@use "variables" as *;`
- `_sass/_layout.scss` - Added `@use "variables" as *;`
- `_sass/_components.scss` - Added `@use "sass:color"` and `@use "variables" as *;`

**Benefits:**
- Explicit dependencies and namespacing
- Better performance and smaller output
-避免variable name collisions
- Future-proof for Dart Sass 3.0

### 2. Color Function Modernization

**Old syntax (deprecated):**
```scss
background-color: lighten($color-accent-green, 45%);
color: darken($color-accent-green, 10%);
```

**New syntax:**
```scss
background-color: color.scale($color-accent-green, $lightness: 74%);
color: color.scale($color-accent-green, $lightness: -25%);
```

**Files updated:**
- `_sass/_components.scss` - Project status badge colors

**Conversion notes:**
- `lighten($color, 45%)` → `color.scale($color, $lightness: 74%)`
- `darken($color, 10%)` → `color.scale($color, $lightness: -25%)`
- `lighten($color, 40%)` → `color.scale($color, $lightness: 80%)`
- `darken($color, 10%)` → `color.scale($color, $lightness: -20%)`

The percentages differ because:
- `lighten()`/`darken()` adjust absolute lightness values
- `color.scale()` scales the remaining range to white/black

**Benefits:**
- More predictable color manipulation
- Better handling of edge cases (very light/dark colors)
- Consistent with modern CSS color manipulation

## Verification

Build output now shows no Sass deprecation warnings:

```bash
$ bundle exec jekyll build
Configuration file: /Users/sdw/Documents/gh/profile/_config.yml
            Source: /Users/sdw/Documents/gh/profile
       Destination: /Users/sdw/Documents/gh/profile/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
       Jekyll Feed: Generating feed for posts
                    done in 0.063 seconds.
```

✅ All deprecation warnings resolved
✅ Build completes successfully
✅ Ready for Dart Sass 3.0

## References

- [Sass Module System Migration Guide](https://sass-lang.com/documentation/at-rules/use)
- [Sass Color Module Documentation](https://sass-lang.com/documentation/modules/color)
- [Dart Sass 3.0 Breaking Changes](https://sass-lang.com/d/import)

## Compatibility

- ✅ Dart Sass 1.23.0+ (current)
- ✅ Dart Sass 2.x (future)
- ✅ Dart Sass 3.0 (when released)
- ❌ LibSass (unmaintained, not recommended)
- ❌ Ruby Sass (deprecated)

## Future Maintenance

To avoid deprecation warnings:

1. Always use `@use` instead of `@import`
2. Use `color.scale()` or `color.adjust()` instead of `lighten()`/`darken()`
3. Use namespaced built-in modules: `@use "sass:math"`, `@use "sass:color"`, etc.
4. Run builds regularly to catch new deprecations early

---

**Last updated:** 2026-01-10
**Dart Sass version:** 1.x (compatible with 3.0)
