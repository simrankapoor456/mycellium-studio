import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'raster-tests');
const sizes = [512, 128, 64, 32, 24, 16];
const directions = [
  '01-living-network',
  '02-rooted-architecture',
  '03-emergent-signal',
  '04-foundation-node',
  '05-mycel-core-monogram',
  '06-asymmetric-growth',
];

await fs.mkdir(output, { recursive: true });

for (const direction of directions) {
  for (const size of sizes) {
    const sourceName = size === 16 ? 'icon-16.svg' : 'icon.svg';
    const source = path.join(root, direction, sourceName);
    const target = path.join(output, `${direction}-${size}.png`);
    await sharp(source, { density: 384 })
      .resize(size, size, { fit: 'contain' })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(target);
  }
}

console.log(`Rendered ${directions.length * sizes.length} optical-size checks to ${output}`);
