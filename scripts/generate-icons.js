// Generate placeholder PWA icons as simple PNGs
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Minimal valid PNG generator (solid green square with "H" hint via color)
function createMinimalPNG(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr.writeUInt8(8, 8);        // bit depth
  ihdr.writeUInt8(2, 9);        // color type (RGB)
  ihdr.writeUInt8(0, 10);       // compression
  ihdr.writeUInt8(0, 11);       // filter
  ihdr.writeUInt8(0, 12);       // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk - raw image data
  // Each row: filter byte (0) + RGB pixels
  const rawRows = [];
  const borderWidth = Math.max(2, Math.floor(size * 0.05));

  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte: None
    for (let x = 0; x < size; x++) {
      // Green background (#16a34a) with darker border
      const isBorder = x < borderWidth || x >= size - borderWidth || y < borderWidth || y >= size - borderWidth;
      // Simple "H" letter in center
      const cx = x / size;
      const cy = y / size;
      const isH = (
        (cx > 0.25 && cx < 0.35 && cy > 0.25 && cy < 0.75) || // left bar
        (cx > 0.65 && cx < 0.75 && cy > 0.25 && cy < 0.75) || // right bar
        (cx > 0.35 && cx < 0.65 && cy > 0.45 && cy < 0.55)    // middle bar
      );

      if (isH) {
        row.push(255, 255, 255); // white H
      } else if (isBorder) {
        row.push(21, 128, 61);   // darker green border
      } else {
        row.push(22, 163, 74);   // #16a34a green
      }
    }
    rawRows.push(Buffer.from(row));
  }

  const rawData = Buffer.concat(rawRows);

  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData));

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

for (const size of sizes) {
  const png = createMinimalPNG(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${png.length} bytes)`);
}

// Create screenshot placeholders (wider images)
const screenshotWide = createMinimalPNG(1280);
fs.writeFileSync(path.join(iconsDir, 'screenshot-wide.png'), screenshotWide);
console.log('Created screenshot-wide.png');

const screenshotNarrow = createMinimalPNG(720);
fs.writeFileSync(path.join(iconsDir, 'screenshot-narrow.png'), screenshotNarrow);
console.log('Created screenshot-narrow.png');

console.log('\nDone! Replace these placeholder icons with your real app icons before publishing.');
