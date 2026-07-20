import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const brand = path.join(root, "public", "brand");
const icons = path.join(brand, "icons");
const social = path.join(brand, "social");

await Promise.all([mkdir(icons, { recursive: true }), mkdir(social, { recursive: true })]);

const iconSource = path.join(icons, "favicon.svg");
const appSource = path.join(brand, "apple-touch-icon.svg");

for (const size of [16, 32]) {
  await sharp(iconSource, { density: 384 }).resize(size, size).png({ compressionLevel: 9, palette: true }).toFile(path.join(icons, `favicon-${size}.png`));
}

for (const size of [64, 128, 256, 512]) {
  await sharp(appSource, { density: 384 }).resize(size, size).png({ compressionLevel: 9, palette: true }).toFile(path.join(icons, `app-icon-${size}.png`));
}

const socialSource = path.join(social, "open-graph.svg");
await sharp(socialSource, { density: 192 }).resize(1280, 640).png({ compressionLevel: 9 }).toFile(path.join(social, "open-graph.png"));
await sharp(socialSource, { density: 192 }).resize(1280, 640).modulate({ brightness: 0.98, saturation: 0.96 }).png({ compressionLevel: 9 }).toFile(path.join(social, "github-social-preview.png"));

console.log("Generated Mycellium Studio favicon, app-icon, and social PNG assets.");
