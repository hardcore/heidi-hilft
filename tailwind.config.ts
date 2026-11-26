import type { Config } from "tailwindcss";

const rgb = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const HEIDI_TOKEN = [
  "canvas",
  "shell",
  "surface",
  "surface-2",
  "surface-3",
  "surface-active",
  "surface-hover",
  "input",
  "control",
  "border",
  "border-muted",
  "border-strong",
  "text",
  "text-strong",
  "text-soft",
  "text-muted",
  "accent",
  "accent-soft",
  "accent-text",
  "accent-off",
  "on-accent",
  "success",
  "success-text",
  "warning",
  "warning-text",
  "danger",
  "chat-bg",
  "chat-in",
  "chat-out",
  "chat-out-text",
] as const;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        kennzahl: ["58px", { lineHeight: "1", letterSpacing: "-0.04em", fontWeight: "600" }],
        seitentitel: ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
        paneltitel: ["28px", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "500" }],
        kartentitel: ["22px", { lineHeight: "1.3", fontWeight: "500" }],
        abschnitt: ["20px", { lineHeight: "1.35", fontWeight: "500" }],
        beschreibung: ["18px", { lineHeight: "1.5" }],
      },
      colors: {
        h: Object.fromEntries(HEIDI_TOKEN.map((t) => [t, rgb(`h-${t}`)])),
        background: rgb("background"),
        foreground: rgb("foreground"),
        card: {
          DEFAULT: rgb("card"),
          foreground: rgb("card-foreground"),
        },
        popover: {
          DEFAULT: rgb("popover"),
          foreground: rgb("popover-foreground"),
        },
        primary: {
          DEFAULT: rgb("primary"),
          foreground: rgb("primary-foreground"),
        },
        secondary: {
          DEFAULT: rgb("secondary"),
          foreground: rgb("secondary-foreground"),
        },
        muted: {
          DEFAULT: rgb("muted"),
          foreground: rgb("muted-foreground"),
        },
        accent: {
          DEFAULT: rgb("accent"),
          foreground: rgb("accent-foreground"),
        },
        destructive: {
          DEFAULT: rgb("destructive"),
          foreground: rgb("destructive-foreground"),
        },
        border: rgb("border"),
        input: rgb("input"),
        ring: rgb("ring"),
        chart: {
          "1": rgb("chart-1"),
          "2": rgb("chart-2"),
          "3": rgb("chart-3"),
          "4": rgb("chart-4"),
          "5": rgb("chart-5"),
        },
        sidebar: {
          DEFAULT: rgb("sidebar-background"),
          foreground: rgb("sidebar-foreground"),
          primary: rgb("sidebar-primary"),
          "primary-foreground": rgb("sidebar-primary-foreground"),
          accent: rgb("sidebar-accent"),
          "accent-foreground": rgb("sidebar-accent-foreground"),
          border: rgb("sidebar-border"),
          ring: rgb("sidebar-ring"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        shell: "34px",
        panel: "22px",
        card: "18px",
        eingabe: "16px",
        avatar: "14px",
        control: "10px",
        icon: "9px",
        badge: "7px",
      },
      boxShadow: {
        shell: "var(--h-shadow-shell)",
      },
      maxWidth: {
        shell: "1420px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
