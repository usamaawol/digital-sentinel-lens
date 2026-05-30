/**
 * Generates PWA icons for Privacy Guard AI.
 * Run: node scripts/generate-icons.mjs
 *
 * Requires: npm install sharp (or uses canvas fallback)
 * If sharp is not available, creates minimal valid PNG placeholders.
 */

import { createWriteStream, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Creates a minimal valid PNG with a solid blue color.
 * This is a proper PNG binary — browsers will accept it.
 */
function createMinimalPng(size) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);   // width
  ihdrData.writeUInt32BE(size, 4);   // height
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk("IHDR", ihdrData);

  // IDAT chunk — raw image data (uncompressed via zlib level 0)
  // Each row: filter byte (0) + RGB pixels
  const rowSize = 1 + size * 3;
  const rawData = Buffer.alloc(size * rowSize);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type: None

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Gradient: blue to cyan
      const t = (x + y) / (size * 2);
      rawData[pixelOffset] = Math.round(59 + t * (6 - 59));     // R: 59→6
      rawData[pixelOffset + 1] = Math.round(130 + t * (182 - 130)); // G: 130→182
      rawData[pixelOffset + 2] = Math.round(246 + t * (212 - 246)); // B: 246→212
    }
  }

  // Compress with zlib
  const { deflateSync } = await import("zlib").catch(() => ({ deflateSync: null }));
  let compressed;
  try {
    const zlib = await import("zlib");
    compressed = zlib.deflateSync(rawData, { level: 6 });
  } catch {
    // Fallback: store uncompressed (zlib level 0 format)
    compressed = storeUncompressed(rawData);
  }

  const idat = makeChunk("IDAT", compressed);

  // IEND chunk
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([len, typeBuffer, data, crc]);
}

function storeUncompressed(data) {
  // zlib header (no compression)
  const header = Buffer.from([0x78, 0x01]);
  const blockSize = 65535;
  const blocks = [];

  for (let i = 0; i < data.length; i += blockSize) {
    const block = data.slice(i, i + blockSize);
    const isLast = i + blockSize >= data.length;
    const blockHeader = Buffer.alloc(5);
    blockHeader[0] = isLast ? 1 : 0;
    blockHeader.writeUInt16LE(block.length, 1);
    blockHeader.writeUInt16LE(~block.length & 0xffff, 3);
    blocks.push(blockHeader, block);
  }

  const adler = adler32(data);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(adler, 0);

  return Buffer.concat([header, ...blocks, checksum]);
}

// CRC32 table
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(buf) {
  let a = 1, b = 0;
  for (const byte of buf) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

// Try to use sharp for high-quality icons
async function generateWithSharp(size, outputPath) {
  try {
    const sharp = (await import("sharp")).default;
    const svgPath = join(iconsDir, "icon.svg");
    const { existsSync } = await import("fs");
    if (!existsSync(svgPath)) return false;

    await sharp(svgPath).resize(size, size).png().toFile(outputPath);
    return true;
  } catch {
    return false;
  }
}

// Main
console.log("Generating PWA icons...");

for (const size of sizes) {
  const outputPath = join(iconsDir, `icon-${size}.png`);
  const usedSharp = await generateWithSharp(size, outputPath);

  if (!usedSharp) {
    // Fallback: write a minimal valid PNG
    const { writeFileSync } = await import("fs");
    const png = createMinimalPng(size);
    writeFileSync(outputPath, png);
    console.log(`  ✓ icon-${size}.png (minimal PNG)`);
  } else {
    console.log(`  ✓ icon-${size}.png (sharp)`);
  }
}

console.log("Done! Icons written to public/icons/");
