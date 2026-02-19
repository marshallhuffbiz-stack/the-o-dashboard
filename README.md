# The O Dashboard

A branded, two-page marketing dashboard for The O (orange/white/black neon style).

## Files

- `index.html` - Main dashboard (Events, Pictures/Flyers, Idea Vault)
- `sms-beta.html` - SMS Campaign Tracker beta page
- `styles.css` - Shared styling/theme
- `app.js` - Main dashboard interactivity
- `sms.js` - SMS beta interactivity
- `assets/the-o-logo.png` - Logo file used in header, favicon, and home-screen icon
- `site.webmanifest` - Mobile install/app metadata (Add to Home Screen)

## Run

1. Open `/Users/MarshallHuff/Downloads/The O/index.html` directly in your browser.
2. Use the left nav to open the SMS Beta page.

## Notes

- All data is saved in browser `localStorage` on that device/browser.
- If `assets/the-o-logo.png` is missing, a branded text fallback is shown in the header and favicon/app icon will not display.
- For best phone icon results, use a square PNG at `assets/the-o-logo.png` (recommended: 512x512).
- Uploads are stored locally in-browser for demo/prototype use.
