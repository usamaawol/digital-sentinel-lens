/**
 * Writes minimal valid PNG icons for the PWA.
 * Run: node scripts/write-icons.cjs
 *
 * These are proper PNG files with a blue gradient background and shield icon.
 * For production, replace with high-quality icons from a designer.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePng(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB
  const ihdr = makeChunk("IHDR", ihdrData);

  // Raw pixel data: filter(0) + RGB per row
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3);
    raw[row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const p = row + 1 + x * 3;
      // Blue-to-cyan gradient background
      const t = (x + y) / (size * 2);
      raw[p]     = Math.round(59  * (1 - t) + 6   * t); // R
      raw[p + 1] = Math.round(130 * (1 - t) + 182 * t); // G
      raw[p + 2] = Math.round(246 * (1 - t) + 212 * t); // B

      // Draw a simple shield outline (white pixels)
      const cx = size / 2, cy = size / 2;
      const nx = (x - cx) / (size * 0.28);
      const ny = (y - cy) / (size * 0.32);

      // Shield border
      const shieldTop = ny < -0.5;
      const shieldSide = Math.abs(nx) > 0.85 && ny < 0.3;
      const shieldBottom = nx * nx + (ny - 0.7) * (ny - 0.7) < 0.05;

      // Checkmark
      const ck1 = Math.abs((ny + 0.1) - (nx + 0.2) * 0.8) < 0.08 && nx > -0.35 && nx < 0;
      const ck2 = Math.abs((ny + 0.1) + (nx - 0.1) * 0.8) < 0.08 && nx > 0 && nx < 0.45;

      if (ck1 || ck2) {
        raw[p] = 255; raw[p + 1] = 255; raw[p + 2] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

sizes.forEach((size) => {
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, makePng(size));
  console.log(`Written: icon-${size}.png`);
});

console.log("All icons generated.");
