import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const palette = {
  acid: [201, 244, 61, 255],
  ink: [24, 26, 21, 255],
  red: [239, 88, 61, 255],
};

const glyphs = {
  R: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10100",
    "10010",
    "10001",
  ],
  "/": [
    "00001",
    "00010",
    "00010",
    "00100",
    "01000",
    "01000",
    "10000",
  ],
  B: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10001",
    "10001",
    "11110",
  ],
};

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function makeIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const setPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const offset = (y * size + x) * 4;
    pixels.set(color, offset);
  };
  const fillRect = (x, y, width, height, color) => {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) {
        setPixel(column, row, color);
      }
    }
  };

  fillRect(0, 0, size, size, palette.acid);
  fillRect(Math.round(size * 0.87), 0, Math.ceil(size * 0.13), size, palette.red);

  const border = Math.max(4, Math.round(size * 0.035));
  fillRect(Math.round(size * 0.07), Math.round(size * 0.07), Math.round(size * 0.76), border, palette.ink);
  fillRect(Math.round(size * 0.07), Math.round(size * 0.895), Math.round(size * 0.76), border, palette.ink);
  fillRect(Math.round(size * 0.07), Math.round(size * 0.07), border, Math.round(size * 0.86), palette.ink);

  const scale = Math.max(8, Math.floor(size / 22));
  const glyphWidth = 5 * scale;
  const gap = scale;
  const logoWidth = glyphWidth * 3 + gap * 2;
  const logoHeight = 7 * scale;
  const startX = Math.round((size * 0.87 - logoWidth) / 2);
  const startY = Math.round((size - logoHeight) / 2);

  ["R", "/", "B"].forEach((character, index) => {
    const glyph = glyphs[character];
    const glyphX = startX + index * (glyphWidth + gap);
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel === "1") {
          fillRect(
            glyphX + columnIndex * scale,
            startY + rowIndex * scale,
            scale,
            scale,
            palette.ink,
          );
        }
      });
    });
  });

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let row = 0; row < size; row += 1) {
    const outputOffset = row * (size * 4 + 1);
    raw[outputOffset] = 0;
    pixels.copy(raw, outputOffset + 1, row * size * 4, (row + 1) * size * 4);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
for (const size of [180, 192, 512]) {
  writeFileSync(`public/icons/repbook-${size}.png`, makeIcon(size));
}
