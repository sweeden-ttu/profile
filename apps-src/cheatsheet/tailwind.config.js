/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4 Variable"', '"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Inter Variable"', "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        paper: { DEFAULT: v("paper"), 2: v("paper-2"), 3: v("paper-3") },
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), 3: v("ink-3") },
        rule: v("rule"),
        oxblood: { DEFAULT: v("accent"), soft: v("accent-soft") },
        // shadcn semantic aliases mapped onto the paper/ink palette
        border: v("rule"),
        input: v("rule"),
        ring: v("accent"),
        background: v("paper"),
        foreground: v("ink"),
        primary: { DEFAULT: v("accent"), foreground: v("paper") },
        secondary: { DEFAULT: v("paper-3"), foreground: v("ink") },
        destructive: { DEFAULT: v("accent"), foreground: v("paper") },
        muted: { DEFAULT: v("paper-3"), foreground: v("ink-3") },
        accent: { DEFAULT: v("paper-3"), foreground: v("ink") },
        popover: { DEFAULT: v("paper-2"), foreground: v("ink") },
        card: { DEFAULT: v("paper-2"), foreground: v("ink") },
      },
      borderRadius: { lg: "6px", md: "4px", sm: "2px" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
