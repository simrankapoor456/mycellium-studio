# Mycellium Studio brand assets

The production identity uses a compact radial network. A central intelligence form connects to a limited set of branching paths and terminal nodes. The mark remains recognizable without glow and at small sizes.

## Source assets

- `mycellium-mark.svg`: primary lime mark for dark surfaces
- `mycellium-mark-light.svg`: warm off-white mark
- `mycellium-mark-dark.svg`: dark mark for light surfaces
- `mycellium-mark-monochrome.svg`: one-color source
- `mycellium-wordmark.svg`: selected editorial wordmark
- `mycellium-lockup-horizontal.svg`: horizontal mark and wordmark
- `mycellium-lockup-stacked.svg`: stacked mark and wordmark
- `icons/favicon.svg`: simplified eight-branch tiny-size mark
- `social/open-graph.svg`: editable 1280 by 640 social source

Generated PNG files are produced by `npm run brand:generate`. Do not load every icon size in the application. Use SVG for interface rendering, 32 pixels for browser fallback, the closest platform icon size for installation surfaces, and the 1280 by 640 PNG for social metadata.

## Usage

- Keep clear space around the lockup at least equal to the height of the capital M.
- Use the simplified favicon at 32 pixels and below.
- Do not stretch, rotate, outline, recolor with gradients, or place the mark on a low-contrast surface.
- Glow is allowed only as a restrained presentation effect. It is never part of the production silhouette.
- The one-time web animation follows Spark, Connect, Grow, Form, and Settle. Reduced motion renders the complete static mark immediately.
