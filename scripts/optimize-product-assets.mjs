import { rename } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const assets = ["landing-desktop.png", "landing-mobile.png", "authentication.png"];

for (const asset of assets) {
  const source = path.join("docs", "assets", asset);
  const optimized = path.join("docs", "assets", `.${asset}`);

  await sharp(source)
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 88 })
    .toFile(optimized);
  await rename(optimized, source);
}

console.log(`Optimized ${assets.length} product screenshots.`);
